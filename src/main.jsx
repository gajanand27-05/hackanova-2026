import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const Admin = lazy(() => import('./admin/Admin.jsx'))
const isAdmin = location.pathname.replace(/\/+$/, '') === '/admin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <Suspense fallback={null}><Admin /></Suspense> : <App />}
  </StrictMode>,
)
