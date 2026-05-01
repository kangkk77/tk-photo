import { Camera } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/albums', label: 'Albums' },
  { to: '/about', label: 'About' },
]

function Header() {
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
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
