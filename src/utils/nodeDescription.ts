/**
 * The MDX editor serialises an "empty" document to markup such as `<br />` or
 * `<br />\n\n<br />` rather than an empty string, so a plain truthiness check on
 * `data.notes` keeps reporting a description the user has cleared. This strips
 * the empty-editor artifacts (br tags, nbsp entities, whitespace) and reports
 * whether any real content remains.
 */
export function hasDescriptionContent(notes: string | null | undefined): boolean {
  if (!notes) return false
  const stripped = notes
    .replace(/<\/?br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .trim()
  return stripped.length > 0
}
