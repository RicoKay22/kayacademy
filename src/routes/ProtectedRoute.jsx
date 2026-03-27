import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../store/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // New user who hasn't completed onboarding — redirect to interest selector
  // Skip this check if they're already on the onboarding page
  const onboardingComplete = user.user_metadata?.onboarding_complete
  const isOnboardingPage = location.pathname === '/onboarding'

  if (!onboardingComplete && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
