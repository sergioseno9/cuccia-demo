import { ArrowRight, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'

const steps = [
  {
    path: '/',
    target: 'tutorial-home',
    eyebrow: '1 di 4 · Home',
    title: 'Le date importanti, subito',
    body: 'Qui trovi le scadenze vicine e la Pet Card, senza altre distrazioni.',
  },
  {
    path: '/diario',
    target: 'tutorial-register',
    eyebrow: '2 di 4 · Diario',
    title: 'Registrare è sempre facoltativo',
    body: 'Quando serve, questo pulsante apre un modulo chiaro con autore, data e ora.',
  },
  {
    path: '/cura',
    target: 'tutorial-care-add',
    eyebrow: '3 di 4 · Cura',
    title: 'Il libretto lo compili tu',
    body: 'Vaccini, visite e terapie entrano solo dopo una tua conferma.',
  },
  {
    path: '/scopri',
    target: 'tutorial-discover',
    eyebrow: '4 di 4 · Scopri',
    title: 'Idee gentili, senza pressioni',
    body: 'Guide e piccoli giochi restano separati dai dati sanitari.',
  },
] as const

interface TargetBox {
  top: number
  left: number
  width: number
  height: number
}

export function TutorialCoach() {
  const { data, completeTutorial } = useAppState()
  const [stepIndex, setStepIndex] = useState(0)
  const [targetBox, setTargetBox] = useState<TargetBox | null>(null)
  const navigate = useNavigate()
  const step = steps[stepIndex]

  useEffect(() => {
    if (data.tutorialDone) return
    navigate(step.path)
    const updateTarget = () => {
      const target = document.getElementById(step.target)
      if (!target) return setTargetBox(null)
      const placeHighlight = () => {
        const rect = target.getBoundingClientRect()
        setTargetBox({ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 })
      }
      const rect = target.getBoundingClientRect()
      if (rect.top < 16 || rect.bottom > window.innerHeight - 360) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' })
        window.setTimeout(placeHighlight, 80)
      } else placeHighlight()
    }
    const timer = window.setTimeout(updateTarget, 180)
    window.addEventListener('resize', updateTarget)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', updateTarget)
    }
  }, [data.tutorialDone, navigate, step])

  if (data.tutorialDone) return null

  const next = () => {
    if (stepIndex === steps.length - 1) completeTutorial()
    else {
      setTargetBox(null)
      setStepIndex((current) => current + 1)
    }
  }

  return (
    <div className="tutorial-layer" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <div className="tutorial-scrim" />
      {targetBox && <div className="tutorial-highlight" style={targetBox} />}
      <section className="tutorial-card">
        <button className="tutorial-skip" onClick={completeTutorial} aria-label="Salta il tutorial"><X size={20} /> Salta</button>
        <p className="eyebrow">{step.eyebrow}</p>
        <h2 id="tutorial-title">{step.title}</h2>
        <p>{step.body}</p>
        <div className="tutorial-actions">
          <div className="tutorial-dots" aria-label={`Passaggio ${stepIndex + 1} di ${steps.length}`}>{steps.map((item, index) => <span className={index === stepIndex ? 'is-active' : ''} key={item.target} />)}</div>
          <button className="button-primary" onClick={next}>{stepIndex === steps.length - 1 ? <><Check size={19} /> Inizia</> : <>Avanti <ArrowRight size={19} /></>}</button>
        </div>
      </section>
    </div>
  )
}
