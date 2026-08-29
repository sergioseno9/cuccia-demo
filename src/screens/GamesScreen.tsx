import { Award, Cat, ChevronRight, Gamepad2, ListChecks, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DiscoverPageHeader } from '../components/DiscoverPageHeader'
import { trainingPaths } from '../data/paths'
import { levelLabels, trickLevels, tricks } from '../data/tricks'
import { formatDate } from '../lib/date'
import { useAppState } from '../state/AppState'

export function GamesScreen() {
  const { activePet, profile } = useAppState()
  if (!activePet || !profile) return null
  const learnedCount = tricks.filter((trick) => activePet.trickProgress[trick.id]?.status === 'imparato').length
  const nextTrick = tricks.find((trick) => activePet.trickProgress[trick.id]?.status !== 'imparato')
  const badgeDefinitions = [
    ...tricks.map((trick) => ({ id: `trick-${trick.id}`, title: trick.name })),
    ...trickLevels.map((level) => ({ id: `level-${level}`, title: `Livello ${levelLabels[level]}` })),
    ...trainingPaths.map((path) => ({ id: `path-${path.id}`, title: path.title })),
  ]

  return <main className="screen discover-subpage games-page">
    <DiscoverPageHeader eyebrow="Rinforzo positivo" title="Giochi & trucchi" />
    {profile.species === 'gatto' ? <section className="cat-discover-coming discover-empty-page"><Cat size={36} /><h2>Contenuti per gatti in arrivo</h2><p>Per ora non mostriamo addestramento pensato per i cani.</p></section> : <>
      <p className="discover-page-lead">Sessioni brevi, premi graditi e libertà di fermarsi.</p>
      <section className="training-paths games-paths"><div className="section-title-row"><div><p className="eyebrow">Passo dopo passo</p><h2>Percorsi guidati</h2></div><ListChecks size={23} /></div>{trainingPaths.map((path) => {
        const completed = path.trickIds.filter((id) => activePet.trickProgress[id]?.status === 'imparato').length
        return <article key={path.id}><div><strong>{path.title}</strong><p>{path.description}</p></div><span>{completed} di {path.trickIds.length}</span><div className="path-progress"><span style={{ width: `${(completed / path.trickIds.length) * 100}%` }} /></div></article>
      })}</section>

      <section className="games-tricks"><div className="section-title-row"><div><p className="eyebrow">Una cosa alla volta</p><h2>Trucchi ed esercizi</h2></div><Gamepad2 size={24} /></div>
        {trickLevels.map((level) => <div className="trick-level" key={level}><h3>{levelLabels[level]}</h3><div className="trick-grid">{tricks.filter((trick) => trick.level === level).map((trick) => {
          const status = activePet.trickProgress[trick.id]?.status ?? 'da_imparare'
          return <Link className="trick-card" key={trick.id} to={`/scopri/trucco/${trick.id}`}><div><span className={`trick-status-dot status-${status}`} />{trick.useful && <span className="useful-chip">Utile</span>}</div><strong>{trick.name}</strong><p>{trick.goal}</p><small>{status === 'imparato' ? 'Imparato' : status === 'in_corso' ? 'In corso' : 'Da imparare'} · {trick.timePerDay}</small></Link>
        })}</div></div>)}
      </section>

      <section className="progress-section games-progress"><div className="section-title-row"><div><p className="eyebrow">Senza classifiche</p><h2>I tuoi progressi</h2></div><Award size={24} /></div><div className="progress-summary"><strong>{activePet.badges.length}</strong><span>badge ottenuti</span><p>{learnedCount} attività imparate su {tricks.length}</p>{nextTrick && <Link className="text-link" to={`/scopri/trucco/${nextTrick.id}`}>Prossimo traguardo: {nextTrick.name} <ChevronRight size={18} /></Link>}</div><div className="badge-grid">{badgeDefinitions.map((definition) => {
        const badge = activePet.badges.find((item) => item.id === definition.id)
        return <article className={badge ? 'is-earned' : ''} key={definition.id}>{badge ? <Award size={22} /> : <LockKeyhole size={20} />}<strong>{definition.title}</strong><span>{badge ? formatDate(badge.unlockedAt) : 'Da sbloccare'}</span></article>
      })}</div></section>
    </>}
  </main>
}
