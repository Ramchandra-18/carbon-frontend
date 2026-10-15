
import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'
import { Alert, Empty, Loading, PageTitle, Panel } from '../components/Ui'

const n = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 0

const formatNumber = (value) =>
  n(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

const formatEmissions = (value) => `${formatNumber(value)} kg CO₂e`

function ScopeIcon({ scope }) {
  const paths = {
    'Scope 1': (
      <>
        <path d="M12 3v5" />
        <path d="M8 8c-2 2-2 5 0 7l4 6 4-6c2-2 2-5 0-7" />
        <path d="M9 13h6" />
      </>
    ),
    'Scope 2': (
      <>
        <path d="M13 2 5 13h6l-1 9 9-12h-6l1-8Z" />
      </>
    ),
    'Scope 3': (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c3 3 3 15 0 18" />
        <path d="M12 3c-3 3-3 15 0 18" />
      </>
    ),
    Total: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 2 5-7" />
      </>
    ),
  }

  return (
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
      {paths[scope] || paths.Total}
    </svg>
  )
}

function KpiCard({ title, value, description, icon, accent = false }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        accent
          ? 'border-emerald-800 bg-emerald-800 text-white'
          : 'border-slate-200/80 bg-white text-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-sm font-medium ${
              accent ? 'text-emerald-100' : 'text-slate-500'
            }`}
          >
            {title}
          </p>
          <p className="mt-3 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            {formatNumber(value)}
          </p>
          <p
            className={`mt-1 text-xs ${
              accent ? 'text-emerald-100/80' : 'text-slate-400'
            }`}
          >
            kg CO₂e
          </p>
        </div>

        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            accent
              ? 'bg-white/10 text-emerald-100'
              : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          <ScopeIcon scope={title} />
        </div>
      </div>

      {description && (
        <p
          className={`mt-4 border-t pt-3 text-xs ${
            accent
              ? 'border-white/15 text-emerald-100/80'
              : 'border-slate-100 text-slate-500'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}

