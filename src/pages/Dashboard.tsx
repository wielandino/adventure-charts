import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGraph, deleteGraph, listGraphs } from '../api/graphs'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ThemeToggle } from '../components/ThemeToggle'
import { CompassIcon, PlusIcon, TrashIcon } from '../components/icons'
import type { GraphMeta } from '../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Dashboard() {
  const [graphs, setGraphs] = useState<GraphMeta[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GraphMeta | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    listGraphs().then(setGraphs)
  }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const graph = await createGraph()
      navigate(`/graph/${graph.id}`)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteGraph(deleteTarget.id)
    setGraphs((current) => current?.filter((g) => g.id !== deleteTarget.id) ?? current)
    setDeleteTarget(null)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <div>
            <h1>Adventure Charts</h1>
            <p className="dashboard-subtitle">Puzzle Charts</p>
          </div>
        </div>
        <div className="dashboard-actions">
          <ThemeToggle />
          <button className="new-graph-button" onClick={handleCreate} disabled={creating}>
            <PlusIcon size={16} />
            Neuer Graph
          </button>
        </div>
      </header>

      {graphs === null && <p className="dashboard-loading">Lade Graphen …</p>}

      {graphs !== null && graphs.length === 0 && (
        <div className="empty-state">
          <CompassIcon size={40} className="empty-state-icon" />
          <p>Noch keine Graphen vorhanden.</p>
          <button className="new-graph-button" onClick={handleCreate} disabled={creating}>
            <PlusIcon size={16} />
            Ersten Graphen erstellen
          </button>
        </div>
      )}

      {graphs !== null && graphs.length > 0 && (
        <div className="graph-grid">
          {graphs.map((graph) => (
            <div key={graph.id} className="graph-card-wrapper">
              <button
                className="graph-card"
                onClick={() => navigate(`/graph/${graph.id}`)}
              >
                <div className="graph-card-name">{graph.name}</div>
                <div className="graph-card-meta">
                  {graph.nodeCount} {graph.nodeCount === 1 ? 'Knoten' : 'Knoten'}
                </div>
                <div className="graph-card-date">Zuletzt bearbeitet: {formatDate(graph.updatedAt)}</div>
              </button>
              <button
                type="button"
                className="graph-card-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(graph)
                }}
                title="Graph löschen"
                aria-label="Graph löschen"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Graph löschen"
          message={`"${deleteTarget.name}" und alle enthaltenen Knoten werden unwiderruflich gelöscht.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
