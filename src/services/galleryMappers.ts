import type { SupabaseClient } from '@supabase/supabase-js'
import type { Album, AlbumTheme, Photo, PhotoLayout, PhotoOrientation } from '../types'
import type { AlbumRow, Database, PhotoRow } from '../types/database'

const PHOTO_BUCKET = 'photos'

function isAbsoluteUrl(path: string) {
  return /^(?:https?:)?\/\//i.test(path) || /^(?:data|blob):/i.test(path)
}

function resolveStoragePath(
  supabase: SupabaseClient<Database>,
  path: string | null,
): string {
  if (!path?.trim()) {
    return ''
  }

  if (isAbsoluteUrl(path)) {
    return path
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function normalizeText(value: string | null | undefined, fallback = '') {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : fallback
}

function normalizeAlbumDate(album: AlbumRow) {
  return normalizeText(album.date, album.created_at.slice(0, 10))
}

function normalizePhotoDate(photo: PhotoRow) {
  return normalizeText(photo.date, photo.created_at.slice(0, 10))
}

function compareDescending(left: string, right: string) {
  return right.localeCompare(left)
}

function compareAscending(left: string, right: string) {
  return left.localeCompare(right)
}

function normalizeOrientation(
  orientation: PhotoOrientation | null,
): PhotoOrientation {
  return orientation ?? 'landscape'
}

function normalizeLayout(layout: PhotoLayout | null): PhotoLayout {
  return layout ?? 'full'
}

function normalizeTheme(theme: AlbumTheme | null): AlbumTheme {
  return theme ?? 'other'
}

export function sortAlbumRows(rows: AlbumRow[]) {
  return [...rows].sort((left, right) =>
    compareDescending(normalizeAlbumDate(left), normalizeAlbumDate(right)),
  )
}

export function sortPhotoRows(rows: PhotoRow[]) {
  return [...rows].sort((left, right) =>
    compareAscending(normalizePhotoDate(left), normalizePhotoDate(right)),
  )
}

export function mapPhotoRowToPhoto(
  supabase: SupabaseClient<Database>,
  photo: PhotoRow,
): Photo {
  return {
    id: photo.id,
    albumId: photo.album_id,
    title: normalizeText(photo.title, photo.id),
    description: normalizeText(photo.description),
    note: normalizeText(photo.note) || undefined,
    image: resolveStoragePath(supabase, photo.image_path),
    date: normalizePhotoDate(photo),
    location: normalizeText(photo.location),
    camera: normalizeText(photo.camera),
    lens: normalizeText(photo.lens),
    aperture: normalizeText(photo.aperture),
    shutterSpeed: normalizeText(photo.shutter_speed),
    iso: photo.iso ?? 0,
    focalLength: normalizeText(photo.focal_length),
    orientation: normalizeOrientation(photo.orientation),
    layout: normalizeLayout(photo.layout),
  }
}

export function mapAlbumRowToAlbum(
  supabase: SupabaseClient<Database>,
  album: AlbumRow,
  albumPhotos: PhotoRow[],
): Album {
  const photos = sortPhotoRows(albumPhotos).map((photo) =>
    mapPhotoRowToPhoto(supabase, photo),
  )
  const coverImage =
    resolveStoragePath(supabase, album.cover_image) || photos[0]?.image || ''

  return {
    id: album.id,
    title: normalizeText(album.title, album.id),
    subtitle: normalizeText(album.subtitle),
    description: normalizeText(album.description),
    coverImage,
    theme: normalizeTheme(album.theme),
    date: normalizeAlbumDate(album),
    location: normalizeText(album.location),
    photos,
  }
}
