export function PageTitle({ title, description, action }) {
  return <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div><h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>
    {action}
  </div>
}
export function Alert({ children, type = 'error' }) {
  if (!children) return null
  const styles = type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-red-200 bg-red-50 text-red-700'
  return <div role="alert" className={`mb-4 rounded-lg border p-3 text-sm ${styles}`}>{children}</div>
}
export function Field({ label, children }) {
  return <label className="block space-y-1"><span className="text-sm font-medium text-slate-700">{label}</span>{children}</label>
}
export function inputClass() {
  return 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-600'
}
export function Panel({ title, children }) {
  return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
    {title && <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">{title}</h2></div>}
    <div className="p-5">{children}</div>
  </section>
}
export function Loading({ children = 'Loading...' }) {
  return <p className="py-8 text-sm text-slate-500">{children}</p>
}
export function Empty({ children = 'No records found.' }) {
  return <p className="py-8 text-center text-sm text-slate-500">{children}</p>
}
