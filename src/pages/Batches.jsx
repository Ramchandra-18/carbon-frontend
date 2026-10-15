
import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import {
  Alert,
  Empty,
  Field,
  inputClass,
  Loading,
  PageTitle,
  Panel,
} from "../components/Ui";

const getToday = () => new Date().toISOString().slice(0, 10);

const createInitialForm = (productId = "") => ({
  productId,
  batchCode: "",
  productionQuantity: "",
  productionUnit: "",
  productionDate: getToday(),
});

const normalizeRole = (value = "") =>
  value.toUpperCase().replace(/^ROLE_/, "");

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

function StatCard({ label, value, description, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function BatchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
      <path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12.1V21M8 5.3l8 4.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function Batches() {
  const role = normalizeRole(sessionStorage.getItem("carbonRole") || "");
  const isAdmin = role === "ADMIN";
  const canWrite = isAdmin || role === "STAKEHOLDER";
  const orgId = sessionStorage.getItem("carbonOrganizationId") || "";

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(
    isAdmin ? "" : orgId
  );

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(() => createInitialForm());

  const [loadingOrganizations, setLoadingOrganizations] = useState(isAdmin);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBatches = useCallback(async (selectedProductId) => {
    if (!selectedProductId) {
      setRows([]);
      setLoadingBatches(false);
      return;
    }

    setLoadingBatches(true);

    try {
      const { data } = await api.get(
        `/batches/product/${selectedProductId}`
      );
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(
        getErrorMessage(e, "Could not load batches for this product.")
      );
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadOrganizations() {
      if (!isAdmin) {
        setSelectedOrgId(orgId);

        if (!orgId) {
          setError("Your user is not assigned to an organization.");
        }

        setLoadingOrganizations(false);
        return;
      }

      setLoadingOrganizations(true);

      try {
        const { data } = await api.get("/organizations");

        if (!alive) return;

        setOrganizations(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) {
          setError(
            getErrorMessage(
              e,
              "Could not load organizations. Verify GET /organizations."
            )
          );
        }
      } finally {
        if (alive) setLoadingOrganizations(false);
      }
    }

    loadOrganizations();

    return () => {
      alive = false;
    };
  }, [isAdmin, orgId]);

  useEffect(() => {
    let alive = true;

    async function loadProducts() {
      setProducts([]);
      setProductId("");
      setRows([]);
      setForm(createInitialForm());

      if (!selectedOrgId) {
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);

      try {
        const { data } = await api.get(
          `/products/organization/${selectedOrgId}`
        );

        if (!alive) return;

        const list = Array.isArray(data) ? data : [];
        const firstProductId = list.length ? String(list[0].id) : "";

        setProducts(list);
        setProductId(firstProductId);
        setForm(createInitialForm(firstProductId));
      } catch (e) {
        if (alive) {
          setError(
            getErrorMessage(
              e,
              "Could not load products for this organization."
            )
          );
        }
      } finally {
        if (alive) setLoadingProducts(false);
      }
    }

    loadProducts();

    return () => {
      alive = false;
    };
  }, [selectedOrgId]);

  useEffect(() => {
    let alive = true;

    async function fetchBatches() {
      if (!productId) {
        setRows([]);
        setLoadingBatches(false);
        return;
      }

      setLoadingBatches(true);

      try {
        const { data } = await api.get(`/batches/product/${productId}`);

        if (alive) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (alive) {
          setRows([]);
          setError(
            getErrorMessage(e, "Could not load batches for this product.")
          );
        }
      } finally {
        if (alive) setLoadingBatches(false);
      }
    }

    fetchBatches();

    return () => {
      alive = false;
    };
  }, [productId]);

  function handleOrganizationChange(value) {
    setSelectedOrgId(value);
    setProducts([]);
    setProductId("");
    setRows([]);
    setForm(createInitialForm());
    setError("");
    setSuccess("");
  }

  function handleProductChange(value) {
    setProductId(value);
    setForm((current) => ({ ...current, productId: value }));
    setRows([]);
    setError("");
    setSuccess("");
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!canWrite) {
      setError("You have read-only access to production batches.");
      return;
    }

    if (!selectedOrgId || !form.productId) {
      setError("Select an organization and product first.");
      return;
    }

    if (!form.batchCode.trim()) {
      setError("Enter a batch code.");
      return;
    }

    if (!form.productionUnit.trim()) {
      setError("Enter the production unit.");
      return;
    }

    const quantity = Number(form.productionQuantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Production quantity must be greater than zero.");
      return;
    }

    setBusy(true);

    try {
      await api.post("/batches", {
        productId: Number(form.productId),
        batchCode: form.batchCode.trim(),
        productionQuantity: quantity,
        productionUnit: form.productionUnit.trim(),
        productionDate: form.productionDate,
      });

      setSuccess("Batch created successfully.");
      setForm((current) =>
        createInitialForm(current.productId)
      );

      await loadBatches(form.productId);
    } catch (e) {
      setError(
        getErrorMessage(
          e,
          "Could not create the batch. Verify the product and organization access."
        )
      );
    } finally {
      setBusy(false);
    }
  }

  const activeCount = rows.filter((batch) => Boolean(batch.active)).length;
  const inactiveCount = rows.length - activeCount;
  const isLoading = loadingOrganizations || loadingProducts;
  const selectedProduct = products.find(
    (product) => String(product.id) === String(productId)
  );

  return (
    <div className="space-y-7 pb-8">
      <PageTitle
        title="Production Batches"
        description="Track production runs, maintain batch traceability, and review production records."
      />

      {error && <Alert>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* Organization context */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Production traceability
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Every batch tells a story.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100 sm:text-base">
              Keep production details organized and make it easier to trace
              individual batches back to their products.
            </p>
          </div>

          {isAdmin ? (
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm lg:max-w-sm">
              <label
                htmlFor="batch-organization"
                className="mb-2 block text-sm font-semibold text-emerald-50"
              >
                Working organization
              </label>
              <select
                id="batch-organization"
                className="w-full rounded-xl border border-white/20 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/30"
                value={selectedOrgId}
                onChange={(event) =>
                  handleOrganizationChange(event.target.value)
                }
                disabled={loadingOrganizations}
              >
                <option value="">
                  {loadingOrganizations
                    ? "Loading organizations..."
                    : "Select an organization"}
                </option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 lg:min-w-56">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">
                Access level
              </p>
              <p className="mt-1 text-lg font-semibold">
                {canWrite ? "Production editor" : "Read-only reviewer"}
              </p>
              <p className="mt-1 text-sm text-emerald-100">
                {canWrite
                  ? "Manage batches for your organization."
                  : "Review batch records for your organization."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total batches"
          value={rows.length}
          description="For the selected product"
          icon={<BatchIcon />}
        />
        <StatCard
          label="Active batches"
          value={activeCount}
          description="Currently marked active"
          icon={<CheckIcon />}
        />
        <StatCard
          label="Inactive batches"
          value={inactiveCount}
          description="Currently marked inactive"
          icon={<ClockIcon />}
        />
      </section>

      {/* Create form */}
      {canWrite && (
        <Panel title="Create a production batch">
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <BatchIcon />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-950">
                Add a new batch
              </p>
              <p className="mt-1 text-sm leading-5 text-emerald-800">
                Enter the batch identifier, production quantity, unit, and
                production date. Required fields are marked below.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Product">
                <select
                  className={inputClass()}
                  required
                  value={form.productId}
                  onChange={(event) =>
                    handleProductChange(event.target.value)
                  }
                  disabled={
                    !selectedOrgId ||
                    loadingProducts ||
                    products.length === 0
                  }
                >
                  <option value="">
                    {loadingProducts
                      ? "Loading products..."
                      : "Select product"}
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.productCode})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Batch code">
                <input
                  className={inputClass()}
                  required
                  maxLength={80}
                  placeholder="e.g. BATCH-2026-001"
                  value={form.batchCode}
                  onChange={(event) =>
                    updateForm("batchCode", event.target.value)
                  }
                />
              </Field>

              <Field label="Production quantity">
                <input
                  className={inputClass()}
                  type="number"
                  min="0.001"
                  step="any"
                  required
                  placeholder="e.g. 1250"
                  value={form.productionQuantity}
                  onChange={(event) =>
                    updateForm("productionQuantity", event.target.value)
                  }
                />
              </Field>

              <Field label="Production unit">
                <input
                  className={inputClass()}
                  required
                  maxLength={30}
                  placeholder="e.g. kg, units, litres"
                  value={form.productionUnit}
                  onChange={(event) =>
                    updateForm("productionUnit", event.target.value)
                  }
                />
              </Field>

              <Field label="Production date">
                <input
                  className={inputClass()}
                  type="date"
                  required
                  value={form.productionDate}
                  onChange={(event) =>
                    updateForm("productionDate", event.target.value)
                  }
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                Make sure the batch code matches your organization's
                traceability records.
              </p>
              <button
                type="submit"
                disabled={
                  busy ||
                  isLoading ||
                  loadingProducts ||
                  !selectedOrgId ||
                  !products.length ||
                  !form.productId
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving batch...
                  </>
                ) : (
                  <>
                    <span className="text-lg leading-none">+</span>
                    Create batch
                  </>
                )}
              </button>
            </div>

            {!loadingProducts &&
              selectedOrgId &&
              products.length === 0 && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  No products are available for this organization. Create a
                  product first, then return here to add a batch.
                </p>
              )}
          </form>
        </Panel>
      )}

      {/* Batch records */}
      <Panel title="Batch records">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {selectedProduct
                ? `Showing batches for ${selectedProduct.name}`
                : "Choose a product to view its production batches."}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {rows.length} record{rows.length === 1 ? "" : "s"} loaded
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <Field label="Filter by product">
              <select
                className={inputClass()}
                value={productId}
                onChange={(event) =>
                  handleProductChange(event.target.value)
                }
                disabled={
                  !selectedOrgId ||
                  loadingProducts ||
                  products.length === 0
                }
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.productCode})
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : !selectedOrgId ? (
          <Empty>Select an organization to continue.</Empty>
        ) : loadingBatches ? (
          <Loading />
        ) : !productId ? (
          <Empty>No products found for this organization.</Empty>
        ) : rows.length === 0 ? (
          <div className="py-5">
            <Empty>No batches for this product yet.</Empty>
            {canWrite && (
              <p className="mt-2 text-center text-sm text-slate-500">
                Use the form above to create your first batch.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {rows.map((batch) => (
                <article
                  key={batch.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <BatchIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-slate-900">
                          {batch.batchCode || "Unnamed batch"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Batch ID: {batch.id}
                        </p>
                      </div>
                    </div>
                    <StatusBadge active={Boolean(batch.active)} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-500">Quantity</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {batch.productionQuantity ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Unit</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {batch.productionUnit || "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">
                        Production date
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {batch.productionDate || "—"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Tablet and desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Batch",
                        "Production quantity",
                        "Unit",
                        "Production date",
                        "Status",
                      ].map((heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {rows.map((batch) => (
                      <tr
                        key={batch.id}
                        className="transition-colors hover:bg-emerald-50/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                              <BatchIcon />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {batch.batchCode || "Unnamed batch"}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                ID: {batch.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-slate-800">
                          {batch.productionQuantity ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {batch.productionUnit || "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {batch.productionDate || "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <StatusBadge active={Boolean(batch.active)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                <p className="text-xs text-slate-500">
                  Production batch records
                </p>
                <p className="text-xs font-medium text-slate-600">
                  {rows.length} total
                </p>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
