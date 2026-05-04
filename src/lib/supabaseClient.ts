import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl =
  typeof import.meta.env.VITE_SUPABASE_URL === 'string' &&
  import.meta.env.VITE_SUPABASE_URL.trim().length > 0
    ? import.meta.env.VITE_SUPABASE_URL.trim()
    : null

const supabaseAnonKey =
  typeof import.meta.env.VITE_SUPABASE_ANON_KEY === 'string' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY.trim().length > 0
    ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim()
    : null

const missingSupabaseEnv = [
  !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
  !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
].filter((value): value is string => value !== null)

function createMissingSupabaseEnvError(): Error {
  return new Error(
    `Missing Supabase environment variables: ${missingSupabaseEnv.join(', ')}. ` +
      'Copy .env.example to .env.local or .env and fill in your Supabase project URL and anon key.',
  )
}

function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw createMissingSupabaseEnvError()
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export const hasSupabaseEnv = missingSupabaseEnv.length === 0

export const supabaseClient = hasSupabaseEnv
  ? createSupabaseBrowserClient()
  : null

export function getSupabaseClient() {
  if (!supabaseClient) {
    throw createMissingSupabaseEnvError()
  }

  return supabaseClient
}
