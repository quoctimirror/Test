import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminWholesaleApi } from "@/services/podApi";
import { ROUTES, getAdminWholesaleOrderDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "inventory", label: "Inventory" },
  { key: "sales", label: "Sales" },
  { key: "orders", label: "Wholesale Orders" },
];

export default function PhygitalPartnerDetail() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination for each tab
  const [invPagination, setInvPagination] = useState({ page: 0, size: 20, totalPages: 0 });
  const [salesPagination, setSalesPagination] = useState({ page: 0, size: 20, totalPages: 0 });
  const [ordersPagination, setOrdersPagination] = useState({ page: 0, size: 20, totalPages: 0 });

  useEffect(() => {
    fetchTabData();
  }, [partnerId, activeTab, invPagination.page, salesPagination.page, ordersPagination.page]);

  const fetchTabData = async () => {
    try {
      setLoading(true);
      setError(null);

      switch (activeTab) {
        case "dashboard": {
          const res = await adminWholesaleApi.getPartnerDashboard(partnerId);
          setDashboard(res.data);
          break;
        }
        case "inventory": {
          const res = await adminWholesaleApi.getPartnerInventory(partnerId, {
            page: invPagination.page, size: invPagination.size,
          });
          setInventory(res.data.content || []);
          setInvPagination((prev) => ({ ...prev, totalPages: res.data.totalPages || 0 }));
          break;
        }
        case "sales": {
          const res = await adminWholesaleApi.getPartnerSales(partnerId, {
            page: salesPagination.page, size: salesPagination.size,
          });
          setSales(res.data.content || []);
          setSalesPagination((prev) => ({ ...prev, totalPages: res.data.totalPages || 0 }));
          break;
        }
        case "orders": {
          const res = await adminWholesaleApi.getPartnerOrders(partnerId, {
            page: ordersPagination.page, size: ordersPagination.size,
          });
          setOrders(res.data.content || []);
          setOrdersPagination((prev) => ({ ...prev, totalPages: res.data.totalPages || 0 }));
          break;
        }
      }
    } catch (err) {
      console.error("Error fetching partner data:", err);
      setError("Failed to load partner data");
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const formatNumber = (num) => num?.toLocaleString() || "0";

  const renderPagination = (pag, setPag) => {
    if (pag.totalPages <= 1) return null;
    return (
      <div className="pod-pagination">
        <button className="pod-pagination-btn" disabled={pag.page === 0}
          onClick={() => setPag((prev) => ({ ...prev, page: prev.page - 1 }))}>Previous</button>
        <span style={{ margin: "0 1rem" }}>Page {pag.page + 1} of {pag.totalPages}</span>
        <button className="pod-pagination-btn" disabled={pag.page >= pag.totalPages - 1}
          onClick={() => setPag((prev) => ({ ...prev, page: prev.page + 1 }))}>Next</button>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!dashboard) return <p style={{ color: "#6b7280" }}>No data available</p>;
    return (
      <>
        {/* Partner Info */}
        <div className="pod-card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%", background: "#4f8cff",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "1.5rem", fontWeight: "bold",
            }}>
              {dashboard.businessName?.charAt(0) || "P"}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{dashboard.businessName}</h2>
              <p style={{ margin: 0, color: "#6b7280" }}>{dashboard.contactEmail}</p>
              <span className={`status-badge ${dashboard.status?.toLowerCase()}`}>{dashboard.status}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{formatNumber(dashboard.totalInventoryItems)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Inventory Value</div>
            <div className="stat-value" style={{ color: "#3b82f6" }}>{formatCurrency(dashboard.totalInventoryValue)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Low Stock Items</div>
            <div className="stat-value" style={{ color: dashboard.lowStockCount > 0 ? "#ef4444" : "#10b981" }}>
              {formatNumber(dashboard.lowStockCount)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Purchased</div>
            <div className="stat-value">{formatCurrency(dashboard.totalPurchased)}</div>
          </div>
        </div>

        <div className="stats-grid" style={{ marginTop: "1rem" }}>
          <div className="stat-card">
            <div className="stat-label">This Month Revenue</div>
            <div className="stat-value" style={{ color: "#10b981" }}>{formatCurrency(dashboard.revenueThisMonth)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This Month Profit</div>
            <div className="stat-value" style={{ color: "#10b981" }}>{formatCurrency(dashboard.profitThisMonth)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value" style={{ color: "#f59e0b" }}>{formatNumber(dashboard.pendingWholesaleOrders)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sales This Month</div>
            <div className="stat-value">{formatNumber(dashboard.salesCountThisMonth)}</div>
          </div>
        </div>
      </>
    );
  };

  const renderInventory = () => (
    <>
      {inventory.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No inventory items</p>
      ) : (
        <div className="pod-table-container">
          <table className="pod-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Wholesale Price</th>
                <th>Retail Price</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const margin = item.effectiveRetailPrice && item.wholesalePrice
                  ? (((item.effectiveRetailPrice - item.wholesalePrice) / item.effectiveRetailPrice) * 100).toFixed(1)
                  : null;
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: "500" }}>{item.productName}</td>
                    <td style={{ fontWeight: "600", color: item.quantityOnHand <= (item.reorderLevel || 5) ? "#ef4444" : "#1f2937" }}>
                      {item.quantityOnHand}
                    </td>
                    <td>{formatCurrency(item.wholesalePrice)}</td>
                    <td>{formatCurrency(item.effectiveRetailPrice)}</td>
                    <td>{margin ? `${margin}%` : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {renderPagination(invPagination, setInvPagination)}
    </>
  );

  const renderSales = () => (
    <>
      {sales.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No sales found</p>
      ) : (
        <div className="pod-table-container">
          <table className="pod-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Profit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{sale.id?.slice(0, 8)}...</td>
                  <td>{sale.customerName || "-"}</td>
                  <td>{formatDate(sale.createdAt)}</td>
                  <td style={{ fontWeight: "600" }}>{formatCurrency(sale.totalAmount)}</td>
                  <td style={{ color: "#10b981" }}>{formatCurrency(sale.profitAmount)}</td>
                  <td>
                    <span className={`status-badge ${sale.status?.toLowerCase()}`}>{sale.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {renderPagination(salesPagination, setSalesPagination)}
    </>
  );

  const renderOrders = () => (
    <>
      {orders.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No wholesale orders found</p>
      ) : (
        <div className="pod-table-container">
          <table className="pod-table">
            <thead>
              <tr>
                <th>Order ID</th>
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
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{order.id?.slice(0, 8)}...</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{order.itemCount || "-"}</td>
                  <td style={{ fontWeight: "600" }}>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>
                    <button className="pod-btn pod-btn-secondary pod-btn-sm"
                      onClick={() => navigate(getAdminWholesaleOrderDetailRoute(order.id))}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {renderPagination(ordersPagination, setOrdersPagination)}
    </>
  );

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <div>
          <button
            className="pod-btn pod-btn-secondary pod-btn-sm"
            onClick={() => navigate(ROUTES.POD_ADMIN_PHYGITAL_PARTNERS)}
            style={{ marginBottom: "0.5rem" }}
          >
            &larr; Back to Partners
          </button>
          <h1 className="pod-page-title">Phygital Partner Detail</h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", borderBottom: "2px solid #e5e7eb" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "0.75rem 1.5rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #4f8cff" : "2px solid transparent",
              color: activeTab === tab.key ? "#4f8cff" : "#6b7280",
              fontWeight: activeTab === tab.key ? "600" : "400",
              cursor: "pointer",
              marginBottom: "-2px",
              fontSize: "0.9rem",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading...</p>
        </div>
      )}

      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchTabData}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="pod-card">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "inventory" && renderInventory()}
          {activeTab === "sales" && renderSales()}
          {activeTab === "orders" && renderOrders()}
        </div>
      )}
    </div>
  );
}
