import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// @ts-ignore
import * as viewport from 'mobile-viewport-control'

// Freeze the mobile viewport to 1.0 scale to prevent zoom issues on mobile devices
viewport.freeze(1.0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
