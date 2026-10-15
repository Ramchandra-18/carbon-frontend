
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden shrink-0 border-r border-slate-200/80 bg-white md:block">
          <Sidebar />
        </aside>

        {/* Mobile sidebar and backdrop */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 h-full w-full bg-slate-950/40 backdrop-blur-[2px]"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col overflow-y-auto border-r border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-end border-b border-slate-100 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  aria-label="Close navigation"
                >
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
                </button>
              </div>

              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main application area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            onMenuClick={() => setMobileMenuOpen((open) => !open)}
            mobileMenuOpen={mobileMenuOpen}
          />

          <main className="w-full flex-1">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
              <div className="min-w-0">
                <Outlet />
              </div>
            </div>
          </main>

          <footer className="border-t border-slate-200/70 bg-white/70 px-4 py-3 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-slate-500">
              Carbon Calculator
              <span className="mx-2 text-slate-300">•</span>
              Measure. Reduce. Sustain.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
