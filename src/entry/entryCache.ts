import { createBackupJson, parseBackupJson } from '../lib/backup.ts'
import type { AppData } from '../types.ts'

const GUEST_CACHE_KEY = 'cuccia:entry:guest:v1'
const ACTIVE_SCOPE_KEY = 'cuccia:entry:active-scope:v1'
const accountCacheKey = (userId: string) => `cuccia:entry:account:${userId}:v1`
const importHandledKey = (userId: string) => `cuccia:entry:import-handled:${userId}:v1`

export type EntryScope = 'guest' | `account:${string}`

const load = (key: string): AppData | null => {
  try {
    const value = localStorage.getItem(key)
    return value ? parseBackupJson(value) : null
  } catch {
    return null
  }
}

const save = (key: string, data: AppData) => {
  try {
    localStorage.setItem(key, createBackupJson(data))
  } catch {}
}

export const loadGuestCache = () => load(GUEST_CACHE_KEY)
export const saveGuestCache = (data: AppData) => save(GUEST_CACHE_KEY, data)
export const loadAccountCache = (userId: string) => load(accountCacheKey(userId))
export const saveAccountCache = (userId: string, data: AppData) => save(accountCacheKey(userId), data)

export const loadActiveScope = (): EntryScope => {
  try {
    const value = localStorage.getItem(ACTIVE_SCOPE_KEY)
    return value === 'guest' || value?.startsWith('account:') ? value as EntryScope : 'guest'
  } catch {
    return 'guest'
  }
}

export const saveActiveScope = (scope: EntryScope) => {
  try {
    localStorage.setItem(ACTIVE_SCOPE_KEY, scope)
  } catch {}
}

export const hasHandledLocalImport = (userId: string) => {
  try {
    return localStorage.getItem(importHandledKey(userId)) === 'true'
  } catch {
    return false
  }
}

export const markLocalImportHandled = (userId: string) => {
  try {
    localStorage.setItem(importHandledKey(userId), 'true')
  } catch {}
}
