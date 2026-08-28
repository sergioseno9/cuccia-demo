import { buildDeadlines } from './deadlines.ts'
import type { Deadline, PetData, PetSpecies } from '../types'

export interface ReminderCandidate {
  id: string
  petId: string
  species: PetSpecies
  dueAt: string
  deadline: Deadline
}

export const buildReminderCandidates = (pet: PetData): ReminderCandidate[] =>
  buildDeadlines(pet).map((deadline) => ({
    id: `${pet.id}:${deadline.id}`,
    petId: pet.id,
    species: pet.profile.species,
    dueAt: deadline.dueDate,
    deadline,
  }))

export const buildInAppDeadlines = (pet: PetData) =>
  buildReminderCandidates(pet).map((candidate) => candidate.deadline)
