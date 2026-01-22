import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { commissionApi } from "@/services/podApi";
import { ROUTES, getPodPartnerDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminCommissionDetail() {
  const { commissionId } = useParams();
  const navigate = useNavigate();
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ amount: "", reason: "" });

  useEffect(() => {
    fetchCommissionDetail();
  }, [commissionId]);

  const fetchCommissionDetail = async () => {
    try {
      setLoading(true);
      const response = await commissionApi.getById(commissionId);
      setCommission(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching commission:", err);
      setError("Failed to load commission details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("Are you sure you want to approve this commission?")) {
      return;
    }
    try {
      await commissionApi.approve(commissionId);
      fetchCommissionDetail();
    } catch (err) {
      console.error("Error approving:", err);
      alert("Failed to approve: " + (err.response?.data?.message || err.message));
    }
  };

  const handleMarkAsPaid = async () => {
    const reference = prompt("Enter payment reference:");
    if (!reference) return;

    try {
      await commissionApi.pay(commissionId, {
        paymentReference: reference,
        paymentMethod: "BANK_TRANSFER",
      });
      fetchCommissionDetail();
    } catch (err) {
      console.error("Error marking as paid:", err);
      alert("Failed to mark as paid: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAdjust = async () => {
    if (!adjustForm.amount || !adjustForm.reason) {
      alert("Please fill in amount and reason");
      return;
    }
    try {
      await commissionApi.adjust(commissionId, {
        amount: parseFloat(adjustForm.amount),
        reason: adjustForm.reason,
      });
      setShowAdjustModal(false);
      setAdjustForm({ amount: "", reason: "" });
      fetchCommissionDetail();
    } catch (err) {
      console.error("Error adjusting:", err);
      alert("Failed to adjust: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      PENDING: "pending",
      APPROVED: "approved",
      PAID: "paid",
      CANCELLED: "cancelled",
    };
    return classes[status] || "";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading commission details...</p>
        </div>
      </div>
    );
  }

  if (error || !commission) {
    return (
      <div className="pod-page">
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error || "Commission not found"}</p>
          <Link to={ROUTES.POD_ADMIN_COMMISSIONS} className="pod-btn pod-btn-primary">
            Back to Commissions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pod-page">
      {/* Header */}
      <div className="pod-page-header">
        <div>
          <Link to={ROUTES.POD_ADMIN_COMMISSIONS} style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to Commissions
          </Link>
          <h1 className="pod-page-title" style={{ marginTop: "0.5rem" }}>
            Commission Details
          </h1>
          <p style={{ color: "#6b7280", margin: 0 }}>{commission.id}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {commission.status === "PENDING" && (
            <>
              <button className="pod-btn pod-btn-warning" onClick={() => setShowAdjustModal(true)}>
                Add Adjustment
              </button>
              <button className="pod-btn pod-btn-success" onClick={handleApprove}>
                Approve
              </button>
            </>
          )}
          {commission.status === "APPROVED" && (
            <button className="pod-btn pod-btn-primary" onClick={handleMarkAsPaid}>
              Mark as Paid
            </button>
          )}
        </div>
      </div>

      {/* Status & Summary */}
      <div className="pod-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
          <span className={`status-badge ${getStatusBadgeClass(commission.status)}`} style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
            {commission.status}
          </span>
          <div>
            <span style={{ color: "#6b7280" }}>Period: </span>
            <strong>{formatDate(commission.periodStart)} - {formatDate(commission.periodEnd)}</strong>
          </div>
          <div>
            <span style={{ color: "#6b7280" }}>Final Amount: </span>
            <strong style={{ fontSize: "1.25rem", color: "#10b981" }}>{formatCurrency(commission.finalAmount)}</strong>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="pod-stats-grid" style={{ marginBottom: "1rem" }}>
        <div className="pod-stat-card">
          <div className="pod-stat-value">{commission.totalOrders || 0}</div>
          <div className="pod-stat-label">Total Orders</div>
        </div>
        <div className="pod-stat-card">
          <div className="pod-stat-value">{formatCurrency(commission.attributedAmount)}</div>
          <div className="pod-stat-label">Attributed Amount</div>
        </div>
        <div className="pod-stat-card">
          <div className="pod-stat-value">{commission.commissionRate}%</div>
          <div className="pod-stat-label">Commission Rate</div>
        </div>
        <div className="pod-stat-card">
          <div className="pod-stat-value">{formatCurrency(commission.commissionAmount)}</div>
          <div className="pod-stat-label">Base Commission</div>
        </div>
        <div className="pod-stat-card">
          <div className="pod-stat-value" style={{ color: commission.adjustments > 0 ? "#10b981" : commission.adjustments < 0 ? "#ef4444" : "#111827" }}>
            {commission.adjustments > 0 ? "+" : ""}{formatCurrency(commission.adjustments)}
          </div>
          <div className="pod-stat-label">Adjustments</div>
        </div>
        <div className="pod-stat-card" style={{ background: "#ecfdf5" }}>
          <div className="pod-stat-value" style={{ color: "#10b981" }}>{formatCurrency(commission.finalAmount)}</div>
          <div className="pod-stat-label">Final Amount</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Partner Information */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Partner Information
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item">
              <span className="pod-detail-label">Partner</span>
              <span className="pod-detail-value">
                {commission.partnerId && (
                  <Link to={getPodPartnerDetailRoute(commission.partnerId)} style={{ color: "#4f8cff" }}>
                    {commission.partnerName || commission.partnerId}
                  </Link>
                )}
              </span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Partner ID</span>
              <span className="pod-detail-value">{commission.partnerId}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Payment Information
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item">
              <span className="pod-detail-label">Payment Status</span>
              <span className="pod-detail-value">{commission.status === "PAID" ? "Paid" : "Unpaid"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Payment Method</span>
              <span className="pod-detail-value">{commission.paymentMethod || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Payment Reference</span>
              <span className="pod-detail-value">{commission.paymentReference || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Paid At</span>
              <span className="pod-detail-value">{formatDateTime(commission.paidAt)}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Timeline
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item">
              <span className="pod-detail-label">Created At</span>
              <span className="pod-detail-value">{formatDateTime(commission.createdAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Updated At</span>
              <span className="pod-detail-value">{formatDateTime(commission.updatedAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Approved At</span>
              <span className="pod-detail-value">{formatDateTime(commission.approvedAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Approved By</span>
              <span className="pod-detail-value">{commission.approvedBy || "-"}</span>
            </div>
          </div>
        </div>

        {/* Notes/Adjustment Reason */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Notes
          </h2>
          <p style={{ margin: 0, whiteSpace: "pre-wrap", color: commission.adjustmentReason ? "#111827" : "#9ca3af" }}>
            {commission.adjustmentReason || "No notes or adjustments"}
          </p>
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowAdjustModal(false)}
        >
          <div
            className="pod-card"
            style={{ width: "400px", maxWidth: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem" }}>Add Adjustment</h3>
            <div className="pod-form-group">
              <label className="pod-form-label">Amount (positive = add, negative = deduct)</label>
              <input
                type="number"
                className="pod-form-input"
                placeholder="e.g., 50000 or -10000"
                value={adjustForm.amount}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Reason</label>
              <textarea
                className="pod-form-input"
                rows={3}
                placeholder="Reason for adjustment..."
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-secondary" onClick={() => setShowAdjustModal(false)}>
                Cancel
              </button>
              <button className="pod-btn pod-btn-primary" onClick={handleAdjust}>
                Add Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
