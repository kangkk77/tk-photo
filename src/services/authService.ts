import type { User } from '@supabase/supabase-js'
import { getSupabaseClient, hasSupabaseEnv } from '../lib/supabaseClient'

export async function getCurrentUser(): Promise<User | null> {
  if (!hasSupabaseEnv) {
    return null
  }

  const supabase = getSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error('Sign in completed without a returned user.')
  }

  return data.user
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseEnv) {
    return
  }

  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!hasSupabaseEnv) {
    return () => undefined
  }

  const supabase = getSupabaseClient()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })

  return () => {
    subscription.unsubscribe()
  }
}
