import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { useI18n } from '../hooks/useI18n'
import { getImagePath } from '../utils/paths'

type GalleryHeroProps = {
  title: string
  subtitle: string
  description: string
  backgroundImage?: string
  featuredAlbumTitle?: string
  featuredAlbumSubtitle?: string
  featuredAlbumDate?: string
  featuredAlbumLocation?: string
}

function GalleryHero({
  title,
  subtitle,
  description,
  backgroundImage,
  featuredAlbumTitle,
  featuredAlbumSubtitle,
  featuredAlbumDate,
  featuredAlbumLocation,
}: GalleryHeroProps) {
  const [imageMissing, setImageMissing] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const { t } = useI18n()
  const heroImage = backgroundImage ? getImagePath(backgroundImage) : ''
  const showHeroImage = Boolean(heroImage) && !imageMissing
  const hasFeaturedDetails = Boolean(
    featuredAlbumTitle || featuredAlbumSubtitle || featuredAlbumDate || featuredAlbumLocation,
  )

  return (
    <section className="relative isolate min-h-[calc(100svh-7rem)] overflow-hidden border-b border-subtle/70 bg-canvas">
      {showHeroImage ? (
        <motion.img
          src={heroImage}
          alt=""
          aria-hidden="true"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.25, ease: 'linear' }
              : { duration: 1.1, ease: 'easeOut' }
          }
          onError={() => setImageMissing(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,115,85,0.18),transparent_38%),linear-gradient(180deg,rgba(24,24,24,0.72)_0%,rgba(24,24,24,0.54)_55%,rgba(24,24,24,0.3)_100%)]"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,9,0.54)_0%,rgba(9,9,9,0.28)_34%,rgba(9,9,9,0.4)_72%,rgba(9,9,9,0.66)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.04)_46%,rgba(0,0,0,0.15)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-6 bottom-8 top-6 border border-white/6 md:inset-x-12 md:bottom-10 md:top-8"
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-7rem)] w-full max-w-6xl flex-col justify-between px-6 pb-12 pt-20 md:px-12 md:pb-14 md:pt-28">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.25, ease: 'linear' }
              : { duration: 0.8, ease: 'easeOut', delay: 0.15 }
          }
          className="max-w-3xl pt-8 md:pt-12"
        >
          <p className="mb-5 text-[11px] uppercase tracking-[0.34em] text-white/72 md:mb-7">
            {t('galleryHero.overline')}
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl lg:text-[5.2rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl font-serif text-xl leading-8 text-white/88 md:mt-7 md:text-[1.9rem] md:leading-[2.8rem]">
            {subtitle}
          </p>
          <p className="mt-6 max-w-2xl text-sm leading-8 text-white/74 md:mt-8 md:text-base">
            {description}
          </p>
        </motion.div>

        {hasFeaturedDetails ? (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.25, ease: 'linear' }
                : { duration: 0.8, ease: 'easeOut', delay: 0.28 }
            }
            className="grid gap-6 border-t border-white/10 pt-6 text-white/84 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-end md:gap-12 md:pt-8"
          >
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/58">
                {t('galleryHero.featuredSequence')}
              </p>
              <h2 className="font-serif text-2xl leading-tight text-white md:text-[2.5rem]">
                {featuredAlbumTitle}
              </h2>
              {featuredAlbumSubtitle ? (
                <p className="text-sm tracking-[0.08em] text-white/72 md:text-base">
                  {featuredAlbumSubtitle}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-[0.18em] text-white/60 md:justify-end">
              {featuredAlbumDate ? <span>{featuredAlbumDate}</span> : null}
              {featuredAlbumDate && featuredAlbumLocation ? <span>/</span> : null}
              {featuredAlbumLocation ? <span>{featuredAlbumLocation}</span> : null}
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}

export default GalleryHero
