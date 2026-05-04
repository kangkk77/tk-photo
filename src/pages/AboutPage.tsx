import { siteConfig } from '../data/site'
import { useI18n } from '../hooks/useI18n'

function AboutPage() {
  const { t } = useI18n()

  return (
    <section className="space-y-14 md:space-y-16">
      <div className="max-w-3xl space-y-5 pt-4 md:pt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          {t('about.overline')}
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          {t('about.title')}
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          {t('about.description', { description: t('site.description') })}
        </p>
      </div>

      <div className="grid gap-10 border-t border-subtle pt-8 md:grid-cols-2 md:gap-x-14">
        <section className="space-y-5">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('about.authors')}
          </p>
          <div className="space-y-4">
            {siteConfig.authors.map((author) => (
              <div key={author.name} className="space-y-1">
                <h2 className="font-serif text-2xl leading-tight text-ink">
                  {author.name}
                </h2>
                <p className="text-sm tracking-[0.08em] text-soft">
                  {author.role === 'Photographer'
                    ? t('site.authorRolePhotographer')
                    : author.role}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              {t('about.cameras')}
            </p>
            <div className="space-y-3">
              {siteConfig.cameras.map((camera) => (
                <p key={camera} className="font-mono text-sm text-ink">
                  {camera}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-subtle pt-6">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              {t('about.lenses')}
            </p>
            <div className="space-y-3">
              {siteConfig.lenses.map((lens) => (
                <p key={lens} className="font-mono text-sm text-ink">
                  {lens}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export default AboutPage
