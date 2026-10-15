import { Navigate, useLocation } from 'react-router-dom'
import { dashboardPath, isLoggedIn } from '../utils/auth'

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation()
  const authenticated = isLoggedIn()
  const role = sessionStorage.getItem('carbonRole')

  if (!authenticated || !role) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={dashboardPath(role)} replace />
  }
  return children
}
