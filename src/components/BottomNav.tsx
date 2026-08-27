import { Compass, HeartHandshake, House, NotebookPen, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home', icon: House },
  { to: '/diario', label: 'Diario', icon: NotebookPen },
  { to: '/cura', label: 'Cura', icon: HeartHandshake },
  { to: '/scopri', label: 'Scopri', icon: Compass },
  { to: '/profilo', label: 'Profilo', icon: UserRound },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigazione principale">
      {tabs.map(({ to, label, icon: Icon }) => <NavLink to={to} key={to} end={to === '/'} className={({ isActive }) => `nav-tab ${isActive ? 'is-active' : ''}`}><Icon size={22} strokeWidth={1.9} aria-hidden="true" /><span>{label}</span></NavLink>)}
    </nav>
  )
}
