import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-5 pt-6 md:pt-10">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">
          Page Not Found
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          This exhibition page could not be found.
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          The route may be unavailable in this static edition, or the address
          may no longer point to an active page in the collection.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm tracking-[0.08em] text-soft">
          <Link to="/" className="transition-colors hover:text-accent">
            Return to homepage
          </Link>
          <Link to="/albums" className="transition-colors hover:text-accent">
            View all albums
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
