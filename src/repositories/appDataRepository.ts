import type { AppData } from '../types'
import { clearStoredAppData, loadAppData, persistAppData } from '../lib/storage'

export interface AppDataRepository {
  load: () => AppData
  save: (data: AppData) => void
  clear: () => void
}

export const localAppDataRepository: AppDataRepository = {
  load: () => loadAppData(),
  save: (data) => persistAppData(data),
  clear: () => clearStoredAppData(),
}
