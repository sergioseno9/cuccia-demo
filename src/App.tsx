import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { loadCloudAppData, hasCloudPets } from './cloud/cloudBootstrapRepository'
import { buildMigrationPlan } from './cloud/migrationPlan'
import { importMigrationPlan } from './cloud/migrationRepository'
import { BottomNav } from './components/BottomNav'
import { PetSwitcher } from './components/PetSwitcher'
import { TutorialCoach } from './components/TutorialCoach'
import { CloudEntryErrorScreen, LocalDataImportScreen } from './entry/CloudEntryScreens'
import { EntryContext } from './entry/EntryContext'
import {
  loadAccountCache,
  loadActiveScope,
  loadGuestCache,
  saveAccountCache,
  saveActiveScope,
  saveGuestCache,
} from './entry/entryCache'
import { decideEntryScreen } from './entry/entryFlow'
import type { CloudPetState } from './entry/entryFlow'
import { EntryLoadingScreen, WelcomeScreen } from './entry/WelcomeScreen'
import type { WelcomeMode } from './entry/WelcomeScreen'
import { createEmptyAppData } from './lib/migrate'
import { Onboarding } from './onboarding/Onboarding'
import { CareScreen } from './screens/CareScreen'
import { DiaryScreen } from './screens/DiaryScreen'
import { DiscoverScreen } from './screens/DiscoverScreen'
import { GamesScreen } from './screens/GamesScreen'
import { GuideReaderScreen } from './screens/GuideReaderScreen'
import { GuidesScreen } from './screens/GuidesScreen'
import { HomeScreen } from './screens/HomeScreen'
import { PathScreen } from './screens/PathScreen'
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
          <Route path="/scopri/percorso/:pathId" element={<PathScreen />} />
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
  const auth = useAuth()
  const { data, replaceData } = useAppState()
  const [guestMode, setGuestMode] = useState(false)
  const [welcomeMode, setWelcomeMode] = useState<WelcomeMode>()
  const [cloudState, setCloudState] = useState<CloudPetState>('idle')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (auth.loading) return
    if (!auth.user) {
      setCloudState('idle')
      return
    }
    let cancelled = false
    const user = auth.user
    const startingData = data

    const bootstrap = async () => {
      setGuestMode(false)
      setCloudState('checking')
      const activeScope = loadActiveScope()
      if (activeScope === 'guest') saveGuestCache(startingData)
      if (activeScope.startsWith('account:') && activeScope !== `account:${user.id}`) {
        saveAccountCache(activeScope.slice('account:'.length), startingData)
        replaceData(loadGuestCache() ?? createEmptyAppData())
      }
      try {
        const cloudHasPets = await hasCloudPets()
        if (cancelled) return
        const cached = loadAccountCache(user.id)
        if (cloudHasPets) {
          const nextData = cached?.pets.length ? cached : await loadCloudAppData(user)
          if (cancelled) return
          replaceData(nextData)
          saveAccountCache(user.id, nextData)
          saveActiveScope(`account:${user.id}`)
          setCloudState('ready')
          return
        }
        if (cached) replaceData(cached)
        saveActiveScope(`account:${user.id}`)
        setCloudState('empty')
      } catch {
        if (!cancelled) setCloudState('error')
      }
    }
    void bootstrap()
    return () => { cancelled = true }
  }, [auth.loading, auth.user?.id, replaceData, retryKey])

  useEffect(() => {
    if (guestMode) {
      saveGuestCache(data)
      saveActiveScope('guest')
    } else if (auth.user && cloudState === 'ready') {
      saveAccountCache(auth.user.id, data)
      saveActiveScope(`account:${auth.user.id}`)
    }
  }, [auth.user, cloudState, data, guestMode])

  const enterGuestMode = () => {
    const activeScope = loadActiveScope()
    if (activeScope.startsWith('account:')) saveAccountCache(activeScope.slice('account:'.length), data)
    const cached = loadGuestCache()
    if (cached) replaceData(cached)
    else saveGuestCache(data)
    saveActiveScope('guest')
    setWelcomeMode(undefined)
    setGuestMode(true)
  }

  const requestAccount = () => {
    saveGuestCache(data)
    saveActiveScope('guest')
    setGuestMode(false)
    setWelcomeMode('signup')
  }

  const completeCloudOnboarding = async (nextData: typeof data) => {
    if (!auth.user) return
    saveAccountCache(auth.user.id, nextData)
    saveActiveScope(`account:${auth.user.id}`)
    try {
      const plan = await buildMigrationPlan(nextData)
      await importMigrationPlan(plan, auth.user)
      replaceData(nextData)
      setCloudState('ready')
    } catch (error) {
      replaceData(nextData)
      setCloudState('empty')
      throw new Error(error instanceof Error
        ? `${error.message} La scheda è rimasta salvata sul dispositivo.`
        : 'Importazione non riuscita. La scheda è rimasta salvata sul dispositivo.')
    }
  }

  if (auth.recovery) return <WelcomeScreen onGuest={enterGuestMode} />
  const screen = decideEntryScreen({
    authLoading: auth.loading,
    hasSession: Boolean(auth.user),
    guestMode,
    cloudState,
    localPetCount: data.pets.length,
  })

  if (screen === 'loading') return <EntryLoadingScreen />
  if (screen === 'welcome') return <WelcomeScreen initialMode={welcomeMode} onGuest={enterGuestMode} />
  if (screen === 'cloud-error') return <CloudEntryErrorScreen onRetry={() => setRetryKey((value) => value + 1)} onSignOut={() => void auth.signOut()} />
  if (screen === 'cloud-import' && auth.user) return <LocalDataImportScreen
    data={data}
    user={auth.user}
    onImported={() => setCloudState('ready')}
    onNewPet={() => {
      saveGuestCache(data)
      const empty = createEmptyAppData()
      replaceData(empty)
      saveAccountCache(auth.user!.id, empty)
    }}
    onSignOut={() => void auth.signOut()}
  />
  if (screen === 'local-onboarding') return <Onboarding />
  if (screen === 'cloud-onboarding') return <Onboarding onComplete={completeCloudOnboarding} />

  return <EntryContext.Provider value={{ guestMode, requestAccount }}>
    <HashRouter><RoutedApp /></HashRouter>
  </EntryContext.Provider>
}

export default App
