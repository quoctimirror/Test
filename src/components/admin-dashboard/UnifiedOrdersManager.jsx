import React, { useState, useEffect } from 'react';
import { ordersAPI, vendorsAPI } from '@services/api';
import { useAuth } from '@/context/AuthContext';
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

const UnifiedOrdersManager = () => {
  const { user } = useAuth();
  const roles = user?.roles || [];

  // Role checks
  const isFinance = roles.includes('FINANCE') || roles.includes('ADMIN') || roles.includes('IT_ADMIN');
  const isProduction = roles.includes('PRODUCTION_OPS') || roles.includes('ADMIN') || roles.includes('IT_ADMIN');
  const isSales = roles.includes('SALES_CUSTOMER_OPS') || roles.includes('ADMIN') || roles.includes('IT_ADMIN');

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [pendingMisaCount, setPendingMisaCount] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL');
  const [vendors, setVendors] = useState([]);

  // Finance-related state
  const [confirmForm, setConfirmForm] = useState({
    depositAmount: '',
    depositDueDate: '',
    finalDueDate: '',
    paymentTerms: '50% deposit, remainder prior to delivery',
    notes: ''
  });

  // Production-related state
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

  // Finance: Confirm order with payment schedule
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const total = Number(selectedOrder.totalAmount || 0);
    const depositValue = Number(confirmForm.depositAmount);
    const depositDue = toStartOfDayISO(confirmForm.depositDueDate);
    const finalDue = toStartOfDayISO(confirmForm.finalDueDate);

    if (!depositValue || depositValue <= 0) {
      setError('Deposit amount must be greater than 0.');
      return;
    }

    if (depositValue > total) {
      setError('Deposit cannot exceed total order amount.');
      return;
    }

    if (!depositDue || !finalDue) {
      setError('Please provide deposit and final payment due dates.');
      return;
    }

    const remaining = Math.max(total - depositValue, 0);
    const paymentSchedule = [
      {
        dueDate: depositDue,
        amountDue: depositValue,
        amountPaid: 0,
        notes: confirmForm.notes || 'Deposit',
      },
    ];

    if (remaining > 0) {
      paymentSchedule.push({
        dueDate: finalDue,
        amountDue: remaining,
        amountPaid: 0,
        notes: 'Final balance',
      });
    }

    setLoading(true);
    setError(null);

    try {
      await ordersAPI.updatePaymentTerms(selectedOrder.id, {
        paymentTermsType: 'FIXED_SCHEDULE',
        paymentTerms: confirmForm.paymentTerms,
        paymentSchedule,
      });

      await ordersAPI.updateStatus(selectedOrder.id, {
        status: 'CONFIRMED',
        changedBy: 'admin-dashboard'
      });

      alert('Order confirmed successfully with payment schedule!');
      setShowModal(null);
      setConfirmForm({
        depositAmount: '',
        depositDueDate: '',
        finalDueDate: '',
        paymentTerms: '50% deposit, remainder prior to delivery',
        notes: ''
      });
      loadOrders();
      loadPendingMisaCount();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm order');
    } finally {
      setLoading(false);
    }
  };

  // Production: MISA SKU creation
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

  // Production: Start production
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

  // Production: Ship order
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

  // Finance/Production: Complete order
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

  const toStartOfDayISO = (dateString) => {
    if (!dateString) return null;
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const toISODateInput = (date) => date.toISOString().slice(0, 10);

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

  // Role-based action buttons
  const getOrderActions = (order) => {
    const actions = [];

    // Finance: Confirm Order (NEW/PENDING orders)
    if (isFinance && (order.status === 'NEW' || order.status === 'PENDING')) {
      actions.push(
        <button
          key="confirm"
          onClick={() => {
            const total = Number(order.totalAmount || 0);
            const defaultDeposit = total ? Math.round(total * 0.5) : '';
            const today = new Date();
            const finalDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

            setConfirmForm({
              depositAmount: defaultDeposit ? defaultDeposit.toString() : '',
              depositDueDate: toISODateInput(today),
              finalDueDate: toISODateInput(finalDate),
              paymentTerms: '50% deposit, remainder prior to delivery',
              notes: ''
            });
            setSelectedOrder(order);
            setShowModal('confirm');
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-900 border-2 border-blue-600 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors text-xs font-semibold shadow-sm"
        >
          <CheckCircle size={14} />
          Confirm Order
        </button>
      );
    }

    // Production: Create MISA SKU (CONFIRMED orders without MISA)
    if (isProduction && order.status === 'CONFIRMED' && !order.misaItemCreated) {
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

    // Production: Start Production (CONFIRMED orders with MISA)
    if (isProduction && order.status === 'CONFIRMED' && order.misaItemCreated) {
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

    // Production: Ship Order (IN_PRODUCTION orders)
    if (isProduction && order.status === 'IN_PRODUCTION') {
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

    // Finance/Production: Complete Order (SHIPPED orders)
    if ((isFinance || isProduction) && order.status === 'SHIPPED') {
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

  // Vendor assignment component (Production only)
  const AssignVendorInline = ({ order }) => {
    const [localVendorId, setLocalVendorId] = useState(order.vendorId || '');
    const [localError, setLocalError] = useState(null);
    const [localAssigning, setLocalAssigning] = useState(false);

    if (!isProduction) return null;

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

  const OrderCard = ({ order }) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    const actions = getOrderActions(order);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="p-5">
          {/* Main Layout: Info on Left, Actions on Right */}
          <div className="flex items-start justify-between gap-6">
            {/* Left Side: Order Info */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Order ID & Status */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Order ID:</span>
                  <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                </div>
                <span className={`${statusConfig.badgeColor} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border ${statusConfig.borderColor}`}>
                  <StatusIcon size={14} strokeWidth={2.5} />
                  {statusConfig.label}
                </span>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-500">Customer:</span>
                <span className="text-sm font-semibold text-gray-900">{order.customerName || 'N/A'}</span>
              </div>

              {/* Amount & Created */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-500">Amount:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-500">Created:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Finance: Payment Outstanding */}
              {isFinance && order.paymentOutstanding > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-orange-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-orange-500">Outstanding:</span>
                  <span className="text-sm font-bold text-orange-600">
                    {formatCurrency(order.paymentOutstanding, order.currency)}
                  </span>
                </div>
              )}

              {/* Production: Vendor Assignment */}
              {isProduction && (
                <div className="pt-2">
                  <AssignVendorInline order={order} />
                </div>
              )}
            </div>

            {/* Right Side: Action Buttons */}
            {actions.length > 0 && (
              <div className="flex flex-col gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Production: MISA SKU Warning - URGENT */}
        {isProduction && order.status === 'CONFIRMED' && !order.misaItemCreated && (
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
                Orders Management
              </h1>
              <p className="text-gray-600 mb-3">
                Unified order management for Finance, Sales, and Production teams
              </p>

              {/* Role Badge */}
              <div className="flex items-center gap-2 text-sm">
                {isFinance && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                    💰 Finance Access
                  </span>
                )}
                {isProduction && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
                    🔧 Production Access
                  </span>
                )}
                {isSales && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                    🤝 Sales Access
                  </span>
                )}
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

          {/* MISA Alert Badge (Production only) */}
          {isProduction && pendingMisaCount > 0 && (
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
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Finance: Confirm Order Modal */}
            {showModal === 'confirm' && isFinance && (
              <form onSubmit={handleConfirmOrder}>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Order & Set Payment Schedule</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Order {selectedOrder?.id} — {formatCurrency(selectedOrder?.totalAmount, selectedOrder?.currency)}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={confirmForm.depositAmount}
                      onChange={(e) => setConfirmForm({ ...confirmForm, depositAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Due Date</label>
                    <input
                      type="date"
                      value={confirmForm.depositDueDate}
                      onChange={(e) => setConfirmForm({ ...confirmForm, depositDueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Final Payment Due Date</label>
                    <input
                      type="date"
                      value={confirmForm.finalDueDate}
                      onChange={(e) => setConfirmForm({ ...confirmForm, finalDueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                    <input
                      type="text"
                      value={confirmForm.paymentTerms}
                      onChange={(e) => setConfirmForm({ ...confirmForm, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                    <textarea
                      value={confirmForm.notes}
                      onChange={(e) => setConfirmForm({ ...confirmForm, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-700">
                      <strong>Remaining:</strong> {formatCurrency(
                        Number(selectedOrder?.totalAmount || 0) - Number(confirmForm.depositAmount || 0),
                        selectedOrder?.currency
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Confirming...' : 'Confirm Order'}
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

            {/* Production: MISA SKU Modal */}
            {showModal === 'misaSku' && isProduction && (
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

            {/* Production: Ship Order Modal */}
            {showModal === 'ship' && isProduction && (
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

            {/* Finance/Production: Complete Order Modal */}
            {showModal === 'complete' && (isFinance || isProduction) && (
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

export default UnifiedOrdersManager;
