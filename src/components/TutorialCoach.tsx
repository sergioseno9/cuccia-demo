import { ArrowRight, Check, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildTutorialSteps } from '../lib/tutorialSteps'
import { useAppState } from '../state/AppState'

interface TargetBox {
  top: number
  left: number
  width: number
  height: number
}

export function TutorialCoach() {
  const { activePet, data, completeTutorial } = useAppState()
  const [stepIndex, setStepIndex] = useState(0)
  const [targetBox, setTargetBox] = useState<TargetBox | null>(null)
  const [cardAtTop, setCardAtTop] = useState(false)
  const layerRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const steps = useMemo(() => buildTutorialSteps(
    activePet?.profile.name ?? 'il tuo pet',
    activePet?.profile.species ?? 'gatto',
  ), [activePet?.profile.name, activePet?.profile.species])
  const safeStepIndex = Math.min(stepIndex, steps.length - 1)
  const step = steps[safeStepIndex]

  useEffect(() => {
    if ((data.tutorialDone || stepIndex >= steps.length) && stepIndex !== 0) setStepIndex(0)
  }, [data.tutorialDone, stepIndex, steps.length])

  useEffect(() => {
    if (data.tutorialDone) return
    const previousOverflow = document.body.style.overflow
    const previousOverscrollBehavior = document.body.style.overscrollBehavior
    const previousTouchAction = document.body.style.touchAction
    const scrim = scrimRef.current
    const layer = layerRef.current
    const preventScroll = (event: Event) => event.preventDefault()
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !layer) return
      const buttons = [...layer.querySelectorAll<HTMLButtonElement>('.tutorial-card button:not(:disabled)')]
      const first = buttons[0]
      const last = buttons.at(-1)
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    document.body.style.touchAction = 'none'
    scrim?.addEventListener('wheel', preventScroll, { passive: false })
    scrim?.addEventListener('touchmove', preventScroll, { passive: false })
    layer?.addEventListener('keydown', trapFocus)
    layer?.querySelector<HTMLButtonElement>('.tutorial-card button')?.focus({ preventScroll: true })

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.overscrollBehavior = previousOverscrollBehavior
      document.body.style.touchAction = previousTouchAction
      scrim?.removeEventListener('wheel', preventScroll)
      scrim?.removeEventListener('touchmove', preventScroll)
      layer?.removeEventListener('keydown', trapFocus)
    }
  }, [data.tutorialDone])

  useEffect(() => {
    if (data.tutorialDone) return
    let animationFrame = 0
    let cancelled = false
    const deadline = performance.now() + 3000

    const measureTarget = () => {
      if (cancelled) return
      const target = document.getElementById(step.target)
      if (!target) return setTargetBox(null)
      const rect = target.getBoundingClientRect()
      setCardAtTop(rect.height < window.innerHeight * .35 && rect.top > window.innerHeight * .52)
      setTargetBox({ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 })
    }

    const revealTarget = () => {
      if (cancelled) return
      const target = document.getElementById(step.target)
      if (!target) {
        setTargetBox(null)
        if (performance.now() < deadline) animationFrame = window.requestAnimationFrame(revealTarget)
        return
      }

      target.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' })
      animationFrame = window.requestAnimationFrame(() => {
        if (cancelled) return
        const currentTarget = document.getElementById(step.target)
        if (!currentTarget) return revealTarget()
        const stickyBottom = document.querySelector('.pet-switcher')?.getBoundingClientRect().bottom ?? 0
        const rect = currentTarget.getBoundingClientRect()
        if (rect.top < stickyBottom + 12) {
          window.scrollBy({ top: rect.top - stickyBottom - 12, behavior: 'auto' })
        }
        animationFrame = window.requestAnimationFrame(measureTarget)
      })
    }

    setTargetBox(null)
    setCardAtTop(false)
    navigate(step.path)
    animationFrame = window.requestAnimationFrame(revealTarget)
    window.addEventListener('resize', measureTarget)
    window.addEventListener('scroll', measureTarget, { passive: true })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', measureTarget)
      window.removeEventListener('scroll', measureTarget)
    }
  }, [data.tutorialDone, navigate, step])

  if (data.tutorialDone) return null

  const finishTutorial = () => {
    completeTutorial()
    navigate('/')
  }

  const next = () => {
    if (safeStepIndex === steps.length - 1) finishTutorial()
    else {
      setTargetBox(null)
      setStepIndex((current) => current + 1)
    }
  }

  return (
    <div ref={layerRef} className="tutorial-layer" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <div ref={scrimRef} className="tutorial-scrim" />
      {targetBox && <div className="tutorial-highlight" style={targetBox} />}
      <section className={`tutorial-card ${cardAtTop ? 'is-top' : ''}`}>
        <button className="tutorial-skip" onClick={finishTutorial} aria-label="Salta il tutorial"><X size={20} /> Salta</button>
        <p className="eyebrow">{step.eyebrow}</p>
        <h2 id="tutorial-title">{step.title}</h2>
        <p>{step.body}</p>
        <div className="tutorial-actions">
          <div className="tutorial-dots" aria-label={`Passaggio ${safeStepIndex + 1} di ${steps.length}`}>{steps.map((item, index) => <span className={index === safeStepIndex ? 'is-active' : ''} key={item.target} />)}</div>
          <button className="button-primary" onClick={next}>{safeStepIndex === steps.length - 1 ? <><Check size={19} /> Inizia</> : <>Avanti <ArrowRight size={19} /></>}</button>
        </div>
      </section>
    </div>
  )
}
