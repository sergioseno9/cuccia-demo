import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DiscoverPageHeaderProps {
  eyebrow: string
  title: string
}

export function DiscoverPageHeader({ eyebrow, title }: DiscoverPageHeaderProps) {
  return <header className="discover-page-header">
    <Link className="discover-page-back" to="/scopri" aria-label="Torna a Scopri"><ArrowLeft size={22} /></Link>
    <p className="eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
  </header>
}
