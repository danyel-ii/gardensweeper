import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/chewy/400.css'
import '@fontsource/patrick-hand/400.css'
import './styles/global.css'
import App from './ui/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
