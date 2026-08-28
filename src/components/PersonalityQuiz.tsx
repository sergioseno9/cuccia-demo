import { Info, RotateCcw, Share2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getQuizQuestions } from '../data/quiz'
import { calculateQuizResult, findQuizArchetype } from '../lib/quiz'
import { shareQuizResult } from '../lib/shareQuizResult'
import { useAppState } from '../state/AppState'
import type { QuizResultRecord } from '../types'
import { Modal } from './Modal'

interface PersonalityQuizProps {
  onClose: () => void
}

export function PersonalityQuiz({ onClose }: PersonalityQuizProps) {
  const { activePet, saveQuizResult } = useAppState()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentResult, setCurrentResult] = useState<QuizResultRecord | undefined>(activePet?.quizResult)
  const [showResult, setShowResult] = useState(Boolean(activePet?.quizResult && findQuizArchetype(activePet.quizResult.archetypeId)))
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState('')
  const questions = useMemo(() => activePet ? getQuizQuestions(activePet.profile.species) : [], [activePet])
  if (!activePet || !questions.length) return null

  const profile = activePet.profile
  const archetype = currentResult ? findQuizArchetype(currentResult.archetypeId) : undefined
  const compatible = archetype ? findQuizArchetype(archetype.compatibleId) : undefined
  const question = questions[step]
  const progress = ((step + 1) / questions.length) * 100

  const restart = () => {
    setAnswers({})
    setStep(0)
    setCurrentResult(undefined)
    setShowResult(false)
  }

  const answer = (optionId: string) => {
    const nextAnswers = { ...answers, [question.id]: optionId }
    setAnswers(nextAnswers)
    if (step < questions.length - 1) {
      setStep((current) => current + 1)
      return
    }
    const result = calculateQuizResult(profile.species, nextAnswers)
    saveQuizResult(result)
    setCurrentResult(result)
    setShowResult(true)
  }

  const share = async () => {
    if (!archetype) return
    setSharing(true)
    setShareError('')
    try {
      await shareQuizResult(profile.name, archetype)
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setShareError('Non riesco a creare la card ora. Puoi riprovare tra poco.')
      }
    } finally {
      setSharing(false)
    }
  }

  return <Modal title={`Che tipo è ${profile.name}?`} onClose={onClose}>
    <div className="quiz-dialog-scroll">
      {showResult && archetype ? <div className="quiz-result">
        <div className="quiz-disclaimer"><Info size={19} /><span>Solo per ridere — non è una valutazione comportamentale.</span></div>
        <span className="quiz-result-emoji" aria-hidden="true">{archetype.emoji}</span>
        <p className="eyebrow">Il risultato di {profile.name}</p>
        <h3>{archetype.name}</h3>
        <p className="quiz-result-description">{archetype.description}</p>
        <div className="quiz-result-details">
          <article><h4>Si vede da…</h4><p>{archetype.seenFrom}</p></article>
          {compatible && <article><h4>Va d'accordo con…</h4><p><span aria-hidden="true">{compatible.emoji}</span> {compatible.name}</p></article>}
        </div>
        <div className="quiz-result-actions">
          <button className="button-secondary" onClick={restart}><RotateCcw size={18} /> Rigioca</button>
          <button className="button-primary" onClick={() => void share()} disabled={sharing}><Share2 size={18} /> {sharing ? 'Creo la card…' : 'Condividi come immagine'}</button>
        </div>
        {shareError && <p className="quiz-share-error" role="status">{shareError}</p>}
      </div> : <div className="quiz-question">
        <div className="quiz-progress-copy"><span>Domanda {step + 1} di {questions.length}</span><span>{Math.round(progress)}%</span></div>
        <div className="quiz-progress" role="progressbar" aria-label="Avanzamento quiz" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={step + 1}><span style={{ width: `${progress}%` }} /></div>
        <h3>{question.prompt}</h3>
        <div className="quiz-options">{question.options.map((option) => <button key={option.id} onClick={() => answer(option.id)}><span>{option.label}</span></button>)}</div>
        <p className="quiz-gentle-copy">Scegli quella che gli somiglia di più. Non ci sono risposte giuste.</p>
      </div>}
    </div>
  </Modal>
}
