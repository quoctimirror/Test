import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminWholesaleApi } from "@/services/podApi";
import { getAdminPhygitalPartnerDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function PhygitalPartners() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0, size: 20, totalPages: 0, totalElements: 0,
  });

  useEffect(() => {
    fetchPartners();
  }, [pagination.page]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await adminWholesaleApi.getPartners({
        page: pagination.page,
        size: pagination.size,
      });
      setPartners(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching phygital partners:", err);
      setError("Failed to load phygital partners");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Phygital Partners ({pagination.totalElements})</h1>
        <button className="pod-btn pod-btn-secondary" onClick={fetchPartners}>Refresh</button>
      </div>

      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading partners...</p>
        </div>
      )}

      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchPartners}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="pod-card">
          {partners.length === 0 ? (
            <div className="pod-empty"><p>No phygital partners found</p></div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>Partner</th>
                      <th>Region</th>
                      <th>Discount %</th>
                      <th>Total Orders</th>
                      <th>Total Purchased</th>
                      <th>Total Sales</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr key={partner.id}>
                        <td>
                          <div style={{ fontWeight: "500" }}>{partner.businessName}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {partner.contactEmail}
                          </div>
                        </td>
                        <td>{partner.territory || partner.city || "-"}</td>
                        <td>{partner.wholesaleDiscountRate != null ? `${partner.wholesaleDiscountRate}%` : "-"}</td>
                        <td>{partner.totalOrders ?? "-"}</td>
                        <td>{formatCurrency(partner.totalPurchased)}</td>
                        <td style={{ color: "#10b981" }}>{formatCurrency(partner.totalSalesRevenue)}</td>
                        <td>
                          <span className={`status-badge ${partner.status?.toLowerCase()}`}>
                            {partner.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="pod-btn pod-btn-secondary pod-btn-sm"
                            onClick={() => navigate(getAdminPhygitalPartnerDetailRoute(partner.id))}
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
