import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { initVisitorTracking } from './services/visitorTracking'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Outside React rendering: runs once and is session-guarded, so StrictMode
// re-renders or navigation cannot send duplicate notifications.
initVisitorTracking()
