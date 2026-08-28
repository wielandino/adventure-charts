import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Rnd } from 'react-rnd'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  linkDialogPlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  Separator,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { markdownPastePlugin } from './markdownPastePlugin'
import { hasDescriptionContent } from '../utils/nodeDescription'
import { CloseIcon, NotesIcon } from './icons'
import { useTheme } from '../theme/ThemeContext'
import type { PuzzleFlowNode, PuzzleNodeData } from '../types'

interface DescriptionDialogProps {
  node: PuzzleFlowNode
  onChange: (patch: Partial<PuzzleNodeData>) => void
  onClose: () => void
}

const DEBOUNCE_MS = 400

function EditorToolbar() {
  return (
    <>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <Separator />
      <BlockTypeSelect />
      <Separator />
      <ListsToggle />
      <Separator />
      <CreateLink />
    </>
  )
}

export function DescriptionDialog({ node, onChange, onClose }: DescriptionDialogProps) {
  const { resolvedTheme } = useTheme()
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pendingMarkdown = useRef<string | null>(null)

  const commit = useCallback(
    (markdown: string) => {
      pendingMarkdown.current = null
      onChange({ notes: hasDescriptionContent(markdown) ? markdown : '' })
    },
    [onChange],
  )

  // On close/unmount, flush a still-pending edit instead of dropping it.
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimer.current)
      if (pendingMarkdown.current !== null) commit(pendingMarkdown.current)
    }
  }, [commit])

  const handleChange = useCallback(
    (markdown: string) => {
      pendingMarkdown.current = markdown
      clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => commit(markdown), DEBOUNCE_MS)
    },
    [commit],
  )

  return createPortal(
    <>
      <div className="description-dialog-scrim" />
      <Rnd
        className="description-dialog"
        default={{
          x: Math.max(24, window.innerWidth / 2 - 480),
          y: 64,
          width: 960,
          height: 680,
        }}
        minWidth={420}
        minHeight={280}
        bounds="window"
        dragHandleClassName="description-dialog-header"
        cancel=".description-dialog-close"
        enableResizing
      >
        <div className="description-dialog-header">
          <h2>
            <NotesIcon size={16} className="description-dialog-header-icon" />
            <span>{node.data.label || 'Knoten'} - Beschreibung</span>
          </h2>
          <button
            type="button"
            className="node-inspector-close description-dialog-close"
            onClick={onClose}
            title="Schließen"
            aria-label="Schließen"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="description-dialog-body">
          <MDXEditor
            key={node.id}
            markdown={node.data.notes ?? ''}
            onChange={handleChange}
            className={resolvedTheme === 'dark' ? 'mdxeditor-full-height dark-theme' : 'mdxeditor-full-height'}
            contentEditableClassName="description-dialog-editable"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              thematicBreakPlugin(),
              markdownPastePlugin(),
              toolbarPlugin({ toolbarContents: () => <EditorToolbar /> }),
            ]}
          />
        </div>
      </Rnd>
    </>,
    document.body,
  )
}
