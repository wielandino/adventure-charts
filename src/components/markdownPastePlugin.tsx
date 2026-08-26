import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  PASTE_COMMAND,
  RootNode,
  type LexicalNode,
} from 'lexical'
import { addComposerChild$, addExportVisitor$, addImportVisitor$, realmPlugin } from '@mdxeditor/editor'

const EMPTY_PARAGRAPH_HTML_MARKER = '<br />'

/**
 * Markdown has no way to represent a deliberately empty paragraph - a run of
 * blank lines is just paragraph-separator whitespace and collapses to nothing
 * on the next parse. To let users keep an intentional blank line (e.g. two
 * blank lines in a row, or an empty paragraph created via double Enter),
 * empty paragraphs are exported as a standalone `<br />` HTML block, which
 * markdown parsers preserve as real content instead of throwing it away.
 */
const EmptyParagraphExportVisitor = {
  priority: 1,
  testLexicalNode: (node: LexicalNode) => $isParagraphNode(node) && node.getChildrenSize() === 0,
  visitLexicalNode: ({ actions }: { actions: { addAndStepInto: (type: string, props?: Record<string, unknown>, hasChildren?: boolean) => void } }) => {
    actions.addAndStepInto('html', { value: EMPTY_PARAGRAPH_HTML_MARKER }, false)
  },
}

const EmptyParagraphImportVisitor = {
  testNode: (node: { type: string; value?: string }) =>
    node.type === 'html' && node.value?.trim() === EMPTY_PARAGRAPH_HTML_MARKER,
  visitNode: ({ actions }: { actions: { addAndStepInto: (node: unknown) => void } }) => {
    actions.addAndStepInto($createParagraphNode())
  },
}

/**
 * MDXEditor's default plain-text paste handling (Lexical's `insertRawText`)
 * turns every newline into a soft line break inside a single paragraph, so a
 * blank line between two paragraphs becomes two consecutive line breaks
 * instead of an actual paragraph split. That's visually confusing (it reads
 * as an extra empty line) and tempts users to "clean it up" by deleting what
 * looks like a redundant blank line - which merges the two paragraphs back
 * into one and drops the paragraph break for good. This intercepts plain-text
 * paste and builds real paragraph nodes for blank-line-separated text instead.
 */
function PlainTextPasteHandler() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!(event instanceof ClipboardEvent) || !event.clipboardData) return false
        if (event.clipboardData.getData('text/html')) return false

        const text = event.clipboardData.getData('text/plain')
        // Split on exact blank-line pairs so an extra blank line (4 newlines)
        // yields an empty segment - i.e. a deliberate empty paragraph -
        // instead of being swallowed into a single paragraph break.
        const paragraphs = text?.split('\n\n') ?? []
        if (paragraphs.length < 2) return false

        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false

        selection.insertNodes(
          paragraphs.map((paragraph) => {
            const paragraphNode = $createParagraphNode()
            const lines = paragraph.split('\n')
            lines.forEach((line, lineIndex) => {
              if (lineIndex > 0) paragraphNode.append($createLineBreakNode())
              if (line) paragraphNode.append($createTextNode(line))
            })
            return paragraphNode
          }),
        )

        event.preventDefault()
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor])

  return null
}

/**
 * Lexical's default backspace handling always dispatches
 * `DELETE_CHARACTER_COMMAND`, even when there is nothing left to delete. When
 * the caret sits in the last remaining empty paragraph (the whole document is
 * empty), `RangeSelection.deleteCharacter` walks out to the root - which
 * counts as a shadow root - and, since the anchor paragraph `isEmpty()`,
 * removes it. That leaves the root with zero children, which corrupts the
 * editor's internal state badly enough that further typing stops working
 * until the editor is remounted (see facebook/lexical#6570 and related
 * "backspace in empty paragraph" issues - the expected behavior described
 * there is that this keystroke should be a no-op). This intercepts backspace
 * ahead of Lexical's own handler and swallows it in exactly that situation.
 */
function EmptyBackspaceGuard() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false

        const root = $getRoot()
        const onlyChild = root.getChildrenSize() === 1 ? root.getFirstChild() : null
        if (!onlyChild || !$isParagraphNode(onlyChild) || onlyChild.getChildrenSize() !== 0) return false

        event.preventDefault()
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor])

  return null
}

/**
 * Backstop for `EmptyBackspaceGuard`: deletion can also reach the model via
 * the native `beforeinput` (`deleteContentBackward`) pipeline, which Lexical
 * handles independently of `KEY_BACKSPACE_COMMAND` (see `$handleBeforeInput`
 * in lexical core) and which isn't reliably preventable by calling
 * `preventDefault()` on the keydown event alone (Lexical's own source notes
 * this breaks down at least on iOS). Whatever path empties the root, this
 * transform runs synchronously within the same update - before anything is
 * painted - and restores the "root always has at least one child" invariant
 * that Lexical itself does not enforce for root/shadow-root nodes.
 */
function EmptyRootGuard() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerNodeTransform(RootNode, (root) => {
      if (root.getChildrenSize() === 0) {
        const paragraph = $createParagraphNode()
        root.append(paragraph)
        paragraph.select()
      }
    })
  }, [editor])

  return null
}

export const markdownPastePlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addComposerChild$]: [PlainTextPasteHandler, EmptyBackspaceGuard, EmptyRootGuard],
      [addExportVisitor$]: EmptyParagraphExportVisitor,
      [addImportVisitor$]: EmptyParagraphImportVisitor,
    })
  },
})
