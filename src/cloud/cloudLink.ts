export const CLOUD_LINK_KEY = 'cuccia:cloud-link:v1'

export interface CloudLink {
  userId: string
  householdId: string
  batchId: string
  linkedAt: string
  source: 'cloud'
}

export const loadCloudLink = (): CloudLink | null => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CLOUD_LINK_KEY) ?? 'null')
    if (!parsed || typeof parsed !== 'object') return null
    const value = parsed as Partial<CloudLink>
    return value.userId && value.householdId && value.batchId && value.source === 'cloud'
      ? value as CloudLink
      : null
  } catch {
    return null
  }
}

export const saveCloudLink = (link: CloudLink) => {
  localStorage.setItem(CLOUD_LINK_KEY, JSON.stringify(link))
  window.dispatchEvent(new CustomEvent('cuccia:cloud-linked', { detail: link }))
}

export const clearCloudLink = (userId: string) => {
  try {
    if (loadCloudLink()?.userId === userId) localStorage.removeItem(CLOUD_LINK_KEY)
  } catch {}
}
