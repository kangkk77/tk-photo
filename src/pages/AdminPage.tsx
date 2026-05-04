import { useNavigate } from 'react-router-dom'
import AdminAlbumsPanel from '../components/AdminAlbumsPanel'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'

function AdminPage() {
  const { user, signOut } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <section className="space-y-14 md:space-y-18">
      <div className="max-w-3xl space-y-5 pt-4 md:pt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          {t('admin.overline')}
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          {t('admin.title')}
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          {t('admin.description')}
        </p>
      </div>

      <div className="grid gap-10 border-t border-subtle pt-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)] md:gap-x-14 md:pt-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              {t('admin.currentAccount')}
            </p>
            <p className="font-serif text-2xl leading-tight text-ink md:text-3xl">
              {user?.email ?? t('admin.signedInUserFallback')}
            </p>
          </div>
        </div>

        <aside className="space-y-5 border-t border-subtle/80 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-1">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('admin.currentSession')}
          </p>
          <div className="space-y-5 text-sm leading-8 text-soft md:text-base">
            <p>{t('admin.sessionDescription')}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex min-w-28 items-center justify-center border border-subtle px-5 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
            >
              {t('admin.signOut')}
            </button>
          </div>
        </aside>
      </div>

      <AdminAlbumsPanel />
    </section>
  )
}

export default AdminPage
