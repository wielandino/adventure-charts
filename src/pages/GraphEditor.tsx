import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { CenteredMessage } from '../components/CenteredMessage'
import { NodeInspector } from '../components/NodeInspector'
import { EdgeInspector } from '../components/EdgeInspector'
import { GroupInspector } from '../components/GroupInspector'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ManageTypesDialog } from '../components/ManageTypesDialog'
import { HelpDialog } from '../components/HelpDialog'
import { NodePlacementGhost } from '../components/NodePlacementGhost'
import { EditorHeader } from '../components/EditorHeader'
import { NodeToolbar } from '../components/NodeToolbar'
import { useTheme } from '../theme/ThemeContext'
import { ConnectModeContext } from '../context/ConnectModeContext'
import { CycleWarningContext } from '../context/CycleWarningContext'
import { IsolatedNodeContext } from '../context/IsolatedNodeContext'
import { GroupActionsContext } from '../context/GroupActionsContext'
import { NodeResizeContext } from '../context/NodeResizeContext'
import { TypeConfigContext } from '../context/TypeConfigContext'
import { useGraphHistory } from '../hooks/useGraphHistory'
import { useGraphSelection } from '../hooks/useGraphSelection'
import { useGraphPersistence } from '../hooks/useGraphPersistence'
import { useConfirmDialog } from '../hooks/useConfirmDialog'
import { useGraphEditorActions } from '../hooks/useGraphEditorActions'
import { useEditorKeyboardShortcuts } from '../hooks/useEditorKeyboardShortcuts'
import { useGraphDerivedState } from '../hooks/useGraphDerivedState'
import { useTypeConfig } from '../hooks/useTypeConfig'
import { nodeTypes, edgeTypes, defaultEdgeOptions, findNodeType, UNKNOWN_TYPE_COLOR } from '../utils/graphEditorVisuals'
import { isGroupNode, type AnyPuzzleNode, type PuzzleFlowEdge } from '../types'

