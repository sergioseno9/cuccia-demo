import { Check, HeartHandshake, ListChecks, Minus, ShieldCheck, X } from 'lucide-react'
import type { GuideSection } from '../data/guides'

interface GuideSectionViewProps {
  section: GuideSection
  sectionIndex: number
  checkedItems: string[]
  onToggle: (itemId: string) => void
}

export function GuideSectionView({ section, sectionIndex, checkedItems, onToggle }: GuideSectionViewProps) {
  if (section.type === 'text') {
    return <section className="guide-section guide-text">{section.heading && <h2>{section.heading}</h2>}<p>{section.body}</p></section>
  }

  if (section.type === 'vet') {
    return <section className="guide-section guide-vet"><span><HeartHandshake size={20} /></span><div><h2>Quando chiamare il veterinario</h2><p>{section.body}</p></div></section>
  }

  if (section.type === 'checklist') {
    return (
      <section className="guide-section guide-checklist">
        <div className="guide-section-heading"><ListChecks size={20} /><h2>{section.heading ?? 'Checklist'}</h2></div>
        <div className="checklist-items">
          {section.items.map((item, itemIndex) => {
            const itemId = `${sectionIndex}-${itemIndex}`
            const checked = checkedItems.includes(itemId)
            return <label key={itemId} className={checked ? 'is-checked' : ''}><input type="checkbox" checked={checked} onChange={() => onToggle(itemId)} /><span><Check size={15} /></span>{item}</label>
          })}
        </div>
      </section>
    )
  }

  const sectionIcon = section.type === 'avoid' ? <X size={18} /> : section.type === 'steps' ? <ShieldCheck size={19} /> : <Minus size={18} />
  return (
    <section className={`guide-section guide-${section.type}`}>
      <div className="guide-section-heading">{sectionIcon}<h2>{section.heading}</h2></div>
      {section.type === 'steps'
        ? <ol>{section.items.map((item) => <li key={item}>{item}</li>)}</ol>
        : <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
    </section>
  )
}
