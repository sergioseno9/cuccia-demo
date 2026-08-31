export type CloudPetState = 'idle' | 'checking' | 'empty' | 'ready' | 'error'

export type EntryScreen =
  | 'loading'
  | 'welcome'
  | 'local-onboarding'
  | 'local-app'
  | 'cloud-onboarding'
  | 'cloud-import'
  | 'cloud-app'
  | 'cloud-error'

interface EntryInput {
  authLoading: boolean
  hasSession: boolean
  guestMode: boolean
  cloudState: CloudPetState
  localPetCount: number
}

export const decideEntryScreen = ({
  authLoading,
  hasSession,
  guestMode,
  cloudState,
  localPetCount,
}: EntryInput): EntryScreen => {
  if (authLoading) return 'loading'
  if (!hasSession && !guestMode) return 'welcome'
  if (guestMode) return localPetCount ? 'local-app' : 'local-onboarding'
  if (cloudState === 'checking' || cloudState === 'idle') return 'loading'
  if (cloudState === 'error') return 'cloud-error'
  if (cloudState === 'ready') return 'cloud-app'
  return localPetCount ? 'cloud-import' : 'cloud-onboarding'
}
