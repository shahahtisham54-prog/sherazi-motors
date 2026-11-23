import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AdminDashboard from './AdminDashboard';
import './index.css';
import './immersive.css';

class RootErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean; detail: string }> {
  state = { failed: false, detail: '' };
  static getDerivedStateFromError(error: Error) { return { failed: true, detail: error?.message || 'Unknown rendering error' }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Sherazi Motors UI failed to render', error, info.componentStack);
    this.setState({ detail: error?.message || 'Unknown rendering error' });
  }
  render() {
    if (this.state.failed) {
      return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#142326', color: '#f4f0e7', textAlign: 'center' }}>
        <section><h1 style={{ fontSize: 30, marginBottom: 12 }}>Sherazi Motors is temporarily unavailable.</h1>
          <p style={{ maxWidth: 440, lineHeight: 1.7, opacity: .8 }}>A display error stopped the page from loading. Please share this error with support:</p>
          <pre style={{ maxWidth: 620, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 14, background: '#26383a', color: '#f2d7a5', textAlign: 'left' }}>{this.state.detail}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 18, padding: '12px 20px', border: 0, background: '#d0b17a', color: '#142326', fontWeight: 700 }}>Refresh website</button>
        </section>
      </main>;
    }
    return this.props.children;
  }
}

const Root = window.location.pathname.startsWith('/admin') ? AdminDashboard : App;
const mount = document.getElementById('root');
if (mount) {
  createRoot(mount).render(<RootErrorBoundary><StrictMode><Root /></StrictMode></RootErrorBoundary>);
} else {
  console.error('Sherazi Motors root mount element is missing.');
}

// Keep the render boundary diagnostic visible during the production verification pass.
