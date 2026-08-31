import { ArrowLeft, Cloud, KeyRound, LogIn, Mail, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { authErrorMessage } from '../auth/authMessages'
import { useAuth } from '../auth/AuthContext'

export type WelcomeMode = 'login' | 'signup' | 'reset'

export function WelcomeScreen({
  initialMode,
  onGuest,
}: {
  initialMode?: WelcomeMode
  onGuest: () => void
}) {
  const auth = useAuth()
  const [mode, setMode] = useState<WelcomeMode | null>(initialMode ?? null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => setMode(initialMode ?? null), [initialMode])

  if (auth.recovery) return <RecoveryScreen />

  const chooseMode = (nextMode: WelcomeMode | null) => {
    setMode(nextMode)
    setMessage('')
    setError('')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!mode) return
    setBusy(true)
    setMessage('')
    setError('')
    try {
      if (mode === 'signup') setMessage(await auth.signUp({ displayName, email, password }))
      if (mode === 'reset') setMessage(await auth.requestPasswordReset(email))
      if (mode === 'login') await auth.signIn(email, password)
    } catch (submitError) {
      setError(authErrorMessage(submitError))
    } finally {
      setBusy(false)
    }
  }

  return <main className="welcome-shell">
    <section className="welcome-card" aria-labelledby="welcome-title">
      <div className="welcome-brand"><img src="./dog-icon.svg" alt="" /><span>cuccia</span></div>
      <div className="welcome-copy">
        <p className="eyebrow">Tutto ciò che conta</p>
        <h1 id="welcome-title">Una casa ordinata per ogni pet.</h1>
        <p>Cura, scadenze e quotidianità, con calma.</p>
      </div>

      {!mode ? <div className="welcome-actions">
        <button className="button-primary" disabled={!auth.configured} onClick={() => chooseMode('login')}>
          <LogIn size={20} /> Accedi
        </button>
        <button className="button-secondary" disabled={!auth.configured} onClick={() => chooseMode('signup')}>
          <UserPlus size={20} /> Crea account
        </button>
        {!auth.configured && <p className="welcome-status">L’accesso cloud non è configurato. Puoi continuare in locale.</p>}
      </div> : <div className="welcome-auth-panel">
        <button className="welcome-back" onClick={() => chooseMode(null)}><ArrowLeft size={18} /> Indietro</button>
        <div className="welcome-auth-heading">
          {mode === 'login' ? <LogIn size={24} /> : mode === 'signup' ? <UserPlus size={24} /> : <Mail size={24} />}
          <div><h2>{mode === 'login' ? 'Bentornato' : mode === 'signup' ? 'Crea il tuo account' : 'Recupera la password'}</h2>
          <p>{mode === 'reset' ? 'Ti invieremo un link sicuro via email.' : 'I dati locali restano disponibili.'}</p></div>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && <label>Come ti chiami?<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required autoComplete="name" /></label>}
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          {mode !== 'reset' && <label>Password<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>}
          <button className="button-primary" disabled={busy} type="submit">
            {mode === 'login' ? <LogIn size={19} /> : mode === 'signup' ? <UserPlus size={19} /> : <Mail size={19} />}
            {busy ? 'Attendi…' : mode === 'login' ? 'Accedi' : mode === 'signup' ? 'Crea account' : 'Invia link'}
          </button>
        </form>
        {mode === 'login' && <button className="welcome-reset-link" onClick={() => chooseMode('reset')}>Password dimenticata?</button>}
        {message && <p className="welcome-message" role="status">{message}</p>}
        {error && <p className="welcome-error" role="alert">{error}</p>}
      </div>}

      <button className="welcome-guest" onClick={onGuest}>Prova senza account</button>
    </section>
  </main>
}

function RecoveryScreen() {
  const auth = useAuth()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await auth.updatePassword(password)
      setMessage('Password aggiornata. Ora puoi continuare in Cuccia.')
    } catch (submitError) {
      setError(authErrorMessage(submitError))
    } finally {
      setBusy(false)
    }
  }

  return <main className="welcome-shell"><section className="welcome-card recovery-card">
    <div className="welcome-brand"><img src="./dog-icon.svg" alt="" /><span>cuccia</span></div>
    <div className="welcome-auth-heading"><KeyRound size={25} /><div><h1>Nuova password</h1><p>Scegli almeno 8 caratteri.</p></div></div>
    <form className="auth-form" onSubmit={submit}><label>Nuova password<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" /></label><button className="button-primary" disabled={busy}>{busy ? 'Salvataggio…' : 'Salva password'}</button></form>
    {message && <p className="welcome-message" role="status">{message}</p>}
    {error && <p className="welcome-error" role="alert">{error}</p>}
  </section></main>
}

export function EntryLoadingScreen({ label = 'Prepariamo la tua Cuccia…' }: { label?: string }) {
  return <main className="welcome-shell"><section className="entry-state-card" aria-live="polite" aria-busy="true"><Cloud size={28} /><img src="./dog-icon.svg" alt="" /><p>{label}</p></section></main>
}
