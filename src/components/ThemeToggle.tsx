import { Moon, Sun } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useTheme } from '../hooks/useTheme'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark ? t('theme.switchToLight') : t('theme.switchToDark')
      }
      aria-pressed={isDark}
      className="inline-flex h-10 w-10 items-center justify-center border border-subtle/80 text-soft transition-colors hover:text-accent"
    >
      {isDark ? (
        <Sun className="h-4 w-4" strokeWidth={1.5} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.5} />
      )}
    </button>
  )
}

export default ThemeToggle
