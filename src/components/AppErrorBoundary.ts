import { Component, createElement } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Errore non gestito nell’app Cuccia.', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return createElement('main', { className: 'app-error-shell', role: 'alert' },
      createElement('section', { className: 'app-error-card' },
        createElement('div', { className: 'app-error-brand' },
          createElement('img', { src: './dog-icon.svg', alt: '' }),
          createElement('span', null, 'cuccia'),
        ),
        createElement('div', { className: 'app-error-copy' },
          createElement('p', { className: 'eyebrow' }, 'Siamo ancora qui'),
          createElement('h1', null, 'Qualcosa è andato storto'),
          createElement('p', null, 'I tuoi dati non sono stati cancellati. Ricarica la pagina per ripartire con calma.'),
        ),
        createElement('button', {
          className: 'button-primary',
          type: 'button',
          onClick: () => window.location.reload(),
        }, 'Ricarica'),
      ),
    )
  }
}
