const includes = (value: string, fragment: string) => value.toLowerCase().includes(fragment)

export const authErrorMessage = (error: unknown) => {
  const fallback = 'Operazione non riuscita. Riprova tra poco.'
  if (!(error instanceof Error)) return fallback
  const message = error.message

  if (includes(message, 'invalid login credentials')) {
    return 'Email o password non corrette. Controlla i dati e riprova.'
  }
  if (includes(message, 'email not confirmed')) {
    return 'La tua email non è ancora confermata. Apri il messaggio ricevuto e usa il link di conferma.'
  }
  if (includes(message, 'user already registered')) {
    return 'Esiste già un account con questa email. Prova ad accedere.'
  }
  if (includes(message, 'password should be')) {
    return 'Scegli una password di almeno 8 caratteri.'
  }
  if (includes(message, 'rate limit')) {
    return 'Hai fatto diversi tentativi ravvicinati. Attendi qualche minuto e riprova.'
  }
  if (includes(message, 'failed to fetch') || includes(message, 'network')) {
    return 'Connessione non disponibile. I dati locali restano al sicuro; riprova quando sei online.'
  }
  return message || fallback
}
