
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

const emptyForm = {
  activityRecordId: "",
  allocatedEmissionKgCo2e: "",
};

const normalizeRole = (value = "") =>
  value.toUpperCase().replace(/^ROLE_/, "");

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

function Icon({ type, className = "h-5 w-5" }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  const paths = {
    allocation: (
      <>
        <rect x="3" y="4" width="7" height="7" rx="1.5" />
        <rect x="14" y="4" width="7" height="7" rx="1.5" />
        <rect x="8.5" y="14" width="7" height="7" rx="1.5" />
        <path d="M10 7.5h4M17.5 11v2M12 11v3" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 4c-8 0-14 3.5-14 10a6 6 0 0 0 6 6c6.5 0 8-8 8-16Z" />
        <path d="M4 21c3-5 7-8 12-11" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    activity: (
      <>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
  };

  return <svg {...common}>{paths[type] || paths.allocation}</svg>;
}

function StatCard({ label, value, detail, icon, tone = "green" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
    teal: "bg-teal-50 text-teal-700",
  };

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon type={icon} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default function Allocations() {
  const role = normalizeRole(sessionStorage.getItem("carbonRole") || "");
  const isAdmin = role === "ADMIN";
  const canWrite = isAdmin || role === "STAKEHOLDER";
  const orgId = sessionStorage.getItem("carbonOrganizationId") || "";

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(
    isAdmin ? "" : orgId
  );

  const [activities, setActivities] = useState([]);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [loadingOrganizations, setLoadingOrganizations] = useState(isAdmin);
  const [loadingOrganizationData, setLoadingOrganizationData] =
    useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProduct = products.find(
    (product) => String(product.id) === String(selectedProductId)
  );

  const selectedBatch = batches.find(
    (batch) => String(batch.id) === String(batchId)
  );

  const totalAllocated = rows.reduce(
    (total, allocation) =>
      total + (Number(allocation.allocatedEmissionKgCo2e) || 0),
    0
  );

  const formatEmissions = (value) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 3,
    }).format(value);

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
        if (alive) setOrganizations(Array.isArray(data) ? data : []);
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

    async function loadOrganizationData() {
      setActivities([]);
      setProducts([]);
      setBatches([]);
      setSelectedProductId("");
      setBatchId("");
      setRows([]);
      setForm({ ...emptyForm });

      if (!selectedOrgId) {
        setLoadingOrganizationData(false);
        return;
      }

      setLoadingOrganizationData(true);

      try {
        const [activityResponse, productResponse] = await Promise.all([
          api.get(`/activity-records/organization/${selectedOrgId}`),
          api.get(`/products/organization/${selectedOrgId}`),
        ]);

        if (!alive) return;

        const activityList = Array.isArray(activityResponse.data)
          ? activityResponse.data
          : [];

        const productList = Array.isArray(productResponse.data)
          ? productResponse.data
          : [];

        setActivities(activityList);
        setProducts(productList);
        setSelectedProductId(
          productList.length ? String(productList[0].id) : ""
        );
      } catch (e) {
        if (alive) {
          setError(
            getErrorMessage(
              e,
              "Could not load activities or products for this organization."
            )
          );
        }
      } finally {
        if (alive) setLoadingOrganizationData(false);
      }
    }

    loadOrganizationData();

    return () => {
      alive = false;
    };
  }, [selectedOrgId]);

  useEffect(() => {
    let alive = true;

    async function loadBatches() {
      setBatches([]);
      setBatchId("");
      setRows([]);
      setForm({ ...emptyForm });

      if (!selectedProductId) {
        setLoadingBatches(false);
        return;
      }

      setLoadingBatches(true);

      try {
        const { data } = await api.get(
          `/batches/product/${selectedProductId}`
        );

        if (!alive) return;

        const batchList = Array.isArray(data) ? data : [];
        setBatches(batchList);
      } catch (e) {
        if (alive) {
          setError(
            getErrorMessage(e, "Could not load batches for this product.")
          );
        }
      } finally {
        if (alive) setLoadingBatches(false);
      }
    }

    loadBatches();

    return () => {
      alive = false;
    };
  }, [selectedProductId]);

  const loadAllocations = useCallback(async (selectedBatchId) => {
    if (!selectedBatchId) {
      setRows([]);
      setLoadingAllocations(false);
      return;
    }

    setLoadingAllocations(true);

    try {
      const { data } = await api.get(
        `/emission-allocations/batch/${selectedBatchId}`
      );
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setError(
        getErrorMessage(e, "Could not load allocations for this batch.")
      );
    } finally {
      setLoadingAllocations(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    async function fetchAllocations() {
      if (!batchId) {
        setRows([]);
        setLoadingAllocations(false);
        return;
      }

      setLoadingAllocations(true);

      try {
        const { data } = await api.get(
          `/emission-allocations/batch/${batchId}`
        );

        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) {
          setRows([]);
          setError(
            getErrorMessage(e, "Could not load allocations for this batch.")
          );
        }
      } finally {
        if (alive) setLoadingAllocations(false);
      }
    }

    fetchAllocations();

    return () => {
      alive = false;
    };
  }, [batchId]);

  function handleOrganizationChange(value) {
    setSelectedOrgId(value);
    setActivities([]);
    setProducts([]);
    setBatches([]);
    setSelectedProductId("");
    setBatchId("");
    setRows([]);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
  }

  function handleProductChange(value) {
    setSelectedProductId(value);
    setBatchId("");
    setRows([]);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
  }

  function handleBatchChange(value) {
    setBatchId(value);
    setRows([]);
    setForm({ ...emptyForm });
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
      setError("You have read-only access to emission allocations.");
      return;
    }

    if (!selectedOrgId || !selectedProductId || !batchId) {
      setError("Select an organization, product, and batch.");
      return;
    }

    if (!form.activityRecordId) {
      setError("Select an activity record.");
      return;
    }

    const amount = Number(form.allocatedEmissionKgCo2e);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Allocated emissions must be greater than zero.");
      return;
    }

    setBusy(true);

    try {
      await api.post("/emission-allocations", {
        activityRecordId: Number(form.activityRecordId),
        batchId: Number(batchId),
        allocatedEmissionKgCo2e: amount,
      });

      setForm({ ...emptyForm });
      setSuccess("Allocation created successfully.");

      await loadAllocations(batchId);
    } catch (e) {
      setError(
        getErrorMessage(
          e,
          "Allocation failed. Verify organization matching, duplicate allocations, and remaining emissions."
        )
      );
    } finally {
      setBusy(false);
    }
  }

  const pageLoading =
    loadingOrganizations ||
    loadingOrganizationData ||
    loadingBatches;

  return (
    <div className="space-y-7 pb-8">
      <PageTitle
        title="Emission Allocations"
        description="Assign activity emissions to production batches with clear, traceable records."
      />

      {error && <Alert>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-2 -top-6 h-44 w-44 rounded-full border border-white/10" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
              <Icon type="leaf" className="h-4 w-4" />
              Carbon accounting
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Connect emissions to production.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100 sm:text-base">
              Allocate recorded emissions to the right production batch and
              keep every assignment easy to review.
            </p>
          </div>

          {isAdmin ? (
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm lg:max-w-sm">
              <label
                htmlFor="allocation-organization"
                className="mb-2 block text-sm font-semibold text-emerald-50"
              >
                Working organization
              </label>
              <select
                id="allocation-organization"
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
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm lg:min-w-56">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                Your access
              </p>
              <p className="mt-2 text-lg font-bold">
                {canWrite ? "Allocation editor" : "Read-only reviewer"}
              </p>
              <p className="mt-1 text-sm text-emerald-100">
                {canWrite
                  ? "Create and review allocations."
                  : "Review existing allocation records."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Allocations"
          value={rows.length}
          detail="Records for the selected batch"
          icon="allocation"
          tone="green"
        />
        <StatCard
          label="Allocated emissions"
          value={formatEmissions(totalAllocated)}
          detail="kg CO₂e for this batch"
          icon="leaf"
          tone="teal"
        />
        <StatCard
          label="Selected batch"
          value={selectedBatch ? selectedBatch.batchCode || `#${selectedBatch.id}` : "—"}
          detail={selectedProduct?.name || "Choose a product and batch"}
          icon="check"
          tone="slate"
        />
      </section>

      {/* Create allocation */}
      {canWrite && (
        <Panel title="Create allocation">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Icon type="allocation" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-950">
                Assign an emission record
              </h3>
              <p className="mt-1 text-sm leading-5 text-emerald-800">
                Choose the product, batch, and activity record, then enter the
                amount to allocate in kilograms of CO₂ equivalent.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Product">
                <select
                  className={inputClass()}
                  value={selectedProductId}
                  onChange={(event) =>
                    handleProductChange(event.target.value)
                  }
                  disabled={!selectedOrgId || loadingOrganizationData}
                  required
                >
                  <option value="">
                    {loadingOrganizationData
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

              <Field label="Production batch">
                <select
                  className={inputClass()}
                  value={batchId}
                  onChange={(event) =>
                    handleBatchChange(event.target.value)
                  }
                  disabled={!selectedProductId || loadingBatches}
                  required
                >
                  <option value="">
                    {loadingBatches ? "Loading batches..." : "Select batch"}
                  </option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchCode}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Activity record">
                <select
                  className={inputClass()}
                  value={form.activityRecordId}
                  onChange={(event) =>
                    updateForm("activityRecordId", event.target.value)
                  }
                  disabled={!batchId || loadingOrganizationData}
                  required
                >
                  <option value="">
                    {!batchId
                      ? "Select a batch first"
                      : loadingOrganizationData
                        ? "Loading activities..."
                        : activities.length === 0
                          ? "No activities available"
                          : "Select activity"}
                  </option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.activityName} —{" "}
                      {activity.emissionKgCo2e ?? "—"} kg CO₂e
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Allocated emissions (kg CO₂e)">
                <input
                  className={inputClass()}
                  type="number"
                  min="0.000001"
                  step="any"
                  inputMode="decimal"
                  placeholder="e.g. 125.5"
                  value={form.allocatedEmissionKgCo2e}
                  onChange={(event) =>
                    updateForm(
                      "allocatedEmissionKgCo2e",
                      event.target.value
                    )
                  }
                  required
                />
              </Field>
            </div>

            {selectedOrgId &&
              !pageLoading &&
              products.length === 0 && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  No products found for this organization. Add a product
                  before creating an allocation.
                </p>
              )}

            {selectedProductId &&
              !loadingBatches &&
              batches.length === 0 && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  No batches found for this product. Create a production batch
                  first.
                </p>
              )}

            {selectedOrgId &&
              !pageLoading &&
              activities.length === 0 && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  No activity records found for this organization.
                </p>
              )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-xs leading-5 text-slate-500">
                Only allocate emissions that belong to the selected
                organization and batch. The server remains responsible for
                validating allocation rules.
              </p>
              <button
                type="submit"
                disabled={
                  busy ||
                  pageLoading ||
                  loadingBatches ||
                  loadingAllocations ||
                  !selectedOrgId ||
                  !selectedProductId ||
                  !batchId ||
                  !form.activityRecordId
                }
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving allocation...
                  </>
                ) : (
                  <>
                    <Icon type="plus" className="h-4 w-4" />
                    Allocate emissions
                  </>
                )}
              </button>
            </div>
          </form>
        </Panel>
      )}

      {/* Allocation records */}
      <Panel title="Allocation records">
        <div className="mb-5 grid grid-cols-1 gap-4 border-b border-slate-100 pb-5 md:grid-cols-2">
          <Field label="Filter by product">
            <select
              className={inputClass()}
              value={selectedProductId}
              onChange={(event) =>
                handleProductChange(event.target.value)
              }
              disabled={!selectedOrgId || loadingOrganizationData}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.productCode})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Filter by batch">
            <select
              className={inputClass()}
              value={batchId}
              onChange={(event) => handleBatchChange(event.target.value)}
              disabled={!selectedProductId || loadingBatches}
            >
              <option value="">
                {loadingBatches ? "Loading batches..." : "Select batch"}
              </option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batchCode}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {pageLoading ? (
          <Loading />
        ) : !selectedOrgId ? (
          <Empty>Select an organization to continue.</Empty>
        ) : !selectedProductId ? (
          <Empty>Select a product to view its batches.</Empty>
        ) : loadingBatches ? (
          <Loading />
        ) : !batchId ? (
          <Empty>Select a batch to view its allocations.</Empty>
        ) : loadingAllocations ? (
          <Loading />
        ) : rows.length === 0 ? (
          <div className="py-5">
            <Empty>No allocations found for this batch.</Empty>
            {canWrite && (
              <p className="mt-2 text-center text-sm text-slate-500">
                Create an allocation using the form above.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedBatch?.batchCode || "Selected batch"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedProduct?.name || "Selected product"} ·{" "}
                  {rows.length} allocation{rows.length === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  loadAllocations(batchId);
                }}
                disabled={loadingAllocations}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50 sm:self-auto"
              >
                <Icon type="refresh" className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {/* Mobile layout */}
            <div className="space-y-3 md:hidden">
              {rows.map((allocation) => (
                <article
                  key={allocation.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Icon type="allocation" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">
                          Allocation ID
                        </p>
                        <p className="font-semibold text-slate-900">
                          #{allocation.id}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                      {formatEmissions(
                        Number(allocation.allocatedEmissionKgCo2e) || 0
                      )}{" "}
                      kg CO₂e
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Metric
                      label="Activity record"
                      value={
                        allocation.activityRecordId ??
                        allocation.activityRecord?.id ??
                        "—"
                      }
                    />
                    <Metric
                      label="Batch"
                      value={
                        allocation.batchId ?? allocation.batch?.id ?? "—"
                      }
                    />
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Allocation",
                        "Activity record",
                        "Batch",
                        "Allocated emissions",
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
                    {rows.map((allocation) => (
                      <tr
                        key={allocation.id}
                        className="transition-colors hover:bg-emerald-50/40"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                              <Icon type="allocation" className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-slate-900">
                              #{allocation.id}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {allocation.activityRecordId ??
                            allocation.activityRecord?.id ??
                            "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {allocation.batchId ?? allocation.batch?.id ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 font-semibold tabular-nums text-emerald-800">
                            {formatEmissions(
                              Number(allocation.allocatedEmissionKgCo2e) || 0
                            )}{" "}
                            kg CO₂e
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Emission allocation records
                </p>
                <p className="text-xs font-medium text-slate-600">
                  Total allocated: {formatEmissions(totalAllocated)} kg CO₂e
                </p>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
