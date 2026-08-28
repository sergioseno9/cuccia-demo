import { getQuizQuestions, quizArchetypes } from '../data/quiz.ts'
import type { QuizArchetype } from '../data/quiz.ts'
import type { PetSpecies, QuizAxisVector, QuizResultRecord } from '../types'

const emptyVector = (): QuizAxisVector => ({ E: 0, C: 0, S: 0, F: 0 })

const distance = (first: QuizAxisVector, second: QuizAxisVector) =>
  (first.E - second.E) ** 2
  + (first.C - second.C) ** 2
  + (first.S - second.S) ** 2
  + (first.F - second.F) ** 2

export const resolveQuizArchetype = (vector: QuizAxisVector): QuizArchetype => {
  const prioritized = [...quizArchetypes].sort((first, second) => first.priority - second.priority)
  return prioritized.reduce((closest, archetype) =>
    distance(vector, archetype.signature) < distance(vector, closest.signature) ? archetype : closest)
}

export const calculateQuizResult = (
  species: PetSpecies,
  answers: Record<string, string>,
  completedAt = new Date().toISOString(),
): QuizResultRecord => {
  const questions = getQuizQuestions(species)
  if (questions.some((question) => !answers[question.id])) {
    throw new Error('Completa tutte le domande prima di vedere il risultato.')
  }

  const vector = questions.reduce<QuizAxisVector>((score, question) => {
    const option = question.options.find((item) => item.id === answers[question.id])
    if (!option) throw new Error('Una risposta del quiz non è valida.')
    return {
      E: score.E + (option.weights.E ?? 0),
      C: score.C + (option.weights.C ?? 0),
      S: score.S + (option.weights.S ?? 0),
      F: score.F + (option.weights.F ?? 0),
    }
  }, emptyVector())

  return {
    archetypeId: resolveQuizArchetype(vector).id,
    vector,
    answers: { ...answers },
    completedAt,
  }
}

export const findQuizArchetype = (id: string) => quizArchetypes.find((item) => item.id === id)
