import type { AppData } from '../types'
import { migrateAppData } from './migrate.ts'

export interface BackupEnvelope {
  format: 'cuccia-backup'
  version: 2
  exportedAt: string
  data: AppData
}

export const createBackupEnvelope = (data: AppData, exportedAt = new Date().toISOString()): BackupEnvelope => ({
  format: 'cuccia-backup',
  version: 2,
  exportedAt,
  data,
})

export const createBackupJson = (data: AppData, exportedAt?: string) =>
  JSON.stringify(createBackupEnvelope(data, exportedAt), null, 2)

export const parseBackupJson = (json: string): AppData => {
  const parsed: unknown = JSON.parse(json)
  if (typeof parsed !== 'object' || parsed === null) throw new Error('File di backup non valido.')
  const envelope = parsed as Partial<BackupEnvelope>
  if (envelope.format !== 'cuccia-backup' || !envelope.data) {
    throw new Error('Questo file non è un backup Cuccia riconosciuto.')
  }
  if (envelope.version !== 2) {
    throw new Error('Questa versione del backup non è supportata. Aggiorna Cuccia prima di importarla.')
  }
  return migrateAppData(envelope.data)
}

export const backupFilename = (date = new Date()) =>
  `cuccia-backup-${date.toISOString().slice(0, 10)}.json`
