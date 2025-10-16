import React, { useState, useEffect } from "react";
import { ordersAPI, handleAPIError } from "@services/api";
import { useAuth } from "@/context/AuthContext";
import "./ProfileTabs.css";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (!user?.id) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        if (isMounted) setLoading(true);
        const response = await ordersAPI.getAll({ userId: user.id });
        if (isMounted) {
          const orderData = Array.isArray(response.data) ? response.data : [];
          setOrders(orderData);
        }
      } catch (err) {
        if (isMounted) {
          const apiError = handleAPIError(err, "Failed to load orders");
          setError(apiError.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Only fetch if user ID exists and is valid
    if (user?.id) {
      fetchOrders();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - user should be available from AuthContext

  const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      NEW: "status-new",
      CONFIRMED: "status-confirmed",
      IN_PRODUCTION: "status-production",
      READY_FOR_DELIVERY: "status-ready",
      COMPLETED: "status-completed",
      CANCELLED: "status-cancelled",
    };
    return statusMap[status] || "status-default";
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="profile-tab-content">
        <div className="profile-loading-state">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-tab-content">
        <div className="profile-error-state">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="profile-tab-content">
        <div className="profile-empty-state">
          <p className="bodytext-2--no-margin">You haven't placed any orders yet.</p>
          <p className="bodytext-3--no-margin">Start exploring our collection to create your first order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-tab-content">
      <div className="profile-items-list">
        {orders.map((order) => (
          <div key={order.id} className="profile-item">
            <div className="profile-item-image">
              <img
                src={order.product?.imageUrl || "/products/default-ring.jpg"}
                alt={order.product?.name || "Product"}
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/products/default-ring.jpg";
                }}
              />
            </div>
            <div className="profile-item-info">
              <h3 className="profile-item-name heading-3--no-margin">
                {order.product?.name || order.productId}
              </h3>
              <div className="profile-item-meta">
                <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status?.replace(/_/g, " ")}
                </span>
                <span className="order-payment-status bodytext-4--no-margin">
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>
            <div className="profile-item-actions">
              <span className="profile-item-date bodytext-3--no-margin">
                {formatDate(order.createdAt)}
              </span>
              <button
                className="profile-view-detail-btn bodytext-3--no-margin"
                onClick={() => handleViewDetail(order)}
              >
                View detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="order-detail-overlay" onClick={closeDetailModal}>
          <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-detail-header">
              <h2 className="heading-2--no-margin">Order Details</h2>
              <button className="order-detail-close" onClick={closeDetailModal}>
                ×
              </button>
            </div>

            <div className="order-detail-content">
              {/* Order Info */}
              <div className="order-detail-section">
                <h3 className="bodytext-2--no-margin">Order Information</h3>
                <div className="order-detail-grid">
                  <div className="order-detail-field">
                    <span className="bodytext-4--no-margin">Order ID:</span>
                    <span className="bodytext-3--no-margin">{selectedOrder.id}</span>
                  </div>
                  <div className="order-detail-field">
                    <span className="bodytext-4--no-margin">Status:</span>
                    <span className={`order-status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="order-detail-field">
                    <span className="bodytext-4--no-margin">Order Date:</span>
                    <span className="bodytext-3--no-margin">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="order-detail-field">
                    <span className="bodytext-4--no-margin">Last Updated:</span>
                    <span className="bodytext-3--no-margin">{formatDate(selectedOrder.lastStatusUpdatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="order-detail-section">
                <h3 className="bodytext-2--no-margin">Product Details</h3>
                <div className="order-detail-product">
                  <img
                    src={selectedOrder.product?.imageUrl || "/products/default-ring.jpg"}
                    alt={selectedOrder.product?.name || "Product"}
                    className="order-detail-product-image"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = "/products/default-ring.jpg";
                    }}
                  />
                  <div className="order-detail-product-info">
                    <h4 className="bodytext-2--no-margin">{selectedOrder.product?.name || selectedOrder.productId}</h4>
                    <p className="bodytext-3--no-margin">Quantity: {selectedOrder.quantity || 1}</p>
                    {selectedOrder.configuration && (
                      <p className="bodytext-4--no-margin">{selectedOrder.configuration}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="order-detail-section">
                <h3 className="bodytext-2--no-margin">Payment Information</h3>
                <div className="order-detail-grid">
                  <div className="order-detail-field">
                    <span className="bodytext-4--no-margin">Total Amount:</span>
                    <span className="bodytext-3--no-margin">
                      ${selectedOrder.totalAmount?.toLocaleString() || "0"} {selectedOrder.currency || "USD"}
                    </span>
                  </div>
                  <div className="order-detail-field">
                    <span className="bodytext-4--no-margin">Payment Status:</span>
                    <span className="bodytext-3--no-margin">{selectedOrder.paymentStatus}</span>
                  </div>
                  <div className="order-detail-field">
                    <span className="bodytext-4--no-margin">Outstanding:</span>
                    <span className="bodytext-3--no-margin">
                      ${selectedOrder.paymentOutstanding?.toLocaleString() || "0"} {selectedOrder.currency || "USD"}
                    </span>
                  </div>
                  <div className="order-detail-field">
                    <span className="bodytext-4--no-margin">Payment Terms:</span>
                    <span className="bodytext-3--no-margin">{selectedOrder.paymentTerms || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              {selectedOrder.deliveryAddress && (
                <div className="order-detail-section">
                  <h3 className="bodytext-2--no-margin">Delivery Information</h3>
                  <p className="bodytext-3--no-margin">{selectedOrder.deliveryAddress}</p>
                  {selectedOrder.expectedDeliveryDate && (
                    <p className="bodytext-4--no-margin">
                      Expected Delivery: {formatDate(selectedOrder.expectedDeliveryDate)}
                    </p>
                  )}
                </div>
              )}

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="order-detail-section">
                  <h3 className="bodytext-2--no-margin">Order Timeline</h3>
                  <div className="order-timeline">
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div key={history.id || index} className="order-timeline-item">
                        <div className="order-timeline-dot"></div>
                        <div className="order-timeline-content">
                          <span className="bodytext-3--no-margin">{history.status?.replace(/_/g, " ")}</span>
                          <span className="bodytext-4--no-margin">{formatDate(history.changedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
