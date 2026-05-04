import { getSupabaseClient } from '../lib/supabaseClient'
import type { PhotoInsert, PhotoRow } from '../types/database'
import { getCurrentUser } from './authService'
import { parseImageExif } from '../utils/exif'

export interface PhotoUploadInput {
  title?: string
  description?: string
}

function normalizeText(value: string | undefined): string | null {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : null
}

function throwIfError(
  error: { message: string } | null,
  fallbackMessage: string,
): void {
  if (error) {
    throw new Error(error.message || fallbackMessage)
  }
}

async function requireCurrentUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('You must be signed in to manage photos.')
  }

  return user
}

function inferFileExtension(file: File): string {
  const nameSegments = file.name.split('.')
  const fileNameExtension =
    nameSegments.length > 1 ? nameSegments[nameSegments.length - 1] : ''
  const sanitizedExtension = fileNameExtension.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (sanitizedExtension) {
    return sanitizedExtension
  }

  const mimeTypeToExtension: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  }

  return mimeTypeToExtension[file.type] ?? 'jpg'
}

function createStoragePath(userId: string, albumId: string, photoId: string, file: File) {
  const extension = inferFileExtension(file)
  return `${userId}/${albumId}/${photoId}-original.${extension}`
}

export async function listPhotosByAlbum(albumId: string): Promise<PhotoRow[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .order('created_at', { ascending: false })

  throwIfError(error, 'Unable to load album photos.')

  return data ?? []
}

export async function uploadPhotoToAlbum(
  albumId: string,
  file: File,
  metadata: PhotoUploadInput,
): Promise<PhotoRow> {
  const user = await requireCurrentUser()

  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded to an album.')
  }

  const supabase = getSupabaseClient()
  const photoId = crypto.randomUUID()
  const imagePath = createStoragePath(user.id, albumId, photoId, file)
  const exif = await parseImageExif(file)

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(imagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  throwIfError(uploadError, 'Unable to upload photo to storage.')

  const payload: PhotoInsert = {
    id: photoId,
    album_id: albumId,
    title: normalizeText(metadata.title),
    description: normalizeText(metadata.description),
    image_path: imagePath,
    date: exif.date,
    location: exif.location,
    camera: exif.camera,
    lens: exif.lens,
    aperture: exif.aperture,
    shutter_speed: exif.shutterSpeed,
    iso: exif.iso,
    focal_length: exif.focalLength,
    orientation: null,
    layout: null,
    created_by: user.id,
  }

  console.log('uploadPhotoToAlbum payload', payload)

  const { data, error } = await supabase
    .from('photos')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    const { error: cleanupError } = await supabase.storage
      .from('photos')
      .remove([imagePath])

    if (cleanupError) {
      throw new Error(
        `${error.message} Storage cleanup also failed: ${cleanupError.message}`,
      )
    }

    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Photo upload completed without a returned record.')
  }

  return data
}

export async function deletePhoto(photoId: string): Promise<void> {
  const user = await requireCurrentUser()
  const supabase = getSupabaseClient()

  const { data: photo, error: photoLookupError } = await supabase
    .from('photos')
    .select('*')
    .eq('id', photoId)
    .eq('created_by', user.id)
    .single()

  throwIfError(photoLookupError, 'Unable to load the selected photo.')

  if (!photo) {
    throw new Error('Photo not found.')
  }

  const { error: deleteRecordError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)
    .eq('created_by', user.id)

  throwIfError(deleteRecordError, 'Unable to delete the photo record.')

  const { error: deleteStorageError } = await supabase.storage
    .from('photos')
    .remove([photo.image_path])

  if (deleteStorageError) {
    throw new Error(
      `Photo record was deleted, but failed to remove the storage file: ${deleteStorageError.message}`,
    )
  }
}
