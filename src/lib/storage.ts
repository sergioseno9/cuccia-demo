import type { AppData } from '../types'
import { createBackupJson, parseBackupJson } from './backup.ts'
import { createEmptyAppData, migrateAppData } from './migrate.ts'

export const STORAGE_KEY = 'cuccia:household:v2'
export const LEGACY_STORAGE_KEY = 'cuccia:complete-dog-care:v1'
export const BACKUP_STORAGE_KEY = 'cuccia:automatic-backup:v2'
export const PREVIOUS_STORAGE_KEY = 'cuccia:previous-save:v2'

export interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const parsePrimary = (raw: string | null) => raw ? migrateAppData(JSON.parse(raw) as unknown) : null

export const loadAppData = (storage: StorageLike = localStorage): AppData => {
  try {
    const current = parsePrimary(storage.getItem(STORAGE_KEY))
    if (current) return current
  } catch {}
  try {
    const backup = storage.getItem(BACKUP_STORAGE_KEY)
    if (backup) return parseBackupJson(backup)
  } catch {}
  try {
    const legacy = parsePrimary(storage.getItem(LEGACY_STORAGE_KEY))
    return legacy ?? createEmptyAppData()
  } catch {
    return createEmptyAppData()
  }
}

export const persistAppData = (data: AppData, storage: StorageLike = localStorage) => {
  const previous = storage.getItem(STORAGE_KEY)
  if (previous) storage.setItem(PREVIOUS_STORAGE_KEY, previous)
  storage.setItem(BACKUP_STORAGE_KEY, createBackupJson(data))
  storage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const clearStoredAppData = (storage: StorageLike = localStorage) => {
  ;[STORAGE_KEY, LEGACY_STORAGE_KEY, BACKUP_STORAGE_KEY, PREVIOUS_STORAGE_KEY]
    .forEach((key) => storage.removeItem(key))
}
