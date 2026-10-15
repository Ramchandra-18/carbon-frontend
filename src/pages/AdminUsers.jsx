
import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'
import {
  Alert,
  Empty,
  Field,
  inputClass,
  Loading,
  PageTitle,
  Panel,
} from '../components/Ui'

const initial = {
  fullName: '',
  email: '',
  password: '',
  role: 'STAKEHOLDER',
  organizationId: '',
}

function formatRole(value = '') {
  return String(value)
    .replace(/^ROLE_/i, '')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function RoleBadge({ role }) {
  const normalized = String(role || '')
    .replace(/^ROLE_/i, '')
    .toUpperCase()

  const styles = {
    ADMIN: 'bg-violet-50 text-violet-700 ring-violet-200',
    STAKEHOLDER: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    REVIEWER: 'bg-sky-50 text-sky-800 ring-sky-200',
  }

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[normalized] || 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {formatRole(role) || 'Unknown'}
    </span>
  )
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        active
          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
          : 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function AdminUsers() {
  const [form, setForm] = useState(initial)
  const [users, setUsers] = useState([])
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const [userResponse, organizationResponse] = await Promise.all([
        api.get('/users'),
        api.get('/organizations'),
      ])

      setUsers(Array.isArray(userResponse.data) ? userResponse.data : [])
      setOrgs(
        Array.isArray(organizationResponse.data)
          ? organizationResponse.data
          : []
      )
      setError('')
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Could not load users and organizations.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  function change(e) {
    const { name, value } = e.target

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'role' && value === 'ADMIN'
        ? { organizationId: '' }
        : {}),
    }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.role !== 'ADMIN' && !form.organizationId) {
      setError(
        'Choose an organization for Stakeholder and Reviewer accounts.'
      )
      return
    }

    if (form.password.length < 12) {
      setError('The temporary password must contain at least 12 characters.')
      return
    }

    setBusy(true)

    try {
      await api.post('/users', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        ...(form.organizationId
          ? { organizationId: Number(form.organizationId) }
          : {}),
      })

      setForm(initial)
      setSuccess('User created successfully.')
      await refresh()
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Could not create user. Confirm you are signed in as Admin and the password meets backend requirements.'
      )
    } finally {
      setBusy(false)
    }
  }

  const activeCount = users.filter((user) => user.active).length

  const adminCount = users.filter(
    (user) =>
      String(user.role || '')
        .replace(/^ROLE_/i, '')
        .toUpperCase() === 'ADMIN'
  ).length

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageTitle
        title="User Management"
        description="Create accounts, assign platform roles, and associate users with their organizations."
      />

      {/* Feedback */}
      <div className="space-y-3" aria-live="polite">
        <Alert>{error}</Alert>
        <Alert type="success">{success}</Alert>
      </div>

      {/* Overview */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total users
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {users.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Accounts registered on the platform
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active users
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {activeCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8 12 2.5 2.5L16 9"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Accounts currently marked active
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Admin accounts
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {adminCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M12 3 4.5 6v5c0 4.8 3.2 8 7.5 10 4.3-2 7.5-5.2 7.5-10V6L12 3Z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 12 2 2 4-4"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Accounts assigned the Admin role
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(300px,390px)_minmax(0,1fr)]">
        {/* Create user */}
        <Panel title="Create user">
          <div className="mb-6">
            <p className="text-sm leading-6 text-slate-500">
              Create an account and configure its access role and organization
              assignment.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Field label="Full name">
              <input
                className={inputClass()}
                name="fullName"
                placeholder="Enter full name"
                autoComplete="name"
                required
                maxLength={100}
                value={form.fullName}
                onChange={change}
              />
            </Field>

            <Field label="Email address">
              <input
                className={inputClass()}
                type="email"
                name="email"
                placeholder="user@organization.com"
                autoComplete="email"
                required
                maxLength={150}
                value={form.email}
                onChange={change}
              />
            </Field>

            <Field label="Temporary password (minimum 12 characters)">
              <input
                className={inputClass()}
                type="password"
                name="password"
                placeholder="Enter a temporary password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={72}
                value={form.password}
                onChange={change}
              />
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Share temporary credentials securely with the new user.
              </p>
            </Field>

            <Field label="Platform role">
              <select
                className={inputClass()}
                name="role"
                value={form.role}
                onChange={change}
              >
                <option value="STAKEHOLDER">Stakeholder</option>
                <option value="REVIEWER">Reviewer</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Choose the role that matches the user's responsibilities.
              </p>
            </Field>

            {form.role !== 'ADMIN' && (
              <Field label="Organization">
                <select
                  className={inputClass()}
                  name="organizationId"
                  required
                  value={form.organizationId}
                  onChange={change}
                >
                  <option value="">Select an organization</option>
                  {orgs.map((organization) => (
                    <option
                      key={organization.id}
                      value={organization.id}
                    >
                      {organization.name} ({organization.organizationCode})
                    </option>
                  ))}
                </select>
                {orgs.length === 0 && (
                  <p className="mt-1.5 text-xs leading-5 text-amber-700">
                    No organizations are available. Create an organization
                    before assigning Stakeholder or Reviewer accounts.
                  </p>
                )}
              </Field>
            )}

            <div className="border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
                    Creating account...
                  </>
                ) : (
                  <>
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
                        d="M12 5v14M5 12h14"
                      />
                    </svg>
                    Create user
                  </>
                )}
              </button>
            </div>
          </form>
        </Panel>

        {/* User directory */}
        <Panel title={`Users (${users.length})`}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-500">
              Review registered accounts, assigned roles, and account status.
            </p>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7v5h-5M4 17v-5h5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.6 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.4-3"
                />
              </svg>
              Refresh
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : users.length === 0 ? (
            <Empty>No users found. Create an account using the form.</Empty>
          ) : (
            <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-xl sm:border sm:border-slate-200">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-xs uppercase tracking-wider text-slate-500">
                    {[
                      'User',
                      'Email',
                      'Role',
                      'Organization ID',
                      'Status',
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3.5 font-semibold first:pl-5 last:pr-5"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-emerald-50/30"
                    >
                      <td className="px-4 py-4 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-800">
                            {(user.fullName || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">
                            {user.fullName || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        <span className="block max-w-56 truncate" title={user.email}>
                          {user.email || '—'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 tabular-nums text-slate-600">
                        {user.organizationId ?? '—'}
                      </td>

                      <td className="px-4 py-4 pr-5">
                        <StatusBadge active={user.active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3.5">
        <p className="text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-700">
            Access control:
          </span>{' '}
          This page creates and lists users. Role-based authorization must
          continue to be enforced by the backend. Editing users, changing
          account status, and password resets require their corresponding
          supported backend operations.
        </p>
      </div>
    </div>
  )
}
