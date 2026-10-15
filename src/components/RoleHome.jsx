import { Navigate } from 'react-router-dom'
import { dashboardPath } from '../utils/auth'

export default function RoleHome() {
  return <Navigate to={dashboardPath(sessionStorage.getItem('carbonRole'))} replace />
}
