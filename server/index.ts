import cors from 'cors'
import express from 'express'
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  AnyPuzzleNode,
  GraphFile,
  GraphMeta,
  GraphPatch,
  PuzzleFlowEdge,
  TypeConfig,
} from '../src/types.js'

const PORT = 3001
const GRAPHS_DIR = path.resolve(import.meta.dirname, '..', 'graphs')
const TYPES_FILE = path.resolve(import.meta.dirname, '..', 'types.json')

const SEED_TYPE_CONFIG: TypeConfig = {
  nodeTypes: [
    { id: 'puzzle', label: 'Puzzle', color: '#7c5cff' },
    { id: 'item', label: 'Item', color: '#b3792e' },
    { id: 'location', label: 'Location', color: '#2f9e6e' },
  ],
  edgeTypes: [
    { id: 'requires', label: 'Benötigt' },
    { id: 'unlocks', label: 'Schaltet frei' },
    { id: 'gives', label: 'Gibt' },
  ],
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

async function readTypeConfig(): Promise<TypeConfig> {
  try {
    const raw = await readFile(TYPES_FILE, 'utf-8')
    return JSON.parse(raw) as TypeConfig
  } catch {
    await writeFile(TYPES_FILE, JSON.stringify(SEED_TYPE_CONFIG, null, 2), 'utf-8')
    return SEED_TYPE_CONFIG
  }
}

async function ensureGraphsDir() {
  await mkdir(GRAPHS_DIR, { recursive: true })
}

function graphPath(id: string) {
  return path.join(GRAPHS_DIR, `${id}.json`)
}

// The server is the only writer (single-user, local). Keeping parsed graphs in
// memory removes a full read + JSON.parse of the whole file from every save.
const graphCache = new Map<string, GraphFile>()

// Serialize all writes per graph id so an autosave PATCH and a manual "Speichern"
// PUT can never interleave into a half-merged file.
const writeChains = new Map<string, Promise<unknown>>()

function enqueueWrite<T>(id: string, task: () => Promise<T>): Promise<T> {
  const prev = writeChains.get(id) ?? Promise.resolve()
  const next = prev.then(task, task)
  // Swallow rejections on the stored chain so one failed write does not poison
  // the queue; the real result/rejection still propagates through `next`.
  writeChains.set(
    id,
    next.catch(() => {}),
  )
  return next
}

async function readGraphFile(id: string): Promise<GraphFile | null> {
  const cached = graphCache.get(id)
  if (cached) return cached
  try {
    const raw = await readFile(graphPath(id), 'utf-8')
    const parsed = JSON.parse(raw) as GraphFile
    graphCache.set(id, parsed)
    return parsed
  } catch {
    return null
  }
}

// Atomic: write a temp file, then rename over the target. A crash mid-write
// leaves either the old file or the new one, never a truncated JSON.
async function writeGraphFile(graph: GraphFile): Promise<void> {
  await ensureGraphsDir()
  const target = graphPath(graph.id)
  const tmp = `${target}.${crypto.randomUUID()}.tmp`
  await writeFile(tmp, JSON.stringify(graph, null, 2), 'utf-8')
  await rename(tmp, target)
  graphCache.set(graph.id, graph)
}

function applyPatch(existing: GraphFile, patch: GraphPatch): GraphFile {
  const nodeMap = new Map(existing.nodes.map((n) => [n.id, n]))
  for (const node of patch.upsertNodes ?? []) nodeMap.set(node.id, node as unknown as AnyPuzzleNode)
  for (const id of patch.removeNodeIds ?? []) nodeMap.delete(id)

  const removedNodeIds = new Set(patch.removeNodeIds ?? [])
  const edgeMap = new Map(existing.edges.map((e) => [e.id, e]))
  for (const edge of patch.upsertEdges ?? []) edgeMap.set(edge.id, edge as unknown as PuzzleFlowEdge)
  for (const id of patch.removeEdgeIds ?? []) edgeMap.delete(id)

  const nodes = [...nodeMap.values()]
  // Drop dangling edges whose endpoint node was removed in this patch.
  const edges = [...edgeMap.values()].filter(
    (e) => !removedNodeIds.has(e.source) && !removedNodeIds.has(e.target),
  )

  return {
    ...existing,
    name: patch.name ?? existing.name,
    nodes,
    edges,
    nodeCount: nodes.length,
    updatedAt: new Date().toISOString(),
  }
}

function toMeta(graph: GraphFile): GraphMeta {
  return {
    id: graph.id,
    name: graph.name,
    createdAt: graph.createdAt,
    updatedAt: graph.updatedAt,
    nodeCount: graph.nodes.length,
  }
}

function ackOf(graph: GraphFile) {
  return { id: graph.id, updatedAt: graph.updatedAt, nodeCount: graph.nodes.length }
}

async function listGraphFiles(): Promise<GraphFile[]> {
  await ensureGraphsDir()
  const files = await readdir(GRAPHS_DIR)
  const graphs: GraphFile[] = []
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const id = file.slice(0, -'.json'.length)
    const graph = await readGraphFile(id)
    if (graph) graphs.push(graph)
  }
  return graphs
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/api/graphs', async (_req, res) => {
  const graphs = await listGraphFiles()
  const metas = graphs.map(toMeta).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  res.json(metas)
})

