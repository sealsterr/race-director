import React from 'react'
import WindowNotice from './WindowNotice'

interface RendererErrorBoundaryProps {
  children: React.ReactNode
  title: string
  variant?: 'window' | 'overlay'
}

interface RendererErrorBoundaryState {
  hasError: boolean
}

class RendererErrorBoundary extends React.Component<
  RendererErrorBoundaryProps,
  RendererErrorBoundaryState
> {
  state: RendererErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): RendererErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error): void {
    console.error(`Renderer crash in ${this.props.title}:`, error)
  }

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.variant === 'overlay') {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-transparent p-4">
          <WindowNotice
            compact
            tone="error"
            title={`${this.props.title} crashed`}
            description="This overlay hit a renderer error. Reload the window to restore it."
            actionLabel="Reload"
            onAction={() => globalThis.location.reload()}
          />
        </div>
      )
    }

    return (
      <div className="rd-shell flex h-screen w-screen items-center justify-center p-4">
        <WindowNotice
          tone="error"
          title={`${this.props.title} crashed`}
          description="This window hit a renderer error. Reload the window to recover."
          actionLabel="Reload window"
          onAction={() => globalThis.location.reload()}
        />
      </div>
    )
  }
}

export default RendererErrorBoundary
