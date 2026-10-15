
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
  productCode: '',
  description: '',
}

function normalizeRole(value) {
  return String(value || '')
    .replace(/^ROLE_/i, '')
    .toUpperCase()
}

function ProductIcon() {
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
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
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

export default function Products() {
  const role = normalizeRole(sessionStorage.getItem('carbonRole'))
  const isAdmin = role === 'ADMIN'
  const canWrite = isAdmin || role === 'STAKEHOLDER'
  const orgId = sessionStorage.getItem('carbonOrganizationId')

  const [organizations, setOrganizations] = useState([])
  const [selectedOrgId, setSelectedOrgId] = useState(
    isAdmin ? '' : orgId || '',
  )
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [loadingOrganizations, setLoadingOrganizations] = useState(isAdmin)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isAdmin) return undefined

    let alive = true

    async function loadOrganizations() {
      setLoadingOrganizations(true)

      try {
        const { data } = await api.get('/organizations')

        if (alive) {
          setOrganizations(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (alive) {
          setError(
            err.response?.data?.detail ||
              err.response?.data?.message ||
              'Could not load organizations.',
          )
        }
      } finally {
        if (alive) setLoadingOrganizations(false)
      }
    }

    loadOrganizations()

    return () => {
      alive = false
    }
  }, [isAdmin])

  const targetOrgId = isAdmin ? selectedOrgId : orgId

  const refreshProducts = useCallback(async () => {
    if (!targetOrgId) {
      setRows([])
      setLoading(false)

      if (!isAdmin && !orgId) {
        setError('Your user is not assigned to an organization.')
      }

      return
    }

    setLoading(true)

    try {
      const { data } = await api.get(
        `/products/organization/${targetOrgId}`,
      )

      setRows(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setRows([])
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Could not load products.',
      )
    } finally {
      setLoading(false)
    }
  }, [targetOrgId, isAdmin, orgId])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  function changeForm(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
    setSuccess('')
  }

  function changeOrganization(event) {
    setSelectedOrgId(event.target.value)
    setError('')
    setSuccess('')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!canWrite) {
      setError('You do not have permission to create products.')
      return
    }

    if (!targetOrgId) {
      setError('Select an organization before creating a product.')
      return
    }

    const name = form.name.trim()
    const productCode = form.productCode.trim()

    if (!name || !productCode) {
      setError('Product name and product code are required.')
      return
    }

    setBusy(true)

    try {
      await api.post('/products', {
        organizationId: Number(targetOrgId),
        name,
        productCode,
        description: form.description.trim(),
      })

      setForm(initial)
      setSuccess('Product created successfully.')

      await refreshProducts()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Could not create product.',
      )
    } finally {
      setBusy(false)
    }
  }

  const activeCount = rows.filter((product) => product.active).length
  const inactiveCount = rows.length - activeCount

  return (
    <>
      <PageTitle
        title="Products"
        description="Manage your organization's products and keep product records organized."
        action={
          <button
            type="button"
            onClick={refreshProducts}
            disabled={loading || !targetOrgId}
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

      {/* Organization selector */}
      {isAdmin && (
        <div className="mb-6">
          <Panel title="Organization">
            <div className="max-w-xl">
              <Field label="Choose organization">
                <select
                  className={inputClass()}
                  value={selectedOrgId}
                  onChange={changeOrganization}
                  disabled={loadingOrganizations}
                >
                  <option value="">
                    {loadingOrganizations
                      ? 'Loading organizations…'
                      : 'Select an organization'}
                  </option>

                  {organizations.map((organization) => (
                    <option
                      key={organization.id}
                      value={organization.id}
                    >
                      {organization.name}
                    </option>
                  ))}
                </select>
              </Field>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Select an organization to view its products and, if
                permitted, create new product records.
              </p>
            </div>
          </Panel>
        </div>
      )}

      {/* Product overview */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              Total products
            </p>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
              <ProductIcon />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {rows.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Registered product records
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              Active products
            </p>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Currently marked active
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              Inactive products
            </p>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12h8" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {inactiveCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Currently marked inactive
          </p>
        </div>
      </section>

      {/* Create product */}
      {canWrite && (
        <div className="mb-6">
          <Panel title="Add product">
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <span className="mt-0.5 text-emerald-800">
                <ProductIcon />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Create a product record
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-900/70">
                  Add the product name and a unique identifier used by
                  your organization.
                </p>
              </div>
            </div>

            <form onSubmit={submit}>
              <fieldset
                disabled={busy || !targetOrgId}
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
              >
                <Field label="Product name">
                  <input
                    className={inputClass()}
                    name="name"
                    required
                    maxLength={150}
                    value={form.name}
                    onChange={changeForm}
                    placeholder="e.g. Recycled packaging"
                  />
                </Field>

                <Field label="Product code">
                  <input
                    className={inputClass()}
                    name="productCode"
                    required
                    maxLength={60}
                    value={form.productCode}
                    onChange={changeForm}
                    placeholder="e.g. PROD-001"
                  />
                </Field>

                <Field label="Description">
                  <input
                    className={inputClass()}
                    name="description"
                    maxLength={1000}
                    value={form.description}
                    onChange={changeForm}
                    placeholder="Brief product description"
                  />
                </Field>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={busy || !targetOrgId}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? (
                      <>
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
                        Saving…
                      </>
                    ) : (
                      <>
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
                          <path d="M12 5v14" />
                          <path d="M5 12h14" />
                        </svg>
                        Create product
                      </>
                    )}
                  </button>
                </div>
              </fieldset>

              {!targetOrgId && (
                <p className="mt-3 text-xs text-amber-700">
                  Select an organization before creating a product.
                </p>
              )}
            </form>
          </Panel>
        </div>
      )}

      {/* Products table */}
      <Panel title={`Products (${rows.length})`}>
        {loading ? (
          <Loading />
        ) : !targetOrgId ? (
          <Empty />
        ) : rows.length === 0 ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-800">
              <ProductIcon />
            </div>
            <p className="mt-4 font-semibold text-slate-800">
              No products yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {canWrite
                ? 'Create your first product using the form above.'
                : 'No products are currently available for this organization.'}
            </p>
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Product
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Product code
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Description
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {rows.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-emerald-50/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                          <ProductIcon />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {product.name || 'Unnamed product'}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            ID: {product.id ?? '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700">
                        {product.productCode || '—'}
                      </span>
                    </td>

                    <td className="max-w-xs px-5 py-4 leading-6 text-slate-600">
                      <p className="break-words">
                        {product.description || 'No description provided'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge active={Boolean(product.active)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Showing {rows.length} product{rows.length === 1 ? '' : 's'}
            </p>
            <p className="text-xs text-slate-400">
              Product status reflects the backend record.
            </p>
          </div>
        )}
      </Panel>
    </>
  )
}
