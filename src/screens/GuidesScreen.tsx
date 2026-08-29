import { BookOpen, ChevronRight, ListChecks, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { DiscoverPageHeader } from '../components/DiscoverPageHeader'
import { guides, panicGuideMap } from '../data/guides'
import type { Guide } from '../data/guides'
import { useAppState } from '../state/AppState'

const panicLabels = ['Notte', 'Pipì in casa', 'Morsi', 'Caos'] as const
const categories: { id: Guide['category']; label: string }[] = [
  { id: 'cucciolo', label: 'Cucciolo' },
  { id: 'strumenti', label: 'Strumenti' },
]

export function GuidesScreen() {
  const { profile } = useAppState()
  const navigate = useNavigate()
  if (!profile) return null
  const speciesGuides = guides.filter((guide) => guide.species === profile.species)
  const compatibleGuides = speciesGuides.filter((guide) => guide.fase === profile.lifePhase || guide.fase === 'tutte')
  const visibleGuides = compatibleGuides.length ? compatibleGuides : speciesGuides

  return <main className="screen discover-subpage guides-page">
    <DiscoverPageHeader eyebrow={`Per ${profile.name}`} title="Guide" />
    {profile.lifePhase === 'cucciolo' && profile.species === 'cane' && <section className="discover-panic guide-calm-panel">
      <div><Sparkles size={24} /><strong>Niente panico</strong><p>Scegli ciò che sta succedendo e apri una guida breve.</p></div>
      <div>{panicLabels.map((label) => <button key={label} onClick={() => navigate(`/scopri/guida/${panicGuideMap[label]}`)}>{label}<ChevronRight size={17} /></button>)}</div>
    </section>}

    {visibleGuides.length ? categories.map((category) => {
      const items = visibleGuides.filter((guide) => guide.category === category.id)
      if (!items.length) return null
      const CategoryIcon = category.id === 'strumenti' ? ListChecks : BookOpen
      return <section className="guide-category" key={category.id} aria-labelledby={`guide-category-${category.id}`}>
        <div className="guide-category-heading"><CategoryIcon size={21} /><h2 id={`guide-category-${category.id}`}>{category.label}</h2></div>
        <div className="guide-page-list">{items.map((guide) => <Link key={guide.id} to={`/scopri/guida/${guide.id}`}>
          <div><strong>{guide.title}</strong><span>Circa {guide.readingMinutes} min · {guide.triggers.slice(0, 2).join(' · ') || 'guida'}</span></div><ChevronRight size={20} />
        </Link>)}</div>
      </section>
    }) : <section className="discover-empty-page"><BookOpen size={34} /><h2>Guide in preparazione</h2><p>Non ci sono ancora guide adatte a questa specie e fase.</p></section>}
  </main>
}
