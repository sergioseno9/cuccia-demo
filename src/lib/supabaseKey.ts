const decodeJwtPayload = (value: string): Record<string, unknown> | null => {
  const payload = value.split('.')[1]
  if (!payload) return null
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const parsed: unknown = JSON.parse(atob(normalized))
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

export const isForbiddenSupabaseKey = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (normalized.startsWith('sb_secret_') || normalized.includes('service_role')) return true
  return decodeJwtPayload(value)?.role === 'service_role'
}
