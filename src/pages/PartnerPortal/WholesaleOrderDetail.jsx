import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phygitalWholesaleApi } from "@/services/podApi";
import { ROUTES } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

const STATUS_FLOW = ["DRAFT", "SUBMITTED", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"];

export default function WholesaleOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalInput, setModalInput] = useState("");
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await phygitalWholesaleApi.getById(orderId);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const showError = (err) => {
    setErrorModal(err.response?.data?.message || err.message);
  };

  const handleSubmit = () => {
    setModal({
      title: "Submit Order",
      message: "Submit this order for approval?",
      confirmText: "Submit",
      confirmStyle: "pod-btn pod-btn-primary",
      onConfirm: async () => {
        setModal(null);
        try {
          await phygitalWholesaleApi.submit(orderId);
          fetchOrder();
        } catch (err) {
          showError(err);
        }
      },
    });
  };

  const handleCancel = () => {
    setModalInput("");
    setModal({
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order?",
      inputLabel: "Cancellation Reason",
      inputPlaceholder: "Enter reason for cancellation...",
      inputRequired: true,
      confirmText: "Cancel Order",
      confirmStyle: "pod-btn pod-btn-danger",
      onConfirm: async (inputValue) => {
        if (!inputValue?.trim()) return;
        setModal(null);
        try {
          await phygitalWholesaleApi.cancel(orderId, inputValue.trim());
          fetchOrder();
        } catch (err) {
          showError(err);
        }
      },
    });
  };

  const handleConfirmDelivery = () => {
    setModal({
      title: "Confirm Delivery",
      message: "Confirm you have received this delivery?",
      confirmText: "Confirm Received",
      confirmStyle: "pod-btn pod-btn-success",
      onConfirm: async () => {
        setModal(null);
        try {
          await phygitalWholesaleApi.confirmDelivery(orderId);
          fetchOrder();
        } catch (err) {
          showError(err);
        }
      },
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      DRAFT: "pending", SUBMITTED: "pending", APPROVED: "approved",
      PROCESSING: "active", SHIPPED: "active", DELIVERED: "approved",
      COMPLETED: "paid", CANCELLED: "cancelled",
    };
    return map[status] || "";
  };

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pod-page">
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchOrder}>Retry</button>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(order?.status);

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <div>
          <button
            className="pod-btn pod-btn-secondary pod-btn-sm"
            onClick={() => navigate(ROUTES.POD_PARTNER_WHOLESALE_ORDERS)}
            style={{ marginBottom: "0.5rem" }}
          >
            &larr; Back to Orders
          </button>
          <h1 className="pod-page-title">Wholesale Order</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {order?.status === "DRAFT" && (
            <button className="pod-btn pod-btn-primary" onClick={handleSubmit}>Submit Order</button>
          )}
          {order?.status === "SHIPPED" && (
            <button className="pod-btn pod-btn-success" onClick={handleConfirmDelivery}>Confirm Delivery</button>
          )}
          {["DRAFT", "SUBMITTED"].includes(order?.status) && (
            <button className="pod-btn pod-btn-danger" onClick={handleCancel}>Cancel</button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      {order?.status !== "CANCELLED" && (
        <div className="pod-card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Order Progress</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto", padding: "0.5rem 0" }}>
            {STATUS_FLOW.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: "fit-content" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: i <= currentIdx ? "#4f8cff" : "#e5e7eb",
                  color: i <= currentIdx ? "#fff" : "#6b7280",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: "600", flexShrink: 0,
                }}>
                  {i <= currentIdx ? "\u2713" : i + 1}
                </div>
                <div style={{ fontSize: "0.7rem", marginLeft: "0.25rem", color: i <= currentIdx ? "#1f2937" : "#9ca3af" }}>
                  {s}
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div style={{
                    flex: 1, height: "2px", minWidth: "20px",
                    background: i < currentIdx ? "#4f8cff" : "#e5e7eb",
                    margin: "0 0.25rem",
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {order?.status === "CANCELLED" && (
        <div className="pod-card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid #ef4444" }}>
          <h3 style={{ color: "#ef4444" }}>Order Cancelled</h3>
          {order.cancellationReason && <p style={{ color: "#6b7280" }}>Reason: {order.cancellationReason}</p>}
        </div>
      )}

      {/* Order Info */}
      <div className="pod-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Status</div>
            <span className={`status-badge ${getStatusBadgeClass(order?.status)}`}>{order?.status}</span>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Created</div>
            <div>{formatDate(order?.createdAt)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Amount</div>
            <div style={{ fontWeight: "700", fontSize: "1.25rem", color: "#1f2937" }}>
              {formatCurrency(order?.totalAmount)}
            </div>
          </div>
          {order?.trackingNumber && (
            <div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Tracking Number</div>
              <div style={{ fontFamily: "monospace" }}>{order.trackingNumber}</div>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="pod-card">
        <div className="pod-card-header">
          <h3 className="pod-card-title">Order Items</h3>
        </div>
        <div className="pod-table-container">
          <table className="pod-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order?.items || []).map((item, index) => (
                <tr key={item.id || index}>
                  <td>
                    <div style={{ fontWeight: "500" }}>{item.productName || item.productId}</div>
                    {item.sku && <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.sku}</div>}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.wholesalePrice)}</td>
                  <td style={{ fontWeight: "600" }}>{formatCurrency(item.lineTotal || item.wholesalePrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: "right", fontWeight: "600" }}>Total:</td>
                <td style={{ fontWeight: "700", fontSize: "1.1rem" }}>{formatCurrency(order?.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Confirm / Prompt Modal */}
      {modal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div style={{
            background: "#fff", borderRadius: "12px", padding: "2rem", maxWidth: "440px", width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700 }}>
              {modal.title}
            </h3>
            <p style={{ color: "#4b5563", margin: "0 0 1.25rem", fontSize: "0.9rem" }}>
              {modal.message}
            </p>
            {modal.inputLabel && (
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
                  {modal.inputLabel}
                </label>
                <input
                  type="text"
                  className="pod-form-input"
                  placeholder={modal.inputPlaceholder || ""}
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  autoFocus
                  style={{ width: "100%" }}
                />
              </div>
            )}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-secondary" onClick={() => { setModal(null); setModalInput(""); }}>
                Cancel
              </button>
              <button
                className={modal.confirmStyle || "pod-btn pod-btn-primary"}
                onClick={() => modal.onConfirm(modalInput)}
                disabled={modal.inputRequired && !modalInput.trim()}
              >
                {modal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div style={{
            background: "#fff", borderRadius: "12px", padding: "2rem", maxWidth: "440px", width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, color: "#dc2626" }}>
              Error
            </h3>
            <p style={{ color: "#4b5563", margin: "0 0 1.25rem", fontSize: "0.9rem" }}>
              {errorModal}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-primary" onClick={() => setErrorModal(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
