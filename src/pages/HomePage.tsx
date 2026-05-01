import AlbumGrid from '../components/AlbumGrid'
import GalleryHero from '../components/GalleryHero'
import { albums } from '../data/albums'
import { siteConfig } from '../data/site'

function HomePage() {
  const featuredAlbums = albums.slice(0, 4)
  const heroAlbum = featuredAlbums[0]

  return (
    <div className="-mx-6 space-y-0 pb-8 md:-mx-12 md:pb-12">
      <GalleryHero
        title={siteConfig.title}
        subtitle={siteConfig.subtitle}
        description={siteConfig.description}
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
              Selected Albums
            </p>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-5xl">
              Photographs arranged as sequences, not as a utility gallery.
            </h2>
            <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
              The homepage moves directly from the opening frame into a curated
              set of albums, so the first scroll already feels like stepping
              deeper into the exhibition.
            </p>
          </div>

          <AlbumGrid albums={featuredAlbums} />
        </div>
      </section>
    </div>
  )
}

export default HomePage
