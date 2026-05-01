import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Photo } from '../types'
import { getImagePath } from '../utils/paths'

type MotionImageProps = {
  photo: Photo
  index: number
  className?: string
}

function getAspectClass(photo: Photo) {
  if (photo.layout === 'full') {
    return 'aspect-[16/9]'
  }

  if (photo.orientation === 'portrait') {
    return 'aspect-[4/5]'
  }

  if (photo.orientation === 'square') {
    return 'aspect-square'
  }

  return 'aspect-[3/2]'
}

function MotionImage({ photo, index, className = '' }: MotionImageProps) {
  const [imageMissing, setImageMissing] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const aspectClass = getAspectClass(photo)

  return (
    <motion.figure
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={
        shouldReduceMotion
          ? { duration: 0.2, ease: 'linear' }
          : { duration: 0.65, ease: 'easeOut', delay: index * 0.05 }
      }
      className={`space-y-4 ${className}`.trim()}
    >
      <Link
        to={`/albums/${photo.albumId}/${photo.id}`}
        className="group block"
        aria-label={`Open photo ${photo.title}`}
      >
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.2, ease: 'linear' }
              : { duration: 0.35, ease: 'easeOut' }
          }
          className="overflow-hidden bg-panel/30"
        >
          {!imageMissing ? (
            <img
              src={getImagePath(photo.image)}
              alt={photo.title}
              loading="lazy"
              onError={() => setImageMissing(true)}
              className="block h-auto w-full"
            />
          ) : (
            <div
              className={`flex ${aspectClass} items-end bg-[linear-gradient(180deg,rgba(242,240,236,0.16),rgba(242,240,236,0.68))] p-5 md:p-7`}
            >
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
                  Image Pending
                </p>
                <p className="max-w-sm font-serif text-2xl leading-tight text-soft md:text-3xl">
                  {photo.title}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </Link>

      <figcaption>
        <h2 className="font-serif text-2xl leading-tight text-ink md:text-[2rem]">
          {photo.title}
        </h2>
      </figcaption>
    </motion.figure>
  )
}

export default MotionImage
