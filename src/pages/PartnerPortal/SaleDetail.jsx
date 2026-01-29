import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phygitalSalesApi } from "@/services/podApi";
import { ROUTES } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function SaleDetail() {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalInput, setModalInput] = useState("");
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    fetchSale();
  }, [saleId]);

  const fetchSale = async () => {
    try {
      setLoading(true);
      const response = await phygitalSalesApi.getById(saleId);
      setSale(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sale:", err);
      setError("Failed to load sale details");
    } finally {
      setLoading(false);
    }
  };

  const showError = (err) => {
    setErrorModal(err.response?.data?.message || err.message);
  };

  const handleConfirm = () => {
    setModal({
      title: "Confirm Sale",
      message: "Are you sure you want to confirm this sale?",
      confirmText: "Confirm",
      confirmStyle: "pod-btn pod-btn-primary",
      onConfirm: async () => {
        setModal(null);
        try {
          await phygitalSalesApi.confirm(saleId);
          fetchSale();
        } catch (err) {
          showError(err);
        }
      },
    });
  };

  const handleComplete = () => {
    setModal({
      title: "Complete Sale",
      message: "Mark this sale as completed? This means the customer has received the product and payment is finalized.",
      confirmText: "Complete",
      confirmStyle: "pod-btn pod-btn-success",
      onConfirm: async () => {
        setModal(null);
        try {
          await phygitalSalesApi.complete(saleId);
          fetchSale();
        } catch (err) {
          showError(err);
        }
      },
    });
  };

  const handleCancel = () => {
    setModalInput("");
    setModal({
      title: "Cancel Sale",
      message: "Are you sure you want to cancel this sale? Stock will be returned to inventory.",
      inputLabel: "Cancellation Reason",
      inputPlaceholder: "Enter reason for cancellation...",
      inputRequired: true,
      confirmText: "Cancel Sale",
      confirmStyle: "pod-btn pod-btn-danger",
      onConfirm: async (inputValue) => {
        if (!inputValue?.trim()) return;
        setModal(null);
        try {
          await phygitalSalesApi.cancel(saleId, inputValue.trim());
          fetchSale();
        } catch (err) {
          showError(err);
        }
      },
    });
  };

  const handleReturn = () => {
    setModal({
      title: "Return Sale",
      message: "Process a return for this sale? Stock will be returned to inventory.",
      confirmText: "Process Return",
      confirmStyle: "pod-btn pod-btn-warning",
      onConfirm: async () => {
        setModal(null);
        try {
          await phygitalSalesApi.returnSale(saleId);
          fetchSale();
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
      PENDING: "pending", CONFIRMED: "approved", COMPLETED: "paid",
      CANCELLED: "cancelled", RETURNED: "cancelled",
    };
    return map[status] || "";
  };

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pod-page">
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchSale}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <div>
          <button
            className="pod-btn pod-btn-secondary pod-btn-sm"
            onClick={() => navigate(ROUTES.POD_PARTNER_SALES)}
            style={{ marginBottom: "0.5rem" }}
          >
            &larr; Back to Sales
          </button>
          <h1 className="pod-page-title">Sale Detail</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {sale?.status === "PENDING" && (
            <button className="pod-btn pod-btn-primary" onClick={handleConfirm}>Confirm</button>
          )}
          {sale?.status === "CONFIRMED" && (
            <button className="pod-btn pod-btn-success" onClick={handleComplete}>Complete</button>
          )}
          {["PENDING", "CONFIRMED"].includes(sale?.status) && (
            <button className="pod-btn pod-btn-danger" onClick={handleCancel}>Cancel</button>
          )}
          {sale?.status === "COMPLETED" && (
            <button className="pod-btn pod-btn-warning" onClick={handleReturn}>Return</button>
          )}
        </div>
      </div>

      {/* Sale Info */}
      <div className="pod-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Status</div>
            <span className={`status-badge ${getStatusBadgeClass(sale?.status)}`}>{sale?.status}</span>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Date</div>
            <div>{formatDate(sale?.createdAt)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Amount</div>
            <div style={{ fontWeight: "700", fontSize: "1.25rem" }}>{formatCurrency(sale?.totalAmount)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Profit</div>
            <div style={{ fontWeight: "600", color: "#10b981", fontSize: "1.1rem" }}>
              {formatCurrency(sale?.profitAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {(sale?.customerName || sale?.customerPhone || sale?.customerEmail) && (
        <div className="pod-card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Customer Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {sale?.customerName && (
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Name</div>
                <div style={{ fontWeight: "500" }}>{sale.customerName}</div>
              </div>
            )}
            {sale?.customerPhone && (
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Phone</div>
                <div>{sale.customerPhone}</div>
              </div>
            )}
            {sale?.customerEmail && (
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Email</div>
                <div>{sale.customerEmail}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {sale?.status === "CANCELLED" && sale?.notes && (
        <div className="pod-card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid #ef4444" }}>
          <h3 style={{ color: "#ef4444" }}>Cancelled</h3>
          <p style={{ color: "#6b7280" }}>Reason: {sale.notes}</p>
        </div>
      )}

      {/* Sale Items */}
      <div className="pod-card">
        <div className="pod-card-header">
          <h3 className="pod-card-title">Sale Items</h3>
        </div>
        <div className="pod-table-container">
          <table className="pod-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Cost Price</th>
                <th>Total</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {(sale?.items || []).map((item, index) => (
                <tr key={item.id || index}>
                  <td>
                    <div style={{ fontWeight: "500" }}>{item.productName || item.inventoryId}</div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.sellingPrice)}</td>
                  <td style={{ color: "#6b7280" }}>{formatCurrency(item.wholesaleCost)}</td>
                  <td style={{ fontWeight: "600" }}>{formatCurrency(item.lineTotal || item.sellingPrice * item.quantity)}</td>
                  <td style={{ color: "#10b981", fontWeight: "500" }}>{formatCurrency(item.profit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" style={{ textAlign: "right", fontWeight: "600" }}>Total:</td>
                <td style={{ fontWeight: "700" }}>{formatCurrency(sale?.totalAmount)}</td>
                <td style={{ fontWeight: "700", color: "#10b981" }}>{formatCurrency(sale?.profitAmount)}</td>
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
