import { useEffect, useState } from 'react'

const storageKey = (guideId: string) => `cuccia:guide-checklist:v1:${guideId}`

const loadCheckedItems = (guideId: string): string[] => {
  try {
    const value = localStorage.getItem(storageKey(guideId))
    return value ? JSON.parse(value) as string[] : []
  } catch {
    return []
  }
}

export const useGuideChecklist = (guideId: string) => {
  const [checkedItems, setCheckedItems] = useState(() => loadCheckedItems(guideId))

  useEffect(() => {
    setCheckedItems(loadCheckedItems(guideId))
  }, [guideId])

  useEffect(() => {
    localStorage.setItem(storageKey(guideId), JSON.stringify(checkedItems))
  }, [checkedItems, guideId])

  const toggleItem = (itemId: string) => {
    setCheckedItems((current) => current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId])
  }

  return { checkedItems, toggleItem }
}
