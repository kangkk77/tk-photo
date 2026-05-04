import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import PhotoWall from '../components/PhotoWall'
import { useI18n } from '../hooks/useI18n'
import type { Album } from '../types'
import { getAlbumById } from '../services/galleryService'

function AlbumDetailPage() {
  const { t } = useI18n()
  const { albumId } = useParams()
  const [album, setAlbum] = useState<Album | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadAlbum = async () => {
      if (!albumId) {
        setAlbum(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result = await getAlbumById(albumId)

        if (!isActive) {
          return
        }

        setAlbum(result)
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

    void loadAlbum()

    return () => {
      isActive = false
    }
  }, [albumId, t])

  if (isLoading) {
    return (
      <section className="space-y-10">
        <BackButton fallbackTo="/albums" />

        <div className="max-w-3xl space-y-5 pt-2 md:pt-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('albumDetail.loadingLabel')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
            {t('albumDetail.loadingTitle')}
          </h1>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {t('albumDetail.loadingDescription')}
          </p>
        </div>
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className="space-y-10">
        <BackButton fallbackTo="/albums" />

        <div className="max-w-3xl space-y-5 pt-2 md:pt-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('albumDetail.loadErrorLabel')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
            {t('albumDetail.loadErrorTitle')}
          </h1>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {errorMessage}
          </p>
          <Link
            to="/albums"
            className="inline-flex text-sm tracking-[0.08em] text-soft transition-colors hover:text-accent"
          >
            {t('albumDetail.returnToAlbums')}
          </Link>
        </div>
      </section>
    )
  }

  if (!album) {
    return (
      <section className="space-y-10">
        <BackButton fallbackTo="/albums" />

        <div className="max-w-3xl space-y-5 pt-2 md:pt-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('albumDetail.notFoundLabel')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
            {t('albumDetail.notFoundTitle')}
          </h1>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {t('albumDetail.notFoundDescription')}
          </p>
          <Link
            to="/albums"
            className="inline-flex text-sm tracking-[0.08em] text-soft transition-colors hover:text-accent"
          >
            {t('albumDetail.returnToAlbums')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-14 md:space-y-18">
      <BackButton fallbackTo="/albums" />

      <div className="grid gap-8 border-t border-subtle pt-6 md:grid-cols-[minmax(0,1.4fr)_minmax(14rem,0.6fr)] md:gap-x-12 md:pt-10 lg:gap-x-16">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {t('albumDetail.sequenceLabel')}
          </p>
          <div className="space-y-3">
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
              {album.title}
            </h1>
            <p className="text-sm tracking-[0.1em] text-soft md:text-base">
              {album.subtitle}
            </p>
          </div>
          <p className="max-w-3xl text-sm leading-8 text-soft md:text-base">
            {album.description}
          </p>
        </div>

        <div className="space-y-4 border-t border-subtle/80 pt-5 md:border-l md:border-t-0 md:border-subtle/80 md:pl-8 md:pt-10">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('albumDetail.notesLabel')}
          </p>
          <div className="space-y-3 text-sm leading-7 text-soft">
            <p>{album.date}</p>
            <p>{album.location}</p>
            <p>{t('albumDetail.worksCount', { count: album.photos.length })}</p>
          </div>
        </div>
      </div>

      <PhotoWall photos={album.photos} />
    </section>
  )
}

export default AlbumDetailPage
