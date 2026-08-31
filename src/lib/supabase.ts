import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

const decodeJwtPayload = (value: string): Record<string, unknown> | null => {
  const payload = value.split('.')[1]
  if (!payload) return null
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const parsed: unknown = JSON.parse(atob(normalized))
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

export const isForbiddenSupabaseKey = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (normalized.startsWith('sb_secret_') || normalized.includes('service_role')) return true
  return decodeJwtPayload(value)?.role === 'service_role'
}

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
