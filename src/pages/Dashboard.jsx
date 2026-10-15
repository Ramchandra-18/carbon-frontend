
import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'
import { PageTitle, Panel, Loading, Alert } from '../components/Ui'

const zero = {
  scope1Emissions: 0,
  scope2Emissions: 0,
  scope3Emissions: 0,
  totalEmissions: 0,
}

const num = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 0

const format = (value) =>
  num(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

function normalizeRole(value) {
  return String(value || '')
    .replace(/^ROLE_/i, '')
    .toUpperCase()
}

function DashboardIcon({ type, className = 'h-6 w-6' }) {
  const paths = {
    total: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 2 5-7" />
      </>
    ),
    scope1: (
      <>
        <path d="M12 3v5" />
        <path d="M8 8c-2 2-2 5 0 7l4 6 4-6c2-2 2-5 0-7" />
        <path d="M9 13h6" />
      </>
    ),
    scope2: (
      <path d="M13 2 5 13h6l-1 9 9-12h-6l1-8Z" />
    ),
    scope3: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c3 3 3 15 0 18" />
        <path d="M12 3c-3 3-3 15 0 18" />
      </>
    ),
    organization: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 7h2M9 11h2M9 15h2M15 7h.01M15 11h.01M15 15h.01M9 21v-3h6v3" />
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
      className={className}
      aria-hidden="true"
    >
      {paths[type] || paths.total}
    </svg>
  )
}

function StatCard({ label, value, type, description, featured = false }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6 ${
        featured
          ? 'border-emerald-800 bg-emerald-800 text-white'
          : 'border-slate-200/80 bg-white text-slate-900'
      }`}
    >
      {featured && (
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/10"
          aria-hidden="true"
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-sm font-medium ${
              featured ? 'text-emerald-100' : 'text-slate-500'
            }`}
          >
            {label}
          </p>

          <p className="mt-4 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            {format(value)}
          </p>

          <p
            className={`mt-1 text-xs ${
              featured ? 'text-emerald-100/75' : 'text-slate-400'
            }`}
          >
            kg CO₂e
          </p>
        </div>

        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition group-hover:scale-105 ${
            featured
              ? 'bg-white/10 text-emerald-100'
              : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          <DashboardIcon type={type} />
        </span>
      </div>

      <div
        className={`mt-5 border-t pt-3 text-xs ${
          featured
            ? 'border-white/15 text-emerald-100/75'
            : 'border-slate-100 text-slate-500'
        }`}
      >
        {description}
      </div>
    </div>
  )
}

