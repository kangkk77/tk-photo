import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Photo } from '../types'
import { getImagePath } from '../utils/paths'

type PhotoNavigation = {
  id: string
  title: string
  to: string
}

type PhotoDetailProps = {
  photo: Photo
  albumTitle: string
  currentIndex: number
  totalPhotos: number
  previousPhoto?: PhotoNavigation
  nextPhoto?: PhotoNavigation
}

function PhotoDetail({
  photo,
  albumTitle,
  currentIndex,
  totalPhotos,
  previousPhoto,
  nextPhoto,
}: PhotoDetailProps) {
  const [imageMissing, setImageMissing] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="space-y-6">
      <motion.figure
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0.2, ease: 'linear' }
            : { duration: 0.55, ease: 'easeOut' }
        }
        className="space-y-5"
      >
        <div className="overflow-hidden bg-panel/30">
          {!imageMissing ? (
            <img
              src={getImagePath(photo.image)}
              alt={photo.title}
              loading="eager"
              onError={() => setImageMissing(true)}
              className="block h-auto w-full"
            />
          ) : (
            <div className="flex min-h-[22rem] items-end bg-[linear-gradient(180deg,rgba(242,240,236,0.16),rgba(242,240,236,0.68))] p-6 md:min-h-[34rem] md:p-10">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
                  Image Pending
                </p>
                <p className="max-w-lg font-serif text-3xl leading-tight text-soft md:text-5xl">
                  {photo.title}
                </p>
              </div>
            </div>
          )}
        </div>

        <figcaption className="flex flex-col gap-3 border-t border-subtle/80 pt-4 text-sm text-soft md:flex-row md:items-center md:justify-between">
          <p className="tracking-[0.08em]">
            {albumTitle} / {String(currentIndex + 1).padStart(2, '0')} of{' '}
            {String(totalPhotos).padStart(2, '0')}
          </p>
          <p className="text-xs uppercase tracking-[0.26em] text-muted">
            Use Arrow Keys To Navigate
          </p>
        </figcaption>
      </motion.figure>

      <div className="flex items-center justify-between gap-4 border-t border-subtle pt-5">
        {previousPhoto ? (
          <Link
            to={previousPhoto.to}
            className="inline-flex items-center gap-2 text-sm text-soft transition-colors hover:text-accent"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>Previous</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-muted/60">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            <span>Previous</span>
          </span>
        )}

        {nextPhoto ? (
          <Link
            to={nextPhoto.to}
            className="inline-flex items-center gap-2 text-sm text-soft transition-colors hover:text-accent"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm text-muted/60">
            <span>Next</span>
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </span>
        )}
      </div>
    </div>
  )
}

export default PhotoDetail
