
import { Link } from 'react-router-dom'

const features = [
  {
    number: '01',
    title: 'Measure emissions',
    text: 'Record business activities and calculate CO₂-equivalent emissions using documented emission factors.',
    icon: (
      <>
        <path d="M20 4c-7 0-12 2-14 7-1.2 3 .2 6 3 7.2C15 20 20 13 20 4Z" />
        <path d="M5 21c2-5 5-8 10-11" />
      </>
    ),
  },
  {
    number: '02',
    title: 'Trace production',
    text: 'Connect products and production batches to allocated emissions with traceable records.',
    icon: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" />
      </>
    ),
  },
  {
    number: '03',
    title: 'Understand your impact',
    text: 'Review Scope 1, Scope 2, Scope 3, and total emissions in one clear workspace.',
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 14v3M12 9v8M17 5v12" />
      </>
    ),
  },
]

const scopes = [
  {
    name: 'Scope 1',
    description: 'Direct emissions',
    width: 'w-1/4',
  },
  {
    name: 'Scope 2',
    description: 'Purchased energy',
    width: 'w-2/5',
  },
  {
    name: 'Scope 3',
    description: 'Value chain',
    width: 'w-3/4',
  },
]

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

export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f4] text-slate-900">
      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-10"
      >
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:gap-3"
          aria-label="CarbonLedger home"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-800 text-white shadow-sm sm:h-11 sm:w-11">
            <LeafIcon className="h-6 w-6" />
          </span>

          <span className="truncate text-lg font-bold tracking-tight sm:text-xl">
            Carbon<span className="text-emerald-800">Ledger</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            to="/login"
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 sm:px-4"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:px-5"
          >
            <span className="hidden xs:inline">Get started</span>
            <span className="xs:hidden">Join</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="relative z-10">
          <p className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-900 sm:mb-6 sm:text-xs sm:tracking-[0.15em]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
            Carbon accounting, made clearer
          </p>

          <h1 className="max-w-2xl text-[2.65rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Make your carbon impact{' '}
            <span className="font-serif italic text-emerald-800">
              visible.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
            Bring activity data, emission factors, products, and production
            batches together to understand and track your organization’s
            footprint.
          </p>

          <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row sm:mt-9">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:px-6 sm:text-base"
            >
              Create an account
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-emerald-700 hover:bg-emerald-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:px-6 sm:text-base"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600 sm:mt-10 sm:gap-x-6">
            {[
              'Scope 1, 2 & 3',
              'Source-linked factors',
              'Batch traceability',
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3 w-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4 10 4 4 8-8"
                    />
                  </svg>
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Illustrative emissions preview */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div
            className="absolute -inset-3 rounded-[2rem] bg-emerald-200/60 blur-2xl sm:-inset-5 sm:rounded-[2.5rem]"
            aria-hidden="true"
          />

          <div className="relative rounded-[1.5rem] border border-white/10 bg-[#163f32] p-4 text-white shadow-2xl sm:rounded-[2rem] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-emerald-100/75 sm:text-sm">
                  EMISSIONS OVERVIEW
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  Your footprint, at a glance
                </h2>
              </div>

              <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-medium text-emerald-100 sm:px-3 sm:text-xs">
                Illustrative preview
              </span>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-4 text-slate-900 sm:mt-7 sm:p-5">
              <p className="text-sm text-slate-500">Total emissions</p>

              <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
                <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  CO₂e
                </p>
                <span className="pb-1 text-xs text-slate-500 sm:text-sm">
                  kg equivalent
                </span>
              </div>

              <div className="mt-6 space-y-5">
                {scopes.map((scope) => (
                  <div key={scope.name}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-semibold text-slate-800">
                        {scope.name}
                      </span>
                      <span className="text-xs text-slate-500 sm:text-sm">
                        {scope.description}
                      </span>
                    </div>

                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                      role="img"
                      aria-label={`${scope.name}: illustrative relative bar`}
                    >
                      <div
                        className={`h-full rounded-full bg-emerald-700 ${scope.width}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">
                Illustration only — actual totals come from your records.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/[0.14]">
                <p className="text-sm text-emerald-100/70">
                  Traceability
                </p>
                <p className="mt-2 text-base font-semibold sm:text-lg">
                  Activity → Batch
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/[0.14]">
                <p className="text-sm text-emerald-100/70">
                  Reporting
                </p>
                <p className="mt-2 text-base font-semibold sm:text-lg">
                  Scope summaries
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <div className="mb-8 max-w-2xl sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-800 sm:text-sm">
              One connected workflow
            </p>

            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              From raw activity to meaningful insight.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Connect the records behind your footprint and make emissions
              information easier to review and understand.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 sm:gap-5">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/[0.05] sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-widest text-emerald-800">
                    {feature.number}
                  </span>

                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-100">
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
                      {feature.icon}
                    </svg>
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[1.75rem] bg-[#163f32] px-6 py-9 text-white shadow-xl shadow-emerald-950/10 sm:rounded-[2rem] sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-200 sm:text-sm">
              Start with better visibility
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Bring your carbon data together.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/80 sm:text-base">
              Create an account to connect activity records, production data,
              and emissions reporting in one workspace.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 min-[420px]:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
            >
              Get started <span aria-hidden="true">→</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-10">
          <Link
            to="/"
            className="font-semibold text-slate-700 transition hover:text-emerald-800"
          >
            © {new Date().getFullYear()} CarbonLedger
          </Link>

          <span>Measure responsibly. Improve continuously.</span>
        </div>
      </footer>
    </main>
  )
}
