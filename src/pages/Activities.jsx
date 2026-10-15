
import { useEffect, useState } from "react";
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

const today = new Date().toISOString().slice(0, 10);

const initial = {
  activityName: "",
  emissionFactorId: "",
  quantity: "",
  unit: "",
  activityDate: today,
  description: "",
};

export default function Activities() {
  const rawRole = sessionStorage.getItem("carbonRole") || "";
  const role = rawRole.replace(/^ROLE_/i, "").toUpperCase();

  const isAdmin = role === "ADMIN";
  const canWrite = isAdmin || role === "STAKEHOLDER";
  const orgId = sessionStorage.getItem("carbonOrganizationId");

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(
    isAdmin ? "" : orgId || ""
  );
  const [rows, setRows] = useState([]);
  const [factors, setFactors] = useState([]);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    let alive = true;

    api
      .get("/organizations")
      .then(({ data }) => {
        if (alive) setOrganizations(data || []);
      })
      .catch((e) => {
        if (alive) {
          setError(
            e.response?.data?.message || "Could not load organizations."
          );
        }
      });

    return () => {
      alive = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    let alive = true;

    api
      .get("/emission-factors")
      .then(({ data }) => {
        if (alive) setFactors(data || []);
      })
      .catch((e) => {
        if (alive) {
          setError(
            e.response?.data?.message || "Could not load emission factors."
          );
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function refresh() {
      const targetOrgId = isAdmin ? selectedOrgId : orgId;

      if (!targetOrgId) {
        setRows([]);
        setLoading(false);
        setError(
          isAdmin
            ? ""
            : "Your user is not assigned to an organization."
        );
        return;
      }

      setLoading(true);

      try {
        const { data } = await api.get(
          `/activity-records/organization/${targetOrgId}`
        );

        if (alive) {
          setRows(data || []);
          setError("");
        }
      } catch (e) {
        if (alive) {
          setRows([]);
          setError(
            e.response?.data?.message || "Could not load activity data."
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    refresh();

    return () => {
      alive = false;
    };
  }, [isAdmin, orgId, selectedOrgId]);

  function change(e) {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };

    if (name === "emissionFactorId") {
      const factor = factors.find((f) => String(f.id) === value);
      next.unit = factor?.activityUnit || "";
    }

    setForm(next);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const targetOrgId = isAdmin ? selectedOrgId : orgId;

    if (!targetOrgId) {
      setError("Select an organization before recording activity.");
      return;
    }

    if (!form.emissionFactorId) {
      setError("Select an emission factor.");
      return;
    }

    if (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    setBusy(true);

    try {
      await api.post("/activity-records", {
        organizationId: Number(targetOrgId),
        emissionFactorId: Number(form.emissionFactorId),
        activityName: form.activityName.trim(),
        quantity: Number(form.quantity),
        unit: form.unit,
        activityDate: form.activityDate,
        description: form.description.trim(),
      });

      setForm({ ...initial, activityDate: today });
      setSuccess("Activity recorded successfully.");

      const { data } = await api.get(
        `/activity-records/organization/${targetOrgId}`
      );

      setRows(data || []);
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not record activity."
      );
    } finally {
      setBusy(false);
    }
  }

  const activeFactors = factors.filter((factor) => factor.active);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageTitle
        title="Activities"
        description="Record organizational activity data and track the emissions associated with your operations."
      />

      {/* Feedback */}
      <div className="space-y-3" aria-live="polite">
        <Alert>{error}</Alert>
        <Alert type="success">{success}</Alert>
      </div>

      {/* Organization selector */}
      {isAdmin && (
        <Panel title="Organization workspace">
          <div className="max-w-xl">
            <Field label="Organization">
              <select
                className={inputClass()}
                value={selectedOrgId}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value);
                  setError("");
                  setSuccess("");
                }}
              >
                <option value="">Select an organization</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Select the organization whose activity records you want to
              view or update.
            </p>
          </div>
        </Panel>
      )}

      {/* Activity form */}
      {canWrite && (
        <Panel title="Record activity">
          <div className="mb-6">
            <p className="text-sm leading-6 text-slate-500">
              Enter the activity details below. The selected emission factor
              determines the applicable activity unit.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Activity name">
                <input
                  className={inputClass()}
                  name="activityName"
                  placeholder="e.g. Electricity consumption"
                  autoComplete="off"
                  required
                  maxLength={150}
                  value={form.activityName}
                  onChange={change}
                />
              </Field>

              <Field label="Emission factor">
                <select
                  className={inputClass()}
                  name="emissionFactorId"
                  required
                  value={form.emissionFactorId}
                  onChange={change}
                >
                  <option value="">Select an emission factor</option>
                  {activeFactors.map((factor) => (
                    <option key={factor.id} value={factor.id}>
                      {factor.name} ({factor.activityUnit})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Quantity">
                <input
                  className={inputClass()}
                  type="number"
                  min="0.0001"
                  step="any"
                  name="quantity"
                  placeholder="Enter quantity"
                  required
                  value={form.quantity}
                  onChange={change}
                />
              </Field>

              <Field label="Unit">
                <input
                  className={inputClass()}
                  name="unit"
                  placeholder="Selected factor unit"
                  required
                  value={form.unit}
                  onChange={change}
                  readOnly
                  aria-describedby="activity-unit-help"
                />
                <p
                  id="activity-unit-help"
                  className="mt-1.5 text-xs text-slate-500"
                >
                  Automatically populated from the selected factor.
                </p>
              </Field>

              <Field label="Activity date">
                <input
                  className={inputClass()}
                  type="date"
                  name="activityDate"
                  required
                  value={form.activityDate}
                  onChange={change}
                />
              </Field>

              <Field label="Description (optional)">
                <input
                  className={inputClass()}
                  name="description"
                  placeholder="Add any useful context"
                  maxLength={500}
                  value={form.description}
                  onChange={change}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                Please verify the quantity, unit, and date before saving.
              </p>

              <button
                type="submit"
                disabled={
                  busy ||
                  !(isAdmin ? selectedOrgId : orgId) ||
                  activeFactors.length === 0
                }
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {busy ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                      />
                    </svg>
                    Saving activity...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 5v14M5 12h14"
                      />
                    </svg>
                    Record activity
                  </>
                )}
              </button>
            </div>
          </form>
        </Panel>
      )}

      {/* Activity records */}
      <Panel title={`Activity records (${rows.length})`}>
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Review the recorded activities and their calculated emissions.
          </p>
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-100">
            {rows.length} {rows.length === 1 ? "record" : "records"}
          </span>
        </div>

        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-xl sm:border sm:border-slate-200">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-xs uppercase tracking-wider text-slate-500">
                  {[
                    "Date",
                    "Activity",
                    "Quantity",
                    "Unit",
                    "Emissions (kg CO₂e)",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3.5 font-semibold first:pl-5 last:pr-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map((record) => (
                  <tr
                    key={record.id}
                    className="transition-colors hover:bg-emerald-50/30"
                  >
                    <td className="whitespace-nowrap px-4 py-4 pl-5 text-slate-600">
                      {record.activityDate || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-800">
                        {record.activityName || "—"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 tabular-nums text-slate-700">
                      {Number(record.quantity).toLocaleString()}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {record.unit || "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 pr-5">
                      <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1.5 font-semibold tabular-nums text-emerald-800">
                        {Number(record.emissionKgCo2e).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 4 }
                        )}
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
  );
}
