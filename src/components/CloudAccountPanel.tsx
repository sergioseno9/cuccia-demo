import { Cloud, KeyRound, LogIn, LogOut, Mail, UserPlus } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

type AuthMode = 'login' | 'signup' | 'reset'
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Operazione non riuscita. Riprova tra poco.'

export function CloudAccountPanel() {
  const auth = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (action: () => Promise<string | void>) => {
    setBusy(true)
    setMessage('')
    try { setMessage((await action()) ?? '') } catch (error) { setMessage(errorMessage(error)) } finally { setBusy(false) }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (mode === 'signup') void run(() => auth.signUp({ displayName, email, password }))
    else if (mode === 'reset') void run(() => auth.requestPasswordReset(email))
    else void run(() => auth.signIn(email, password))
  }

  if (!auth.configured) return <PanelHeading title="Account cloud" copy="La modalità locale resta disponibile."><p className="cloud-account-message">Configura le variabili Supabase per attivare l’accesso.</p></PanelHeading>
  if (auth.loading) return <section className="cloud-account-panel" aria-busy="true"><div className="cloud-account-heading"><Cloud size={22} /><h2>Controllo account…</h2></div></section>
  if (auth.recovery) return <RecoveryForm busy={busy} message={message} onSubmit={(nextPassword) => run(() => auth.updatePassword(nextPassword))} />

  if (auth.user) return <PanelHeading title="Account cloud" copy={auth.user.email ?? ''}>
    <p>I dati locali non vengono caricati automaticamente.</p>
    {message && <p className="cloud-account-message" role="status">{message}</p>}
    <button className="button-secondary" disabled={busy} onClick={() => void run(auth.signOut)}><LogOut size={18} /> Esci</button>
  </PanelHeading>

  return <PanelHeading title="Account cloud" copy="Facoltativo: Cuccia continua a funzionare in locale.">
    <div className="auth-mode-switch" aria-label="Scegli operazione">
      <button className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>Accedi</button>
      <button className={mode === 'signup' ? 'is-active' : ''} onClick={() => setMode('signup')}>Crea account</button>
      <button className={mode === 'reset' ? 'is-active' : ''} onClick={() => setMode('reset')}>Password</button>
    </div>
    <form className="auth-form" onSubmit={submit}>
      {mode === 'signup' && <label>Come ti chiami?<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required autoComplete="name" /></label>}
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
      {mode !== 'reset' && <label>Password<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>}
      <button className="button-primary" disabled={busy} type="submit">
        {mode === 'signup' ? <UserPlus size={18} /> : mode === 'reset' ? <Mail size={18} /> : <LogIn size={18} />}
        {mode === 'signup' ? 'Crea account' : mode === 'reset' ? 'Invia link' : 'Accedi'}
      </button>
    </form>
    {message && <p className="cloud-account-message" role="status">{message}</p>}
  </PanelHeading>
}

function PanelHeading({ title, copy, children }: { title: string; copy: string; children: ReactNode }) {
  return <section className="cloud-account-panel"><div className="cloud-account-heading"><Cloud size={22} /><div><h2>{title}</h2><p>{copy}</p></div></div>{children}</section>
}

function RecoveryForm({ busy, message, onSubmit }: { busy: boolean; message: string; onSubmit: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState('')
  return <section className="cloud-account-panel"><div className="cloud-account-heading"><KeyRound size={22} /><div><h2>Nuova password</h2><p>Scegli almeno 8 caratteri.</p></div></div><form className="auth-form" onSubmit={(event) => { event.preventDefault(); void onSubmit(password) }}><label>Nuova password<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" /></label><button className="button-primary" disabled={busy}>Salva password</button></form>{message && <p className="cloud-account-message" role="status">{message}</p>}</section>
}
