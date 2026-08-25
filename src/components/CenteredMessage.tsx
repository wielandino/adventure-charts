export function CenteredMessage({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="centered-message">
      <p>{text}</p>
      {children}
    </div>
  )
}
