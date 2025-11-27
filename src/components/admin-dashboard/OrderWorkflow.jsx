import React, { useState, useEffect } from 'react';
import { ordersAPI, vendorsAPI } from '@services/api';
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  Calendar,
  ShoppingCart,
  RefreshCw,
  Play,
  Send
} from 'lucide-react';

const OrderWorkflow = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [pendingMisaCount, setPendingMisaCount] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, NEW, PENDING, CONFIRMED, IN_PRODUCTION, SHIPPED, COMPLETED
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignPayload, setAssignPayload] = useState({ orderId: '', vendorId: '' });
  const [vendors, setVendors] = useState([]);

  const [shipData, setShipData] = useState({
    trackingNumber: '',
    shippingCarrier: '',
    notes: ''
  });
  const [completeData, setCompleteData] = useState({
    finalPaymentReceived: false,
    finalPaymentAmount: 0,
    finalPaymentDate: '',
    paymentMethod: '',
    notes: ''
  });
  const [misaItemId, setMisaItemId] = useState('');

  useEffect(() => {
    loadOrders();
    loadPendingMisaCount();
    loadVendors();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingMisaCount = async () => {
    try {
      const response = await ordersAPI.getAwaitingMisaSku();
      setPendingMisaCount(response.data?.length || 0);
    } catch (err) {
      console.error('Failed to load pending MISA count:', err);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      setVendors(response.data || []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
  };

  const handleMisaSkuCreation = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !misaItemId.trim()) {
      setError('MISA Item ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await ordersAPI.markMisaSkuCreated(selectedOrder.id, misaItemId.trim());
      alert('MISA SKU created successfully! You can now start production.');
      setShowModal(null);
      setMisaItemId('');
      loadOrders();
      loadPendingMisaCount();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark MISA SKU as created');
    } finally {
      setLoading(false);
    }
  };

  const handleStartProduction = async (orderId) => {
    if (!window.confirm('Start production for this order?')) return;

    setLoading(true);
    setError(null);
    try {
      await ordersAPI.startProduction(orderId);
      alert('Production started successfully!');
      loadOrders();
      loadPendingMisaCount();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start production');
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setLoading(true);
    setError(null);
    try {
      await ordersAPI.ship(selectedOrder.id, shipData);
      alert('Order shipped successfully!');
      setShowModal(null);
      setShipData({ trackingNumber: '', shippingCarrier: '', notes: '' });
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to ship order');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setLoading(true);
    setError(null);
    try {
      await ordersAPI.complete(selectedOrder.id, completeData);
      alert('Order completed successfully!');
      setShowModal(null);
      setCompleteData({
        finalPaymentReceived: false,
        finalPaymentAmount: 0,
        finalPaymentDate: '',
        paymentMethod: '',
        notes: ''
      });
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete order');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVendor = async (e) => {
    e.preventDefault();
    if (!assignPayload.orderId || !assignPayload.vendorId) {
      setAssignError('Order ID and Vendor ID are required');
      return;
    }
    setAssigning(true);
    setAssignError(null);
    try {
      await ordersAPI.assignVendor(assignPayload.orderId.trim(), assignPayload.vendorId.trim());
      alert('Vendor assigned successfully');
      setAssignPayload({ orderId: '', vendorId: '' });
      loadOrders();
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign vendor');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      NEW: {
        color: 'bg-gray-500',
        badgeColor: 'bg-gray-50 text-gray-800',
        borderColor: 'border-gray-300',
        icon: ShoppingCart,
        label: '🆕 New Order'
      },
      PENDING: {
        color: 'bg-blue-500',
        badgeColor: 'bg-blue-50 text-blue-800',
        borderColor: 'border-blue-300',
        icon: Clock,
        label: '⏳ Pending Review'
      },
      CONFIRMED: {
        color: 'bg-indigo-500',
        badgeColor: 'bg-indigo-50 text-indigo-800',
        borderColor: 'border-indigo-300',
        icon: CheckCircle,
        label: '✅ Confirmed'
      },
      IN_PRODUCTION: {
        color: 'bg-orange-500',
        badgeColor: 'bg-orange-50 text-orange-800',
        borderColor: 'border-orange-300',
        icon: Package,
        label: '🔧 In Production'
      },
      SHIPPED: {
        color: 'bg-purple-500',
        badgeColor: 'bg-purple-50 text-purple-800',
        borderColor: 'border-purple-300',
        icon: Truck,
        label: '🚚 Shipped'
      },
      COMPLETED: {
        color: 'bg-green-500',
        badgeColor: 'bg-green-50 text-green-800',
        borderColor: 'border-green-300',
        icon: CheckCircle,
        label: '✅ Completed'
      }
    };
    return configs[status] || {
      color: 'bg-gray-400',
      badgeColor: 'bg-gray-100 text-gray-600',
      borderColor: 'border-gray-300',
      icon: ShoppingCart,
      label: status
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' ' + (currency || 'USD');
  };

  const getOrderCounts = () => {
    const counts = {
      ALL: orders.length,
      NEW: 0,
      PENDING: 0,
      CONFIRMED: 0,
      IN_PRODUCTION: 0,
      SHIPPED: 0,
      COMPLETED: 0
    };

    orders.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });

    return counts;
  };

  const getFilteredOrders = () => {
    if (activeTab === 'ALL') {
      return orders;
    }
    return orders.filter(order => order.status === activeTab);
  };

  const orderCounts = getOrderCounts();
  const filteredOrders = getFilteredOrders();

  const AssignVendorInline = ({ order }) => {
    const [localVendorId, setLocalVendorId] = useState(order.vendorId || '');
    const [localError, setLocalError] = useState(null);
    const [localAssigning, setLocalAssigning] = useState(false);

    const handleAssign = async () => {
      if (!localVendorId) {
        setLocalError('Select a vendor');
        return;
      }
      setLocalAssigning(true);
      setLocalError(null);
      try {
        await ordersAPI.assignVendor(order.id, localVendorId);
        await loadOrders();
      } catch (err) {
        setLocalError(err.response?.data?.message || 'Failed to assign vendor');
      } finally {
        setLocalAssigning(false);
      }
    };

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-medium text-gray-700">Vendor:</label>
        <select
          className="flex-1 min-w-[200px] max-w-xs border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={localVendorId}
          onChange={(e) => setLocalVendorId(e.target.value)}
        >
          <option value="">Select vendor...</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
          ))}
        </select>
        <button
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-900 border-2 border-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 active:bg-indigo-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAssign}
          disabled={localAssigning}
        >
          {localAssigning ? 'Assigning…' : 'Assign'}
        </button>
        {localError && <div className="w-full text-sm text-red-600 font-medium mt-1">{localError}</div>}
      </div>
    );
  };

  const getOrderActions = (order) => {
    const actions = [];

    if (order.status === 'CONFIRMED' && !order.misaItemCreated) {
      actions.push(
        <button
          key="create-misa"
          onClick={() => { setSelectedOrder(order); setShowModal('misaSku'); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-900 border-2 border-orange-600 rounded-lg hover:bg-orange-100 active:bg-orange-200 transition-colors text-xs font-semibold shadow-sm"
        >
          <AlertTriangle size={14} />
          Create MISA SKU
        </button>
      );
    }

    if (order.status === 'CONFIRMED' && order.misaItemCreated) {
      actions.push(
        <button
          key="start-production"
          onClick={() => handleStartProduction(order.id)}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-900 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 active:bg-indigo-200 transition-colors text-xs font-semibold shadow-sm"
        >
          <Play size={14} />
          Start Production
        </button>
      );
    }

    if (order.status === 'IN_PRODUCTION') {
      actions.push(
        <button
          key="ship"
          onClick={() => { setSelectedOrder(order); setShowModal('ship'); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-900 border-2 border-purple-600 rounded-lg hover:bg-purple-100 active:bg-purple-200 transition-colors text-xs font-semibold shadow-sm"
        >
          <Send size={14} />
          Ship Order
        </button>
      );
    }

    if (order.status === 'SHIPPED') {
      actions.push(
        <button
          key="complete"
          onClick={() => { setSelectedOrder(order); setShowModal('complete'); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-900 border-2 border-green-600 rounded-lg hover:bg-green-100 active:bg-green-200 transition-colors text-xs font-semibold shadow-sm"
        >
          <CheckCircle size={14} />
          Complete Order
        </button>
      );
    }

    return actions;
  };

  const OrderCard = ({ order }) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    const actions = getOrderActions(order);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="p-5">
          {/* Header Section: Order Info */}
          <div className="flex items-start justify-between gap-4 mb-4">
            {/* Left: Order ID & Status */}
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">
                {order.id}
              </h3>
              <span className={`${statusConfig.badgeColor} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border ${statusConfig.borderColor}`}>
                <StatusIcon size={14} strokeWidth={2.5} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
            {/* Customer */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <User size={12} />
                <span>Customer</span>
              </div>
              <p className="font-medium text-gray-900 text-sm">{order.customerName || 'N/A'}</p>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <DollarSign size={12} />
                <span>Amount</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                {formatCurrency(order.totalAmount, order.currency)}
              </p>
            </div>

            {/* Created Date */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Calendar size={12} />
                <span>Created</span>
              </div>
              <p className="font-medium text-gray-900 text-sm">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Actions Section */}
          {(actions.length > 0 || true) && (
            <div className="space-y-3">
              {/* Action Buttons */}
              {actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {actions}
                </div>
              )}

              {/* Vendor Assignment */}
              <AssignVendorInline order={order} />
            </div>
          )}
        </div>

        {/* MISA SKU Warning - URGENT */}
        {order.status === 'CONFIRMED' && !order.misaItemCreated && (
          <div className="px-6 py-5 bg-red-50 border-l-8 border-red-600 shadow-lg animate-pulse">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1 animate-bounce" size={32} strokeWidth={2.5} />
              <div className="flex-1">
                <p className="text-lg font-black text-red-900 mb-2">
                  🚨 URGENT: MISA SKU Creation Required
                </p>
                <p className="text-base text-red-800 font-bold leading-relaxed">
                  You MUST create a MISA SKU in the accounting system before production can start.
                  Production is BLOCKED until this step is completed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'ALL', label: 'All Orders', color: 'text-gray-700' },
    { id: 'NEW', label: 'New Orders', color: 'text-gray-600' },
    { id: 'PENDING', label: 'Pending Review', color: 'text-blue-600' },
    { id: 'CONFIRMED', label: 'Confirmed', color: 'text-indigo-600' },
    { id: 'IN_PRODUCTION', label: 'In Production', color: 'text-orange-600' },
    { id: 'SHIPPED', label: 'Shipped', color: 'text-purple-600' },
    { id: 'COMPLETED', label: 'Completed', color: 'text-green-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Workflow Management
              </h1>
              <p className="text-gray-600 mb-3">
                Track and manage order lifecycle from confirmation to completion
              </p>

              {/* Workflow Steps Guide */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  New
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Confirm
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Create MISA SKU
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Production
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Ship
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Complete
                </span>
              </div>
            </div>
            <button
              onClick={() => { loadOrders(); loadPendingMisaCount(); }}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* MISA Alert Badge */}
          {pendingMisaCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 px-4 py-2.5 rounded-lg">
              <AlertTriangle className="text-amber-600" size={20} />
              <span className="text-sm font-semibold text-amber-900">
                ⚠️ Action Required: {pendingMisaCount} Order{pendingMisaCount > 1 ? 's' : ''} Awaiting MISA SKU Creation
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {orderCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Package className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 text-lg font-medium">No orders in this category</p>
            <p className="text-gray-400 text-sm mt-1">Try selecting a different tab</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            {showModal === 'misaSku' && (
              <form onSubmit={handleMisaSkuCreation}>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Create MISA SKU</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">MISA Item ID *</label>
                  <input
                    type="text"
                    value={misaItemId}
                    onChange={(e) => setMisaItemId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter MISA Item ID"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter the MISA Item ID created in the MISA system
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-600 text-white py-2.5 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                  >
                    Save MISA SKU
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(null)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {showModal === 'ship' && (
              <form onSubmit={handleShip}>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ship Order</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                    <input
                      type="text"
                      value={shipData.trackingNumber}
                      onChange={(e) => setShipData({ ...shipData, trackingNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Carrier</label>
                    <input
                      type="text"
                      value={shipData.shippingCarrier}
                      onChange={(e) => setShipData({ ...shipData, shippingCarrier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={shipData.notes}
                      onChange={(e) => setShipData({ ...shipData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-2.5 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                  >
                    Mark as Shipped
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(null)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {showModal === 'complete' && (
              <form onSubmit={handleComplete}>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Order</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={completeData.finalPaymentReceived}
                      onChange={(e) => setCompleteData({ ...completeData, finalPaymentReceived: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">Final payment received</label>
                  </div>
                  {completeData.finalPaymentReceived && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                        <input
                          type="number"
                          value={completeData.finalPaymentAmount}
                          onChange={(e) => setCompleteData({ ...completeData, finalPaymentAmount: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                        <input
                          type="date"
                          value={completeData.finalPaymentDate}
                          onChange={(e) => setCompleteData({ ...completeData, finalPaymentDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <input
                          type="text"
                          value={completeData.paymentMethod}
                          onChange={(e) => setCompleteData({ ...completeData, paymentMethod: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={completeData.notes}
                      onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    Complete Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(null)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderWorkflow;
