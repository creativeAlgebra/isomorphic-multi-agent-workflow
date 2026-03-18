import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', color: '#ef4444' }}>
          <h1>React Runtime Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#888', fontSize: '12px' }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '20px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
