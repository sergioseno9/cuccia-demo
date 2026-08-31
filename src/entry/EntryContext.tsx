import { createContext, useContext } from 'react'

interface EntryContextValue {
  guestMode: boolean
  requestAccount: () => void
  resetCloudData: () => Promise<void>
}

export const EntryContext = createContext<EntryContextValue>({
  guestMode: false,
  requestAccount: () => undefined,
  resetCloudData: async () => undefined,
})

export const useEntryMode = () => useContext(EntryContext)
