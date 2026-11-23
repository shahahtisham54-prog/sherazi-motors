import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AdminDashboard from './AdminDashboard';
import './index.css';
import './immersive.css';

class RootErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Sherazi Motors UI failed to render', error, info.componentStack);
  }
  render() {
    if (this.state.failed) {
      return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#142326', color: '#f4f0e7', textAlign: 'center' }}>
        <section><h1 style={{ fontSize: 30, marginBottom: 12 }}>Sherazi Motors is temporarily unavailable.</h1>
          <p style={{ maxWidth: 440, lineHeight: 1.7, opacity: .8 }}>Please refresh the page. Our team has been notified of a display error.</p>
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
