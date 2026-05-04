import { useEffect, useState } from 'react'
import AlbumGrid from '../components/AlbumGrid'
import GalleryHero from '../components/GalleryHero'
import { siteConfig } from '../data/site'
import { useI18n } from '../hooks/useI18n'
import type { Album } from '../types'
import { getFeaturedAlbums } from '../services/galleryService'

function HomePage() {
  const { t } = useI18n()
  const [featuredAlbums, setFeaturedAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const heroAlbum = featuredAlbums[0]

  useEffect(() => {
    let isActive = true

    const loadFeaturedAlbums = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const results = await getFeaturedAlbums(4)

        if (!isActive) {
          return
        }

        setFeaturedAlbums(results)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : t('common.status.somethingWentWrong'),
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadFeaturedAlbums()

    return () => {
      isActive = false
    }
  }, [t])

  return (
    <div className="-mx-6 space-y-0 pb-8 md:-mx-12 md:pb-12">
      <GalleryHero
        title={siteConfig.title}
        subtitle={t('site.subtitle')}
        description={t('site.description')}
        backgroundImage={heroAlbum?.coverImage}
        featuredAlbumTitle={heroAlbum?.title}
        featuredAlbumSubtitle={heroAlbum?.subtitle}
        featuredAlbumDate={heroAlbum?.date}
        featuredAlbumLocation={heroAlbum?.location}
      />

      <section className="relative z-10 -mt-12 mx-auto w-full max-w-6xl px-6 md:-mt-16 md:px-12">
        <div className="border-t border-subtle bg-canvas px-0 pt-10 md:pt-12">
          <div className="mb-12 flex flex-col gap-5 md:mb-16 md:max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              {t('home.overline')}
            </p>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-5xl">
              {t('home.title')}
            </h2>
            <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
              {t('home.description')}
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm leading-8 text-soft md:text-base">
              {t('home.loading')}
            </p>
          ) : errorMessage ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                {t('home.loadErrorLabel')}
              </p>
              <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
                {errorMessage}
              </p>
            </div>
          ) : featuredAlbums.length === 0 ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                {t('home.noAlbumsLabel')}
              </p>
              <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
                {t('home.noAlbumsDescription')}
              </p>
            </div>
          ) : (
            <AlbumGrid albums={featuredAlbums} />
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
