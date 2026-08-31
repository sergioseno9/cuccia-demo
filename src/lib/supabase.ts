import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isForbiddenSupabaseKey } from './supabaseKey.ts'

const runtimeEnv = import.meta.env ?? {}
const supabaseUrl = runtimeEnv.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseKey = runtimeEnv.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

let client: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!isSupabaseConfigured) throw new Error('Configurazione Supabase non disponibile.')
  if (isForbiddenSupabaseKey(supabaseKey)) {
    throw new Error('Chiave Supabase server rilevata: usa soltanto la chiave publishable.')
  }
  client ??= createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
  return client
}

export const authRedirectUrl = () =>
  `${window.location.origin}${window.location.pathname}#/profilo`
