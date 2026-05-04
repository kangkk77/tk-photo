import { getSupabaseClient } from '../lib/supabaseClient'
import type { PhotoLayout } from '../types'
import type { PhotoInsert, PhotoRow, PhotoUpdate } from '../types/database'
import { getCurrentUser } from './authService'
import { parseImageExif } from '../utils/exif'

export interface PhotoUploadInput {
  title?: string
  description?: string
}

export interface PhotoMutationInput {
  title?: string
  description?: string
  note?: string
  date?: string
  location?: string
  layout?: PhotoLayout | null
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
    throw new Error('请先登录后再管理照片。')
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
    throw new Error('只能上传图片文件。')
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
    throw new Error('上传照片后没有返回数据。')
  }

  return data
}

export async function updatePhoto(
  photoId: string,
  input: PhotoMutationInput,
): Promise<PhotoRow> {
  const user = await requireCurrentUser()
  const supabase = getSupabaseClient()
  const payload: PhotoUpdate = {
    title: normalizeText(input.title),
    description: normalizeText(input.description),
    note: normalizeText(input.note),
    date: normalizeText(input.date),
    location: normalizeText(input.location),
    layout: input.layout ?? null,
  }

  console.log('updatePhoto payload', payload)

  const { data, error } = await supabase
    .from('photos')
    .update(payload)
    .eq('id', photoId)
    .eq('created_by', user.id)
    .select('*')
    .single()

  throwIfError(error, '无法更新照片信息。')

  if (!data) {
    throw new Error('更新照片后没有返回数据。')
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
    throw new Error('未找到这张照片。')
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
