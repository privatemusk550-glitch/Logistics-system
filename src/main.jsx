/**
 * main.jsx
 * --------
 * Entry point for the React app.
 *
 * IMPORTANT: We import './i18n/index.js' BEFORE anything else so the
 * translation system is ready before any component renders.
 * Without this, components calling t() would crash on first load.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// 1. Initialise translations FIRST (order matters!)
import './i18n/index.js'

// 2. Global styles
import './styles/global.css'

// 3. App
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
