import { ArrowLeft, BookOpen, ChevronRight, Clock3 } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { GuideSectionView } from '../components/GuideSectionView'
import { GLOBAL_GUIDE_DISCLAIMER, getGuide } from '../data/guides'
import { useGuideChecklist } from '../hooks/useGuideChecklist'
import { useAppState } from '../state/AppState'

export function GuideReaderScreen() {
  const { guideId = '' } = useParams()
  const navigate = useNavigate()
  const { data } = useAppState()
  const guide = getGuide(guideId)
  const { checkedItems, toggleItem } = useGuideChecklist(guideId)

  if (!guide || (guide.fase !== 'tutte' && guide.fase !== data.profile!.lifePhase)) return <Navigate to="/guida" replace />
  const related = (guide.related ?? []).map(getGuide).filter(Boolean)

  return (
    <article className="screen guide-reader-screen">
      <header className="guide-reader-header">
        <button className="icon-button" onClick={() => navigate('/guida')} aria-label="Torna alle guide"><ArrowLeft size={19} /></button>
        <div className="guide-reader-meta"><span>Guida per cuccioli</span><span><Clock3 size={14} />Circa {guide.readingMinutes} min</span></div>
        <h1>{guide.title}</h1>
        {guide.subtitle && <p>{guide.subtitle}</p>}
      </header>

      <div className="guide-body">
        {guide.sections.map((section, index) => <GuideSectionView key={`${section.type}-${index}`} section={section} sectionIndex={index} checkedItems={checkedItems} onToggle={toggleItem} />)}
      </div>

      {related.length > 0 && <section className="related-guides" aria-labelledby="related-title"><p className="eyebrow">Continua con calma</p><h2 id="related-title">Guide collegate</h2><div>{related.map((item) => item && <Link key={item.id} to={`/guida/${item.id}`}><span>{item.title}</span><ChevronRight size={17} /></Link>)}</div></section>}

      <aside className="guide-disclaimer"><BookOpen size={19} /><p>{GLOBAL_GUIDE_DISCLAIMER}</p></aside>
    </article>
  )
}
