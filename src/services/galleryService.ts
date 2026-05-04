import { albums as staticAlbums } from '../data/albums'
import { getSupabaseClient, hasSupabaseEnv } from '../lib/supabaseClient'
import type { Album, Photo } from '../types'
import type { PhotoRow } from '../types/database'
import {
  mapAlbumRowToAlbum,
  sortAlbumRows,
} from './galleryMappers'

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

const SHOULD_FALL_BACK_WHEN_EMPTY = true

function logGallerySource(message: string) {
  if (import.meta.env.DEV) {
    console.info(`[galleryService] ${message}`)
  }
}

function getStaticAlbumsSorted(): Album[] {
  return [...staticAlbums].sort((left, right) => right.date.localeCompare(left.date))
}

async function loadPublicAlbumsFromSupabase(): Promise<Album[]> {
  const supabase = getSupabaseClient()
  const { data: albumRows, error: albumError } = await supabase
    .from('albums')
    .select('*')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (albumError) {
    throw albumError
  }

  if (!albumRows?.length) {
    return []
  }

  const { data: photoRows, error: photoError } = await supabase
    .from('photos')
    .select('*')
    .in(
      'album_id',
      albumRows.map((album) => album.id),
    )
    .order('created_at', { ascending: true })

  if (photoError) {
    throw photoError
  }

  const photosByAlbumId = new Map<string, PhotoRow[]>()

  for (const photo of photoRows ?? []) {
    const existingPhotos = photosByAlbumId.get(photo.album_id) ?? []
    existingPhotos.push(photo)
    photosByAlbumId.set(photo.album_id, existingPhotos)
  }

  return sortAlbumRows(albumRows).map((album) =>
    mapAlbumRowToAlbum(supabase, album, photosByAlbumId.get(album.id) ?? []),
  )
}

async function loadPublicAlbumByIdFromSupabase(
  albumId: string,
): Promise<Album | null> {
  const supabase = getSupabaseClient()
  const { data: albumRow, error: albumError } = await supabase
    .from('albums')
    .select('*')
    .eq('id', albumId)
    .eq('visibility', 'public')
    .maybeSingle()

  if (albumError) {
    throw albumError
  }

  if (!albumRow) {
    return null
  }

  const { data: photoRows, error: photoError } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .order('created_at', { ascending: true })

  if (photoError) {
    throw photoError
  }

  return mapAlbumRowToAlbum(supabase, albumRow, photoRows ?? [])
}

export async function getAlbums(): Promise<Album[]> {
  if (!hasSupabaseEnv) {
    logGallerySource('getAlbums -> static fallback (missing Supabase env)')
    return getStaticAlbumsSorted()
  }

  try {
    const supabaseAlbums = await loadPublicAlbumsFromSupabase()

    if (supabaseAlbums.length > 0 || !SHOULD_FALL_BACK_WHEN_EMPTY) {
      logGallerySource('getAlbums -> supabase')
      return supabaseAlbums
    }

    logGallerySource('getAlbums -> static fallback (no public albums yet)')
    return getStaticAlbumsSorted()
  } catch (error) {
    logGallerySource(
      `getAlbums -> static fallback (Supabase query failed: ${
        error instanceof Error ? error.message : 'unknown error'
      })`,
    )
    return getStaticAlbumsSorted()
  }
}

export async function getFeaturedAlbums(limit = 4): Promise<Album[]> {
  const allAlbums = await getAlbums()
  return allAlbums.slice(0, limit)
}

export async function getAlbumById(albumId: string): Promise<Album | null> {
  if (!hasSupabaseEnv) {
    logGallerySource('getAlbumById -> static fallback (missing Supabase env)')
    return staticAlbums.find((entry) => entry.id === albumId) ?? null
  }

  try {
    const album = await loadPublicAlbumByIdFromSupabase(albumId)

    if (album) {
      logGallerySource('getAlbumById -> supabase')
      return album
    }

    logGallerySource('getAlbumById -> static fallback (album not found in Supabase)')
    return staticAlbums.find((entry) => entry.id === albumId) ?? null
  } catch (error) {
    logGallerySource(
      `getAlbumById -> static fallback (Supabase query failed: ${
        error instanceof Error ? error.message : 'unknown error'
      })`,
    )
    return staticAlbums.find((entry) => entry.id === albumId) ?? null
  }
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
