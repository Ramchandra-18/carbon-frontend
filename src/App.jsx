import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminOrganizations from './pages/AdminOrganizations'
import AdminUsers from './pages/AdminUsers'
import EmissionFactors from './pages/EmissionFactors'
import Activities from './pages/Activities'
import Products from './pages/Products'
import Batches from './pages/Batches'
import Allocations from './pages/Allocations'
import Reports from './pages/Reports'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleHome from './components/RoleHome'

const ADMIN = ['ADMIN']
const OPERATIONS = ['ADMIN', 'STAKEHOLDER']
const READ_REPORTS = ['ADMIN', 'STAKEHOLDER', 'REVIEWER']
function Guard({ roles, children }) {
  return <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
}
export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route index element={<RoleHome />} />
      <Route path="admin/dashboard" element={<Guard roles={ADMIN}><Dashboard /></Guard>} />
      <Route path="stakeholder/dashboard" element={<Guard roles={['STAKEHOLDER']}><Dashboard /></Guard>} />
      <Route path="reviewer/dashboard" element={<Guard roles={['REVIEWER']}><Dashboard /></Guard>} />
      <Route path="admin/organizations" element={<Guard roles={ADMIN}><AdminOrganizations /></Guard>} />
      <Route path="admin/users" element={<Guard roles={ADMIN}><AdminUsers /></Guard>} />
      <Route path="emission-factors" element={<Guard roles={READ_REPORTS}><EmissionFactors /></Guard>} />
      <Route path="activities" element={<Guard roles={OPERATIONS}><Activities /></Guard>} />
      <Route path="products" element={<Guard roles={OPERATIONS}><Products /></Guard>} />
      <Route path="batches" element={<Guard roles={OPERATIONS}><Batches /></Guard>} />
      <Route path="allocations" element={<Guard roles={OPERATIONS}><Allocations /></Guard>} />
      <Route path="reports" element={<Guard roles={READ_REPORTS}><Reports /></Guard>} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>
}
