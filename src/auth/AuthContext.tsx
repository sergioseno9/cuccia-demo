import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authRedirectUrl, getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'

interface SignUpInput { displayName: string; email: string; password: string }

interface AuthContextValue {
  configured: boolean
  loading: boolean
  recovery: boolean
  session: Session | null
  user: User | null
  signUp: (input: SignUpInput) => Promise<string>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<string>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const supabase = getSupabaseClient()
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setRecovery(event === 'PASSWORD_RECOVERY')
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    configured: isSupabaseConfigured,
    loading,
    recovery,
    session,
    user: session?.user ?? null,
    signUp: async ({ displayName, email, password }) => {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email: email.trim(), password,
        options: { data: { display_name: displayName.trim() }, emailRedirectTo: authRedirectUrl() },
      })
      if (error) throw error
      return data.session ? 'Account creato e accesso effettuato.' : 'Controlla la tua email e conferma l’account.'
    },
    signIn: async (email, password) => {
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
    },
    signOut: async () => {
      const { error } = await getSupabaseClient().auth.signOut()
      if (error) throw error
    },
    requestPasswordReset: async (email) => {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: authRedirectUrl() })
      if (error) throw error
      return 'Ti abbiamo inviato il link per scegliere una nuova password.'
    },
    updatePassword: async (password) => {
      const { error } = await getSupabaseClient().auth.updateUser({ password })
      if (error) throw error
      setRecovery(false)
    },
  }), [loading, recovery, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve essere usato dentro AuthProvider')
  return context
}
