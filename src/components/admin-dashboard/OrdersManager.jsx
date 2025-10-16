import { useEffect, useMemo, useState } from "react";
import { ordersAPI, handleAPIError } from "@services/api";
import "./AdminDashboard.css";

const STATUS_FILTERS = [
  "ALL",
  "NEW",
  "PENDING",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY_FOR_DELIVERY",
  "COMPLETED",
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

const toISODateInput = (date) => date.toISOString().slice(0, 10);

const toStartOfDayISO = (dateString) => {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const [confirmForm, setConfirmForm] = useState({
    depositAmount: "",
    depositDueDate: "",
    finalDueDate: "",
    paymentTerms: "50% deposit, remainder prior to delivery",
    notes: "",
  });

  const fetchOrders = async () => {
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
      const response = await ordersAPI.getAll(params);
      const data = Array.isArray(response.data) ? response.data : [];
      setOrders(data);
      const totalHeader = response.headers?.["x-total-count"];
      setTotalCount(totalHeader ? Number(totalHeader) : data.length);
    } catch (err) {
      const apiError = handleAPIError(err, "Failed to load orders");
      setError(apiError.message);
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const handleStatusUpdate = async (orderId, nextStatus, changedBy = "admin-dashboard") => {
    await ordersAPI.updateStatus(orderId, { status: nextStatus, changedBy });
  };

  const canConfirm = (status) =>
    ["NEW", "PENDING"].includes(status);

  const canCancel = (status) =>
    ["NEW", "PENDING", "CONFIRMED", "IN_PRODUCTION"].includes(status);

  const canRenew = (status) => status === "CANCELLED";

  // Status progression helpers
  const canStartProduction = (status) => status === "CONFIRMED";

  const canMarkReadyForDelivery = (status) => status === "IN_PRODUCTION";

  const canComplete = (status) => status === "READY_FOR_DELIVERY";

  const pageInfo = useMemo(() => {
    const start = page * pageSize + 1;
    const end = start + orders.length - 1;
    return totalCount > 0
      ? `Showing ${start}-${end} of ${totalCount} orders`
      : "No orders";
  }, [orders.length, page, pageSize, totalCount]);

  const openConfirmModal = (order) => {
    const total = Number(order.totalAmount || 0);
    const defaultDeposit = total ? Math.round(total * 0.5) : "";
    const today = new Date();
    const finalDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    setConfirmForm({
      depositAmount: defaultDeposit ? defaultDeposit.toString() : "",
      depositDueDate: toISODateInput(today),
      finalDueDate: toISODateInput(finalDate),
      paymentTerms: "50% deposit, remainder prior to delivery",
      notes: "",
    });
    setConfirmError(null);
    setConfirmingOrder(order);
  };

  const closeConfirmModal = () => {
    setConfirmingOrder(null);
    setConfirmSubmitting(false);
    setConfirmError(null);
  };

  const handleConfirmSubmit = async (event) => {
    event.preventDefault();
    if (!confirmingOrder) return;

    const total = Number(confirmingOrder.totalAmount || 0);
    const depositValue = Number(confirmForm.depositAmount);
    const depositDue = toStartOfDayISO(confirmForm.depositDueDate);
    const finalDue = toStartOfDayISO(confirmForm.finalDueDate);

    if (!depositValue || depositValue <= 0) {
      setConfirmError("Deposit amount must be greater than 0.");
      return;
    }

    if (depositValue > total) {
      setConfirmError("Deposit cannot exceed total order amount.");
      return;
    }

    if (!depositDue) {
      setConfirmError("Please provide a deposit due date.");
      return;
    }

    if (!finalDue) {
      setConfirmError("Please provide a final payment due date.");
      return;
    }

    const remaining = Math.max(total - depositValue, 0);

    const paymentSchedule = [
      {
        dueDate: depositDue,
        amountDue: depositValue,
        amountPaid: 0,
        notes: confirmForm.notes || "Deposit",
      },
    ];

    if (remaining > 0) {
      paymentSchedule.push({
        dueDate: finalDue,
        amountDue: remaining,
        amountPaid: 0,
        notes: "Final balance",
      });
    }

    setConfirmSubmitting(true);
    setConfirmError(null);

    try {
      await ordersAPI.updatePaymentTerms(confirmingOrder.id, {
        paymentTermsType: "FIXED_SCHEDULE",
        paymentTerms: confirmForm.paymentTerms,
        paymentSchedule,
      });

      await handleStatusUpdate(confirmingOrder.id, "CONFIRMED", "admin.dashboard");
      closeConfirmModal();
      fetchOrders();
    } catch (err) {
      const apiError = handleAPIError(err, "Unable to confirm order");
      setConfirmError(apiError.message);
      setConfirmSubmitting(false);
    }
  };

  const remainingAmount = useMemo(() => {
    if (!confirmingOrder) return 0;
    const total = Number(confirmingOrder.totalAmount || 0);
    const depositValue = Number(confirmForm.depositAmount || 0);
    const remaining = total - depositValue;
    return remaining > 0 ? remaining : 0;
  }, [confirmingOrder, confirmForm.depositAmount]);

  return (
    <div className="admin-card admin-orders-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Customer Orders</h2>
          <p className="admin-card-subtitle">
            Monitor incoming orders and progress them through the pipeline.
          </p>
        </div>
        <div className="orders-toolbar">
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : status}
              </option>
            ))}
          </select>
          <button
            className="admin-button admin-button-secondary"
            onClick={fetchOrders}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty-state">Loading orders…</div>
      ) : error ? (
        <div className="admin-error-state">{error}</div>
      ) : orders.length === 0 ? (
        <div className="admin-empty-state">
          No orders found for the selected criteria.
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Outstanding</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customerName || order.customerEmail || "–"}</td>
                  <td>{order.product?.name || order.productId}</td>
                  <td>
                    <span className={`status-pill status-${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.paymentStatus}</td>
                  <td>{formatCurrency(order.paymentOutstanding, order.currency)}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    <div className="orders-actions">
                      {canConfirm(order.status) && (
                        <button
                          className="admin-button admin-button-primary"
                          onClick={() => openConfirmModal(order)}
                        >
                          Confirm
                        </button>
                      )}

                      {canStartProduction(order.status) && (
                        <button
                          className="admin-button admin-button-primary"
                          onClick={async () => {
                            try {
                              await handleStatusUpdate(order.id, "IN_PRODUCTION");
                              fetchOrders();
                            } catch (err) {
                              const apiError = handleAPIError(err, "Unable to start production");
                              setError(apiError.message);
                            }
                          }}
                        >
                          Start Production
                        </button>
                      )}

                      {canMarkReadyForDelivery(order.status) && (
                        <button
                          className="admin-button admin-button-primary"
                          onClick={async () => {
                            try {
                              await handleStatusUpdate(order.id, "READY_FOR_DELIVERY");
                              fetchOrders();
                            } catch (err) {
                              const apiError = handleAPIError(err, "Unable to mark ready");
                              setError(apiError.message);
                            }
                          }}
                        >
                          Ready for Delivery
                        </button>
                      )}

                      {canComplete(order.status) && (
                        <button
                          className="admin-button admin-button-primary"
                          onClick={async () => {
                            try {
                              await handleStatusUpdate(order.id, "COMPLETED");
                              fetchOrders();
                            } catch (err) {
                              const apiError = handleAPIError(err, "Unable to complete order");
                              setError(apiError.message);
                            }
                          }}
                        >
                          Complete Order
                        </button>
                      )}

                      {canCancel(order.status) && (
                        <button
                          className="admin-button admin-button-secondary"
                          onClick={async () => {
                            try {
                              await handleStatusUpdate(order.id, "CANCELLED");
                              fetchOrders();
                            } catch (err) {
                              const apiError = handleAPIError(err, "Unable to cancel order");
                              setError(apiError.message);
                            }
                          }}
                        >
                          Cancel
                        </button>
                      )}

                      {canRenew(order.status) && (
                        <button
                          className="admin-button admin-button-outline"
                          onClick={async () => {
                            try {
                              await handleStatusUpdate(order.id, "NEW", "admin.dashboard");
                              fetchOrders();
                            } catch (err) {
                              const apiError = handleAPIError(err, "Unable to renew order");
                              setError(apiError.message);
                            }
                          }}
                        >
                          Renew
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

      <div className="orders-footer">
        <span className="orders-page-info">{pageInfo}</span>
        <div className="orders-pagination">
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
            disabled={orders.length < pageSize || loading}
          >
            Next
          </button>
        </div>
      </div>

      {confirmingOrder && canConfirm(confirmingOrder.status) && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Confirm Order</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={closeConfirmModal}
                disabled={confirmSubmitting}
              >
                ×
              </button>
            </div>
            <form className="orders-confirm-form" onSubmit={handleConfirmSubmit}>
              <p className="orders-confirm-summary">
                {`Order ${confirmingOrder.id} — ${formatCurrency(
                  confirmingOrder.totalAmount,
                  confirmingOrder.currency
                )}`}
              </p>

              <div className="orders-confirm-grid">
                <label>
                  Deposit amount
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={confirmForm.depositAmount}
                    onChange={(event) =>
                      setConfirmForm((prev) => ({
                        ...prev,
                        depositAmount: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Deposit due date
                  <input
                    type="date"
                    value={confirmForm.depositDueDate}
                    onChange={(event) =>
                      setConfirmForm((prev) => ({
                        ...prev,
                        depositDueDate: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Final payment due date
                  <input
                    type="date"
                    value={confirmForm.finalDueDate}
                    onChange={(event) =>
                      setConfirmForm((prev) => ({
                        ...prev,
                        finalDueDate: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Payment terms (descriptor)
                  <input
                    type="text"
                    value={confirmForm.paymentTerms}
                    onChange={(event) =>
                      setConfirmForm((prev) => ({
                        ...prev,
                        paymentTerms: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="orders-confirm-breakdown">
                <span>
                  Deposit:{" "}
                  <strong>
                    {formatCurrency(
                      Number(confirmForm.depositAmount || 0),
                      confirmingOrder.currency
                    )}
                  </strong>
                </span>
                <span>
                  Remaining:{" "}
                  <strong>
                    {formatCurrency(remainingAmount, confirmingOrder.currency)}
                  </strong>
                </span>
              </div>

              <label className="orders-confirm-notes">
                Internal notes
                <textarea
                  rows={3}
                  value={confirmForm.notes}
                  onChange={(event) =>
                    setConfirmForm((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Optional notes for payment schedule entries"
                />
              </label>

              {confirmError && (
                <div className="admin-error-state" style={{ marginTop: "0" }}>
                  {confirmError}
                </div>
              )}

              <div className="orders-confirm-actions">
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={closeConfirmModal}
                  disabled={confirmSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button admin-button-primary"
                  disabled={confirmSubmitting}
                >
                  {confirmSubmitting ? "Saving…" : "Confirm order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
