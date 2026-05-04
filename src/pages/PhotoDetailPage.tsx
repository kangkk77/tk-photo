import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ExifPanel from '../components/ExifPanel'
import PhotoDetail from '../components/PhotoDetail'
import { useI18n } from '../hooks/useI18n'
import type { Album, Photo } from '../types'
import {
  getAdjacentPhotos,
  getPhotoById,
} from '../services/galleryService'

interface PhotoPageState {
  album: Album | null
  photo: Photo | null
  previousPhoto: Photo | null
  nextPhoto: Photo | null
  currentIndex: number
  totalPhotos: number
}

function PhotoDetailPage() {
  const { albumId, photoId } = useParams()
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const { t } = useI18n()
  const [pageState, setPageState] = useState<PhotoPageState>({
    album: null,
    photo: null,
    previousPhoto: null,
    nextPhoto: null,
    currentIndex: -1,
    totalPhotos: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { album, photo, previousPhoto, nextPhoto, currentIndex, totalPhotos } =
    pageState

  useEffect(() => {
    let isActive = true

    const loadPhoto = async () => {
      if (!albumId || !photoId) {
        setPageState({
          album: null,
          photo: null,
          previousPhoto: null,
          nextPhoto: null,
          currentIndex: -1,
          totalPhotos: 0,
        })
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const [photoResult, adjacentResult] = await Promise.all([
          getPhotoById(albumId, photoId),
          getAdjacentPhotos(albumId, photoId),
        ])

        if (!isActive) {
          return
        }

        if (!photoResult || !adjacentResult) {
          setPageState({
            album: null,
            photo: null,
            previousPhoto: null,
            nextPhoto: null,
            currentIndex: -1,
            totalPhotos: 0,
          })
          return
        }

        setPageState({
          album: photoResult.album,
          photo: photoResult.photo,
          previousPhoto: adjacentResult.previousPhoto,
          nextPhoto: adjacentResult.nextPhoto,
          currentIndex: adjacentResult.currentIndex,
          totalPhotos: adjacentResult.totalPhotos,
        })
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

    void loadPhoto()

    return () => {
      isActive = false
    }
  }, [albumId, photoId, t])

  useEffect(() => {
    if (!album || !photo) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName

      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
        return
      }

      if (event.key === 'ArrowLeft' && previousPhoto) {
        navigate(`/albums/${album.id}/${previousPhoto.id}`)
      }

      if (event.key === 'ArrowRight' && nextPhoto) {
        navigate(`/albums/${album.id}/${nextPhoto.id}`)
      }

      if (event.key === 'Escape') {
        navigate(`/albums/${album.id}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [album, navigate, nextPhoto, photo, previousPhoto])

  if (isLoading) {
    return (
      <section className="space-y-10">
        <BackButton fallbackTo="/albums" />

        <div className="max-w-3xl space-y-5 pt-2 md:pt-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('photoDetail.loadingLabel')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
            {t('photoDetail.loadingTitle')}
          </h1>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {t('photoDetail.loadingDescription')}
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
            {t('photoDetail.loadErrorLabel')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
            {t('photoDetail.loadErrorTitle')}
          </h1>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {errorMessage}
          </p>
          <Link
            to="/albums"
            className="inline-flex text-sm tracking-[0.08em] text-soft transition-colors hover:text-accent"
          >
            {t('photoDetail.returnToAlbums')}
          </Link>
        </div>
      </section>
    )
  }

  if (!album || !photo) {
    return (
      <section className="space-y-10">
        <BackButton fallbackTo="/albums" />

        <div className="max-w-3xl space-y-5 pt-2 md:pt-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('photoDetail.notFoundLabel')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
            {t('photoDetail.notFoundTitle')}
          </h1>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {t('photoDetail.notFoundDescription')}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm tracking-[0.08em] text-soft">
            <Link to="/albums" className="transition-colors hover:text-accent">
              {t('photoDetail.returnToAlbums')}
            </Link>
            {album ? (
              <Link
                to={`/albums/${album.id}`}
                className="transition-colors hover:text-accent"
              >
                {t('photoDetail.returnToCurrentAlbum')}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-10 md:space-y-12">
      <BackButton fallbackTo={`/albums/${album.id}`} />

      <div className="grid gap-10 border-t border-subtle pt-6 lg:grid-cols-[minmax(0,7fr)_minmax(18rem,3fr)] lg:gap-x-14 lg:pt-10">
        <PhotoDetail
          photo={photo}
          albumTitle={album.title}
          currentIndex={currentIndex}
          totalPhotos={totalPhotos}
          previousPhoto={
            previousPhoto
              ? {
                  id: previousPhoto.id,
                  title: previousPhoto.title,
                  to: `/albums/${album.id}/${previousPhoto.id}`,
                }
              : undefined
          }
          nextPhoto={
            nextPhoto
              ? {
                  id: nextPhoto.id,
                  title: nextPhoto.title,
                  to: `/albums/${album.id}/${nextPhoto.id}`,
                }
              : undefined
          }
        />

        <motion.aside
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.2, ease: 'linear' }
              : { duration: 0.55, ease: 'easeOut', delay: 0.08 }
          }
          className="space-y-8 lg:pt-2"
        >
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              {t('photoDetail.singleWork')}
            </p>
            <div className="space-y-3">
              <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl">
                {photo.title}
              </h1>
              <p className="text-sm tracking-[0.08em] text-muted">
                {photo.date} / {photo.location}
              </p>
            </div>
            <p className="text-sm leading-8 text-soft md:text-base">
              {photo.description}
            </p>
          </div>

          <ExifPanel photo={photo} />
        </motion.aside>
      </div>
    </section>
  )
}

export default PhotoDetailPage
