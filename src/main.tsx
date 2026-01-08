import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f9fafb',
        color: '#1f2937'
      }}>
        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#dc2626' }}>
            Missing Configuration
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            The application cannot start because the Clerk Publishable Key is missing.
          </p>
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '1rem',
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            marginBottom: '1rem',
            wordBreak: 'break-all'
          }}>
            VITE_CLERK_PUBLISHABLE_KEY
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Please check your netlify.toml file or Netlify Console logs to ensure the key is being picked up.
          </p>
        </div>
      </div>
    </StrictMode>
  )
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </StrictMode>,
  )
}
