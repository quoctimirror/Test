import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { phygitalSalesApi, phygitalInventoryApi, POD_ENUMS } from "@/services/podApi";
import { getPartnerSaleDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function Sales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0, size: 20, totalPages: 0, totalElements: 0,
  });
  const [statusFilter, setStatusFilter] = useState("");

  // Create sale modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saleForm, setSaleForm] = useState({
    customerName: "", customerPhone: "", customerEmail: "",
    items: [{ productId: "", quantity: "", sellingPrice: "" }],
  });
  const [creating, setCreating] = useState(false);

  // Inventory for product picker
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [openPickerIndex, setOpenPickerIndex] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");

  // Modals
  const [confirmModal, setConfirmModal] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    fetchSales();
  }, [pagination.page, statusFilter]);

  useEffect(() => {
    if (showCreateModal && inventory.length === 0) {
      fetchInventory();
    }
  }, [showCreateModal]);

  const fetchInventory = async () => {
    try {
      setInventoryLoading(true);
      const response = await phygitalInventoryApi.getAll({ page: 0, size: 200 });
      setInventory(response.data.content || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, size: pagination.size };
      if (statusFilter) params.status = statusFilter;
      const response = await phygitalSalesApi.getAll(params);
      setSales(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const items = saleForm.items.filter((i) => i.productId && i.quantity && i.sellingPrice);
    if (items.length === 0) {
      setErrorModal("Please add at least one item with product, quantity, and price.");
      return;
    }
    // Check stock
    const overStockItem = items.find((i) => {
      const inv = inventory.find((p) => p.productId === i.productId);
      return inv && parseInt(i.quantity) > (inv.quantityAvailable ?? inv.quantityOnHand ?? 0);
    });
    if (overStockItem) {
      const inv = inventory.find((p) => p.productId === overStockItem.productId);
      setErrorModal(`"${inv?.productName}" quantity exceeds available stock (${inv?.quantityAvailable ?? inv?.quantityOnHand ?? 0}).`);
      return;
    }
    setConfirmModal({
      title: "Confirm Sale",
      message: `Record this sale with ${items.length} item(s)?`,
      onConfirm: () => submitSale(items),
    });
  };

  const submitSale = async (items) => {
    setConfirmModal(null);
    try {
      setCreating(true);
      await phygitalSalesApi.create({
        customerName: saleForm.customerName || undefined,
        customerPhone: saleForm.customerPhone || undefined,
        customerEmail: saleForm.customerEmail || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: parseInt(i.quantity),
          sellingPrice: parseFloat(i.sellingPrice),
        })),
      });
      setShowCreateModal(false);
      setSaleForm({
        customerName: "", customerPhone: "", customerEmail: "",
        items: [{ productId: "", quantity: "", sellingPrice: "" }],
      });
      fetchSales();
      // Refresh inventory for next time
      fetchInventory();
    } catch (err) {
      setErrorModal("Failed to create sale: " + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const addSaleItem = () => {
    setSaleForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: "", sellingPrice: "" }],
    }));
  };

  const removeSaleItem = (index) => {
    setSaleForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateSaleItem = (index, field, value) => {
    setSaleForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  };

  const selectProduct = (index, invItem) => {
    setSaleForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? { ...item, productId: invItem.productId, sellingPrice: invItem.effectiveRetailPrice || "" }
          : item
      ),
    }));
    setOpenPickerIndex(null);
    setPickerSearch("");
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      PENDING: "pending", CONFIRMED: "approved", COMPLETED: "paid",
      CANCELLED: "cancelled", RETURNED: "cancelled",
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
        <h1 className="pod-page-title">Sales ({pagination.totalElements})</h1>
        <button className="pod-btn pod-btn-primary" onClick={() => setShowCreateModal(true)}>
          + Record Sale
        </button>
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
          {POD_ENUMS.partnerSaleStatus.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading sales...</p>
        </div>
      )}

      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchSales}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="pod-card">
          {sales.length === 0 ? (
            <div className="pod-empty">
              <p>No sales found</p>
              <button className="pod-btn pod-btn-primary" onClick={() => setShowCreateModal(true)}>
                Record First Sale
              </button>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Profit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td>{sale.customerName || "-"}</td>
                        <td>{formatDate(sale.createdAt)}</td>
                        <td>{sale.itemCount || sale.items?.length || "-"}</td>
                        <td style={{ fontWeight: "600" }}>{formatCurrency(sale.totalAmount)}</td>
                        <td style={{ color: "#10b981", fontWeight: "500" }}>
                          {formatCurrency(sale.profitAmount)}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(sale.status)}`}>
                            {sale.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="pod-btn pod-btn-secondary pod-btn-sm"
                            onClick={() => navigate(getPartnerSaleDetailRoute(sale.id))}
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

      {/* Create Sale Modal */}
      {showCreateModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="pod-card"
            style={{ width: "650px", maxWidth: "90%", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => { e.stopPropagation(); setOpenPickerIndex(null); }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Record Sale</h3>

            {/* Customer Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div className="pod-form-group">
                <label className="pod-form-label">Customer Name</label>
                <input type="text" className="pod-form-input" placeholder="Customer name"
                  value={saleForm.customerName}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, customerName: e.target.value }))} />
              </div>
              <div className="pod-form-group">
                <label className="pod-form-label">Phone</label>
                <input type="text" className="pod-form-input" placeholder="+84 xxx xxx xxx"
                  value={saleForm.customerPhone}
                  onChange={(e) => setSaleForm((prev) => ({ ...prev, customerPhone: e.target.value }))} />
              </div>
            </div>

            {/* Items */}
            <h4 style={{ marginBottom: "0.5rem", fontSize: "0.95rem", fontWeight: 600 }}>Items</h4>

            {inventoryLoading && <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading inventory...</p>}

            {saleForm.items.map((item, index) => {
              const selectedInv = inventory.find((p) => p.productId === item.productId);
              const isPickerOpen = openPickerIndex === index;
              const filteredInventory = inventory.filter((inv) => {
                if (!pickerSearch) return true;
                const q = pickerSearch.toLowerCase();
                return (inv.productName || "").toLowerCase().includes(q) ||
                       (inv.sku || "").toLowerCase().includes(q) ||
                       (inv.productId || "").toLowerCase().includes(q);
              });
              const available = selectedInv ? (selectedInv.quantityAvailable ?? selectedInv.quantityOnHand ?? 0) : 0;

              return (
                <div key={index} style={{ marginBottom: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.75rem", background: "#fafafa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>Item {index + 1}</span>
                    {saleForm.items.length > 1 && (
                      <button
                        className="pod-btn pod-btn-danger pod-btn-sm"
                        onClick={() => removeSaleItem(index)}
                        style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Product Picker */}
                  <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                    <label className="pod-form-label" style={{ fontSize: "0.75rem" }}>Product</label>
                    <div
                      onClick={(e) => { e.stopPropagation(); setOpenPickerIndex(isPickerOpen ? null : index); setPickerSearch(""); }}
                      style={{
                        border: "1px solid #d1d5db", borderRadius: "6px", padding: "0.5rem",
                        cursor: "pointer", background: "#fff", minHeight: "48px",
                        display: "flex", alignItems: "center", gap: "0.75rem",
                      }}
                    >
                      {selectedInv ? (
                        <>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {selectedInv.productName}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                              {selectedInv.sku || selectedInv.productId?.slice(0, 8)} · Stock: {available} · Retail: {formatCurrency(selectedInv.effectiveRetailPrice)}
                            </div>
                          </div>
                          <span style={{ color: "#9ca3af", fontSize: "0.8rem", flexShrink: 0 }}>Change</span>
                        </>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>-- Select Product --</span>
                      )}
                    </div>

                    {/* Dropdown */}
                    {isPickerOpen && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                        background: "#fff", border: "1px solid #d1d5db", borderRadius: "8px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)", maxHeight: "280px",
                        display: "flex", flexDirection: "column", marginTop: "4px",
                      }}>
                        <div style={{ padding: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>
                          <input
                            type="text"
                            className="pod-form-input"
                            placeholder="Search by name, SKU..."
                            value={pickerSearch}
                            onChange={(e) => setPickerSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}
                          />
                        </div>
                        <div style={{ overflowY: "auto", flex: 1 }}>
                          {filteredInventory.length === 0 ? (
                            <div style={{ padding: "1rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                              No products found
                            </div>
                          ) : (
                            filteredInventory.map((inv) => {
                              const avail = inv.quantityAvailable ?? inv.quantityOnHand ?? 0;
                              const isOutOfStock = avail <= 0;
                              return (
                                <div
                                  key={inv.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isOutOfStock) selectProduct(index, inv);
                                  }}
                                  style={{
                                    display: "flex", alignItems: "center", gap: "0.75rem",
                                    padding: "0.5rem 0.75rem", cursor: isOutOfStock ? "not-allowed" : "pointer",
                                    borderBottom: "1px solid #f3f4f6",
                                    background: item.productId === inv.productId ? "#eff6ff" : "transparent",
                                    opacity: isOutOfStock ? 0.5 : 1,
                                  }}
                                  onMouseEnter={(e) => { if (!isOutOfStock) e.currentTarget.style.background = "#f9fafb"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = item.productId === inv.productId ? "#eff6ff" : "transparent"; }}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{inv.productName}</div>
                                    <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                                      {inv.sku || inv.productId?.slice(0, 8)}
                                      {isOutOfStock && <span style={{ color: "#ef4444", fontWeight: 600 }}> · Out of stock</span>}
                                    </div>
                                  </div>
                                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#059669" }}>
                                      {formatCurrency(inv.effectiveRetailPrice)}
                                    </div>
                                    <div style={{ fontSize: "0.7rem", color: avail <= 3 ? "#f59e0b" : "#6b7280" }}>
                                      Stock: {avail}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div style={{ flex: 1 }}>
                      <label className="pod-form-label" style={{ fontSize: "0.75rem" }}>Quantity</label>
                      <input
                        type="number"
                        className="pod-form-input"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateSaleItem(index, "quantity", e.target.value)}
                        style={{
                          borderColor: selectedInv && item.quantity && parseInt(item.quantity) > available ? "#dc2626" : undefined,
                        }}
                      />
                      {selectedInv && item.quantity && parseInt(item.quantity) > available && (
                        <span style={{ color: "#dc2626", fontSize: "0.75rem", display: "block", marginTop: "0.25rem" }}>
                          Exceeds stock ({available})
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="pod-form-label" style={{ fontSize: "0.75rem" }}>Selling Price</label>
                      <input
                        type="number"
                        className="pod-form-input"
                        placeholder="Price"
                        min="0"
                        step="1000"
                        value={item.sellingPrice}
                        onChange={(e) => updateSaleItem(index, "sellingPrice", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <button className="pod-btn pod-btn-secondary pod-btn-sm" onClick={addSaleItem} style={{ marginBottom: "1rem" }}>
              + Add Item
            </button>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="pod-btn pod-btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Record Sale"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
        }}>
          <div style={{
            background: "#fff", borderRadius: "12px", padding: "2rem", maxWidth: "400px", width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.1rem", fontWeight: 700 }}>
              {confirmModal.title}
            </h3>
            <p style={{ color: "#4b5563", margin: "0 0 1.5rem", fontSize: "0.9rem" }}>
              {confirmModal.message}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-secondary" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className="pod-btn pod-btn-primary" onClick={confirmModal.onConfirm}>Confirm</button>
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
              <button className="pod-btn pod-btn-primary" onClick={() => setErrorModal(null)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
