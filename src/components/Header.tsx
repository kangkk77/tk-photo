import { Camera } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import ThemeToggle from './ThemeToggle'

function Header() {
  const { isAuthenticated, signOut, user } = useAuth()
  const { locale, setLocale, t } = useI18n()
  const navigate = useNavigate()
  const navItems = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/albums', label: t('nav.albums') },
    { to: '/about', label: t('nav.about') },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-subtle bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-6 py-3 md:px-12">
        <NavLink
          to="/"
          end
          className="flex items-center gap-3 text-sm tracking-[0.16em] text-ink"
        >
          <Camera className="h-4 w-4" strokeWidth={1.5} />
          <span className="font-serif text-base tracking-[0.12em]">
            T&amp;K Photo
          </span>
        </NavLink>

        <div className="flex items-center gap-3 md:gap-5">
          <nav className="flex items-center gap-4 text-sm text-soft md:gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? 'text-ink' : 'transition-colors hover:text-accent'
                }
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? 'text-ink'
                    : 'transition-colors hover:text-accent'
                }
              >
                {t('nav.admin')}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? 'text-ink'
                    : 'transition-colors hover:text-accent'
                }
              >
                {t('nav.login')}
              </NavLink>
            )}
          </nav>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm tracking-[0.08em] text-soft transition-colors hover:text-accent"
              aria-label={t('header.signOutAria', { email: user?.email ?? '' }).trim()}
            >
              {t('common.actions.logout')}
            </button>
          ) : null}

          <div
            aria-label={t('header.languageSwitchLabel')}
            className="flex items-center gap-2 border-l border-subtle/70 pl-3 text-xs tracking-[0.16em] text-soft md:pl-4"
          >
            <button
              type="button"
              onClick={() => setLocale('zh-CN')}
              className={
                locale === 'zh-CN'
                  ? 'text-ink'
                  : 'transition-colors hover:text-accent'
              }
            >
              {t('common.locale.zhCN')}
            </button>
            <span className="text-muted/70">/</span>
            <button
              type="button"
              onClick={() => setLocale('en-US')}
              className={
                locale === 'en-US'
                  ? 'text-ink'
                  : 'transition-colors hover:text-accent'
              }
            >
              {t('common.locale.enUS')}
            </button>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