function ScopeBreakdown({ summary }) {
  const scopes = [
    { label: 'Scope 1', value: n(summary?.scope1Emissions) },
    { label: 'Scope 2', value: n(summary?.scope2Emissions) },
    { label: 'Scope 3', value: n(summary?.scope3Emissions) },
  ]

  const total = n(summary?.totalEmissions)

  return (
    <Panel title="Emissions breakdown">
      <p className="mb-5 text-sm leading-6 text-slate-500">
        Compare direct emissions, purchased energy, and other indirect
        emissions using the values returned by your report API.
      </p>

      <div className="space-y-5">
        {scopes.map((scope) => {
          const percentage =
            total > 0 ? Math.max(0, (scope.value / total) * 100) : 0

          return (
            <div key={scope.label}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-700">
                  {scope.label}
                </span>
                <span className="text-sm font-semibold tabular-nums text-slate-900">
                  {formatNumber(scope.value)} kg CO₂e
                </span>
              </div>

              <div
                className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                role="img"
                aria-label={`${scope.label}: ${formatNumber(scope.value)} kg CO₂e`}
              >
                <div
                  className="h-full rounded-full bg-emerald-700 transition-[width] duration-500"
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              <p className="mt-1.5 text-right text-xs text-slate-400">
                {formatNumber(percentage)}% of reported total
              </p>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export default function Reports() {
  const role = sessionStorage.getItem('carbonRole')
  const orgId = sessionStorage.getItem('carbonOrganizationId')
  const isAdmin = String(role || '').replace(/^ROLE_/i, '').toUpperCase() === 'ADMIN'

  const [summary, setSummary] = useState(null)
  const [activities, setActivities] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      if (isAdmin) {
        const { data: orgs } = await api.get('/organizations')
        const organizations = Array.isArray(orgs) ? orgs : []

        const results = await Promise.all(
          organizations.map(async (organization) => {
            const [summaryResult, activityResult] = await Promise.all([
              api.get(
                `/emissions-summary/organization/${organization.id}`,
              ),
              api.get(
                `/activity-records/organization/${organization.id}`,
              ),
            ])

            return {
              organization,
              summary: summaryResult.data,
              activities: Array.isArray(activityResult.data)
                ? activityResult.data
                : [],
            }
          }),
        )

        setSummary(
          results.map(({ organization, summary: data }) => ({
            organizationId: organization.id,
            name: organization.name,
            ...data,
          })),
        )

        setActivities(
          results.flatMap(({ organization, activities: records }) =>
            records.map((activity) => ({
              ...activity,
              organizationName: organization.name,
            })),
          ),
        )
      } else {
        if (!orgId) {
          throw new Error(
            'Your account is not assigned to an organization.',
          )
        }

        const [summaryResult, activityResult] = await Promise.all([
          api.get(`/emissions-summary/organization/${orgId}`),
          api.get(`/activity-records/organization/${orgId}`),
        ])

        setSummary(summaryResult.data)
        setActivities(
          Array.isArray(activityResult.data) ? activityResult.data : [],
        )
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Could not load report data.',
      )
      setSummary(null)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, orgId])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const summaryRows = Array.isArray(summary)
    ? summary
    : summary
      ? [
          {
            ...summary,
            organizationId: orgId,
            name: 'Your organization',
          },
        ]
      : []

  const totals = summaryRows.reduce(
    (result, item) => ({
      scope1: result.scope1 + n(item.scope1Emissions),
      scope2: result.scope2 + n(item.scope2Emissions),
      scope3: result.scope3 + n(item.scope3Emissions),
      total: result.total + n(item.totalEmissions),
    }),
    { scope1: 0, scope2: 0, scope3: 0, total: 0 },
  )

  const reportTotal = isAdmin
    ? totals.total
    : n(summary?.totalEmissions)

  const exportCsv = () => {
    if (!summaryRows.length || exporting) return

    setExporting(true)

    try {
      const headers = [
        'Organization ID',
        'Organization',
        'Scope 1 (kg CO2e)',
        'Scope 2 (kg CO2e)',
        'Scope 3 (kg CO2e)',
        'Total (kg CO2e)',
      ]

      const rows = summaryRows.map((item) => [
        item.organizationId ?? '',
        item.name || '',
        n(item.scope1Emissions),
        n(item.scope2Emissions),
        n(item.scope3Emissions),
        n(item.totalEmissions),
      ])

      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(','))
        .join('\r\n')

      // UTF-8 BOM helps spreadsheet applications recognize the encoding.
      const blob = new Blob(['\uFEFF', csv], {
        type: 'text/csv;charset=utf-8;',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = 'carbon-emissions-summary.csv'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <PageTitle
        title="Reports"
        description="Understand your emissions footprint and review recorded activity."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadReports}
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

            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || exporting || summaryRows.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 17v4h14v-4" />
              </svg>
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-6" role="alert">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <section aria-label="Emissions overview">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Emissions overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Reported greenhouse gas emissions across three scopes.
                </p>
              </div>

              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                {isAdmin
                  ? `${summaryRows.length} organizations`
                  : 'Organization report'}
              </span>
            </div>

            {summaryRows.length === 0 ? (
              <Panel>
                <Empty />
              </Panel>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  title="Total"
                  value={reportTotal}
                  description="Combined reported emissions"
                  accent
                />
                <KpiCard
                  title="Scope 1"
                  value={isAdmin ? totals.scope1 : summary?.scope1Emissions}
                  description="Direct emissions"
                />
                <KpiCard
                  title="Scope 2"
                  value={isAdmin ? totals.scope2 : summary?.scope2Emissions}
                  description="Purchased energy emissions"
                />
                <KpiCard
                  title="Scope 3"
                  value={isAdmin ? totals.scope3 : summary?.scope3Emissions}
                  description="Other indirect emissions"
                />
              </div>
            )}
          </section>

          {/* Scope visualization for a single organization */}
          {!isAdmin && summary && (
            <ScopeBreakdown summary={summary} />
          )}

          {/* Emissions summary table */}
          <Panel title={isAdmin ? 'Organization comparison' : 'Emissions summary'}>
            {summaryRows.length === 0 ? (
              <Empty />
            ) : (
              <div className="-mx-5 overflow-x-auto sm:mx-0">
                <table className="min-w-[680px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                      {isAdmin && (
                        <th scope="col" className="px-5 py-3.5 font-semibold">
                          Organization
                        </th>
                      )}
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Scope 1
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Scope 2
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Scope 3
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {summaryRows.map((item, index) => (
                      <tr
                        key={item.organizationId ?? index}
                        className="transition hover:bg-emerald-50/30"
                      >
                        {isAdmin && (
                          <td className="px-5 py-4 font-medium text-slate-800">
                            {item.name || 'Unnamed organization'}
                          </td>
                        )}
                        <td className="whitespace-nowrap px-5 py-4 tabular-nums text-slate-600">
                          {formatNumber(item.scope1Emissions)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 tabular-nums text-slate-600">
                          {formatNumber(item.scope2Emissions)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 tabular-nums text-slate-600">
                          {formatNumber(item.scope3Emissions)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-emerald-800">
                          {formatNumber(item.totalEmissions)}
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            kg CO₂e
                          </span>
                        </td>
                      </tr>
                    ))}

                    {isAdmin && summaryRows.length > 1 && (
                      <tr className="bg-slate-50 font-semibold text-slate-900">
                        <td className="px-5 py-4">All organizations</td>
                        <td className="px-5 py-4 tabular-nums">
                          {formatNumber(totals.scope1)}
                        </td>
                        <td className="px-5 py-4 tabular-nums">
                          {formatNumber(totals.scope2)}
                        </td>
                        <td className="px-5 py-4 tabular-nums">
                          {formatNumber(totals.scope3)}
                        </td>
                        <td className="px-5 py-4 tabular-nums text-emerald-800">
                          {formatNumber(totals.total)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-slate-400">
              Emissions are displayed in kg CO₂e. Figures reflect the
              values returned by the backend summary endpoint.
            </p>
          </Panel>

          {/* Activity records */}
          <Panel title={`Activity records (${activities.length})`}>
            {activities.length === 0 ? (
              <Empty />
            ) : (
              <div className="-mx-5 overflow-x-auto sm:mx-0">
                <table className="min-w-[720px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Date
                      </th>
                      {isAdmin && (
                        <th scope="col" className="px-5 py-3.5 font-semibold">
                          Organization
                        </th>
                      )}
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Activity
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Quantity
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Unit
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Emissions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {activities.map((activity, index) => (
                      <tr
                        key={`${activity.organizationId ?? orgId ?? 'org'}-${activity.id ?? index}`}
                        className="transition hover:bg-emerald-50/30"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                          {activity.activityDate || '—'}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-4 font-medium text-slate-700">
                            {activity.organizationName ||
                              activity.organizationId ||
                              '—'}
                          </td>
                        )}
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {activity.activityName || '—'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 tabular-nums text-slate-600">
                          {formatNumber(activity.quantity)}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {activity.unit || '—'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-slate-800">
                          {formatNumber(activity.emissionKgCo2e)}
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            kg CO₂e
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
      )}
    </>
  )
}
