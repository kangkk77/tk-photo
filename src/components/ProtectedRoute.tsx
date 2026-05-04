import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <section className="space-y-5 pt-4 md:pt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Checking Access
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-6xl">
          Preparing the studio route.
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
          Your session is being verified before entering the dashboard.
        </p>
      </section>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
