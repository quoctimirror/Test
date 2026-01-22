import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { podApi_pods, POD_ENUMS } from "@/services/podApi";
import { ROUTES, getPodDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PodAdminPods() {
  const navigate = useNavigate();
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    city: "",
  });

  useEffect(() => {
    fetchPods();
  }, [pagination.page, filters]);

  const fetchPods = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };
      const response = await podApi_pods.getAll(params);
      setPods(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching PODs:", err);
      setError("Failed to load PODs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleStatusUpdate = async (podId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }
    try {
      await podApi_pods.updateStatus(podId, newStatus);
      fetchPods();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      DRAFT: "draft",
      ACTIVE: "active",
      MAINTENANCE: "maintenance",
      INACTIVE: "inactive",
    };
    return classes[status] || "";
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">PODs ({pagination.totalElements})</h1>
        <Link to={ROUTES.POD_ADMIN_POD_CREATE} className="pod-btn pod-btn-primary">
          + Create POD
        </Link>
      </div>

      {/* Filters */}
      <div className="pod-filters">
        <input
          type="text"
          className="pod-form-input pod-search"
          placeholder="Search by name, location..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
        />
        <select
          className="pod-form-select pod-filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          {POD_ENUMS.podStatus.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="pod-form-input"
          placeholder="Filter by city..."
          value={filters.city}
          onChange={(e) => handleFilterChange("city", e.target.value)}
          style={{ maxWidth: "200px" }}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading PODs...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchPods}>
            Retry
          </button>
        </div>
      )}

      {/* PODs Table */}
      {!loading && !error && (
        <div className="pod-card">
          {pods.length === 0 ? (
            <div className="pod-empty">
              <p>No PODs found</p>
              <Link to={ROUTES.POD_ADMIN_POD_CREATE} className="pod-btn pod-btn-primary">
                Create First POD
              </Link>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>POD Name</th>
                      <th>Partner</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Capacity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pods.map((pod) => (
                      <tr key={pod.id}>
                        <td>
                          <Link
                            to={getPodDetailRoute(pod.id)}
                            style={{ color: "#4f8cff", textDecoration: "none" }}
                          >
                            {pod.name}
                          </Link>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {pod.id}
                          </div>
                        </td>
                        <td>
                          {pod.partnerBusinessName || pod.partnerId}
                        </td>
                        <td>
                          <div>{pod.locationName}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {pod.city}, {pod.country}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(pod.status)}`}
                          >
                            {pod.status}
                          </span>
                        </td>
                        <td>{pod.displayCapacity}</td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="pod-btn pod-btn-secondary pod-btn-sm"
                              onClick={() => navigate(getPodDetailRoute(pod.id))}
                            >
                              View
                            </button>
                            {pod.status === "DRAFT" && (
                              <button
                                className="pod-btn pod-btn-success pod-btn-sm"
                                onClick={() => handleStatusUpdate(pod.id, "ACTIVE")}
                              >
                                Activate
                              </button>
                            )}
                            {pod.status === "ACTIVE" && (
                              <button
                                className="pod-btn pod-btn-danger pod-btn-sm"
                                onClick={() => handleStatusUpdate(pod.id, "INACTIVE")}
                              >
                                Deactivate
                              </button>
                            )}
                            {pod.status === "INACTIVE" && (
                              <button
                                className="pod-btn pod-btn-success pod-btn-sm"
                                onClick={() => handleStatusUpdate(pod.id, "ACTIVE")}
                              >
                                Reactivate
                              </button>
                            )}
                            {pod.status === "MAINTENANCE" && (
                              <button
                                className="pod-btn pod-btn-success pod-btn-sm"
                                onClick={() => handleStatusUpdate(pod.id, "ACTIVE")}
                              >
                                Back to Active
                              </button>
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
    </div>
  );
}
