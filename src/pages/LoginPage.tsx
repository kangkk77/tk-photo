import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'

function LoginPage() {
  const { isAuthenticated, loading, signIn } = useAuth()
  const { t } = useI18n()
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
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : t('common.status.somethingWentWrong')

      setErrorMessage(t('login.errorPrefix', { message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-14 md:space-y-18">
      <div className="max-w-3xl space-y-5 pt-4 md:pt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          {t('login.overline')}
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          {t('login.title')}
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          {t('login.description')}
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
                {t('login.email')}
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
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>
          </div>

          {errorMessage ? (
            <div className="space-y-2 border-t border-subtle pt-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                {t('login.errorLabel')}
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
              {isSubmitting ? t('login.submitting') : t('login.submit')}
            </button>
            <p className="text-sm leading-7 text-muted">{t('login.hint')}</p>
          </div>
        </form>

        <aside className="space-y-5 border-t border-subtle/80 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-1">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('login.accessNotes')}
          </p>
          <div className="space-y-4 text-sm leading-8 text-soft md:text-base">
            <p>{t('login.noteOne')}</p>
            <p>{t('login.noteTwo')}</p>
            <p>{t('login.noteThree')}</p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default LoginPage
