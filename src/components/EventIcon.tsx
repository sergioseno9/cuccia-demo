import {
  Cloud,
  Droplets,
  Footprints,
  NotebookPen,
  MoonStar,
  Pill,
  Scissors,
  Utensils,
  Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CareEventType } from '../types'

const icons: Record<CareEventType, LucideIcon> = {
  meal: Utensils,
  water: Droplets,
  pee: Waves,
  poop: Cloud,
  walk: Footprints,
  sleep: MoonStar,
  grooming: Scissors,
  medication: Pill,
  note: NotebookPen,
}

export function EventIcon({ type, size = 20 }: { type: CareEventType; size?: number }) {
  const Icon = icons[type]
  return <Icon size={size} strokeWidth={1.9} aria-hidden="true" />
}
