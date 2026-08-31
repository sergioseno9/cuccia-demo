import { backupFilename, createBackupJson, parseBackupJson } from '../lib/backup.ts'
import type { AppData } from '../types'

export const createVerifiedBackupJson = (data: AppData) => {
  const json = createBackupJson(data)
  const restored = parseBackupJson(json)
  if (JSON.stringify(restored) !== JSON.stringify(data)) {
    throw new Error('Il backup locale non supera la verifica. Importazione interrotta.')
  }
  return json
}

export const downloadVerifiedBackup = (data: AppData) => {
  const json = createVerifiedBackupJson(data)
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = backupFilename()
  link.click()
  URL.revokeObjectURL(url)
}
