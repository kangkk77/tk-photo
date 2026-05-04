import { useEffect, useState } from 'react'
import AlbumGrid from '../components/AlbumGrid'
import { useI18n } from '../hooks/useI18n'
import type { Album } from '../types'
import { getAlbums } from '../services/galleryService'

function AlbumListPage() {
  const { t } = useI18n()
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
          error instanceof Error ? error.message : t('common.status.somethingWentWrong'),
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
  }, [t])

  return (
    <section className="space-y-14 md:space-y-18">
      <div className="max-w-3xl space-y-5 pt-4 md:pt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          {t('albumList.overline')}
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          {t('albumList.title')}
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          {t('albumList.description')}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm leading-8 text-soft md:text-base">
          {t('albumList.loading')}
        </p>
      ) : errorMessage ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {t('albumList.loadErrorLabel')}
          </p>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {errorMessage}
          </p>
        </div>
      ) : albums.length === 0 ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {t('albumList.noAlbumsLabel')}
          </p>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {t('albumList.noAlbumsDescription')}
          </p>
        </div>
      ) : (
        <AlbumGrid albums={albums} />
      )}
    </section>
  )
}

export default AlbumListPage
