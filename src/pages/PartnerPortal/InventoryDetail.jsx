import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phygitalInventoryApi } from "@/services/podApi";
import { ROUTES } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function InventoryDetail() {
  const { inventoryId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movementPagination, setMovementPagination] = useState({
    page: 0, size: 20, totalPages: 0,
  });

  // Modals
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ quantity: "", notes: "", movementType: "ADJUSTMENT_IN" });
  const [priceForm, setPriceForm] = useState({ retailPrice: "" });
  const [priceError, setPriceError] = useState("");
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [inventoryId]);

  useEffect(() => {
    if (inventoryId) fetchMovements();
  }, [inventoryId, movementPagination.page]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await phygitalInventoryApi.getById(inventoryId);
      setItem(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching inventory detail:", err);
      setError("Failed to load inventory item");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await phygitalInventoryApi.getMovements(inventoryId, {
        page: movementPagination.page,
        size: movementPagination.size,
      });
      setMovements(response.data.content || []);
      setMovementPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
      }));
    } catch (err) {
      console.error("Error fetching movements:", err);
    }
  };

  const handleAdjust = async () => {
    if (!adjustForm.quantity || !adjustForm.notes) {
      setErrorModal("Please fill in all required fields (quantity and notes).");
      return;
    }
    try {
      await phygitalInventoryApi.adjustStock(inventoryId, {
        quantity: parseInt(adjustForm.quantity),
        movementType: adjustForm.movementType,
        notes: adjustForm.notes,
      });
      setShowAdjustModal(false);
      setAdjustForm({ quantity: "", notes: "", movementType: "ADJUSTMENT_IN" });
      fetchDetail();
      fetchMovements();
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
      await phygitalInventoryApi.updatePrice(inventoryId, {
        partnerRetailPrice: parseFloat(priceForm.retailPrice),
      });
      setShowPriceModal(false);
      setPriceForm({ retailPrice: "" });
      setPriceError("");
      fetchDetail();
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const getMovementColor = (type) => {
    const colors = {
      WHOLESALE_IN: "#10b981",
      SALE_OUT: "#ef4444",
      ADJUSTMENT: "#3b82f6",
      RETURN_IN: "#f59e0b",
    };
    return colors[type] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading inventory detail...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pod-page">
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchDetail}>Retry</button>
        </div>
      </div>
    );
  }

  const margin = item?.effectiveRetailPrice && item?.wholesalePrice
    ? (((item.effectiveRetailPrice - item.wholesalePrice) / item.effectiveRetailPrice) * 100).toFixed(1)
    : null;

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <div>
          <button
            className="pod-btn pod-btn-secondary pod-btn-sm"
            onClick={() => navigate(ROUTES.POD_PARTNER_INVENTORY)}
            style={{ marginBottom: "0.5rem" }}
          >
            &larr; Back to Inventory
          </button>
          <h1 className="pod-page-title">{item?.productName}</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="pod-btn pod-btn-primary" onClick={() => {
            setAdjustForm({ quantity: "", notes: "", movementType: "ADJUSTMENT_IN" });
            setShowAdjustModal(true);
          }}>
            Adjust Stock
          </button>
          <button className="pod-btn pod-btn-success" onClick={() => {
            setPriceForm({ retailPrice: item?.effectiveRetailPrice || "" });
            setPriceError("");
            setShowPriceModal(true);
          }}>
            Update Price
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="pod-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Product ID</div>
            <div style={{ fontWeight: "500", fontFamily: "monospace" }}>{item?.productId}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>SKU</div>
            <div style={{ fontWeight: "500" }}>{item?.sku || "-"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Current Stock</div>
            <div style={{ fontWeight: "600", fontSize: "1.25rem" }}>{item?.quantityOnHand}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Available</div>
            <div style={{ fontWeight: "500" }}>{item?.quantityAvailable ?? item?.quantityOnHand}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Wholesale Price</div>
            <div style={{ fontWeight: "500" }}>{formatCurrency(item?.wholesalePrice)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Retail Price</div>
            <div style={{ fontWeight: "500" }}>{formatCurrency(item?.effectiveRetailPrice)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Profit Margin</div>
            <div style={{ fontWeight: "500", color: "#10b981" }}>{margin ? `${margin}%` : "-"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Reorder Level</div>
            <div style={{ fontWeight: "500" }}>{item?.reorderLevel ?? "-"}</div>
          </div>
        </div>
      </div>

      {/* Inventory Movements */}
      <div className="pod-card">
        <div className="pod-card-header">
          <h3 className="pod-card-title">Inventory Movements</h3>
        </div>
        {movements.length === 0 ? (
          <p style={{ color: "#6b7280", padding: "1rem 0" }}>No movements recorded yet</p>
        ) : (
          <>
            <div className="pod-table-container">
              <table className="pod-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Reason</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontSize: "0.8rem" }}>{formatDate(m.createdAt)}</td>
                      <td>
                        <span style={{ color: getMovementColor(m.movementType), fontWeight: "500", fontSize: "0.8rem" }}>
                          {m.movementType}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600", color: m.quantity > 0 ? "#10b981" : "#ef4444" }}>
                        {m.quantity > 0 ? "+" : ""}{m.quantity}
                      </td>
                      <td>{m.quantityBefore}</td>
                      <td>{m.quantityAfter}</td>
                      <td style={{ fontSize: "0.8rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.notes || "-"}
                      </td>
                      <td style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                        {m.referenceId?.slice(0, 8) || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {movementPagination.totalPages > 1 && (
              <div className="pod-pagination">
                <button
                  className="pod-pagination-btn"
                  disabled={movementPagination.page === 0}
                  onClick={() => setMovementPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                <span style={{ margin: "0 1rem" }}>
                  Page {movementPagination.page + 1} of {movementPagination.totalPages}
                </span>
                <button
                  className="pod-pagination-btn"
                  disabled={movementPagination.page >= movementPagination.totalPages - 1}
                  onClick={() => setMovementPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowAdjustModal(false)}
        >
          <div className="pod-card" style={{ width: "450px", maxWidth: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Adjust Stock</h3>
            <div className="pod-form-group">
              <label className="pod-form-label">Current Stock: {item?.quantityOnHand}</label>
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Movement Type *</label>
              <select className="pod-form-input" value={adjustForm.movementType}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, movementType: e.target.value }))}>
                <option value="ADJUSTMENT_IN">Adjustment In</option>
                <option value="ADJUSTMENT_OUT">Adjustment Out</option>
                <option value="DAMAGED_OUT">Damaged Out</option>
                <option value="RETURN_IN">Return In</option>
                <option value="TRANSFER_OUT">Transfer Out</option>
              </select>
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Quantity *</label>
              <input type="number" className="pod-form-input" min="1" value={adjustForm.quantity}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, quantity: e.target.value }))} />
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Notes *</label>
              <input type="text" className="pod-form-input" value={adjustForm.notes}
                onChange={(e) => setAdjustForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
              <button className="pod-btn pod-btn-primary" onClick={handleAdjust}>Adjust</button>
            </div>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {showPriceModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowPriceModal(false)}
        >
          <div className="pod-card" style={{ width: "400px", maxWidth: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Update Retail Price</h3>
            <div className="pod-form-group">
              <label className="pod-form-label">Wholesale: {formatCurrency(item?.wholesalePrice)}</label>
            </div>
            <div className="pod-form-group">
              <label className="pod-form-label">Retail Price *</label>
              <input type="number" className="pod-form-input" min="0" step="1000" value={priceForm.retailPrice}
                onChange={(e) => { setPriceForm({ retailPrice: e.target.value }); setPriceError(""); }}
                style={priceError ? { borderColor: "#dc2626" } : undefined} />
              {priceError && (
                <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "0.375rem 0 0" }}>{priceError}</p>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-secondary" onClick={() => setShowPriceModal(false)}>Cancel</button>
              <button className="pod-btn pod-btn-success" onClick={handlePriceUpdate}>Update</button>
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
