import { Component, type ErrorInfo, type ReactNode } from 'react'
import { FrameError } from './FrameError'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[frame] view crashed', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return <FrameError title="View crashed" detail={this.state.error.message} />
    }
    return this.props.children
  }
}
