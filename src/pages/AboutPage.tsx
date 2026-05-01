import { siteConfig } from '../data/site'

function AboutPage() {
  return (
    <section className="space-y-14 md:space-y-16">
      <div className="max-w-3xl space-y-5 pt-4 md:pt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          About The Exhibition
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          A quiet online space for photographs, sequencing, and memory.
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          {siteConfig.description} The project is shaped as a small digital
          exhibition rather than a utility gallery, so pacing, spacing, and
          narrative remain as important as the images themselves.
        </p>
      </div>

      <div className="grid gap-10 border-t border-subtle pt-8 md:grid-cols-2 md:gap-x-14">
        <section className="space-y-5">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            Authors
          </p>
          <div className="space-y-4">
            {siteConfig.authors.map((author) => (
              <div key={author.name} className="space-y-1">
                <h2 className="font-serif text-2xl leading-tight text-ink">
                  {author.name}
                </h2>
                <p className="text-sm tracking-[0.08em] text-soft">
                  {author.role}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              Cameras
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
              Lenses
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
