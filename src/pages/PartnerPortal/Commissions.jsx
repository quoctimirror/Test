import { useState, useEffect } from "react";
import { partnerPortalApi, POD_ENUMS } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PartnerPortalCommissions() {
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

  useEffect(() => {
    fetchCommissions();
  }, [pagination.page, filters]);

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
      const response = await partnerPortalApi.getMyCommissions(params);
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

  // Calculate summary stats
  const summaryStats = {
    pending: commissions
      .filter((c) => c.status === "PENDING")
      .reduce((sum, c) => sum + (c.finalAmount || 0), 0),
    approved: commissions
      .filter((c) => c.status === "APPROVED")
      .reduce((sum, c) => sum + (c.finalAmount || 0), 0),
    paid: commissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + (c.finalAmount || 0), 0),
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">My Commissions ({pagination.totalElements})</h1>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <div className="pod-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            Pending Review
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#f59e0b" }}>
            {formatCurrency(summaryStats.pending)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
            Awaiting approval
          </div>
        </div>
        <div className="pod-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            Approved
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#3b82f6" }}>
            {formatCurrency(summaryStats.approved)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
            Ready for payment
          </div>
        </div>
        <div className="pod-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            Total Paid
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#10b981" }}>
            {formatCurrency(summaryStats.paid)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
            Successfully received
          </div>
        </div>
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

      {/* Commissions List */}
      {!loading && !error && (
        <>
          {commissions.length === 0 ? (
            <div className="pod-card">
              <div className="pod-empty">
                <p>No commissions found</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Commissions are generated periodically based on your attributions
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {commissions.map((comm) => (
                <div key={comm.id} className="pod-card">
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "1rem"
                  }}>
                    {/* Left: Period Info */}
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                        Commission Period
                      </div>
                      <div style={{ fontWeight: "500" }}>
                        {formatDate(comm.periodStart)} - {formatDate(comm.periodEnd)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                        ID: {comm.id}
                      </div>
                    </div>

                    {/* Center: Stats */}
                    <div style={{
                      display: "flex",
                      gap: "2rem",
                      padding: "0.75rem 1rem",
                      background: "#f9fafb",
                      borderRadius: "8px"
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                          {comm.totalOrders}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Orders</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                          {formatCurrency(comm.attributedAmount)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Attributed</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          {comm.commissionRate}%
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Rate</div>
                      </div>
                    </div>

                    {/* Right: Amount & Status */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: comm.status === "PAID" ? "#10b981" : "#1f2937"
                      }}>
                        {formatCurrency(comm.finalAmount)}
                      </div>
                      {comm.adjustments !== 0 && (
                        <div style={{
                          fontSize: "0.75rem",
                          color: comm.adjustments > 0 ? "#10b981" : "#ef4444"
                        }}>
                          Adjustment: {comm.adjustments > 0 ? "+" : ""}{formatCurrency(comm.adjustments)}
                        </div>
                      )}
                      <span className={`status-badge ${getStatusBadgeClass(comm.status)}`}
                        style={{ marginTop: "0.5rem", display: "inline-block" }}
                      >
                        {comm.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment Info (if paid) */}
                  {comm.status === "PAID" && comm.paymentReference && (
                    <div style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      background: "#ecfdf5",
                      borderRadius: "6px",
                      fontSize: "0.875rem"
                    }}>
                      <span style={{ color: "#059669" }}>✓ Paid</span>
                      <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>
                        Reference: {comm.paymentReference}
                      </span>
                      {comm.paidAt && (
                        <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>
                          on {formatDate(comm.paidAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pod-pagination" style={{ marginTop: "1.5rem" }}>
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
  );
}
