import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { setupMockElectronAPI } from './utils/mockElectronAPI'

// Ensure electronAPI is always available even in browser preview
setupMockElectronAPI()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
