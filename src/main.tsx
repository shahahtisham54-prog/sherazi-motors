import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AdminDashboard from './AdminDashboard';
import './index.css';
import './immersive.css';

const Root = window.location.pathname.startsWith('/admin') ? AdminDashboard : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
