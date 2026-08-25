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
import { CloseIcon } from './icons'
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

  useEffect(() => {
    return () => clearTimeout(debounceTimer.current)
  }, [])

  const handleChange = useCallback(
    (markdown: string) => {
      clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        onChange({ notes: markdown })
      }, DEBOUNCE_MS)
    },
    [onChange],
  )

  return createPortal(
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
        <h2>{node.data.label || 'Knoten'} – Beschreibung</h2>
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
          className={resolvedTheme === 'dark' ? 'dark-theme' : undefined}
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
    </Rnd>,
    document.body,
  )
}
