import cors from 'cors'
import express from 'express'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { GraphFile, GraphMeta, TypeConfig } from '../src/types.js'

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

async function readGraphFile(id: string): Promise<GraphFile | null> {
  try {
    const raw = await readFile(graphPath(id), 'utf-8')
    return JSON.parse(raw) as GraphFile
  } catch {
    return null
  }
}

async function listGraphFiles(): Promise<GraphFile[]> {
  await ensureGraphsDir()
  const files = await readdir(GRAPHS_DIR)
  const graphs: GraphFile[] = []
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const raw = await readFile(path.join(GRAPHS_DIR, file), 'utf-8')
    graphs.push(JSON.parse(raw) as GraphFile)
  }
  return graphs
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
  await writeFile(graphPath(graph.id), JSON.stringify(graph, null, 2), 'utf-8')
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

app.put('/api/graphs/:id', async (req, res) => {
  const existing = await readGraphFile(req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Graph not found' })
    return
  }
  const { name, nodes, edges } = req.body as Pick<GraphFile, 'name' | 'nodes' | 'edges'>
  const updated: GraphFile = {
    ...existing,
    name: name ?? existing.name,
    nodes: nodes ?? existing.nodes,
    edges: edges ?? existing.edges,
    nodeCount: (nodes ?? existing.nodes).length,
    updatedAt: new Date().toISOString(),
  }
  await writeFile(graphPath(updated.id), JSON.stringify(updated, null, 2), 'utf-8')
  res.json(updated)
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
  const existing = await readGraphFile(req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Graph not found' })
    return
  }
  await rm(graphPath(req.params.id))
  res.status(204).end()
})

await ensureGraphsDir()
app.listen(PORT, () => {
  console.log(`Graph API server listening on http://localhost:${PORT}`)
})