function EmissionsBreakdown({ summary }) {
  const scopes = [
    {
      label: 'Scope 1',
      description: 'Direct emissions',
      value: num(summary.scope1Emissions),
    },
    {
      label: 'Scope 2',
      description: 'Purchased energy',
      value: num(summary.scope2Emissions),
    },
    {
      label: 'Scope 3',
      description: 'Other indirect emissions',
      value: num(summary.scope3Emissions),
    },
  ]

  const total = num(summary.totalEmissions)

  return (
    <Panel title="Emissions breakdown">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            How your reported footprint is distributed
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {format(total)}{' '}
            <span className="text-xs font-medium text-slate-500">
              kg CO₂e total
            </span>
          </p>
        </div>

        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          3 emissions scopes
        </span>
      </div>

      <div
        className="mb-7 flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
        role="img"
        aria-label={`Emissions distribution: ${scopes
          .map((scope) => `${scope.label} ${format(scope.value)} kg CO₂e`)
          .join(', ')}`}
      >
        {scopes.map((scope, index) => {
          const percentage =
            total > 0 ? Math.max(0, (scope.value / total) * 100) : 0

          return (
            <div
              key={scope.label}
              className={[
                'h-full transition-[width] duration-500',
                index === 0
                  ? 'bg-emerald-800'
                  : index === 1
                    ? 'bg-emerald-500'
                    : 'bg-emerald-200',
              ].join(' ')}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          )
        })}
      </div>

      <div className="space-y-5">
        {scopes.map((scope, index) => {
          const percentage =
            total > 0 ? Math.max(0, (scope.value / total) * 100) : 0

          return (
            <div key={scope.label}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full ${
                      index === 0
                        ? 'bg-emerald-800'
                        : index === 1
                          ? 'bg-emerald-500'
                          : 'bg-emerald-200'
                    }`}
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {scope.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {scope.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-slate-900">
                    {format(scope.value)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {format(percentage)}%
                  </p>
                </div>
              </div>

              <div className="ml-6 mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${
                    index === 0
                      ? 'bg-emerald-800'
                      : index === 1
                        ? 'bg-emerald-500'
                        : 'bg-emerald-200'
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function OrganizationTable({ organizations }) {
  return (
    <Panel title="Organization emissions">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          Compare reported emissions across organizations.
        </p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {organizations.length} organizations
        </span>
      </div>

      {organizations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
            <DashboardIcon type="organization" />
          </span>
          <p className="mt-4 font-semibold text-slate-800">
            No organizations yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Add your first organization from Organization Management to
            start viewing organization-level emissions.
          </p>
        </div>
      ) : (
        <div className="-mx-5 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  Organization
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  Code
                </th>
                <th scope="col" className="px-5 py-3.5 text-right font-semibold">
                  Total emissions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {organizations.map((organization) => (
                <tr
                  key={organization.id}
                  className="transition hover:bg-emerald-50/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                        <DashboardIcon
                          type="organization"
                          className="h-5 w-5"
                        />
                      </span>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {organization.name || 'Unnamed organization'}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Organization ID: {organization.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600">
                      {organization.organizationCode || '—'}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <p className="font-semibold tabular-nums text-emerald-800">
                      {format(organization.summary?.totalEmissions)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      kg CO₂e
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

export default function Dashboard() {
  const role = normalizeRole(sessionStorage.getItem('carbonRole'))
  const orgId = sessionStorage.getItem('carbonOrganizationId')
  const isAdmin = role === 'ADMIN'

  const [summary, setSummary] = useState(zero)
  const [orgs, setOrgs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      if (isAdmin) {
        const { data: organizations } = await api.get('/organizations')
        const list = Array.isArray(organizations) ? organizations : []

        const results = await Promise.all(
          list.map(async (organization) => {
            const { data } = await api.get(
              `/emissions-summary/organization/${organization.id}`,
            )

            return {
              ...organization,
              summary: { ...zero, ...(data || {}) },
            }
          }),
        )

        const total = results.reduce(
          (accumulator, organization) => ({
            scope1Emissions:
              accumulator.scope1Emissions +
              num(organization.summary.scope1Emissions),
            scope2Emissions:
              accumulator.scope2Emissions +
              num(organization.summary.scope2Emissions),
            scope3Emissions:
              accumulator.scope3Emissions +
              num(organization.summary.scope3Emissions),
            totalEmissions:
              accumulator.totalEmissions +
              num(organization.summary.totalEmissions),
          }),
          { ...zero },
        )

        setOrgs(results)
        setSummary(total)
      } else {
        if (!orgId) {
          throw new Error(
            'This account is not assigned to an organization. Contact an administrator.',
          )
        }

        const { data } = await api.get(
          `/emissions-summary/organization/${orgId}`,
        )

        setSummary({ ...zero, ...(data || {}) })
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Could not load dashboard data.',
      )
    } finally {
      setLoading(false)
    }
  }, [isAdmin, orgId])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const title =
    role === 'ADMIN'
      ? 'Admin Dashboard'
      : role === 'REVIEWER'
        ? 'Reviewer Dashboard'
        : 'Stakeholder Dashboard'

  const description = isAdmin
    ? 'Monitor emissions performance across your organizations from one place.'
    : role === 'REVIEWER'
      ? 'Review emissions data and the reported footprint for your assigned organization.'
      : 'Track your organization’s emissions footprint and sustainability performance.'

  return (
    <>
      <PageTitle
        title={title}
        description={description}
        action={
          <button
            type="button"
            onClick={loadDashboard}
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
            Refresh data
          </button>
        }
      />

      {error && (
        <div className="mb-6" role="alert" aria-live="polite">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          {/* Hero banner */}
          <section className="relative overflow-hidden rounded-3xl bg-[#123d30] p-6 text-white shadow-sm sm:p-8 lg:p-10">
            <div
              className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/[0.09]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-2 -top-10 h-52 w-52 rounded-full border border-white/[0.09]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-emerald-400/[0.08] blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  SUSTAINABILITY OVERVIEW
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                  Measure your impact.
                  <span className="block text-emerald-300">
                    Make every action count.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/75 sm:text-base">
                  Understand your emissions footprint, monitor your
                  organization's reported data, and use clear insights to
                  support better sustainability decisions.
                </p>
              </div>

              <div className="relative flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 md:min-w-56 md:flex-col md:items-start">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-200">
                  <DashboardIcon
                    type="total"
                    className="h-6 w-6"
                  />
                </span>

                <div>
                  <p className="text-xs font-medium text-emerald-100/70">
                    {isAdmin ? 'Organizations monitored' : 'Total footprint'}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {isAdmin
                      ? orgs.length.toLocaleString()
                      : format(summary.totalEmissions)}
                  </p>
                  <p className="mt-1 text-xs text-emerald-100/65">
                    {isAdmin ? 'Across the platform' : 'kg CO₂e reported'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* KPI cards */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Emissions at a glance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                A breakdown of the emissions recorded in your report.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total emissions"
                value={summary.totalEmissions}
                type="total"
                description="Combined reported footprint"
                featured
              />
              <StatCard
                label="Scope 1"
                value={summary.scope1Emissions}
                type="scope1"
                description="Direct emissions"
              />
              <StatCard
                label="Scope 2"
                value={summary.scope2Emissions}
                type="scope2"
                description="Purchased energy emissions"
              />
              <StatCard
                label="Scope 3"
                value={summary.scope3Emissions}
                type="scope3"
                description="Other indirect emissions"
              />
            </div>
          </section>

          {/* Admin organization count and breakdown */}
          {isAdmin ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
              <OrganizationTable organizations={orgs} />
              <EmissionsBreakdown summary={summary} />
            </div>
          ) : (
            <EmissionsBreakdown summary={summary} />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                <DashboardIcon type="scope3" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Keep your data up to date
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Dashboard values reflect the latest successful API response.
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-slate-400">
              Units: kg CO₂e
            </span>
          </div>
        </div>
      )}
    </>
  )
}
