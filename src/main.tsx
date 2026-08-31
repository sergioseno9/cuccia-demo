import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { AppStateProvider } from './state/AppState'
import './styles/base.css'
import './styles/components.css'
import './styles/screens.css'
import './styles/guides.css'
import './styles/personalization.css'
import './styles/state-cards.css'
import './styles/accessibility.css'
import './styles/responsive.css'
import './styles/quality-evolution.css'
import './styles/quiz.css'
import './styles/minimal-restyle.css'
import './styles/onboarding.css'
import './styles/onboarding-choices.css'
import './styles/discover-pages.css'
import './styles/discover-details.css'
import './styles/path-screen.css'
import './styles/pet-card.css'
import './styles/auth.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AuthProvider>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
