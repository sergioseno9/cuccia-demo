import { createContext, useContext } from 'react'

interface EntryContextValue {
  guestMode: boolean
  requestAccount: () => void
}

export const EntryContext = createContext<EntryContextValue>({
  guestMode: false,
  requestAccount: () => undefined,
})

export const useEntryMode = () => useContext(EntryContext)
