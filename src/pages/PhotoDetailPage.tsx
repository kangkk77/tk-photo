import { motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ExifPanel from '../components/ExifPanel'
import PhotoDetail from '../components/PhotoDetail'
import { albums } from '../data/albums'

function PhotoDetailPage() {
  const { albumId, photoId } = useParams()
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const album = albums.find((entry) => entry.id === albumId)
  const currentIndex = album?.photos.findIndex((entry) => entry.id === photoId) ?? -1
  const photo = currentIndex >= 0 && album ? album.photos[currentIndex] : undefined
  const previousPhoto =
    album && currentIndex > 0 ? album.photos[currentIndex - 1] : undefined
  const nextPhoto =
    album && currentIndex >= 0 && currentIndex < album.photos.length - 1
      ? album.photos[currentIndex + 1]
      : undefined

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

  if (!album || !photo) {
    return (
      <section className="space-y-10">
        <BackButton fallbackTo="/albums" />

        <div className="max-w-3xl space-y-5 pt-2 md:pt-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            Work Not Found
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
            This photograph is not available in the current exhibition path.
          </h1>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            The album or photo id may be incorrect, or this work is not part of
            the static collection yet.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm tracking-[0.08em] text-soft">
            <Link to="/albums" className="transition-colors hover:text-accent">
              Return to all albums
            </Link>
            {album ? (
              <Link
                to={`/albums/${album.id}`}
                className="transition-colors hover:text-accent"
              >
                Return to current album
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
          totalPhotos={album.photos.length}
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
              Single Work
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