function GraphEditor() {
  const { id } = useParams<{ id: string }>()
  const { resolvedTheme } = useTheme()

  const [nodes, setNodes, onNodesChange] = useNodesState<AnyPuzzleNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<PuzzleFlowEdge>([])
  const [isManageTypesOpen, setIsManageTypesOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const { typeConfig, saveTypeConfig } = useTypeConfig()

  const reactFlowInstanceRef = useRef<ReactFlowInstance<AnyPuzzleNode, PuzzleFlowEdge> | null>(null)

  const { loadState, name, setName, saveStatus, handleSaveClick } = useGraphPersistence(
    id,
    nodes,
    edges,
    setNodes,
    setEdges,
  )

  const {
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    selectedGroupId,
    setSelectedGroupId,
    connectMode,
    setConnectMode,
    connectSourceId,
    setConnectSourceId,
    isPlacingNode,
    setIsPlacingNode,
    ghostScreenPos,
    setGhostScreenPos,
    dropTargetGroupId,
    setDropTargetGroupId,
    isDescriptionDialogOpen,
    setIsDescriptionDialogOpen,
  } = useGraphSelection(nodes, edges)

  const { commit, commitDebounced, undo, redo } = useGraphHistory(nodes, edges, setNodes, setEdges)

  // Snapshot the pre-resize state when a node/group resize gesture starts. Kept as
  // a stable callback (commit is recreated every render) so the context value does
  // not force every memoized node body to re-render.
  const commitRef = useRef(commit)
  useEffect(() => {
    commitRef.current = commit
  }, [commit])
  const handleResizeStart = useCallback(() => commitRef.current(), [])

  const { confirmRequest, requestConfirm, resolveConfirm } = useConfirmDialog()

  const {
    onConnect,
    handleStartPlacingNode,
    handlePlacementMouseMove,
    handlePlacementClick,
    handleNewNodeDragStart,
    handleNewNodeDragEnd,
    handlePaneDragOver,
    handlePaneDrop,
    handleNodeDataChange,
    handleGroupDataChange,
    handleAssignGroup,
    handleGroupSelectedNodes,
    handleToggleGroupVisibility,
    handleJumpToGroup,
    handleGroupDelete,
    handleEdgeDataChange,
    handleToggleConnectMode,
    handleNodeClick,
    handleNodeDoubleClick,
    handleEdgeClick,
    handlePaneClick,
    handleNodeDelete,
    handleEdgeDelete,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragStop,
    handleCanvasPointerMove,
    handleCopy,
    handlePaste,
    handleBeforeDelete,
  } = useGraphEditorActions({
    nodes,
    edges,
    nodeTypes: typeConfig?.nodeTypes ?? [],
    setNodes,
    setEdges,
    commit,
    commitDebounced,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    selectedGroupId,
    setSelectedGroupId,
    connectMode,
    setConnectMode,
    connectSourceId,
    setConnectSourceId,
    setIsPlacingNode,
    setGhostScreenPos,
    setDropTargetGroupId,
    setIsDescriptionDialogOpen,
    requestConfirm,
    reactFlowInstanceRef,
  })

  const isAnyDialogOpen = isManageTypesOpen || isHelpOpen || isDescriptionDialogOpen || !!confirmRequest

  useEditorKeyboardShortcuts(
    connectMode,
    isPlacingNode,
    isAnyDialogOpen,
    setConnectMode,
    setConnectSourceId,
    setIsPlacingNode,
    setGhostScreenPos,
    handleStartPlacingNode,
    undo,
    redo,
    handleCopy,
    handlePaste,
  )

  const {
    selectedNode,
    selectedEdge,
    selectedGroup,
    groupNodes,
    eligibleForGrouping,
    groupMemberCounts,
    cycleNodeIds,
    isolatedNodeIds,
    displayEdges,
  } = useGraphDerivedState(nodes, edges, selectedNodeId, selectedEdgeId, selectedGroupId, resolvedTheme)

  const flowNodeTypes = useMemo(() => nodeTypes, [])
  const flowEdgeTypes = useMemo(() => edgeTypes, [])

  if (loadState === 'loading' || !typeConfig) {
    return <CenteredMessage text="Graph wird geladen …" />
  }

  if (loadState === 'not-found') {
    return (
      <CenteredMessage text="Dieser Graph wurde nicht gefunden.">
        <Link to="/" className="back-link">
          Zurück zum Dashboard
        </Link>
      </CenteredMessage>
    )
  }

  return (
    <div className="editor-page">
      <EditorHeader
        name={name}
        onNameChange={setName}
        cycleCount={cycleNodeIds.size}
        isolatedCount={isolatedNodeIds.size}
        saveStatus={saveStatus}
        onSaveClick={handleSaveClick}
        onOpenManageTypes={() => setIsManageTypesOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        groups={groupNodes}
        groupMemberCounts={groupMemberCounts}
        onSelectGroup={handleJumpToGroup}
      />
      <div className="editor-canvas" onMouseMove={handleCanvasPointerMove}>
        <NodeToolbar
          isPlacingNode={isPlacingNode}
          onStartPlacingNode={handleStartPlacingNode}
          onDragStartNewNode={handleNewNodeDragStart}
          onDragEndNewNode={handleNewNodeDragEnd}
          connectMode={connectMode}
          connectSourceId={connectSourceId}
          onToggleConnectMode={handleToggleConnectMode}
          eligibleCount={eligibleForGrouping.length}
          onGroupSelectedNodes={handleGroupSelectedNodes}
        />
        <TypeConfigContext.Provider value={typeConfig}>
        <NodeResizeContext.Provider value={handleResizeStart}>
        <ConnectModeContext.Provider value={connectMode ? connectSourceId : null}>
         <CycleWarningContext.Provider value={cycleNodeIds}>
         <IsolatedNodeContext.Provider value={isolatedNodeIds}>
         <GroupActionsContext.Provider value={{ onToggleVisibility: handleToggleGroupVisibility, dropTargetGroupId }}>
          <ReactFlow
            nodes={nodes}
            edges={displayEdges}
            nodeTypes={flowNodeTypes}
            edgeTypes={flowEdgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onEdgeClick={handleEdgeClick}
            onPaneClick={handlePaneClick}
            onNodeDragStart={handleNodeDragStart}
            onNodeDrag={handleNodeDrag}
            onNodeDragStop={handleNodeDragStop}
            onBeforeDelete={handleBeforeDelete}
            onDragOver={handlePaneDragOver}
            onDrop={handlePaneDrop}
            onInit={(instance) => {
              reactFlowInstanceRef.current = instance
            }}
            deleteKeyCode={['Delete', 'Backspace']}
            multiSelectionKeyCode="Shift"
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            snapToGrid
          >
            <Background color="var(--border-strong)" gap={28} size={1.5} />
            <Controls />
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) => {
                const n = node as AnyPuzzleNode
                if (isGroupNode(n)) return n.data.color ?? UNKNOWN_TYPE_COLOR
                return n.data.color ?? findNodeType(typeConfig.nodeTypes, n.data.kind)?.color ?? UNKNOWN_TYPE_COLOR
              }}
            />
          </ReactFlow>
         </GroupActionsContext.Provider>
         </IsolatedNodeContext.Provider>
         </CycleWarningContext.Provider>
        </ConnectModeContext.Provider>
        </NodeResizeContext.Provider>
        </TypeConfigContext.Provider>
        {isPlacingNode && (
          <div
            className="node-placement-overlay"
            onMouseMove={handlePlacementMouseMove}
            onClick={handlePlacementClick}
            onDragOver={handlePaneDragOver}
            onDrop={handlePaneDrop}
          >
            <NodePlacementGhost position={ghostScreenPos} />
          </div>
        )}
        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            groups={groupNodes}
            nodeTypes={typeConfig.nodeTypes}
            onChange={handleNodeDataChange}
            onAssignGroup={handleAssignGroup}
            onDelete={handleNodeDelete}
            onClose={() => setSelectedNodeId(null)}
            isDescriptionDialogOpen={isDescriptionDialogOpen}
            onOpenDescriptionDialog={() => setIsDescriptionDialogOpen(true)}
            onCloseDescriptionDialog={() => setIsDescriptionDialogOpen(false)}
          />
        )}
        {selectedEdge && (
          <EdgeInspector
            edge={selectedEdge}
            edgeTypes={typeConfig.edgeTypes}
            onChange={handleEdgeDataChange}
            onDelete={handleEdgeDelete}
            onClose={() => setSelectedEdgeId(null)}
          />
        )}
        {selectedGroup && (
          <GroupInspector
            group={selectedGroup}
            onChange={handleGroupDataChange}
            onDelete={handleGroupDelete}
            onToggleVisibility={() => handleToggleGroupVisibility(selectedGroup.id)}
            onClose={() => setSelectedGroupId(null)}
          />
        )}
        {confirmRequest && (
          <ConfirmDialog
            title={confirmRequest.title}
            message={confirmRequest.message}
            onConfirm={() => resolveConfirm(true)}
            onCancel={() => resolveConfirm(false)}
          />
        )}
        {isManageTypesOpen && (
          <ManageTypesDialog
            typeConfig={typeConfig}
            onSave={saveTypeConfig}
            onClose={() => setIsManageTypesOpen(false)}
          />
        )}
        {isHelpOpen && <HelpDialog onClose={() => setIsHelpOpen(false)} />}
      </div>
    </div>
  )
}

export default GraphEditor
