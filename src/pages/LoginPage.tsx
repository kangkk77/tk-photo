import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const { isAuthenticated, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo =
    (
      location.state as {
        from?: {
          pathname?: string
        }
      } | null
    )?.from?.pathname ?? '/admin'

  if (!loading && isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      await signIn(email.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to sign in with the provided credentials.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-14 md:space-y-18">
      <div className="max-w-3xl space-y-5 pt-4 md:pt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Studio Access
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          Sign in to the private upload edition.
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          The public exhibition remains open, while the studio route is
          reserved for managing future uploads and album work.
        </p>
      </div>

      <div className="grid gap-10 border-t border-subtle pt-8 md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] md:gap-x-14 md:pt-10">
        <form className="max-w-2xl space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="text-xs uppercase tracking-[0.28em] text-muted"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-[0.28em] text-muted"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {errorMessage ? (
            <div className="space-y-2 border-t border-subtle pt-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                Sign In Error
              </p>
              <p className="max-w-xl text-sm leading-8 text-soft md:text-base">
                {errorMessage}
              </p>
            </div>
          ) : null}

          <div className="flex items-center gap-5 border-t border-subtle pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-w-32 items-center justify-center border border-subtle px-5 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
            <p className="text-sm leading-7 text-muted">
              Email and password authentication is enabled for the V2 studio
              preview.
            </p>
          </div>
        </form>

        <aside className="space-y-5 border-t border-subtle/80 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-1">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            Access Notes
          </p>
          <div className="space-y-4 text-sm leading-8 text-soft md:text-base">
            <p>The studio route is separate from the public exhibition flow.</p>
            <p>
              This round only prepares authentication, route protection, and a
              minimal private dashboard.
            </p>
            <p>
              Albums, uploads, and editing tools will arrive in later V2
              phases.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default LoginPage
