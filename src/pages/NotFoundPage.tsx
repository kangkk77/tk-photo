import { Link } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'

function NotFoundPage() {
  const { t } = useI18n()

  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-5 pt-6 md:pt-10">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">
          {t('notFound.overline')}
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          {t('notFound.title')}
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          {t('notFound.description')}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm tracking-[0.08em] text-soft">
          <Link to="/" className="transition-colors hover:text-accent">
            {t('notFound.returnHome')}
          </Link>
          <Link to="/albums" className="transition-colors hover:text-accent">
            {t('notFound.viewAlbums')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
