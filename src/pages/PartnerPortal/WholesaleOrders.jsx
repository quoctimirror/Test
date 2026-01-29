import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { phygitalWholesaleApi, phygitalInventoryApi, productCatalogApi, POD_ENUMS } from "@/services/podApi";
import { getPartnerWholesaleOrderDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

export default function WholesaleOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0, size: 20, totalPages: 0, totalElements: 0,
  });
  const [statusFilter, setStatusFilter] = useState("");

  // Create order modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orderItems, setOrderItems] = useState([{ productId: "", quantity: "" }]);
  const [creating, setCreating] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [openPickerIndex, setOpenPickerIndex] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  useEffect(() => {
    if (showCreateModal && products.length === 0) {
      fetchProducts();
    }
  }, [showCreateModal]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productCatalogApi.getAvailable();
      setProducts(response.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, size: pagination.size };
      if (statusFilter) params.status = statusFilter;
      const response = await phygitalWholesaleApi.getAll(params);
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

  const handleCreate = () => {
    const items = orderItems.filter((i) => i.productId && i.quantity);
    if (items.length === 0) {
      setErrorModal("Please add at least one item with a product and quantity.");
      return;
    }
    // Check stock limits
    const overStockItem = items.find((i) => {
      const product = products.find((p) => p.id === i.productId);
      return product && parseInt(i.quantity) > (product.stockQuantity || 0);
    });
    if (overStockItem) {
      const product = products.find((p) => p.id === overStockItem.productId);
      setErrorModal(`"${product?.name}" quantity exceeds available stock (${product?.stockQuantity || 0}). Please reduce the quantity.`);
      return;
    }
    setConfirmModal({
      title: "Confirm Order",
      message: `Do you want to place this order with ${items.length} item(s)?`,
      onConfirm: () => submitOrder(items),
    });
  };

  const submitOrder = async (items) => {
    setConfirmModal(null);
    try {
      setCreating(true);
      await phygitalWholesaleApi.create({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: parseInt(i.quantity),
        })),
      });
      setShowCreateModal(false);
      setOrderItems([{ productId: "", quantity: "" }]);
      fetchOrders();
    } catch (err) {
      setErrorModal("Failed to create order: " + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: "" }]);
  };

  const removeOrderItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index, field, value) => {
    setOrderItems(orderItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      DRAFT: "pending",
      SUBMITTED: "pending",
      APPROVED: "approved",
      PROCESSING: "active",
      SHIPPED: "active",
      DELIVERED: "approved",
      COMPLETED: "paid",
      CANCELLED: "cancelled",
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
        <button className="pod-btn pod-btn-primary" onClick={() => setShowCreateModal(true)}>
          + New Order
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
            <div className="pod-empty">
              <p>No wholesale orders found</p>
              <button className="pod-btn pod-btn-primary" onClick={() => setShowCreateModal(true)}>
                Create First Order
              </button>
            </div>
          ) : (
            <>
              <div className="pod-table-container">
                <table className="pod-table">
                  <thead>
                    <tr>
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
                            onClick={() => navigate(getPartnerWholesaleOrderDetailRoute(order.id))}
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowCreateModal(false)}
        >
          <div className="pod-card" style={{ width: "650px", maxWidth: "90%", maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => { e.stopPropagation(); setOpenPickerIndex(null); }}>
            <h3 style={{ marginBottom: "1rem" }}>Create Wholesale Order</h3>

            {productsLoading && <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading products...</p>}

            {orderItems.map((item, index) => {
              const selectedProduct = products.find((p) => p.id === item.productId);
              const isPickerOpen = openPickerIndex === index;
              const filteredProducts = products.filter((p) => {
                if (!pickerSearch) return true;
                const q = pickerSearch.toLowerCase();
                return (p.name || "").toLowerCase().includes(q) ||
                       (p.skuCode || "").toLowerCase().includes(q) ||
                       (p.categoryName || "").toLowerCase().includes(q);
              });

              return (
              <div key={index} style={{ marginBottom: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.75rem", background: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>Item {index + 1}</span>
                  {orderItems.length > 1 && (
                    <button
                      className="pod-btn pod-btn-danger pod-btn-sm"
                      onClick={() => removeOrderItem(index)}
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
                    {selectedProduct ? (
                      <>
                        <img
                          src={selectedProduct.imageUrl || "https://via.placeholder.com/40x40?text=No+img"}
                          alt=""
                          style={{ width: 40, height: 40, borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/40x40?text=No+img"; }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {selectedProduct.name}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                            {selectedProduct.skuCode || "-"} · {formatCurrency(selectedProduct.price)} · Stock: {selectedProduct.stockQuantity ?? "-"}
                          </div>
                        </div>
                        <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Change</span>
                      </>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>-- Select Product --</span>
                    )}
                  </div>

                  {/* Dropdown Panel */}
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
                        {filteredProducts.length === 0 ? (
                          <div style={{ padding: "1rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                            No products found
                          </div>
                        ) : (
                          filteredProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderItem(index, "productId", p.id);
                                setOpenPickerIndex(null);
                                setPickerSearch("");
                              }}
                              style={{
                                display: "flex", alignItems: "center", gap: "0.75rem",
                                padding: "0.5rem 0.75rem", cursor: "pointer",
                                borderBottom: "1px solid #f3f4f6",
                                background: item.productId === p.id ? "#eff6ff" : "transparent",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                              onMouseLeave={(e) => e.currentTarget.style.background = item.productId === p.id ? "#eff6ff" : "transparent"}
                            >
                              <img
                                src={p.imageUrl || "https://via.placeholder.com/44x44?text=No+img"}
                                alt=""
                                style={{ width: 44, height: 44, borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                                onError={(e) => { e.target.src = "https://via.placeholder.com/44x44?text=No+img"; }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{p.name}</div>
                                <div style={{ fontSize: "0.7rem", color: "#6b7280", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                  <span>SKU: {p.skuCode || "-"}</span>
                                  {p.categoryName && <span>· {p.categoryName}</span>}
                                  {p.metalType && <span>· {p.metalType}</span>}
                                </div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#059669" }}>
                                  {formatCurrency(p.price)}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                                  Stock: {p.stockQuantity ?? "-"}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="pod-form-label" style={{ fontSize: "0.75rem" }}>Quantity</label>
                  <input
                    type="number"
                    className="pod-form-input"
                    placeholder="Enter quantity"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, "quantity", e.target.value)}
                    style={{
                      width: "120px",
                      borderColor: selectedProduct && item.quantity && parseInt(item.quantity) > (selectedProduct.stockQuantity || 0) ? "#dc2626" : undefined,
                    }}
                  />
                  {selectedProduct && item.quantity && parseInt(item.quantity) > (selectedProduct.stockQuantity || 0) && (
                    <span style={{ color: "#dc2626", fontSize: "0.75rem", display: "block", marginTop: "0.25rem" }}>
                      Exceeds available stock ({selectedProduct.stockQuantity || 0}). Please enter a lower quantity.
                    </span>
                  )}
                </div>
              </div>
              );
            })}

            <button
              className="pod-btn pod-btn-secondary pod-btn-sm"
              onClick={addOrderItem}
              style={{ marginBottom: "1rem" }}
            >
              + Add Item
            </button>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button className="pod-btn pod-btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="pod-btn pod-btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Create Order"}
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
              <button
                className="pod-btn pod-btn-secondary"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                className="pod-btn pod-btn-primary"
                onClick={confirmModal.onConfirm}
              >
                Confirm
              </button>
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
