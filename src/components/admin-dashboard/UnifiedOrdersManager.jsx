import React, { useState, useEffect } from 'react';
import { ordersAPI, vendorsAPI } from '@services/api';
import { useAuth } from '@/context/AuthContext';

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
        gradient: 'from-slate-500 to-slate-600',
        bgGradient: 'from-slate-50 to-slate-100',
        textColor: '#0f172a',
        borderColor: 'border-slate-300',
        label: 'New Order',
        accentColor: '#64748b'
      },
      PENDING: {
        gradient: 'from-sky-500 to-blue-600',
        bgGradient: 'from-sky-50 to-blue-100',
        textColor: '#1e3a8a',
        borderColor: 'border-blue-300',
        label: 'Pending Review',
        accentColor: '#3b82f6'
      },
      CONFIRMED: {
        gradient: 'from-emerald-500 to-teal-600',
        bgGradient: 'from-emerald-50 to-teal-100',
        textColor: '#064e3b',
        borderColor: 'border-emerald-400',
        label: 'Confirmed',
        accentColor: '#10b981'
      },
      IN_PRODUCTION: {
        gradient: 'from-amber-500 to-orange-600',
        bgGradient: 'from-amber-50 to-orange-100',
        textColor: '#78350f',
        borderColor: 'border-amber-400',
        label: 'In Production',
        accentColor: '#f59e0b'
      },
      SHIPPED: {
        gradient: 'from-violet-500 to-purple-600',
        bgGradient: 'from-violet-50 to-purple-100',
        textColor: '#4c1d95',
        borderColor: 'border-violet-400',
        label: 'Shipped',
        accentColor: '#a855f7'
      },
      COMPLETED: {
        gradient: 'from-emerald-600 to-green-700',
        bgGradient: 'from-emerald-50 to-green-100',
        textColor: '#022c22',
        borderColor: 'border-emerald-500',
        label: 'Completed',
        accentColor: '#059669'
      }
    };
    return configs[status] || {
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-gray-100',
      textColor: '#111827',
      borderColor: 'border-gray-300',
      icon: ShoppingCart,
      label: status,
      accentColor: '#6b7280'
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
          className="luxury-btn luxury-btn-emerald group"
        >
          <span>Confirm</span>
        </button>
      );
    }

    // Production: Create MISA SKU (CONFIRMED orders without MISA)
    if (isProduction && order.status === 'CONFIRMED' && !order.misaItemCreated) {
      actions.push(
        <button
          key="create-misa"
          onClick={() => { setSelectedOrder(order); setShowModal('misaSku'); }}
          className="luxury-btn luxury-btn-amber group"
        >
          <span>MISA SKU</span>
        </button>
      );
    }

    // Production: Start Production (CONFIRMED orders with MISA)
    if (isProduction && order.status === 'CONFIRMED' && order.misaItemCreated) {
      actions.push(
        <button
          key="start-production"
          onClick={() => handleStartProduction(order.id)}
          className="luxury-btn luxury-btn-violet group"
        >
          <span>Start</span>
        </button>
      );
    }

    // Production: Ship Order (IN_PRODUCTION orders)
    if (isProduction && order.status === 'IN_PRODUCTION') {
      actions.push(
        <button
          key="ship"
          onClick={() => { setSelectedOrder(order); setShowModal('ship'); }}
          className="luxury-btn luxury-btn-purple group"
        >
          <span>Ship</span>
        </button>
      );
    }

    // Finance/Production: Complete Order (SHIPPED orders)
    if ((isFinance || isProduction) && order.status === 'SHIPPED') {
      actions.push(
        <button
          key="complete"
          onClick={() => { setSelectedOrder(order); setShowModal('complete'); }}
          className="luxury-btn luxury-btn-green group"
        >
          <span>Complete</span>
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
      <div className="vendor-assignment">
        <label className="vendor-label">Manufacturing Partner</label>
        <div className="vendor-select-group">
          <select
            className="luxury-select"
            value={localVendorId}
            onChange={(e) => setLocalVendorId(e.target.value)}
          >
            <option value="">Select vendor...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <button
            className="luxury-btn luxury-btn-navy"
            onClick={handleAssign}
            disabled={localAssigning}
          >
            {localAssigning ? 'Assigning…' : 'Assign'}
          </button>
        </div>
        {localError && <div className="vendor-error">{localError}</div>}
      </div>
    );
  };

  const OrderCard = ({ order, index }) => {
    const statusConfig = getStatusConfig(order.status);
    const actions = getOrderActions(order);

    return (
      <div className="admin-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Left: Order Info */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Order</span>
                <h3 style={{ margin: '0.125rem 0 0 0', fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
                  {order.id}
                </h3>
              </div>
              <div style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: statusConfig.bgGradient ? `#${statusConfig.accentColor}15` : '#f1f5f9',
                color: statusConfig.textColor,
                border: `1px solid ${statusConfig.accentColor}30`
              }}>
                {statusConfig.label}
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Customer</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0f172a' }}>
                  {order.customerName || 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Amount</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', fontFamily: 'monospace' }}>
                  {formatCurrency(order.totalAmount, order.currency)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Created</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0f172a' }}>
                  {formatDate(order.createdAt)}
                </div>
              </div>

              {isFinance && order.paymentOutstanding > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '0.25rem' }}>Outstanding</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', fontFamily: 'monospace' }}>
                    {formatCurrency(order.paymentOutstanding, order.currency)}
                  </div>
                </div>
              )}
            </div>

            {/* Vendor Assignment */}
            {isProduction && (
              <AssignVendorInline order={order} />
            )}

            {/* MISA Warning Banner */}
            {isProduction && order.status === 'CONFIRMED' && !order.misaItemCreated && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '6px'
              }}>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8125rem', fontWeight: '600', color: '#78350f' }}>
                  ⚠ MISA SKU Required
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#92400e' }}>
                  Create MISA SKU in accounting system before production can start
                </p>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          {actions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'ALL', label: 'All Orders' },
    { id: 'NEW', label: 'New' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'IN_PRODUCTION', label: 'Production' },
    { id: 'SHIPPED', label: 'Shipped' },
    { id: 'COMPLETED', label: 'Completed' }
  ];

  return (
    <>
      <style>{`
        .orders-manager-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Header Section */
        .orders-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .orders-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .orders-header-left {
          flex: 1;
        }

        .orders-title {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
        }

        .orders-subtitle {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0;
        }

        /* Role Badges */
        .role-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.75rem;
        }

        .role-badge {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--luxury-white), #f9fafb);
          border: 1.5px solid;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: var(--luxury-shadow);
        }

        .role-badge-finance {
          border-color: #3b82f6;
          color: #1e40af;
        }

        .role-badge-production {
          border-color: #f59e0b;
          color: #92400e;
        }

        .role-badge-sales {
          border-color: #10b981;
          color: #065f46;
        }

        /* Refresh Button */
        .refresh-btn {
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: var(--luxury-white);
          border: 1.5px solid var(--luxury-gold);
          color: var(--luxury-navy);
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: var(--luxury-shadow);
        }

        .refresh-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--luxury-gold), var(--luxury-gold-light));
          color: var(--luxury-white);
          transform: translateY(-1px);
          box-shadow: var(--luxury-shadow-lg);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* MISA Alert */
        .misa-alert {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--luxury-shadow);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.5); }
        }

        .misa-alert-text {
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: #78350f;
        }

        /* Error Message */
        .error-message {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          border: 2px solid #ef4444;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          color: #991b1b;
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        /* Tab Navigation */
        .tabs-container {
          background: var(--luxury-white);
          border-radius: 16px;
          box-shadow: var(--luxury-shadow);
          margin-bottom: 2rem;
          border: 2px solid rgba(201, 169, 97, 0.1);
          overflow: hidden;
        }

        .tabs-nav {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tabs-nav::-webkit-scrollbar {
          display: none;
        }

        .tab-button {
          font-family: 'Outfit', sans-serif;
          flex-shrink: 0;
          padding: 1.25rem 2rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tab-button:hover {
          color: var(--luxury-navy);
          background: rgba(201, 169, 97, 0.05);
        }

        .tab-button.active {
          color: var(--luxury-navy);
          border-bottom-color: var(--luxury-gold);
          background: linear-gradient(180deg, rgba(201, 169, 97, 0.08), transparent);
        }

        .tab-count {
          font-family: 'JetBrains Mono', monospace;
          background: rgba(201, 169, 97, 0.15);
          color: var(--luxury-navy);
          padding: 0.25rem 0.625rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tab-button.active .tab-count {
          background: linear-gradient(135deg, var(--luxury-gold), var(--luxury-gold-light));
          color: var(--luxury-white);
        }

        /* Orders List */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Order Card */
        .order-card {
          background: var(--luxury-white);
          border-radius: 16px;
          box-shadow: var(--luxury-shadow);
          border: 2px solid rgba(201, 169, 97, 0.12);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          animation: slideInUp 0.5s ease-out backwards;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .order-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--status-color);
          opacity: 0.6;
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--luxury-shadow-lg);
          border-color: var(--luxury-gold);
        }

        .order-card-inner {
          display: flex;
          justify-content: space-between;
          gap: 2rem;
          padding: 2rem;
        }

        /* Order Info */
        .order-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .order-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .order-id-group {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }

        .order-id-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .order-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--luxury-navy);
          margin: 0;
        }

        /* Status Badge - Indicator only, not a button */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1.5px solid rgba(0, 0, 0, 0.1);
        }

        /* Order Details Grid */
        .order-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }

        .detail-item-warning {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-color: #f59e0b;
        }

        .detail-icon {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .detail-item-warning .detail-icon {
          color: #d97706;
        }

        .detail-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: var(--luxury-navy);
          font-weight: 600;
          margin-left: auto;
        }

        .detail-value-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        /* Vendor Assignment */
        .vendor-assignment {
          padding: 1.25rem;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-radius: 12px;
          border: 1.5px solid #10b981;
        }

        .vendor-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #065f46;
          display: block;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .vendor-select-group {
          display: flex;
          gap: 0.75rem;
        }

        .luxury-select {
          font-family: 'Outfit', sans-serif;
          flex: 1;
          padding: 0.75rem 1rem;
          background: var(--luxury-white);
          border: 1.5px solid #10b981;
          border-radius: 8px;
          color: var(--luxury-navy);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .luxury-select:focus {
          outline: none;
          border-color: var(--luxury-gold);
          box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
        }

        .vendor-error {
          font-family: 'Outfit', sans-serif;
          font-size: 0.8125rem;
          color: #dc2626;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        /* Order Actions */
        .order-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        /* Luxury Buttons */
        .luxury-btn {
          font-family: 'Outfit', sans-serif;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 2px solid;
          white-space: nowrap;
          box-shadow: var(--luxury-shadow);
        }

        .luxury-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--luxury-shadow-lg);
        }

        .luxury-btn:active {
          transform: translateY(0);
        }

        .luxury-btn-emerald {
          background: linear-gradient(135deg, #10b981, #059669);
          color: var(--luxury-white);
          border-color: #10b981;
        }

        .luxury-btn-amber {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: var(--luxury-white);
          border-color: #f59e0b;
        }

        .luxury-btn-violet {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: var(--luxury-white);
          border-color: #8b5cf6;
        }

        .luxury-btn-purple {
          background: linear-gradient(135deg, #a855f7, #9333ea);
          color: var(--luxury-white);
          border-color: #a855f7;
        }

        .luxury-btn-green {
          background: linear-gradient(135deg, #059669, #047857);
          color: var(--luxury-white);
          border-color: #059669;
        }

        .luxury-btn-navy {
          background: linear-gradient(135deg, var(--luxury-navy), #0f172a);
          color: var(--luxury-white);
          border-color: var(--luxury-navy);
        }

        /* MISA Warning */
        .misa-warning {
          background: linear-gradient(90deg, #fee2e2, #fecaca);
          border-top: 3px solid #ef4444;
          padding: 1.5rem 2rem;
        }

        .misa-warning-content {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          color: #991b1b;
        }

        .misa-warning-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .misa-warning-text {
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          margin: 0;
          font-weight: 500;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          background: var(--luxury-white);
          border-radius: 16px;
          border: 2px dashed rgba(201, 169, 97, 0.3);
        }

        .empty-state-icon {
          color: #d1d5db;
          margin-bottom: 1.5rem;
        }

        .empty-state-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--luxury-navy);
          margin: 0 0 0.5rem 0;
        }

        .empty-state-text {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9375rem;
          color: #6b7280;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 35, 50, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: var(--luxury-white);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 2.5rem;
          max-width: 520px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideInModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 2px solid rgba(201, 169, 97, 0.2);
        }

        @keyframes slideInModal {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--luxury-navy);
          margin: 0 0 0.5rem 0;
        }

        .modal-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9375rem;
          color: #6b7280;
          margin: 0 0 2rem 0;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--luxury-navy);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          font-family: 'Outfit', sans-serif;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9375rem;
          color: var(--luxury-navy);
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--luxury-gold);
          box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
        }

        .form-hint {
          font-family: 'Outfit', sans-serif;
          font-size: 0.8125rem;
          color: #6b7280;
          font-style: italic;
        }

        .form-summary {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 2px solid #3b82f6;
          border-radius: 12px;
          padding: 1rem 1.25rem;
        }

        .form-summary-text {
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: #1e40af;
          margin: 0;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .modal-btn-primary {
          flex: 1;
          font-family: 'Outfit', sans-serif;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, var(--luxury-gold), var(--luxury-gold-light));
          color: var(--luxury-white);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9375rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--luxury-shadow-lg);
        }

        .modal-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-btn-secondary {
          font-family: 'Outfit', sans-serif;
          padding: 1rem 1.5rem;
          background: transparent;
          color: var(--luxury-navy);
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9375rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-btn-secondary:hover {
          background: #f9fafb;
          border-color: var(--luxury-navy);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .orders-title {
            font-size: 2.5rem;
          }

          .orders-header-top {
            flex-direction: column;
            gap: 1.5rem;
          }

          .order-card-inner {
            flex-direction: column;
            gap: 1.5rem;
          }

          .order-actions {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .order-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="orders-manager-content">
        {/* Header */}
        <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
                Orders Management
              </h1>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', color: '#64748b' }}>
                Review customer orders and coordinate follow-up
              </p>

              {/* Role Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {isFinance && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe'
                  }}>
                    Finance
                  </span>
                )}
                {isProduction && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a'
                  }}>
                    Production
                  </span>
                )}
                {isSales && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    border: '1px solid #6ee7b7'
                  }}>
                    Sales
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => { loadOrders(); loadPendingMisaCount(); }}
              disabled={loading}
              className="admin-button admin-button-primary"
            >
              {loading ? '⟳' : '↻'} Refresh
            </button>
          </div>

          {/* MISA Alert */}
          {isProduction && pendingMisaCount > 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#78350f'
            }}>
              ⚠️ {pendingMisaCount} Order{pendingMisaCount > 1 ? 's' : ''} Awaiting MISA SKU Creation
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="admin-error-state" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="admin-card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #e2e8f0' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: '0 0 auto',
                  padding: '1rem 1.5rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #0f172a' : '2px solid transparent',
                  color: activeTab === tab.id ? '#0f172a' : '#64748b',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '10px',
                  backgroundColor: activeTab === tab.id ? '#0f172a' : '#f1f5f9',
                  color: activeTab === tab.id ? '#ffffff' : '#64748b'
                }}>
                  {orderCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))}</div>

        {/* Empty State */}
        {filteredOrders.length === 0 && !loading && (
          <div className="admin-empty-state">
            No orders in this category. Try selecting a different tab.
          </div>
        )}

        {/* Modals */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Finance: Confirm Order Modal */}
              {showModal === 'confirm' && isFinance && (
                <form onSubmit={handleConfirmOrder} className="modal-form">
                  <h3 className="modal-title">Confirm Order</h3>
                  <p className="modal-subtitle">
                    Order {selectedOrder?.id} — {formatCurrency(selectedOrder?.totalAmount, selectedOrder?.currency)}
                  </p>

                  <div className="form-group">
                    <label className="form-label">Deposit Amount</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={confirmForm.depositAmount}
                      onChange={(e) => setConfirmForm({ ...confirmForm, depositAmount: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Deposit Due Date</label>
                    <input
                      type="date"
                      value={confirmForm.depositDueDate}
                      onChange={(e) => setConfirmForm({ ...confirmForm, depositDueDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Final Payment Due</label>
                    <input
                      type="date"
                      value={confirmForm.finalDueDate}
                      onChange={(e) => setConfirmForm({ ...confirmForm, finalDueDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Terms</label>
                    <input
                      type="text"
                      value={confirmForm.paymentTerms}
                      onChange={(e) => setConfirmForm({ ...confirmForm, paymentTerms: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Internal Notes</label>
                    <textarea
                      value={confirmForm.notes}
                      onChange={(e) => setConfirmForm({ ...confirmForm, notes: e.target.value })}
                      className="form-input"
                      rows={3}
                    />
                  </div>

                  <div className="form-summary">
                    <p className="form-summary-text">
                      <strong>Remaining:</strong> {formatCurrency(
                        Number(selectedOrder?.totalAmount || 0) - Number(confirmForm.depositAmount || 0),
                        selectedOrder?.currency
                      )}
                    </p>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" disabled={loading} className="modal-btn-primary">
                      {loading ? 'Processing...' : 'Confirm Order'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(null)}
                      className="modal-btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Production: MISA SKU Modal */}
              {showModal === 'misaSku' && isProduction && (
                <form onSubmit={handleMisaSkuCreation} className="modal-form">
                  <h3 className="modal-title">Create MISA SKU</h3>
                  <p className="modal-subtitle">
                    Order {selectedOrder?.id}
                  </p>

                  <div className="form-group">
                    <label className="form-label">MISA Item ID *</label>
                    <input
                      type="text"
                      value={misaItemId}
                      onChange={(e) => setMisaItemId(e.target.value)}
                      className="form-input"
                      placeholder="Enter MISA Item ID"
                      required
                    />
                    <p className="form-hint">
                      Enter the MISA Item ID created in the accounting system
                    </p>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" disabled={loading} className="modal-btn-primary">
                      {loading ? 'Saving...' : 'Save MISA SKU'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(null)}
                      className="modal-btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Production: Ship Order Modal */}
              {showModal === 'ship' && isProduction && (
                <form onSubmit={handleShip} className="modal-form">
                  <h3 className="modal-title">Ship Order</h3>
                  <p className="modal-subtitle">
                    Order {selectedOrder?.id}
                  </p>

                  <div className="form-group">
                    <label className="form-label">Tracking Number</label>
                    <input
                      type="text"
                      value={shipData.trackingNumber}
                      onChange={(e) => setShipData({ ...shipData, trackingNumber: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shipping Carrier</label>
                    <input
                      type="text"
                      value={shipData.shippingCarrier}
                      onChange={(e) => setShipData({ ...shipData, shippingCarrier: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      value={shipData.notes}
                      onChange={(e) => setShipData({ ...shipData, notes: e.target.value })}
                      className="form-input"
                      rows={3}
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" disabled={loading} className="modal-btn-primary">
                      {loading ? 'Processing...' : 'Mark as Shipped'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(null)}
                      className="modal-btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Finance/Production: Complete Order Modal */}
              {showModal === 'complete' && (isFinance || isProduction) && (
                <form onSubmit={handleComplete} className="modal-form">
                  <h3 className="modal-title">Complete Order</h3>
                  <p className="modal-subtitle">
                    Order {selectedOrder?.id}
                  </p>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={completeData.finalPaymentReceived}
                        onChange={(e) => setCompleteData({ ...completeData, finalPaymentReceived: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span className="form-label" style={{ margin: 0 }}>Final Payment Received</span>
                    </label>
                  </div>

                  {completeData.finalPaymentReceived && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Payment Amount</label>
                        <input
                          type="number"
                          value={completeData.finalPaymentAmount}
                          onChange={(e) => setCompleteData({ ...completeData, finalPaymentAmount: parseFloat(e.target.value) })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Payment Date</label>
                        <input
                          type="date"
                          value={completeData.finalPaymentDate}
                          onChange={(e) => setCompleteData({ ...completeData, finalPaymentDate: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Payment Method</label>
                        <input
                          type="text"
                          value={completeData.paymentMethod}
                          onChange={(e) => setCompleteData({ ...completeData, paymentMethod: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      value={completeData.notes}
                      onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
                      className="form-input"
                      rows={3}
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" disabled={loading} className="modal-btn-primary">
                      {loading ? 'Processing...' : 'Complete Order'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(null)}
                      className="modal-btn-secondary"
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
    </>
  );
};

export default UnifiedOrdersManager;
