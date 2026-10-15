
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
  source: '',
  sourceReference: '',
  activityUnit: '',
  co2eFactor: '',
  scope: 'SCOPE_1',
  scope3Category: '',
  validFrom: '',
  validUntil: '',
}

const categories = [
  'PURCHASED_GOODS_AND_SERVICES',
  'CAPITAL_GOODS',
  'FUEL_AND_ENERGY_RELATED_ACTIVITIES',
  'UPSTREAM_TRANSPORTATION_AND_DISTRIBUTION',
  'WASTE_GENERATED_IN_OPERATIONS',
  'BUSINESS_TRAVEL',
  'EMPLOYEE_COMMUTING',
  'UPSTREAM_LEASED_ASSETS',
  'DOWNSTREAM_TRANSPORTATION_AND_DISTRIBUTION',
  'PROCESSING_OF_SOLD_PRODUCTS',
  'USE_OF_SOLD_PRODUCTS',
  'END_OF_LIFE_TREATMENT_OF_SOLD_PRODUCTS',
  'DOWNSTREAM_LEASED_ASSETS',
  'FRANCHISES',
  'INVESTMENTS',
]

function normalizeRole(value) {
  return String(value || '')
    .replace(/^ROLE_/i, '')
    .toUpperCase()
}

function formatCategory(value) {
  return value
    ? value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '—'
}

function formatFactor(value) {
  const number = Number(value)

  return Number.isFinite(number)
    ? number.toLocaleString(undefined, { maximumFractionDigits: 8 })
    : '—'
}

