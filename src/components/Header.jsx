
import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../utils/auth'

export default function Header({ onMenuClick, mobileMenuOpen = false }) {
  const navigate = useNavigate()

  const email = sessionStorage.getItem('carbonEmail') || 'User'
  const rawRole = sessionStorage.getItem('carbonRole') || ''

  const role = rawRole
    .replace(/^ROLE_/i, '')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())

  function logout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile menu button and brand */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 md:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-controls="mobile-navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18 6-12 12M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              </svg>
            )}
          </button>

          

         
        </div>

        {/* Account and actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
              {email.charAt(0).toUpperCase()}
            </div>

            <div className="max-w-48">
              <p
                className="truncate text-sm font-semibold text-slate-800"
                title={email}
              >
                {email}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {role || 'User'}
              </p>
            </div>
          </div>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:scale-[0.98] sm:px-4"
            aria-label="Log out of your account"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 17l5-5-5-5M15 12H3"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
