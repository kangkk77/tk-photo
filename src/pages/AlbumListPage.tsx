import { useEffect, useState } from 'react'
import AlbumGrid from '../components/AlbumGrid'
import type { Album } from '../types'
import { getAlbums } from '../services/galleryService'

function AlbumListPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadAlbums = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const results = await getAlbums()

        if (!isActive) {
          return
        }

        setAlbums(results)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error ? error.message : 'Unable to load albums.',
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadAlbums()

    return () => {
      isActive = false
    }
  }, [])

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

      {isLoading ? (
        <p className="text-sm leading-8 text-soft md:text-base">
          Loading the exhibition directory...
        </p>
      ) : errorMessage ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Load Error
          </p>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {errorMessage}
          </p>
        </div>
      ) : albums.length === 0 ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            No Albums Yet
          </p>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            The exhibition directory is currently empty.
          </p>
        </div>
      ) : (
        <AlbumGrid albums={albums} />
      )}
    </section>
  )
}

export default AlbumListPage
