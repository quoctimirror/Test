import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminWholesaleApi, POD_ENUMS } from "@/services/podApi";
import { getAdminWholesaleOrderDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function AdminWholesaleOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0, size: 20, totalPages: 0, totalElements: 0,
  });
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, size: pagination.size };
      if (statusFilter) params.status = statusFilter;
      const response = await adminWholesaleApi.getOrders(params);
      setOrders(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching wholesale orders:", err);
      setError("Failed to load wholesale orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      DRAFT: "pending", SUBMITTED: "pending", APPROVED: "approved",
      PROCESSING: "active", SHIPPED: "active", DELIVERED: "approved",
      COMPLETED: "paid", CANCELLED: "cancelled",
    };
    return map[status] || "";
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
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Wholesale Orders ({pagination.totalElements})</h1>
        <button className="pod-btn pod-btn-secondary" onClick={fetchOrders}>Refresh</button>
      </div>

      {/* Filters */}
      <div className="pod-filters">
        <select
          className="pod-form-select pod-filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, page: 0 }));
          }}
        >
          <option value="">All Status</option>
          {POD_ENUMS.wholesaleOrderStatus.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading orders...</p>
        </div>
      )}

      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchOrders}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="pod-card">
          {orders.length === 0 ? (
            <div className="pod-empty"><p>No wholesale orders found</p></div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Partner</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                          {order.id?.slice(0, 8)}...
                        </td>
                        <td>{order.partnerName || order.partnerId?.slice(0, 8)}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.itemCount || order.items?.length || "-"}</td>
                        <td style={{ fontWeight: "600" }}>{formatCurrency(order.totalAmount)}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="pod-btn pod-btn-secondary pod-btn-sm"
                            onClick={() => navigate(getAdminWholesaleOrderDetailRoute(order.id))}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
    </div>
  );
}
