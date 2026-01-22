import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { commissionApi, partnerApi, POD_ENUMS } from "@/services/podApi";
import { ROUTES, getCommissionDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminCommissions() {
  const navigate = useNavigate();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
  });

  // Generate commission modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    partnerId: "",
    periodStart: "",
    periodEnd: "",
  });
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, [pagination.page, filters]);

  useEffect(() => {
    if (showGenerateModal && partners.length === 0) {
      fetchPartners();
    }
  }, [showGenerateModal]);

  const fetchPartners = async () => {
    try {
      setLoadingPartners(true);
      const response = await partnerApi.getAll({ size: 100, status: "ACTIVE" });
      setPartners(response.data.content || []);
    } catch (err) {
      console.error("Error fetching partners:", err);
    } finally {
      setLoadingPartners(false);
    }
  };

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };
      const response = await commissionApi.getAll(params);
      setCommissions(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching commissions:", err);
      setError("Failed to load commissions");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleApprove = async (commissionId) => {
    if (!window.confirm("Are you sure you want to approve this commission?")) {
      return;
    }
    try {
      await commissionApi.approve(commissionId);
      fetchCommissions();
    } catch (err) {
      console.error("Error approving commission:", err);
      alert("Failed to approve: " + (err.response?.data?.message || err.message));
    }
  };

  const handleMarkAsPaid = async (commissionId) => {
    const reference = prompt("Enter payment reference:");
    if (!reference) return;

    try {
      await commissionApi.pay(commissionId, {
        paymentReference: reference,
        paymentMethod: "BANK_TRANSFER",
      });
      fetchCommissions();
    } catch (err) {
      console.error("Error marking as paid:", err);
      alert("Failed to mark as paid: " + (err.response?.data?.message || err.message));
    }
  };

  const handleGenerateCommission = async () => {
    if (!generateForm.partnerId || !generateForm.periodStart || !generateForm.periodEnd) {
      alert("Please fill all fields");
      return;
    }
    try {
      await commissionApi.generate(generateForm);
      setShowGenerateModal(false);
      setGenerateForm({ partnerId: "", periodStart: "", periodEnd: "" });
      fetchCommissions();
    } catch (err) {
      console.error("Error generating commission:", err);
      alert("Failed to generate: " + (err.response?.data?.message || err.message));
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
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Commissions ({pagination.totalElements})</h1>
        <button
          className="pod-btn pod-btn-primary"
          onClick={() => setShowGenerateModal(true)}
        >
          + Generate Commission
        </button>
      </div>

      {/* Filters */}
      <div className="pod-filters">
        <select
          className="pod-form-select pod-filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          {POD_ENUMS.commissionStatus.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading commissions...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchCommissions}>
            Retry
          </button>
        </div>
      )}

      {/* Commissions Table */}
      {!loading && !error && (
        <div className="pod-card">
          {commissions.length === 0 ? (
            <div className="pod-empty">
              <p>No commissions found</p>
              <button
                className="pod-btn pod-btn-primary"
                onClick={() => setShowGenerateModal(true)}
              >
                Generate First Commission
              </button>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>Partner</th>
                      <th>Period</th>
                      <th>Orders</th>
                      <th>Attributed</th>
                      <th>Rate</th>
                      <th>Commission</th>
                      <th>Adjustments</th>
                      <th>Final</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((comm) => (
                      <tr key={comm.id}>
                        <td>{comm.partnerName || comm.partnerId?.slice(0, 8)}</td>
                        <td>
                          <div style={{ fontSize: "0.75rem" }}>
                            {formatDate(comm.periodStart)} -
                          </div>
                          <div style={{ fontSize: "0.75rem" }}>
                            {formatDate(comm.periodEnd)}
                          </div>
                        </td>
                        <td>{comm.totalOrders}</td>
                        <td>{formatCurrency(comm.attributedAmount)}</td>
                        <td>{comm.commissionRate}%</td>
                        <td>{formatCurrency(comm.commissionAmount)}</td>
                        <td>
                          {comm.adjustments !== 0 && (
                            <span style={{ color: comm.adjustments > 0 ? "#10b981" : "#ef4444" }}>
                              {comm.adjustments > 0 ? "+" : ""}
                              {formatCurrency(comm.adjustments)}
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: "600" }}>
                          {formatCurrency(comm.finalAmount)}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(comm.status)}`}>
                            {comm.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button
                              className="pod-btn pod-btn-secondary pod-btn-sm"
                              onClick={() => navigate(getCommissionDetailRoute(comm.id))}
                            >
                              View
                            </button>
                            {comm.status === "PENDING" && (
                              <button
                                className="pod-btn pod-btn-success pod-btn-sm"
                                onClick={() => handleApprove(comm.id)}
                              >
                                Approve
                              </button>
                            )}
                            {comm.status === "APPROVED" && (
                              <button
                                className="pod-btn pod-btn-primary pod-btn-sm"
                                onClick={() => handleMarkAsPaid(comm.id)}
                              >
                                Mark Paid
                              </button>
                            )}
                            {comm.status === "PAID" && comm.paymentReference && (
                              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                Ref: {comm.paymentReference}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pod-pagination">
                  <button
                    className="pod-pagination-btn"
                    disabled={pagination.page === 0}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span style={{ margin: "0 1rem" }}>
                    Page {pagination.page + 1} of {pagination.totalPages}
                  </span>
                  <button
                    className="pod-pagination-btn"
                    disabled={pagination.page >= pagination.totalPages - 1}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Generate Commission Modal */}
      {showGenerateModal && (
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
          onClick={() => setShowGenerateModal(false)}
        >
          <div
            className="pod-card"
            style={{ width: "400px", maxWidth: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem" }}>Generate Commission</h3>
            <div className="pod-form-group">
              <label className="pod-form-label">Partner</label>
              <select
                className="pod-form-select"
                value={generateForm.partnerId}
                onChange={(e) =>
                  setGenerateForm((prev) => ({ ...prev, partnerId: e.target.value }))
                }
                disabled={loadingPartners}
              >
                <option value="">
                  {loadingPartners ? "Loading partners..." : "Select a partner"}
                </option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.businessName} ({partner.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Period Start</label>
              <input
                type="date"
                className="pod-form-input"
                value={generateForm.periodStart}
                onChange={(e) =>
                  setGenerateForm((prev) => ({ ...prev, periodStart: e.target.value }))
                }
              />
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Period End</label>
              <input
                type="date"
                className="pod-form-input"
                value={generateForm.periodEnd}
                onChange={(e) =>
                  setGenerateForm((prev) => ({ ...prev, periodEnd: e.target.value }))
                }
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                className="pod-btn pod-btn-secondary"
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </button>
              <button
                className="pod-btn pod-btn-primary"
                onClick={handleGenerateCommission}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
