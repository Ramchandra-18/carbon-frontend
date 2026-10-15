
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  clearAuth,
  dashboardPath,
  saveUserSession,
} from '../utils/auth'
import { Alert, Field, inputClass } from '../components/Ui'

function LeafIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 4c-7 0-12 2-14 7-1.2 3 .2 6 3 7.2C15 20 20 13 20 4Z" />
      <path d="M5 21c2-5 5-8 10-11" />
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password,
      })

      const user = data?.user
      const allowedRoles = ['ADMIN', 'STAKEHOLDER', 'REVIEWER']
      const normalizedRole = String(user?.role || '')
        .replace(/^ROLE_/i, '')
        .toUpperCase()

      if (
        !data?.accessToken ||
        !user?.email ||
        !allowedRoles.includes(normalizedRole)
      ) {
        throw new Error('The login response is incomplete.')
      }

      clearAuth()
      saveUserSession(data.accessToken, {
        ...user,
        role: normalizedRole,
      })

      const intended = location.state?.from?.pathname
      const roleDashboard = dashboardPath(normalizedRole)

      // Only return to a known dashboard path for the authenticated role.
      const destination =
        intended && intended === roleDashboard
          ? intended
          : roleDashboard

      navigate(destination, { replace: true })
    } catch (err) {
      clearAuth()

      setError(
        err.response?.status === 401
          ? 'Invalid email or password, or this account is awaiting approval.'
          : err.response?.data?.detail ||
              err.response?.data?.message ||
              err.message ||
              'Unable to sign in. Check the backend and try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8f4] px-4 py-8 sm:px-6 sm:py-12">
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-xl shadow-slate-900/[0.06] lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#163f32] p-10 text-white lg:flex xl:p-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/10 blur-2xl"
            aria-hidden="true"
          />

          <Link
            to="/"
            className="relative inline-flex w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/10">
              <LeafIcon className="h-6 w-6" />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Carbon<span className="text-emerald-300">Ledger</span>
            </span>
          </Link>

          <div className="relative my-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Your sustainability workspace
            </p>

            <h2 className="mt-7 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Make your carbon impact{' '}
              <span className="font-serif italic text-emerald-300">
                visible.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-base leading-7 text-emerald-50/75">
              Bring activity records, emission factors, products, and
              production data together in one connected workspace.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Track activity-based emissions',
                'Connect products and production batches',
                'Review emissions across Scope 1, 2, and 3',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-emerald-200">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4 10 4 4 8-8"
                      />
                    </svg>
                  </span>
                  <span className="text-sm text-emerald-50/90">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-emerald-100/60">
            Measure responsibly. Improve continuously.
          </p>
        </section>

        {/* Login form */}
        <section className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-12">
          <Link
            to="/"
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-lg text-sm font-semibold text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 lg:hidden"
          >
            <LeafIcon className="h-5 w-5" />
            CarbonLedger
          </Link>

          <div className="mb-8">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-100">
              Welcome back
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sign in to your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Enter your credentials to access your sustainability workspace.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div aria-live="polite">
              <Alert>{error}</Alert>
            </div>

            <Field label="Email address">
              <input
                className={inputClass()}
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@organization.com"
                required
                maxLength={150}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  className={`${inputClass()} pr-16`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 inline-flex items-center justify-center rounded-r-lg px-3 text-xs font-semibold text-slate-500 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      className="opacity-90"
                      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Need an account?{' '}
            <Link
              className="font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              to="/register"
            >
              Register
            </Link>
          </p>

          <div className="mt-8 border-t border-slate-100 pt-5 text-center">
            <Link
              to="/"
              className="text-xs font-medium text-slate-400 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              ← Back to CarbonLedger
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
