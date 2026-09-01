import { createEmptyAppData } from '../lib/migrate.ts'
import type { AppData } from '../types.ts'

export const guestEntryData = (cachedGuest: AppData | null): AppData =>
  cachedGuest ?? createEmptyAppData()
