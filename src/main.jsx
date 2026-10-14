/* editorial-ui · Cristian Pérez · cristianperez.me */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.info(
  '%cPassGuard%c · tallado con cuidado por Cristian Pérez · https://cristianperez.me',
  'font-weight:700;color:#d9a74a',
  '',
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
