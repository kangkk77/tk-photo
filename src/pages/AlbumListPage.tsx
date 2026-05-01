import AlbumGrid from '../components/AlbumGrid'
import { albums } from '../data/albums'

function AlbumListPage() {
  const sortedAlbums = [...albums].sort((left, right) =>
    right.date.localeCompare(left.date),
  )

  return (
    <section className="space-y-14 md:space-y-18">
      <div className="max-w-3xl space-y-5 pt-4 md:pt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Exhibition Directory
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          All albums arranged as exhibition sequences.
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          A complete view of the current collection, presented in reverse
          chronological order so the latest sequence enters first while the
          overall rhythm remains restrained and spacious.
        </p>
      </div>

      <AlbumGrid albums={sortedAlbums} />
    </section>
  )
}

export default AlbumListPage
