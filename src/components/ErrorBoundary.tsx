import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: 'black', color: 'red', fontFamily: 'monospace', height: '100vh', overflow: 'auto' }}>
          <h2>SYSTEM FAILURE (CrashLoopBackOff)</h2>
          <p>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ color: '#ffaaaa' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px', background: 'red', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>
            REBOOT KERNEL
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
