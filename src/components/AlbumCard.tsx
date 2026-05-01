import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Album } from '../types'
import { getImagePath } from '../utils/paths'

type AlbumCardProps = {
  album: Album
  index: number
  className?: string
}

function AlbumCard({ album, index, className = '' }: AlbumCardProps) {
  const [imageMissing, setImageMissing] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.article
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={
        shouldReduceMotion
          ? { duration: 0.2, ease: 'linear' }
          : { duration: 0.6, ease: 'easeOut', delay: index * 0.08 }
      }
      className={className}
    >
      <Link
        to={`/albums/${album.id}`}
        className="group block"
        aria-label={`Open album ${album.title}`}
      >
        <figure className="space-y-5 md:space-y-6">
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.2, ease: 'linear' }
                : { duration: 0.4, ease: 'easeOut' }
            }
            className="overflow-hidden bg-panel/30"
          >
            {!imageMissing ? (
              <img
                src={getImagePath(album.coverImage)}
                alt={album.title}
                loading="lazy"
                onError={() => setImageMissing(true)}
                className="block h-auto w-full"
              />
            ) : (
              <div className="flex min-h-[18rem] items-end bg-[linear-gradient(180deg,rgba(242,240,236,0.18),rgba(242,240,236,0.72))] p-6 md:min-h-[26rem] md:p-8">
                <p className="max-w-sm font-serif text-2xl leading-tight text-soft md:text-3xl">
                  {album.title}
                </p>
              </div>
            )}
          </motion.div>

          <figcaption className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-10">
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
                  Selected Album
                </p>
                <h2 className="font-serif text-[2rem] leading-tight text-ink transition-colors duration-300 group-hover:text-accent md:text-[2.35rem]">
                  {album.title}
                </h2>
              </div>

              <p className="text-sm tracking-[0.08em] text-soft">{album.subtitle}</p>

              <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
                {album.description}
              </p>
            </div>

            <div className="space-y-3 md:pt-2 md:text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                {album.photos.length} Photos
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted md:justify-end">
                <span>{album.date}</span>
                <span>/</span>
                <span>{album.location}</span>
              </div>
            </div>
          </figcaption>
        </figure>
      </Link>
    </motion.article>
  )
}

export default AlbumCard
