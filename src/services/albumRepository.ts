import type { PostgrestError } from '@supabase/supabase-js'
import { getSupabaseClient } from '../lib/supabaseClient'
import type {
  AlbumInsert,
  AlbumRow,
  AlbumUpdate,
  DatabaseAlbumVisibility,
} from '../types/database'
import type { AlbumTheme } from '../types'
import { getCurrentUser } from './authService'

export interface AlbumMutationInput {
  title: string
  subtitle?: string
  description?: string
  coverImage?: string | null
  theme?: AlbumTheme | null
  date?: string
  location?: string
  visibility?: DatabaseAlbumVisibility
}

function normalizeText(value: string | undefined): string | null {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : null
}

function mapAlbumInput(
  input: AlbumMutationInput,
): Pick<
  AlbumInsert,
  'title' | 'subtitle' | 'description' | 'cover_image' | 'theme' | 'date' | 'location' | 'visibility'
> {
  const trimmedTitle = input.title.trim()

  if (!trimmedTitle) {
    throw new Error('Album title is required.')
  }

  return {
    title: trimmedTitle,
    subtitle: normalizeText(input.subtitle),
    description: normalizeText(input.description),
    cover_image: input.coverImage ?? null,
    theme: input.theme ?? null,
    date: normalizeText(input.date),
    location: normalizeText(input.location),
    visibility: input.visibility ?? 'public',
  }
}

async function requireCurrentUserId() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('You must be signed in to manage albums.')
  }

  return user.id
}

function throwIfSupabaseError(error: PostgrestError | null) {
  if (error) {
    throw new Error(error.message)
  }
}

export async function listMyAlbums(): Promise<AlbumRow[]> {
  const userId = await requireCurrentUserId()
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  throwIfSupabaseError(error)

  return data ?? []
}

export async function createAlbum(input: AlbumMutationInput): Promise<AlbumRow> {
  const userId = await requireCurrentUserId()
  const supabase = getSupabaseClient()
  const payload: AlbumInsert = {
    ...mapAlbumInput(input),
    created_by: userId,
  }

  console.log('createAlbum payload', payload)

  const { data, error } = await supabase
    .from('albums')
    .insert(payload)
    .select('*')
    .single()

  throwIfSupabaseError(error)

  if (!data) {
    throw new Error('Album creation returned no data.')
  }

  return data
}

export async function updateAlbum(
  id: string,
  input: AlbumMutationInput,
): Promise<AlbumRow> {
  const userId = await requireCurrentUserId()
  const supabase = getSupabaseClient()
  const payload: AlbumUpdate = mapAlbumInput(input)

  const { data, error } = await supabase
    .from('albums')
    .update(payload)
    .eq('id', id)
    .eq('created_by', userId)
    .select('*')
    .single()

  throwIfSupabaseError(error)

  if (!data) {
    throw new Error('Album update returned no data.')
  }

  return data
}

export async function deleteAlbum(id: string): Promise<void> {
  const userId = await requireCurrentUserId()
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', id)
    .eq('created_by', userId)

  throwIfSupabaseError(error)
}
