import { Award, BookOpen, Cat, ChevronRight, Compass, Gamepad2, Lightbulb, ListChecks, LockKeyhole, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrainingTools } from '../components/TrainingTools'
import { PersonalityQuiz } from '../components/PersonalityQuiz'
import { TrickDialog } from '../components/TrickDialog'
import { guides, panicGuideMap } from '../data/guides'
import { trainingPaths } from '../data/paths'
import { levelLabels, trickLevels, tricks } from '../data/tricks'
import type { Trick } from '../data/tricks'
import { selectTip } from '../data/tips'
import { formatDate } from '../lib/date'
import { useAppState } from '../state/AppState'

const panicLabels = ['Notte', 'Pipì in casa', 'Morsi', 'Caos'] as const

export function DiscoverScreen() {
  const { activePet, profile } = useAppState()
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const navigate = useNavigate()
  const tip = useMemo(() => profile ? selectTip(profile.species, profile.lifePhase) : null, [profile])
  if (!activePet || !profile || !tip) return null

  const compatibleGuides = guides.filter((guide) => guide.species === profile.species && (guide.fase === profile.lifePhase || guide.fase === 'tutte'))
  const learnedCount = tricks.filter((trick) => activePet.trickProgress[trick.id]?.status === 'imparato').length
  const nextTrick = tricks.find((trick) => activePet.trickProgress[trick.id]?.status !== 'imparato')
  const badgeDefinitions = [
    ...tricks.map((trick) => ({ id: `trick-${trick.id}`, title: trick.name })),
    ...trickLevels.map((level) => ({ id: `level-${level}`, title: `Livello ${levelLabels[level]}` })),
    ...trainingPaths.map((path) => ({ id: `path-${path.id}`, title: path.title })),
  ]

  const openRelated = () => {
    if (!tip.relatedId) return
    const relatedTrick = tricks.find((trick) => trick.id === tip.relatedId)
    if (relatedTrick) setSelectedTrick(relatedTrick)
    else navigate(`/scopri/guida/${tip.relatedId}`)
  }

  return <div className="screen discover-screen">
    <header id="tutorial-discover" className="screen-header discover-header"><p className="eyebrow">Idee gentili per stare bene insieme</p><h1>Scopri</h1><p>Contenuti utili per {profile.name}, senza gare, serie o pressioni.</p></header>

    <section className="quiz-entry-section"><button className="quiz-entry-card" onClick={() => setQuizOpen(true)}><span className="quiz-entry-icon"><Sparkles size={27} /></span><span><small>Mini-quiz di personalità</small><strong>Che tipo è {profile.name}?</strong><em>{activePet.quizResult ? 'Rivedi il risultato' : 'Scoprilo'} <ChevronRight size={18} /></em></span></button></section>

    <section className="tip-section"><div className="section-title-row"><div><p className="eyebrow">Scelto per questo momento</p><h2>Consiglio del momento</h2></div><Lightbulb size={26} /></div><article className="tip-card"><span><Compass size={25} /></span><div><h3>{tip.title}</h3><p>{tip.body}</p>{tip.relatedId && profile.species === 'cane' && <button className="text-link" onClick={openRelated}>Approfondisci <ChevronRight size={18} /></button>}</div></article></section>

    {profile.species === 'gatto' ? <section className="cat-discover-coming"><Cat size={36} /><p className="eyebrow">Contenuti per gatti</p><h2>Guide e attività in arrivo</h2><p>Per ora trovi consigli del momento adatti ai gatti. Non mostriamo guide o addestramento pensati per i cani.</p></section> : <>
      <section className="tricks-section"><div className="section-title-row"><div><p className="eyebrow">Rinforzo positivo</p><h2>Addestramento</h2></div><Gamepad2 size={27} /></div><p className="section-lead">Sessioni brevi, premi graditi e libertà di fermarsi. Nessuna penalità se interrompi.</p><TrainingTools />
        <div className="training-paths"><div className="section-title-row"><div><p className="eyebrow">Passo dopo passo</p><h3>Percorsi guidati</h3></div><ListChecks size={23} /></div>{trainingPaths.map((path) => { const completed = path.trickIds.filter((id) => activePet.trickProgress[id]?.status === 'imparato').length; return <article key={path.id}><div><strong>{path.title}</strong><p>{path.description}</p></div><span>{completed} di {path.trickIds.length}</span><div className="path-progress"><span style={{ width: `${(completed / path.trickIds.length) * 100}%` }} /></div></article> })}</div>
        {trickLevels.map((level) => <div className="trick-level" key={level}><h3>{levelLabels[level]}</h3><div className="trick-grid">{tricks.filter((trick) => trick.level === level).map((trick) => { const status = activePet.trickProgress[trick.id]?.status ?? 'da_imparare'; return <button className="trick-card" key={trick.id} onClick={() => setSelectedTrick(trick)}><div><span className={`trick-status-dot status-${status}`} />{trick.useful && <span className="useful-chip">Utile</span>}</div><strong>{trick.name}</strong><p>{trick.goal}</p><small>{status === 'imparato' ? 'Imparato' : status === 'in_corso' ? 'In corso' : 'Da imparare'} · {trick.timePerDay}</small></button> })}</div></div>)}
      </section>

      <section className="discover-guides"><div className="section-title-row"><div><p className="eyebrow">Contenuti statici</p><h2>Guide</h2></div><BookOpen size={27} /></div>{profile.lifePhase === 'cucciolo' && <div className="discover-panic"><div><Sparkles size={24} /><strong>Niente panico</strong><p>Scegli ciò che sta succedendo e apri una guida breve.</p></div><div>{panicLabels.map((label) => <button key={label} onClick={() => navigate(`/scopri/guida/${panicGuideMap[label]}`)}>{label}<ChevronRight size={17} /></button>)}</div></div>}{compatibleGuides.length ? <div className="discover-guide-list">{compatibleGuides.map((guide) => <Link key={guide.id} to={`/scopri/guida/${guide.id}`}><div><strong>{guide.title}</strong><span>~{guide.readingMinutes} min · {guide.triggers.slice(0, 2).join(' · ') || 'guida'}</span></div><ChevronRight size={20} /></Link>)}</div> : <div className="empty-inline">Non ci sono ancora guide per questa fase. Non mostriamo contenuti poco pertinenti.</div>}</section>

      <section className="progress-section"><div className="section-title-row"><div><p className="eyebrow">Senza classifiche</p><h2>I tuoi progressi</h2></div><Award size={27} /></div><div className="progress-summary"><strong>{activePet.badges.length}</strong><span>badge ottenuti</span><p>{learnedCount} attività imparate su {tricks.length}</p>{nextTrick && <button className="text-link" onClick={() => setSelectedTrick(nextTrick)}>Prossimo traguardo: {nextTrick.name} <ChevronRight size={18} /></button>}</div><div className="badge-grid">{badgeDefinitions.map((definition) => { const badge = activePet.badges.find((item) => item.id === definition.id); return <article className={badge ? 'is-earned' : ''} key={definition.id}>{badge ? <Award size={22} /> : <LockKeyhole size={20} />}<strong>{definition.title}</strong><span>{badge ? formatDate(badge.unlockedAt) : 'Da sbloccare'}</span></article> })}</div></section>
    </>}

    {selectedTrick && <TrickDialog trick={selectedTrick} onClose={() => setSelectedTrick(null)} />}
    {quizOpen && <PersonalityQuiz key={activePet.id} onClose={() => setQuizOpen(false)} />}
  </div>
}
