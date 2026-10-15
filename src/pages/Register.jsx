
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Alert, Field, inputClass } from '../components/Ui'

function LeafIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 4c-7 0-13 2.5-15 8-1.2 3.2.7 6 3.8 6C15 18 19.5 12 20 4Z" />
      <path d="M4 21c2.5-5.5 6.5-9 12-12" />
    </svg>
  )
}

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5 0 8.5 4.3 9.5 7-.4 1.1-1.3 2.5-2.7 3.7" />
      <path d="M6.2 6.2C3.9 7.7 2.8 10 2.5 12c1 2.7 4.5 7 9.5 7 1.1 0 2.1-.2 3-.6" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  autoComplete,
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          className={`${inputClass()} pr-12`}
          type={visible ? 'text' : 'password'}
          name={name}
          autoComplete={autoComplete}
          minLength={12}
          maxLength={72}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
    </Field>
  )
}

export default function Register() {
  const navigate = useNavigate()

  const [organizations, setOrganizations] = useState([])
  const [loadingOrganizations, setLoadingOrganizations] = useState(true)
  const [organizationError, setOrganizationError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationId: '',
    role: 'STAKEHOLDER',
  })

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    let mounted = true

    api
      .get('/public/organizations')
      .then(({ data }) => {
        if (mounted) {
          setOrganizations(
            Array.isArray(data)
              ? data.filter((org) => org.active !== false)
              : [],
          )
        }
      })
      .catch((err) => {
        if (!mounted) return

        setOrganizationError(
          err.response?.status === 404
            ? 'Organization registration options are not enabled on the backend yet.'
            : 'Could not load organizations. Please try again later.',
        )
      })
      .finally(() => {
        if (mounted) setLoadingOrganizations(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const change = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
    setNotice('')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!form.fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!form.email.trim()) {
      setError('Please enter your work email.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 12 || form.password.length > 72) {
      setError('Password must contain 12 to 72 characters.')
      return
    }

    if (!form.organizationId) {
      setError('Please select your organization.')
      return
    }

    setBusy(true)

    try {
      const { data } = await api.post('/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        organizationId: Number(form.organizationId),
        role: form.role,
      })

      setNotice(data?.message || 'Account created. You can now sign in.')

      window.setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1400)
    } catch (err) {
      if (!err.response) {
        setError(
          'Could not contact the API. Check Spring Boot, API URL, and CORS settings.',
        )
      } else if (err.response.status === 409) {
        setError(
          err.response.data?.detail ||
            err.response.data?.message ||
            'An account with this email may already exist.',
        )
      } else {
        setError(
          err.response.data?.detail ||
            err.response.data?.message ||
            `Registration failed (HTTP ${err.response.status}).`,
        )
      }
    } finally {
      setBusy(false)
    }
  }

  const organizationsUnavailable =
    !loadingOrganizations && organizations.length === 0

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      {/* Branding panel */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#123d30] p-10 text-white sm:p-12 lg:flex xl:p-16">
        <div
          className="pointer-events-none absolute -right-28 top-20 h-80 w-80 rounded-full border border-white/[0.08]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-12 top-36 h-64 w-64 rounded-full border border-white/[0.08]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-400/[0.08] blur-3xl"
          aria-hidden="true"
        />

        <Link
          to="/"
          className="relative z-10 inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-200 ring-1 ring-white/10">
            <LeafIcon className="h-6 w-6" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            Carbon<span className="text-emerald-300">Ledger</span>
          </span>
        </Link>

        <div className="relative z-10 my-12 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold tracking-wide text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            START YOUR SUSTAINABILITY JOURNEY
          </div>

          <h1 className="mt-7 text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">
            Better data for
            <span className="block text-emerald-300">
              a lighter footprint.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-emerald-50/75 xl:text-lg">
            Bring your organization&apos;s carbon data together, understand
            your impact, and take meaningful steps toward a more sustainable
            future.
          </p>

          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <LeafIcon className="h-5 w-5 text-emerald-300" />
              <p className="mt-3 text-sm font-semibold">Track emissions</p>
              <p className="mt-1 text-xs leading-5 text-white/55">
                Keep activity data organized.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-emerald-300"
                aria-hidden="true"
              >
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <path d="m7 15 4-4 3 2 5-6" />
                <path d="M15 7h4v4" />
              </svg>
              <p className="mt-3 text-sm font-semibold">Make progress</p>
              <p className="mt-1 text-xs leading-5 text-white/55">
                Turn insights into action.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4 text-xs text-emerald-100/55">
          <span>Measure. Reduce. Sustain.</span>
          <span className="text-right">Built for a greener future</span>
        </div>
      </section>

      {/* Registration form */}
      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-20">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                <LeafIcon className="h-5 w-5" />
              </span>
              <span className="font-bold tracking-tight text-slate-900">
                Carbon<span className="text-emerald-700">Ledger</span>
              </span>
            </Link>

            <Link
              to="/login"
              className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
            >
              Sign in
            </Link>
          </div>

          <Link
            to="/"
            className="hidden items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-800 lg:inline-flex"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to home
          </Link>

          <div className="mb-7 mt-2 lg:mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Create an account
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Join CarbonLedger
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Set up your profile and connect with your organization.
            </p>
          </div>

          {error && (
            <div className="mb-4" role="alert" aria-live="polite">
              <Alert>{error}</Alert>
            </div>
          )}

          {organizationError && (
            <div className="mb-4" role="status">
              <Alert>{organizationError}</Alert>
            </div>
          )}

          {notice && (
            <div className="mb-4" role="status" aria-live="polite">
              <Alert type="success">{notice}</Alert>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Field label="Full name">
              <input
                className={inputClass()}
                name="fullName"
                autoComplete="name"
                autoCapitalize="words"
                required
                maxLength={100}
                value={form.fullName}
                onChange={change}
                placeholder="Enter your full name"
              />
            </Field>

            <Field label="Work email">
              <input
                className={inputClass()}
                type="email"
                name="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                maxLength={150}
                value={form.email}
                onChange={change}
                placeholder="you@company.com"
              />
            </Field>

            <Field label="Organization">
              <select
                className={inputClass()}
                name="organizationId"
                required
                value={form.organizationId}
                onChange={change}
                disabled={loadingOrganizations || organizationsUnavailable}
              >
                <option value="">
                  {loadingOrganizations
                    ? 'Loading organizations…'
                    : organizationsUnavailable
                      ? 'No organizations available'
                      : 'Select your organization'}
                </option>

                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>

              {loadingOrganizations && (
                <p className="mt-2 text-xs text-slate-500">
                  Fetching available organizations…
                </p>
              )}
            </Field>

            <Field label="Requested role">
              <select
                className={inputClass()}
                name="role"
                value={form.role}
                onChange={change}
              >
                <option value="STAKEHOLDER">Stakeholder</option>
                <option value="REVIEWER">
                  Reviewer (requires Admin approval)
                </option>
              </select>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Public registration does not allow Admin accounts.
              </p>
            </Field>

            <PasswordField
              label="Password"
              name="password"
              value={form.password}
              onChange={change}
              placeholder="Create a strong password"
              autoComplete="new-password"
              visible={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
            />

            <p className="-mt-2 text-xs leading-5 text-slate-500">
              Use 12–72 characters. Choose a password you do not use elsewhere.
            </p>

            <PasswordField
              label="Confirm password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={change}
              placeholder="Enter your password again"
              autoComplete="new-password"
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
            />

            {form.confirmPassword && (
              <p
                className={`-mt-2 text-xs ${
                  form.password === form.confirmPassword
                    ? 'text-emerald-700'
                    : 'text-rose-600'
                }`}
                aria-live="polite"
              >
                {form.password === form.confirmPassword
                  ? 'Passwords match.'
                  : 'Passwords do not match yet.'}
              </p>
            )}

            <button
              type="submit"
              disabled={
                busy ||
                loadingOrganizations ||
                organizations.length === 0
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">ALREADY REGISTERED?</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-600">
            Have an account?{' '}
            <Link
              className="font-semibold text-emerald-800 underline-offset-4 hover:underline"
              to="/login"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Your account is subject to your organization&apos;s access policies.
            Reviewer access may require Admin approval.
          </p>
        </div>
      </section>
    </main>
  )
}
