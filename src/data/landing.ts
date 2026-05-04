import { albums as staticAlbums } from './albums'
import type { Album } from '../types'

export interface LandingContent {
  heroImage: string
  featuredAlbums: Album[]
}

const LANDING_FEATURED_ALBUM_IDS = [
  'stone-and-eaves',
  'twilight-ridge',
  'small-signs',
] as const

function getLandingFeaturedAlbums(): Album[] {
  const selectedAlbums = LANDING_FEATURED_ALBUM_IDS.map((albumId) =>
    staticAlbums.find((album) => album.id === albumId),
  ).filter((album): album is Album => Boolean(album))

  return selectedAlbums.length > 0 ? selectedAlbums : staticAlbums.slice(0, 3)
}

export const landingContent: LandingContent = {
  heroImage: 'landing/entrance-pagoda.jpg',
  featuredAlbums: getLandingFeaturedAlbums(),
}
