import { useEffect, useMemo, useState } from "react";
import { ordersAPI, handleAPIError } from "@services/api";
import "./AdminDashboard.css";

const PAYMENT_SCHEDULE_STATUSES = [
  "ALL",
  "PENDING",
  "PARTIALLY_PAID",
  "OVERDUE",
  "PAID",
  "CANCELLED",
];

const formatCurrency = (value, currency = "USD") => {
  if (value == null) return "-";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(Number(value));
  } catch (error) {
    return `${Number(value).toFixed(0)} ${currency}`;
  }
};

const formatDateTime = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch (error) {
    return iso;
  }
};

const toDateInputValue = (iso) => {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toISOString().slice(0, 16);
  } catch (error) {
    return "";
  }
};

const fromDateInputValue = (value) => {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
};

const canMarkPaid = (schedule) => {
  if (!schedule) return false;
  const outstanding = Number(schedule.outstanding || 0);
  return outstanding > 0 && ["PENDING", "PARTIALLY_PAID", "OVERDUE"].includes(schedule.status);
};

const PaymentSchedulesManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const [markModal, setMarkModal] = useState(null);
  const [markSubmitting, setMarkSubmitting] = useState(false);
  const [markError, setMarkError] = useState(null);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        paginated: true,
        page,
        size: pageSize,
      };
      if (statusFilter && statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      const response = await ordersAPI.getPaymentSchedules(params);
      const data = Array.isArray(response.data) ? response.data : [];
      setSchedules(data);
      const totalHeader = response.headers?.["x-total-count"];
      setTotalCount(totalHeader ? Number(totalHeader) : data.length);
    } catch (err) {
      const apiError = handleAPIError(err, "Failed to load payment schedules");
      setError(apiError.message);
      setSchedules([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const openMarkModal = (schedule) => {
    if (!canMarkPaid(schedule)) return;
    setMarkError(null);
    setMarkModal({
      schedule,
      amountPaid: Number(schedule.outstanding || 0) || "",
      paymentMethod: schedule.paymentMethod || "MANUAL",
      note: "",
      paidAt: toDateInputValue(new Date().toISOString()),
    });
  };

  const closeMarkModal = () => {
    setMarkModal(null);
    setMarkSubmitting(false);
    setMarkError(null);
  };

  const handleMarkSubmit = async (event) => {
    event.preventDefault();
    if (!markModal?.schedule) return;

    const outstanding = Number(markModal.schedule.outstanding || 0);
    const amountPaid = Number(markModal.amountPaid || 0);

    if (amountPaid <= 0) {
      setMarkError("Amount paid must be greater than 0.");
      return;
    }

    if (amountPaid > outstanding) {
      setMarkError("Amount paid cannot exceed outstanding amount.");
      return;
    }

    setMarkSubmitting(true);
    setMarkError(null);

    try {
      await ordersAPI.markSchedulePaid(markModal.schedule.orderId, markModal.schedule.id, {
        amountPaid,
        paymentMethod: markModal.paymentMethod || undefined,
        note: markModal.note || undefined,
        paidAt: fromDateInputValue(markModal.paidAt),
      });

      await fetchSchedules();
      closeMarkModal();
    } catch (err) {
      const apiError = handleAPIError(err, "Unable to record payment");
      setMarkError(apiError.message);
      setMarkSubmitting(false);
    }
  };

  const pageInfo = useMemo(() => {
    const start = page * pageSize + 1;
    const end = start + schedules.length - 1;
    return totalCount > 0
      ? `Showing ${start}-${end} of ${totalCount} entries`
      : "No schedules";
  }, [schedules.length, page, pageSize, totalCount]);

  return (
    <div className="admin-card admin-payments-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Payment Schedules</h2>
          <p className="admin-card-subtitle">
            Track installments across all customer orders and mark payments as received.
          </p>
        </div>
        <div className="payments-toolbar">
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {PAYMENT_SCHEDULE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : status}
              </option>
            ))}
          </select>
          <button
            className="admin-button admin-button-secondary"
            onClick={fetchSchedules}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty-state">Loading payment schedules…</div>
      ) : error ? (
        <div className="admin-error-state">{error}</div>
      ) : schedules.length === 0 ? (
        <div className="admin-empty-state">No payment schedules found.</div>
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Due date</th>
                <th>Amount due</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.orderId}</td>
                  <td>{schedule.customerName || schedule.customerPhone || "–"}</td>
                  <td>{formatDateTime(schedule.dueDate)}</td>
                  <td>{formatCurrency(schedule.amountDue, schedule.currency)}</td>
                  <td>{formatCurrency(schedule.amountPaid, schedule.currency)}</td>
                  <td>{formatCurrency(schedule.outstanding, schedule.currency)}</td>
                  <td>
                    <span className={`status-pill status-${schedule.status?.toLowerCase()}`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td>
                    <div className="payments-actions">
                      {canMarkPaid(schedule) && (
                        <button
                          className="admin-button admin-button-primary"
                          onClick={() => openMarkModal(schedule)}
                        >
                          Mark paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="payments-footer">
        <span className="payments-page-info">{pageInfo}</span>
        <div className="payments-pagination">
          <button
            className="admin-button admin-button-secondary"
            onClick={() => setPage(Math.max(page - 1, 0))}
            disabled={page === 0 || loading}
          >
            Previous
          </button>
          <button
            className="admin-button admin-button-secondary"
            onClick={() => setPage(page + 1)}
            disabled={schedules.length < pageSize || loading}
          >
            Next
          </button>
        </div>
      </div>

      {markModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Record payment</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={closeMarkModal}
                disabled={markSubmitting}
              >
                ×
              </button>
            </div>
            <form className="payments-mark-form" onSubmit={handleMarkSubmit}>
              <p className="payments-mark-summary">
                {`Order ${markModal.schedule.orderId} – due ${formatDateTime(markModal.schedule.dueDate)}`}
              </p>
              <div className="payments-mark-grid">
                <label>
                  Amount paid
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={markModal.amountPaid}
                    onChange={(event) =>
                      setMarkModal((prev) => ({
                        ...prev,
                        amountPaid: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Payment method
                  <input
                    type="text"
                    value={markModal.paymentMethod}
                    onChange={(event) =>
                      setMarkModal((prev) => ({
                        ...prev,
                        paymentMethod: event.target.value,
                      }))
                    }
                    placeholder="e.g. Bank transfer"
                  />
                </label>
                <label>
                  Paid at
                  <input
                    type="datetime-local"
                    value={markModal.paidAt}
                    onChange={(event) =>
                      setMarkModal((prev) => ({
                        ...prev,
                        paidAt: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <label className="payments-mark-notes">
                Internal notes
                <textarea
                  rows={3}
                  value={markModal.note}
                  onChange={(event) =>
                    setMarkModal((prev) => ({
                      ...prev,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Optional note for audit trail"
                />
              </label>

              {markError && (
                <div className="admin-error-state" style={{ marginTop: "0" }}>
                  {markError}
                </div>
              )}

              <div className="payments-mark-actions">
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={closeMarkModal}
                  disabled={markSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button admin-button-primary"
                  disabled={markSubmitting}
                >
                  {markSubmitting ? "Saving…" : "Save payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSchedulesManager;
