import { useTheme } from '../theme/ThemeContext'
import { MoonIcon, SunIcon } from './icons'

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      title={resolvedTheme === 'dark' ? 'Zu hellem Design wechseln' : 'Zu dunklem Design wechseln'}
      aria-label="Design wechseln"
    >
      {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