app.post('/api/graphs', async (_req, res) => {
  await ensureGraphsDir()
  const now = new Date().toISOString()
  const graph: GraphFile = {
    id: crypto.randomUUID(),
    name: 'Neuer Graph',
    createdAt: now,
    updatedAt: now,
    nodeCount: 0,
    nodes: [],
    edges: [],
  }
  await enqueueWrite(graph.id, () => writeGraphFile(graph))
  res.status(201).json(graph)
})

app.get('/api/graphs/:id', async (req, res) => {
  const graph = await readGraphFile(req.params.id)
  if (!graph) {
    res.status(404).json({ error: 'Graph not found' })
    return
  }
  res.json(graph)
})

// Full-graph save (initial reconcile, import, explicit "save all").
app.put('/api/graphs/:id', async (req, res) => {
  const id = req.params.id
  const { name, nodes, edges } = req.body as Pick<GraphFile, 'name' | 'nodes' | 'edges'>
  try {
    const updated = await enqueueWrite(id, async () => {
      const existing = await readGraphFile(id)
      if (!existing) throw new HttpError(404, 'Graph not found')
      const next: GraphFile = {
        ...existing,
        name: name ?? existing.name,
        nodes: nodes ?? existing.nodes,
        edges: edges ?? existing.edges,
        nodeCount: (nodes ?? existing.nodes).length,
        updatedAt: new Date().toISOString(),
      }
      await writeGraphFile(next)
      return next
    })
    res.json(ackOf(updated))
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500
    res.status(status).json({ error: (err as Error).message })
  }
})

// Incremental save - apply only the changed entities.
app.patch('/api/graphs/:id', async (req, res) => {
  const id = req.params.id
  const patch = req.body as GraphPatch
  try {
    const updated = await enqueueWrite(id, async () => {
      const existing = await readGraphFile(id)
      if (!existing) throw new HttpError(404, 'Graph not found')
      const next = applyPatch(existing, patch)
      await writeGraphFile(next)
      return next
    })
    res.json(ackOf(updated))
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500
    res.status(status).json({ error: (err as Error).message })
  }
})

app.get('/api/types', async (_req, res) => {
  const config = await readTypeConfig()
  res.json(config)
})

app.put('/api/types', async (req, res) => {
  const config = req.body as TypeConfig
  await writeFile(TYPES_FILE, JSON.stringify(config, null, 2), 'utf-8')
  res.json(config)
})

app.delete('/api/graphs/:id', async (req, res) => {
  const id = req.params.id
  const existing = await readGraphFile(id)
  if (!existing) {
    res.status(404).json({ error: 'Graph not found' })
    return
  }
  await enqueueWrite(id, async () => {
    await rm(graphPath(id))
    graphCache.delete(id)
  })
  res.status(204).end()
})

await ensureGraphsDir()
app.listen(PORT, () => {
  console.log(`Graph API server listening on http://localhost:${PORT}`)
})
