
import { NavLink } from 'react-router-dom'
import { dashboardPath, ROLES } from '../utils/auth'

const links = [
  {
    label: 'Organizations',
    path: '/app/admin/organizations',
    roles: [ROLES.ADMIN],
    section: 'Administration',
    icon: 'building',
  },
  {
    label: 'User Management',
    path: '/app/admin/users',
    roles: [ROLES.ADMIN],
    section: 'Administration',
    icon: 'users',
  },
  {
    label: 'Emission Factors',
    path: '/app/emission-factors',
    roles: [ROLES.ADMIN, ROLES.STAKEHOLDER, ROLES.REVIEWER],
    section: 'Carbon Management',
    icon: 'leaf',
  },
  {
    label: 'Activities',
    path: '/app/activities',
    roles: [ROLES.ADMIN, ROLES.STAKEHOLDER],
    section: 'Carbon Management',
    icon: 'activity',
  },
  {
    label: 'Products',
    path: '/app/products',
    roles: [ROLES.ADMIN, ROLES.STAKEHOLDER],
    section: 'Carbon Management',
    icon: 'package',
  },
  {
    label: 'Production Batches',
    path: '/app/batches',
    roles: [ROLES.ADMIN, ROLES.STAKEHOLDER],
    section: 'Carbon Management',
    icon: 'layers',
  },
  {
    label: 'Allocations',
    path: '/app/allocations',
    roles: [ROLES.ADMIN, ROLES.STAKEHOLDER],
    section: 'Carbon Management',
    icon: 'chart',
  },
  {
    label: 'Reports',
    path: '/app/reports',
    roles: [ROLES.ADMIN, ROLES.STAKEHOLDER, ROLES.REVIEWER],
    section: 'Insights',
    icon: 'report',
  },
]

const icons = {
  dashboard: (
    <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 21v-3h4v3" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c-7 0-12 2-14 7-1.2 3 .2 6 3 7.2C15 20 20 13 20 4Z" />
      <path d="M5 21c2-5 5-8 10-11" />
    </>
  ),
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  package: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="5" rx="0.5" />
      <rect x="13" y="8" width="3" height="9" rx="0.5" />
      <rect x="19" y="5" width="2" height="12" rx="0.5" />
    </>
  ),
  report: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
    </>
  ),
}

function Icon({ name, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {icons[name]}
    </svg>
  )
}

export default function Sidebar({ onNavigate }) {
  const rawRole = sessionStorage.getItem('carbonRole') || ''
  const role = rawRole.replace(/^ROLE_/i, '').toUpperCase()

  const visibleLinks = links.filter((link) =>
    link.roles.some(
      (allowedRole) =>
        String(allowedRole).replace(/^ROLE_/i, '').toUpperCase() === role
    )
  )

  const sections = [
    {
      title: 'Administration',
      items: visibleLinks.filter((link) => link.section === 'Administration'),
    },
    {
      title: 'Carbon Management',
      items: visibleLinks.filter((link) => link.section === 'Carbon Management'),
    },
    {
      title: 'Insights',
      items: visibleLinks.filter((link) => link.section === 'Insights'),
    },
  ]

  const navClass = ({ isActive }) =>
    [
      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
      'text-sm font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
      isActive
        ? 'bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-900/[0.03]'
        : 'text-slate-600 hover:bg-emerald-50/60 hover:text-emerald-900',
    ].join(' ')

  return (
    <aside className="sticky top-0 flex h-screen max-h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-white">
      {/* Brand */}
      <div className="shrink-0 border-b border-slate-100 px-5 py-5">
        <NavLink
          to={dashboardPath(rawRole)}
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          aria-label="CarbonLedger dashboard"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-800/20 transition duration-200 group-hover:bg-emerald-800">
            <Icon name="leaf" className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="whitespace-nowrap text-xl font-extrabold tracking-tight text-slate-950">
              Carbon<span className="text-emerald-800">Ledger</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Sustainability workspace
            </p>
          </div>
        </NavLink>
      </div>

      {/* Scrollable navigation area; sidebar itself remains fixed */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-width:none]">
        {/* Workspace information */}
        <div className="mb-6 shrink-0 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
              Active workspace
            </span>
          </div>

          <p className="mt-3 text-sm font-bold text-slate-900">
            {role
              ? role.charAt(0) + role.slice(1).toLowerCase()
              : 'User'}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Navigate your carbon data and insights.
          </p>
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 space-y-6">
          <div>
            <p className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>

            <NavLink
              to={dashboardPath(rawRole)}
              end
              onClick={onNavigate}
              className={navClass}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-emerald-600" />
                  )}
                  <Icon name="dashboard" className="h-5 w-5 shrink-0" />
                  <span className="flex-1">Dashboard</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  )}
                </>
              )}
            </NavLink>
          </div>

          {sections.map(
            (section) =>
              section.items.length > 0 && (
                <div key={section.title}>
                  <p className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {section.title}
                  </p>

                  <div className="space-y-1">
                    {section.items.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={onNavigate}
                        className={navClass}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-emerald-600" />
                            )}

                            <Icon
                              name={link.icon}
                              className={[
                                'h-5 w-5 shrink-0 transition-colors',
                                isActive
                                  ? 'text-emerald-700'
                                  : 'text-slate-400 group-hover:text-emerald-700',
                              ].join(' ')}
                            />

                            <span className="min-w-0 flex-1">
                              {link.label}
                            </span>

                            {isActive && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )
          )}
        </nav>

        {/* Footer */}
        <div className="mt-7 shrink-0 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <Icon name="leaf" className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700">
                Measure. Reduce. Sustain.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                CarbonLedger workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
