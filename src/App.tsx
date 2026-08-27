import { Check } from 'lucide-react'
import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { Onboarding } from './onboarding/Onboarding'
import { DiaryScreen } from './screens/DiaryScreen'
import { GuideHubScreen } from './screens/GuideHubScreen'
import { GuideReaderScreen } from './screens/GuideReaderScreen'
import { HealthScreen } from './screens/HealthScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { TodayScreen } from './screens/TodayScreen'
import { useAppState } from './state/AppState'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [pathname])
  return null
}

function RoutedApp() {
  const { toast } = useAppState()

  return (
    <div className="app-shell">
      <ScrollToTop />
      <div className="app-frame">
        <Routes>
          <Route path="/" element={<TodayScreen />} />
          <Route path="/diario" element={<DiaryScreen />} />
          <Route path="/salute" element={<HealthScreen />} />
          <Route path="/profilo" element={<ProfileScreen />} />
          <Route path="/guida" element={<GuideHubScreen />} />
          <Route path="/guida/:guideId" element={<GuideReaderScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">
        <span><Check size={17} /></span>
        {toast}
      </div>
    </div>
  )
}

function App() {
  const { data } = useAppState()
  if (!data.profile) return <Onboarding />
  return <HashRouter><RoutedApp /></HashRouter>
}

export default App
