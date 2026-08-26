// Suppress benign Vite HMR WebSocket connection warnings & unhandled rejections
if (typeof window !== 'undefined') {
  const isWsError = (err: any): boolean => {
    if (!err) return false;
    const str = String(
      typeof err === 'string'
        ? err
        : err?.message || err?.reason?.message || err?.reason || err?.stack || ''
    ).toLowerCase();

    return (
      str.includes('websocket') ||
      str.includes('[vite]') ||
      str.includes('vite:ws') ||
      str.includes('failed to connect')
    );
  };

  // Intercept and suppress unhandled promise rejections originating from WebSocket drops
  window.addEventListener(
    'unhandledrejection',
    (event) => {
      if (isWsError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  // Intercept global window error events for WebSocket connection failures
  window.addEventListener(
    'error',
    (event) => {
      if (isWsError(event.error) || isWsError(event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  // Mute console warnings/errors regarding Vite WebSocket connections
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (args.some((arg) => isWsError(arg))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (args.some((arg) => isWsError(arg))) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
