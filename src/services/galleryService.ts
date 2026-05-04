import { albums } from '../data/albums'
import type { Album, Photo } from '../types'

export interface PhotoLookupResult {
  album: Album
  photo: Photo
}

export interface AdjacentPhotosResult {
  previousPhoto: Photo | null
  nextPhoto: Photo | null
  currentIndex: number
  totalPhotos: number
}

export async function getAlbums(): Promise<Album[]> {
  return [...albums].sort((left, right) => right.date.localeCompare(left.date))
}

export async function getFeaturedAlbums(limit = 4): Promise<Album[]> {
  return albums.slice(0, limit)
}

export async function getAlbumById(albumId: string): Promise<Album | null> {
  return albums.find((entry) => entry.id === albumId) ?? null
}

export async function getPhotoById(
  albumId: string,
  photoId: string,
): Promise<PhotoLookupResult | null> {
  const album = await getAlbumById(albumId)

  if (!album) {
    return null
  }

  const photo = album.photos.find((entry) => entry.id === photoId)

  if (!photo) {
    return null
  }

  return {
    album,
    photo,
  }
}

export async function getAdjacentPhotos(
  albumId: string,
  photoId: string,
): Promise<AdjacentPhotosResult | null> {
  const album = await getAlbumById(albumId)

  if (!album) {
    return null
  }

  const currentIndex = album.photos.findIndex((entry) => entry.id === photoId)

  if (currentIndex < 0) {
    return null
  }

  return {
    previousPhoto: currentIndex > 0 ? album.photos[currentIndex - 1] : null,
    nextPhoto:
      currentIndex < album.photos.length - 1
        ? album.photos[currentIndex + 1]
        : null,
    currentIndex,
    totalPhotos: album.photos.length,
  }
}
