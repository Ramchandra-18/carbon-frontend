
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
  name: '',
  organizationCode: '',
  industry: '',
  country: '',
}

export default function AdminOrganizations() {
  const [form, setForm] = useState(initial)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/organizations')
      setRows(Array.isArray(data) ? data : [])
      setError('')
    } catch (e) {
      setError(
        e.response?.data?.message || 'Could not load organizations.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  function change(e) {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)

    try {
      await api.post('/organizations', {
        name: form.name.trim(),
        organizationCode: form.organizationCode.trim(),
        industry: form.industry.trim() || null,
        country: form.country.trim() || null,
      })

      setForm(initial)
      setSuccess('Organization created successfully.')
      await refresh()
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Could not create organization. Check required fields and permissions.'
      )
    } finally {
      setBusy(false)
    }
  }

  const activeCount = rows.filter((organization) => organization.active).length

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageTitle
        title="Organization Management"
        description="Create and manage the organizations registered on your carbon management platform."
      />

      {/* Feedback */}
      <div className="space-y-3" aria-live="polite">
        <Alert>{error}</Alert>
        <Alert type="success">{success}</Alert>
      </div>

      {/* Overview cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total organizations
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {rows.length}
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
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M8 8h3M8 12h3M8 16h3M15 8h2M15 12h2M15 16h2" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Organizations registered on the platform
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active organizations
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
              Organizations currently marked active
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        {/* Create organization */}
        <Panel title="Add organization">
          <div className="mb-6">
            <p className="text-sm leading-6 text-slate-500">
              Register an organization to establish its workspace on the
              platform.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Field label="Organization name">
              <input
                className={inputClass()}
                name="name"
                placeholder="e.g. Green Energy Solutions"
                autoComplete="organization"
                required
                maxLength={150}
                value={form.name}
                onChange={change}
              />
            </Field>

            <Field label="Organization code">
              <input
                className={inputClass()}
                name="organizationCode"
                placeholder="e.g. GES001"
                required
                maxLength={50}
                autoComplete="off"
                value={form.organizationCode}
                onChange={change}
              />
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Use the unique code assigned to this organization.
              </p>
            </Field>

            <Field label="Industry (optional)">
              <input
                className={inputClass()}
                name="industry"
                placeholder="e.g. Manufacturing"
                maxLength={100}
                value={form.industry}
                onChange={change}
              />
            </Field>

            <Field label="Country (optional)">
              <input
                className={inputClass()}
                name="country"
                placeholder="e.g. India"
                maxLength={100}
                autoComplete="country-name"
                value={form.country}
                onChange={change}
              />
            </Field>

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
                    Creating organization...
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
                    Create organization
                  </>
                )}
              </button>
            </div>
          </form>
        </Panel>

        {/* Organization directory */}
        <Panel title={`Organizations (${rows.length})`}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-500">
              View organization details and current status.
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
          ) : rows.length === 0 ? (
            <Empty>
              No organizations yet. Create your first organization using
              the form.
            </Empty>
          ) : (
            <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-xl sm:border sm:border-slate-200">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-xs uppercase tracking-wider text-slate-500">
                    {[
                      'Organization',
                      'Code',
                      'Industry',
                      'Country',
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
                  {rows.map((organization) => (
                    <tr
                      key={organization.id}
                      className="transition-colors hover:bg-emerald-50/30"
                    >
                      <td className="px-4 py-4 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-800">
                            {(organization.name || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">
                            {organization.name || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-slate-600">
                        {organization.organizationCode || '—'}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {organization.industry || '—'}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {organization.country || '—'}
                      </td>

                      <td className="px-4 py-4 pr-5">
                        <span
                          className={
                            organization.active
                              ? 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200'
                              : 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200'
                          }
                        >
                          <span
                            className={
                              organization.active
                                ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                                : 'h-1.5 w-1.5 rounded-full bg-slate-400'
                            }
                          />
                          {organization.active ? 'Active' : 'Inactive'}
                        </span>
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
            API capabilities:
          </span>{' '}
          This page supports listing and creating organizations. Editing or
          deactivating organizations requires additional backend endpoints.
        </p>
      </div>
    </div>
  )
}
