import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { phygitalInventoryApi } from "@/services/podApi";
import { getPartnerInventoryDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function Inventory() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0, size: 20, totalPages: 0, totalElements: 0,
  });
  const [search, setSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [errorModal, setErrorModal] = useState(null);

  // Forms
  const [adjustForm, setAdjustForm] = useState({ quantity: "", notes: "", movementType: "ADJUSTMENT_IN" });
  const [priceForm, setPriceForm] = useState({ retailPrice: "" });
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    fetchInventory();
  }, [pagination.page, showLowStockOnly]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let response;
      if (showLowStockOnly) {
        response = await phygitalInventoryApi.getLowStock();
        setInventory(response.data || []);
        setPagination((prev) => ({ ...prev, totalPages: 1, totalElements: (response.data || []).length }));
      } else {
        const params = { page: pagination.page, size: pagination.size };
        if (search) params.search = search;
        response = await phygitalInventoryApi.getAll(params);
        setInventory(response.data.content || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages || 0,
          totalElements: response.data.totalElements || 0,
        }));
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchInventory();
  };

  const handleAdjust = async () => {
    if (!adjustForm.quantity || !adjustForm.notes) {
      setErrorModal("Please fill in all required fields (quantity and notes).");
      return;
    }
    try {
      await phygitalInventoryApi.adjustStock(selectedItem.id, {
        quantity: parseInt(adjustForm.quantity),
        movementType: adjustForm.movementType,
        notes: adjustForm.notes,
      });
      setShowAdjustModal(false);
      setAdjustForm({ quantity: "", notes: "", movementType: "ADJUSTMENT_IN" });
      setSelectedItem(null);
      fetchInventory();
    } catch (err) {
      setErrorModal("Failed to adjust: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePriceUpdate = async () => {
    if (!priceForm.retailPrice) {
      setPriceError("Please enter a retail price.");
      return;
    }
    try {
      setPriceError("");
      await phygitalInventoryApi.updatePrice(selectedItem.id, {
        partnerRetailPrice: parseFloat(priceForm.retailPrice),
      });
      setShowPriceModal(false);
      setPriceForm({ retailPrice: "" });
      setPriceError("");
      setSelectedItem(null);
      fetchInventory();
    } catch (err) {
      setPriceError(err.response?.data?.message || err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const getStockStatus = (item) => {
    if (item.quantityOnHand <= 0) return { label: "Out of Stock", color: "#ef4444", bg: "#fef2f2" };
    if (item.quantityOnHand <= (item.reorderLevel || 5)) return { label: "Low Stock", color: "#f59e0b", bg: "#fffbeb" };
    return { label: "In Stock", color: "#10b981", bg: "#f0fdf4" };
  };

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">Inventory ({pagination.totalElements})</h1>
      </div>

      {/* Filters */}
      <div className="pod-filters" style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="pod-form-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "250px" }}
          />
          <button type="submit" className="pod-btn pod-btn-secondary">Search</button>
        </form>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => {
              setShowLowStockOnly(e.target.checked);
              setPagination((prev) => ({ ...prev, page: 0 }));
            }}
          />
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Low stock only</span>
        </label>
      </div>

      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading inventory...</p>
        </div>
      )}

      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchInventory}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="pod-card">
          {inventory.length === 0 ? (
            <div className="pod-empty">
              <p>No inventory items yet. Place a wholesale order to receive products.</p>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Available</th>
                      <th>Wholesale Price</th>
                      <th>Retail Price</th>
                      <th>Margin</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const status = getStockStatus(item);
                      const margin = item.effectiveRetailPrice && item.wholesalePrice
                        ? (((item.effectiveRetailPrice - item.wholesalePrice) / item.effectiveRetailPrice) * 100).toFixed(1)
                        : null;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div style={{ fontWeight: "500" }}>{item.productName}</div>
                            <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.sku || item.productId?.slice(0, 8)}</div>
                          </td>
                          <td style={{ fontWeight: "600" }}>{item.quantityOnHand}</td>
                          <td>{item.quantityAvailable ?? item.quantityOnHand}</td>
                          <td>{formatCurrency(item.wholesalePrice)}</td>
                          <td>{formatCurrency(item.effectiveRetailPrice)}</td>
                          <td>{margin ? `${margin}%` : "-"}</td>
                          <td>
                            <span className="status-badge" style={{ background: status.bg, color: status.color }}>
                              {status.label}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <button
                                className="pod-btn pod-btn-secondary pod-btn-sm"
                                onClick={() => navigate(getPartnerInventoryDetailRoute(item.id))}
                              >
                                View
                              </button>
                              <button
                                className="pod-btn pod-btn-primary pod-btn-sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setAdjustForm({ quantity: "", notes: "", movementType: "ADJUSTMENT_IN" });
                                  setShowAdjustModal(true);
                                }}
                              >
                                Adjust
                              </button>
                              <button
                                className="pod-btn pod-btn-success pod-btn-sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setPriceForm({ retailPrice: item.effectiveRetailPrice || "" });
                                  setPriceError("");
                                  setShowPriceModal(true);
                                }}
                              >
                                Price
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!showLowStockOnly && pagination.totalPages > 1 && (
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

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowAdjustModal(false)}
        >
          <div className="pod-card" style={{ width: "450px", maxWidth: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Adjust Stock: {selectedItem?.productName}</h3>
            <div className="pod-form-group">
              <label className="pod-form-label">Current Stock: {selectedItem?.quantityOnHand}</label>
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Movement Type *</label>
              <select
                className="pod-form-input"
                value={adjustForm.movementType}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, movementType: e.target.value }))}
              >
                <option value="ADJUSTMENT_IN">Adjustment In</option>
                <option value="ADJUSTMENT_OUT">Adjustment Out</option>
                <option value="DAMAGED_OUT">Damaged Out</option>
                <option value="RETURN_IN">Return In</option>
                <option value="TRANSFER_OUT">Transfer Out</option>
              </select>
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Quantity *</label>
              <input
                type="number"
                className="pod-form-input"
                placeholder="e.g., 5"
                min="1"
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Notes *</label>
              <input
                type="text"
                className="pod-form-input"
                placeholder="e.g., Stock count correction"
                value={adjustForm.notes}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
              <button className="pod-btn pod-btn-primary" onClick={handleAdjust}>Adjust</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {showPriceModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowPriceModal(false)}
        >
          <div className="pod-card" style={{ width: "400px", maxWidth: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Update Price: {selectedItem?.productName}</h3>
            <div className="pod-form-group">
              <label className="pod-form-label">
                Wholesale Price: {formatCurrency(selectedItem?.wholesalePrice)}
              </label>
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Retail Price *</label>
              <input
                type="number"
                className="pod-form-input"
                min="0"
                step="1000"
                value={priceForm.retailPrice}
                onChange={(e) => { setPriceForm({ retailPrice: e.target.value }); setPriceError(""); }}
                style={priceError ? { borderColor: "#dc2626" } : undefined}
              />
              {priceError && (
                <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "0.375rem 0 0" }}>{priceError}</p>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-secondary" onClick={() => setShowPriceModal(false)}>Cancel</button>
              <button className="pod-btn pod-btn-success" onClick={handlePriceUpdate}>Update Price</button>
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
