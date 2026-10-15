import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  timeout: 15000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register', '/public/organizations']

api.interceptors.request.use((config) => {
  const url = config.url || ''
  const isPublic = PUBLIC_ENDPOINTS.some((path) => url === path || url.startsWith(`${path}?`))
  if (isPublic) {
    if (config.headers) delete config.headers.Authorization
    return config
  }

  const token = sessionStorage.getItem('carbonToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('carbonToken')
      sessionStorage.removeItem('carbonUser')
      sessionStorage.removeItem('carbonRole')
      sessionStorage.removeItem('carbonOrganizationId')
    }
    return Promise.reject(error)
  },
)

export default api
