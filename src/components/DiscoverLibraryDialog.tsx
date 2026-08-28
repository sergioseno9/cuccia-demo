import { Award, BookOpen, Cat, ChevronRight, Gamepad2, ListChecks, LockKeyhole, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { guides, panicGuideMap } from '../data/guides'
import { trainingPaths } from '../data/paths'
import { levelLabels, trickLevels, tricks } from '../data/tricks'
import type { Trick } from '../data/tricks'
import { formatDate } from '../lib/date'
import { useAppState } from '../state/AppState'
import { Modal } from './Modal'
import { TrainingTools } from './TrainingTools'
import { TrickDialog } from './TrickDialog'

const panicLabels = ['Notte', 'Pipì in casa', 'Morsi', 'Caos'] as const

export function DiscoverLibraryDialog({ onClose }: { onClose: () => void }) {
  const { activePet, profile } = useAppState()
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null)
  const navigate = useNavigate()
  if (!activePet || !profile) return null
  const compatibleGuides = guides.filter((guide) => guide.species === profile.species && (guide.fase === profile.lifePhase || guide.fase === 'tutte'))
  const learnedCount = tricks.filter((trick) => activePet.trickProgress[trick.id]?.status === 'imparato').length
  const nextTrick = tricks.find((trick) => activePet.trickProgress[trick.id]?.status !== 'imparato')
  const badgeDefinitions = [
    ...tricks.map((trick) => ({ id: `trick-${trick.id}`, title: trick.name })),
    ...trickLevels.map((level) => ({ id: `level-${level}`, title: `Livello ${levelLabels[level]}` })),
    ...trainingPaths.map((path) => ({ id: `path-${path.id}`, title: path.title })),
  ]
  const openGuide = (id: string) => {
    onClose()
    navigate(`/scopri/guida/${id}`)
  }

  return <><Modal title="Giochi, trucchi e guide" onClose={onClose}><div className="discover-library-scroll">
    {profile.species === 'gatto' ? <section className="cat-discover-coming"><Cat size={36} /><h2>Contenuti per gatti in arrivo</h2><p>Per ora non mostriamo guide o addestramento pensati per i cani.</p></section> : <>
      <section className="tricks-section"><div className="section-title-row"><div><p className="eyebrow">Rinforzo positivo</p><h2>Addestramento</h2></div><Gamepad2 size={27} /></div><p className="section-lead">Sessioni brevi, premi graditi e libertà di fermarsi.</p><TrainingTools />
        <div className="training-paths"><div className="section-title-row"><div><p className="eyebrow">Passo dopo passo</p><h3>Percorsi guidati</h3></div><ListChecks size={23} /></div>{trainingPaths.map((path) => { const completed = path.trickIds.filter((id) => activePet.trickProgress[id]?.status === 'imparato').length; return <article key={path.id}><div><strong>{path.title}</strong><p>{path.description}</p></div><span>{completed} di {path.trickIds.length}</span><div className="path-progress"><span style={{ width: `${(completed / path.trickIds.length) * 100}%` }} /></div></article> })}</div>
        {trickLevels.map((level) => <div className="trick-level" key={level}><h3>{levelLabels[level]}</h3><div className="trick-grid">{tricks.filter((trick) => trick.level === level).map((trick) => { const status = activePet.trickProgress[trick.id]?.status ?? 'da_imparare'; return <button className="trick-card" key={trick.id} onClick={() => setSelectedTrick(trick)}><div><span className={`trick-status-dot status-${status}`} />{trick.useful && <span className="useful-chip">Utile</span>}</div><strong>{trick.name}</strong><p>{trick.goal}</p><small>{status === 'imparato' ? 'Imparato' : status === 'in_corso' ? 'In corso' : 'Da imparare'} · {trick.timePerDay}</small></button> })}</div></div>)}
      </section>

      <section className="discover-guides"><div className="section-title-row"><div><p className="eyebrow">Contenuti statici</p><h2>Guide</h2></div><BookOpen size={27} /></div>{profile.lifePhase === 'cucciolo' && <div className="discover-panic"><div><Sparkles size={24} /><strong>Niente panico</strong><p>Scegli ciò che sta succedendo e apri una guida breve.</p></div><div>{panicLabels.map((label) => <button key={label} onClick={() => openGuide(panicGuideMap[label])}>{label}<ChevronRight size={17} /></button>)}</div></div>}{compatibleGuides.length ? <div className="discover-guide-list">{compatibleGuides.map((guide) => <Link key={guide.id} to={`/scopri/guida/${guide.id}`} onClick={onClose}><div><strong>{guide.title}</strong><span>~{guide.readingMinutes} min · {guide.triggers.slice(0, 2).join(' · ') || 'guida'}</span></div><ChevronRight size={20} /></Link>)}</div> : <div className="empty-inline">Non ci sono ancora guide per questa fase.</div>}</section>

      <section className="progress-section"><div className="section-title-row"><div><p className="eyebrow">Senza classifiche</p><h2>I tuoi progressi</h2></div><Award size={27} /></div><div className="progress-summary"><strong>{activePet.badges.length}</strong><span>badge ottenuti</span><p>{learnedCount} attività imparate su {tricks.length}</p>{nextTrick && <button className="text-link" onClick={() => setSelectedTrick(nextTrick)}>Prossimo traguardo: {nextTrick.name} <ChevronRight size={18} /></button>}</div><div className="badge-grid">{badgeDefinitions.map((definition) => { const badge = activePet.badges.find((item) => item.id === definition.id); return <article className={badge ? 'is-earned' : ''} key={definition.id}>{badge ? <Award size={22} /> : <LockKeyhole size={20} />}<strong>{definition.title}</strong><span>{badge ? formatDate(badge.unlockedAt) : 'Da sbloccare'}</span></article> })}</div></section>
    </>}
  </div></Modal>{selectedTrick && <TrickDialog trick={selectedTrick} onClose={() => setSelectedTrick(null)} />}</>
}