function ScopeBadge({ scope }) {
  const styles = {
    SCOPE_1: 'bg-amber-50 text-amber-800 ring-amber-200',
    SCOPE_2: 'bg-sky-50 text-sky-800 ring-sky-200',
    SCOPE_3: 'bg-violet-50 text-violet-800 ring-violet-200',
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[scope] || 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {String(scope || 'UNKNOWN').replace('_', ' ')}
    </span>
  )
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200'
          : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? 'bg-emerald-600' : 'bg-slate-400'
        }`}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export default function EmissionFactors() {
  const role = normalizeRole(sessionStorage.getItem('carbonRole'))
  const isAdmin = role === 'ADMIN'

  const [rows, setRows] = useState([])
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/emission-factors')
      setRows(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Could not load emission factors.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  function change(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'scope' && value !== 'SCOPE_3'
        ? { scope3Category: '' }
        : {}),
    }))

    setError('')
    setSuccess('')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!isAdmin) {
      setError('Only administrators can create emission factors.')
      return
    }

    const factor = Number(form.co2eFactor)

    if (!Number.isFinite(factor) || factor < 0) {
      setError('Enter a valid, non-negative emissions factor.')
      return
    }

    if (
      form.validUntil &&
      form.validFrom &&
      form.validUntil < form.validFrom
    ) {
      setError('"Valid until" cannot be earlier than "Valid from".')
      return
    }

    if (form.scope === 'SCOPE_3' && !form.scope3Category) {
      setError('Select a Scope 3 category.')
      return
    }

    setBusy(true)

    try {
      await api.post('/emission-factors', {
        ...form,
        name: form.name.trim(),
        source: form.source.trim(),
        sourceReference: form.sourceReference.trim(),
        activityUnit: form.activityUnit.trim(),
        co2eFactor: factor,
        scope3Category:
          form.scope === 'SCOPE_3' ? form.scope3Category || null : null,
        validUntil: form.validUntil || null,
      })

      setForm(initial)
      setSuccess('Emission factor created successfully.')
      await refresh()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Could not create emission factor.',
      )
    } finally {
      setBusy(false)
    }
  }

  const activeCount = rows.filter((row) => row.active).length
  const inactiveCount = rows.length - activeCount
  const scope3Count = rows.filter((row) => row.scope === 'SCOPE_3').length

  return (
    <>
      <PageTitle
        title="Emission Factors"
        description="Manage emission factors, verify their source references, and review their validity."
        action={
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            >
              <path d="M20 7v5h-5" />
              <path d="M4 17v-5h5" />
              <path d="M5.6 9A7 7 0 0 1 18 6l2 6" />
              <path d="M18.4 15A7 7 0 0 1 6 18l-2-6" />
            </svg>
            Refresh
          </button>
        }
      />

      {error && (
        <div className="mb-5" role="alert" aria-live="polite">
          <Alert>{error}</Alert>
        </div>
      )}

      {success && (
        <div className="mb-5" role="status" aria-live="polite">
          <Alert type="success">{success}</Alert>
        </div>
      )}

      {/* Overview */}
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total factors',
            value: rows.length,
            description: 'Available factor records',
          },
          {
            label: 'Active factors',
            value: activeCount,
            description: 'Currently marked active',
          },
          {
            label: 'Inactive factors',
            value: inactiveCount,
            description: 'Currently marked inactive',
          },
          {
            label: 'Scope 3 factors',
            value: scope3Count,
            description: 'Indirect value-chain factors',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      {/* Admin creation form */}
      {isAdmin && (
        <div className="mb-6">
          <Panel title="Add emission factor">
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <span className="mt-0.5 text-emerald-800">
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
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Create a source-backed factor
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-900/70">
                  Enter the emissions value, activity unit, scope, source
                  reference, and validity period.
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div>
                <h3 className="mb-4 text-sm font-semibold text-slate-800">
                  Factor details
                </h3>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Factor name">
                    <input
                      className={inputClass()}
                      name="name"
                      required
                      maxLength={150}
                      value={form.name}
                      onChange={change}
                      placeholder="e.g. Grid electricity"
                    />
                  </Field>

                  <Field label="Activity unit">
                    <input
                      className={inputClass()}
                      name="activityUnit"
                      required
                      maxLength={50}
                      value={form.activityUnit}
                      onChange={change}
                      placeholder="e.g. kWh"
                    />
                  </Field>

                  <Field label="kg CO₂e per unit">
                    <input
                      className={inputClass()}
                      type="number"
                      name="co2eFactor"
                      min="0"
                      step="any"
                      required
                      value={form.co2eFactor}
                      onChange={change}
                      placeholder="e.g. 0.42"
                    />
                  </Field>

                  <Field label="Scope">
                    <select
                      className={inputClass()}
                      name="scope"
                      value={form.scope}
                      onChange={change}
                    >
                      <option value="SCOPE_1">Scope 1 — Direct</option>
                      <option value="SCOPE_2">Scope 2 — Energy</option>
                      <option value="SCOPE_3">Scope 3 — Value chain</option>
                    </select>
                  </Field>

                  {form.scope === 'SCOPE_3' && (
                    <Field label="Scope 3 category">
                      <select
                        className={inputClass()}
                        name="scope3Category"
                        required
                        value={form.scope3Category}
                        onChange={change}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {formatCategory(category)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">
                  Source and validity
                </h3>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Source name">
                    <input
                      className={inputClass()}
                      name="source"
                      required
                      maxLength={200}
                      value={form.source}
                      onChange={change}
                      placeholder="e.g. Government publication"
                    />
                  </Field>

                  <Field label="Source reference / URL">
                    <input
                      className={inputClass()}
                      type="text"
                      name="sourceReference"
                      required
                      maxLength={1000}
                      value={form.sourceReference}
                      onChange={change}
                      placeholder="Publication reference or https://…"
                    />
                  </Field>

                  <Field label="Valid from">
                    <input
                      className={inputClass()}
                      type="date"
                      name="validFrom"
                      required
                      value={form.validFrom}
                      onChange={change}
                    />
                  </Field>

                  <Field label="Valid until (optional)">
                    <input
                      className={inputClass()}
                      type="date"
                      name="validUntil"
                      min={form.validFrom || undefined}
                      value={form.validUntil}
                      onChange={change}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <p className="max-w-lg text-xs leading-5 text-slate-500">
                  Verify factor values and their source documentation before
                  publishing them for use in calculations.
                </p>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
                  {busy ? 'Saving…' : 'Create factor'}
                </button>
              </div>
            </form>
          </Panel>
        </div>
      )}

      {/* Factor directory */}
      <Panel title={`Available factors (${rows.length})`}>
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="-mx-5 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Factor
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Scope
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Factor value
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Unit
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Source
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Validity
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const safeUrl = isSafeHttpUrl(row.sourceReference || '')

                  return (
                    <tr
                      key={row.id}
                      className="transition hover:bg-emerald-50/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {row.name || 'Unnamed factor'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          ID: {row.id ?? '—'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <ScopeBadge scope={row.scope} />
                      </td>

                      <td className="max-w-[220px] px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {formatCategory(row.scope3Category)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-slate-900">
                        {formatFactor(row.co2eFactor)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {row.activityUnit || '—'}
                      </td>

                      <td className="max-w-[200px] px-5 py-4">
                        <p className="break-words font-medium text-slate-700">
                          {row.source || '—'}
                        </p>
                        {safeUrl && (
                          <a
                            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900"
                            href={row.sourceReference}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open source for ${row.name || 'emission factor'} in a new tab`}
                          >
                            View source
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            >
                              <path d="M14 4h6v6" />
                              <path d="m20 4-9 9" />
                              <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
                            </svg>
                          </a>
                        )}
                        {!safeUrl && row.sourceReference && (
                          <p className="mt-1 break-words text-xs text-slate-400">
                            Ref: {row.sourceReference}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                        <p>
                          <span className="text-slate-400">From: </span>
                          {row.validFrom || '—'}
                        </p>
                        <p className="mt-1">
                          <span className="text-slate-400">Until: </span>
                          {row.validUntil || 'No end date'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge active={Boolean(row.active)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs leading-5 text-slate-400">
              Factor values and active status are displayed as returned by
              the backend. Check each factor&apos;s validity period before
              using it in emissions calculations.
            </p>
          </div>
        )}
      </Panel>
    </>
  )
}
