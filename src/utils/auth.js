
export const ROLES = {
  ADMIN: 'ADMIN',
  STAKEHOLDER: 'STAKEHOLDER',
  REVIEWER: 'REVIEWER',
}

export function saveUserSession(token, user) {
  sessionStorage.setItem('carbonToken', token)
  sessionStorage.setItem('carbonUser', JSON.stringify(user))
  sessionStorage.setItem('carbonRole', user.role)

  if (user.organizationId == null) {
    sessionStorage.removeItem('carbonOrganizationId')
  } else {
    sessionStorage.setItem(
      'carbonOrganizationId',
      String(user.organizationId)
    )
  }
}

export function clearAuth() {
  sessionStorage.removeItem('carbonToken')
  sessionStorage.removeItem('carbonUser')
  sessionStorage.removeItem('carbonRole')
  sessionStorage.removeItem('carbonOrganizationId')
  sessionStorage.removeItem('carbonAuth')
}

export function dashboardPath(role) {
  if (role === ROLES.ADMIN) return '/app/admin/dashboard'
  if (role === ROLES.REVIEWER) return '/app/reviewer/dashboard'
  return '/app/stakeholder/dashboard'
}

export function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('carbonUser') || 'null')
  } catch {
    return null
  }
}

export function isLoggedIn() {
  return Boolean(
    sessionStorage.getItem('carbonToken') &&
    sessionStorage.getItem('carbonRole')
  )
}
