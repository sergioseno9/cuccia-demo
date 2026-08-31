import type { AppData, Household, PetData } from '../types'

export interface AppDomainState {
  schemaVersion: 2
  household: Household
  pets: PetData[]
}

export interface AppUiPreferences {
  selectedPetId: string
  selectedCaregiverId: string
  tutorialDone: boolean
}

export interface AppStateParts {
  domain: AppDomainState
  ui: AppUiPreferences
}

export const splitAppData = (data: AppData): AppStateParts => ({
  domain: {
    schemaVersion: data.schemaVersion,
    household: data.household,
    pets: data.pets,
  },
  ui: {
    selectedPetId: data.selectedPetId,
    selectedCaregiverId: data.selectedCaregiverId,
    tutorialDone: data.tutorialDone,
  },
})

export const joinAppData = ({ domain, ui }: AppStateParts): AppData => ({
  ...domain,
  ...ui,
})
