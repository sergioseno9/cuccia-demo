import { Check } from 'lucide-react'
import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { PetSwitcher } from './components/PetSwitcher'
import { TutorialCoach } from './components/TutorialCoach'
import { Onboarding } from './onboarding/Onboarding'
import { CareScreen } from './screens/CareScreen'
import { DiaryScreen } from './screens/DiaryScreen'
import { DiscoverScreen } from './screens/DiscoverScreen'
import { GamesScreen } from './screens/GamesScreen'
import { GuideReaderScreen } from './screens/GuideReaderScreen'
import { GuidesScreen } from './screens/GuidesScreen'
import { HomeScreen } from './screens/HomeScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { QuizScreen } from './screens/QuizScreen'
import { TrickScreen } from './screens/TrickScreen'
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
        <PetSwitcher />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/diario" element={<DiaryScreen />} />
          <Route path="/cura" element={<CareScreen />} />
          <Route path="/scopri" element={<DiscoverScreen />} />
          <Route path="/scopri/quiz" element={<QuizScreen />} />
          <Route path="/scopri/guide" element={<GuidesScreen />} />
          <Route path="/scopri/giochi" element={<GamesScreen />} />
          <Route path="/scopri/trucco/:id" element={<TrickScreen />} />
          <Route path="/scopri/guida/:guideId" element={<GuideReaderScreen />} />
          <Route path="/profilo" element={<ProfileScreen />} />
          <Route path="/salute" element={<Navigate to="/cura" replace />} />
          <Route path="/guida" element={<Navigate to="/scopri" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
        <TutorialCoach />
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
  if (!data.pets.length) return <Onboarding />
  return <HashRouter><RoutedApp /></HashRouter>
}

export default App
