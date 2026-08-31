import type { AppData } from '../types'
import { backupFilename, createBackupJson } from './backup'

export const downloadAppDataBackup = (data: AppData) => {
  const url = URL.createObjectURL(new Blob([createBackupJson(data)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = backupFilename()
  link.click()
  URL.revokeObjectURL(url)
}
