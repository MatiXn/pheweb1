import { Navigate } from 'react-router-dom'
import { useAuthContext } from './features/auth'

export default function App() {
  const { user, isLoading } = useAuthContext()
  if (isLoading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <Navigate to="/login" replace />
}
