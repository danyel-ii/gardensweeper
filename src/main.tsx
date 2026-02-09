import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { SettingsProvider } from './state/settings'
import App from './ui/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)
