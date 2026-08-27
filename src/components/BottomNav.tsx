import { BookOpen, HeartPulse, House, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Oggi', icon: House },
  { to: '/diario', label: 'Diario', icon: BookOpen },
  { to: '/salute', label: 'Salute', icon: HeartPulse },
  { to: '/profilo', label: 'Profilo', icon: UserRound },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigazione principale">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          to={to}
          key={to}
          end={to === '/'}
          className={({ isActive }) => `nav-tab ${isActive ? 'is-active' : ''}`}
        >
          <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
