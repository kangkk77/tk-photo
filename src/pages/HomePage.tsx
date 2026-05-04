import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AlbumGrid from '../components/AlbumGrid'
import GalleryHero from '../components/GalleryHero'
import { siteConfig } from '../data/site'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import type { Album } from '../types'
import type { LandingContent } from '../data/landing'
import {
  getLandingContent,
  getMyHomepageAlbums,
} from '../services/galleryService'

function HomePage() {
  const { t } = useI18n()
  const { isAuthenticated, loading: isAuthLoading } = useAuth()
  const [landing, setLanding] = useState<LandingContent | null>(null)
  const [myAlbums, setMyAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    let isActive = true

    const loadHomepageContent = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const nextLanding = await getLandingContent()

        if (!isActive) {
          return
        }

        setLanding(nextLanding)

        if (isAuthenticated) {
          const nextMyAlbums = await getMyHomepageAlbums()

          if (!isActive) {
            return
          }

          setMyAlbums(nextMyAlbums)
          return
        }

        setMyAlbums([])
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

    void loadHomepageContent()

    return () => {
      isActive = false
    }
  }, [isAuthenticated, isAuthLoading, t])

  const featuredAlbums = isAuthenticated
    ? myAlbums.slice(0, 4)
    : landing?.featuredAlbums ?? []
  const heroAlbum = isAuthenticated ? myAlbums[0] : landing?.featuredAlbums[0]
  const heroTitle = isAuthenticated ? t('home.auth.heroTitle') : siteConfig.title
  const heroSubtitle = isAuthenticated
    ? t('home.auth.heroSubtitle')
    : t('home.landing.heroSubtitle')
  const heroDescription = isAuthenticated
    ? t('home.auth.heroDescription')
    : t('home.landing.heroDescription')
  const heroBackgroundImage = isAuthenticated
    ? heroAlbum?.coverImage || landing?.heroImage
    : landing?.heroImage
  const sectionOverline = isAuthenticated
    ? t('home.auth.overline')
    : t('home.landing.overline')
  const sectionTitle = isAuthenticated
    ? t('home.auth.title')
    : t('home.landing.title')
  const sectionDescription = isAuthenticated
    ? t('home.auth.description')
    : t('home.landing.description')

  return (
    <div className="-mx-6 space-y-0 pb-8 md:-mx-12 md:pb-12">
      <GalleryHero
        title={heroTitle}
        subtitle={heroSubtitle}
        description={heroDescription}
        backgroundImage={heroBackgroundImage}
        featuredAlbumTitle={heroAlbum?.title}
        featuredAlbumSubtitle={heroAlbum?.subtitle}
        featuredAlbumDate={heroAlbum?.date}
        featuredAlbumLocation={heroAlbum?.location}
      />

      <section className="relative z-10 -mt-12 mx-auto w-full max-w-6xl px-6 md:-mt-16 md:px-12">
        <div className="border-t border-subtle bg-canvas px-0 pt-10 md:pt-12">
          <div className="mb-12 flex flex-col gap-5 md:mb-16 md:max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              {sectionOverline}
            </p>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-5xl">
              {sectionTitle}
            </h2>
            <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
              {sectionDescription}
            </p>
          </div>

          {isAuthLoading || isLoading ? (
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
          ) : isAuthenticated && featuredAlbums.length === 0 ? (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                {t('home.auth.emptyLabel')}
              </p>
              <h3 className="font-serif text-2xl leading-tight text-ink md:text-3xl">
                {t('home.auth.emptyTitle')}
              </h3>
              <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
                {t('home.auth.emptyDescription')}
              </p>
              <Link
                to="/admin"
                className="inline-flex text-sm tracking-[0.08em] text-soft transition-colors hover:text-accent"
              >
                {t('home.auth.emptyAction')}
              </Link>
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
