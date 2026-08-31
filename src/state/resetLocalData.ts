import { createEmptyAppData } from '../lib/migrate.ts'
import type { AppData } from '../types.ts'
import type { AppDataRepository } from '../repositories/appDataRepository.ts'

interface ResetStorage {
  length: number
  key: (index: number) => string | null
  removeItem: (key: string) => void
}

interface LocalResetResult {
  data: AppData
  storageCleared: boolean
}

export const resetLocalData = (
  repository: AppDataRepository,
  storage: ResetStorage = localStorage,
): LocalResetResult => {
  let storageCleared = true
  try {
    repository.clear()
    const checklistKeys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter((key): key is string => Boolean(key?.startsWith('cuccia:guide-checklist:')))
    checklistKeys.forEach((key) => storage.removeItem(key))
  } catch {
    storageCleared = false
  }

  return { data: createEmptyAppData(), storageCleared }
}
