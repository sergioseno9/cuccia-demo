import type { LifePhase } from '../types'

export type Season = 'primavera' | 'estate' | 'autunno' | 'inverno' | 'feste'

export interface Tip {
  id: string
  title: string
  body: string
  fase?: LifePhase
  season?: Season
  relatedId?: string
}

export const tips: Tip[] = [
  { id: 'asfalto-caldo', title: 'Passeggiate nelle ore più fresche', body: 'In estate scegli, quando puoi, mattina presto o sera e controlla l’asfalto con il dorso della mano. Nel dubbio senti il veterinario.', season: 'estate' },
  { id: 'acqua-estate', title: 'Acqua fresca a portata di mano', body: 'Durante le giornate calde porta una ciotola pieghevole e fai pause tranquille all’ombra. Osserva il tuo cane senza trasformare la passeggiata in un obiettivo.', season: 'estate' },
  { id: 'parassiti', title: 'Controlla la prevenzione inserita', body: 'Con la bella stagione verifica nello scadenzario la data dell’antiparassitario. Prodotto e cadenza restano sempre quelli confermati da te.', season: 'primavera' },
  { id: 'freddo', title: 'Rientro asciutto e tranquillo', body: 'Dopo pioggia o freddo asciuga bene zampe e pelo. Per cani anziani o molto piccoli adatta tempi e comfort alle loro abitudini.', season: 'inverno' },
  { id: 'feste-cibi', title: 'Feste senza assaggi rischiosi', body: 'Tieni dolci, cioccolato, alcol e avanzi fuori portata. Se pensi che abbia ingerito qualcosa di inadatto, nel dubbio senti il veterinario.', season: 'feste' },
  { id: 'foglie', title: 'Una passeggiata di fiuto', body: 'In autunno lascia qualche minuto per annusare con calma in un luogo sicuro. Il fiuto è un’attività ricca anche senza aumentare distanza o velocità.', season: 'autunno', relatedId: 'cerca' },
  { id: 'cucciolo-routine', title: 'Una novità alla volta', body: 'Per un cucciolo, poche esperienze brevi e positive sono più facili da capire. Alterna scoperta, calma e riposo.', fase: 'cucciolo', relatedId: 'primi-mesi' },
  { id: 'senior-comfort', title: 'Comfort prima della quantità', body: 'Per un cane senior contano superfici comode, ritmi prevedibili e movimenti adatti a lui. Se noti cambiamenti improvvisi, senti il veterinario.', fase: 'senior' },
  { id: 'richiamo', title: 'Premia il ritorno', body: 'Quando torna da te, accoglilo sempre con qualcosa di positivo. Il richiamo si costruisce in luoghi sicuri e senza rimproveri.', relatedId: 'richiamo' },
]

const currentSeason = (date: Date): Season => {
  const month = date.getMonth() + 1
  if (month === 12) return 'feste'
  if (month >= 3 && month <= 5) return 'primavera'
  if (month >= 6 && month <= 8) return 'estate'
  if (month >= 9 && month <= 11) return 'autunno'
  return 'inverno'
}

export const selectTip = (phase: LifePhase, date = new Date()) => {
  const season = currentSeason(date)
  const candidates = tips.filter((tip) => (!tip.fase || tip.fase === phase) && (!tip.season || tip.season === season))
  const dayIndex = Math.floor(date.getTime() / 86_400_000)
  return candidates[dayIndex % candidates.length]
}
