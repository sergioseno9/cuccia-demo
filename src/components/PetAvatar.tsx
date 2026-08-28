import type { PetSpecies } from '../types'

interface PetAvatarProps {
  name: string
  photo?: string
  species: PetSpecies
  className?: string
}

export function PetAvatar({ className = '', name, photo, species }: PetAvatarProps) {
  return (
    <span className={`pet-avatar ${className}`.trim()}>
      <img
        src={photo || `./pet-${species}-fallback.svg`}
        alt={photo ? `Foto di ${name}` : `Illustrazione di ${name}`}
      />
    </span>
  )
}
