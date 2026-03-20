import { Component } from 'preact'
import type { ComponentChildren } from 'preact'

interface Props {
  children: ComponentChildren
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div class="min-h-screen flex items-center justify-center bg-ocean-50 px-6">
          <div class="text-center max-w-sm">
            <div class="text-5xl mb-4">🌊</div>
            <h2 class="text-xl font-bold text-ocean-800 mb-2">Algo salió mal</h2>
            <p class="text-sm text-ocean-500 mb-4">
              {this.state.error.message}
            </p>
            <button
              onClick={() => {
                this.setState({ error: null })
                window.location.href = '/'
              }}
              class="bg-ocean-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-ocean-600 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
