import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DiscoverPageHeaderProps {
  backTo?: string
  eyebrow: string
  title: string
}

export function DiscoverPageHeader({ backTo = '/scopri', eyebrow, title }: DiscoverPageHeaderProps) {
  return <header className="discover-page-header">
    <Link className="discover-page-back" to={backTo} aria-label="Torna indietro"><ArrowLeft size={22} /></Link>
    <p className="eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
  </header>
}
