import { Navigate } from 'react-router-dom'
import { useAuthContext } from './features/auth'
import LandingPage from './pages/LandingPage'

export default function App() {
  const { user, isLoading } = useAuthContext()
  if (isLoading) return null
  if (user) return <Navigate to="/dashboard" replace />
  // Show landing page for unauthenticated visitors
  return <LandingPage />
}
