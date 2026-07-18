import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="d-flex justify-content-center align-items-center min-vh-100">
        <p className="mb-0">Cargando sesión...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const destination =
      user.role === 'admin'
        ? '/admin/dashboard'
        : '/client/dashboard'

    return <Navigate to={destination} replace />
  }

  return <Outlet />
}

export default ProtectedRoute

