import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div style={{
          padding: '3rem', textAlign: 'center',
          color: '#ef4444',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
          <p style={{ marginBottom: 8, fontWeight: 600 }}>Something went wrong</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: '6px 16px', borderRadius: 6,
              background: '#1f2937', border: '1px solid #374151',
              color: '#d1d5db', cursor: 'pointer', fontSize: 13,
            }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
