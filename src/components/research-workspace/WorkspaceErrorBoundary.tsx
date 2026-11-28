'use client'

import { Component, type ReactNode } from 'react'

export default class WorkspaceErrorBoundary extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state = { message: null as string | null }

  static getDerivedStateFromError(error: Error) {
    return { message: error.message || 'This view failed to render.' }
  }

  render() {
    if (this.state.message) {
      return (
        <div role="alert" className="rounded-xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm">
          <p>This panel hit an error and stopped.</p>
          <p className="mt-1 text-ink/70">{this.state.message}</p>
          <button type="button" className="mt-3 rounded-lg border border-hairline px-3 py-1.5" onClick={() => this.setState({ message: null })}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
