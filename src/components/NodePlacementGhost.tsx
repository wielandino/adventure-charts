interface NodePlacementGhostProps {
  position: { x: number; y: number } | null
}

export function NodePlacementGhost({ position }: NodePlacementGhostProps) {
  if (!position) return null

  return (
    <div
      className="node-placement-ghost"
      style={{ left: position.x, top: position.y }}
    >
      <div className="node-placement-ghost-label">Neuer Knoten</div>
    </div>
  )
}
