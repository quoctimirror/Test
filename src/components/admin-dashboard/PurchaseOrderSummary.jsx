import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

const PurchaseOrderSummary = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const statuses = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // const response = await purchaseOrderAPI.getAll();
      // setOrders(response.data);

      // Load orders from localStorage (created by Vendor Selection Wizard)
      const savedOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');

      // Mock data
      const mockOrders = [
        {
          id: 'PO-001',
          vendorName: 'Gold Jewelry Manufacturer Ltd',
          totalAmount: 125000000,
          currency: 'VND',
          status: 'APPROVED',
          orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          expectedDelivery: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          itemCount: 150
        },
        {
          id: 'PO-002',
          vendorName: 'Diamond Ring Supplier Co',
          totalAmount: 85000000,
          currency: 'VND',
          status: 'IN_TRANSIT',
          orderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          itemCount: 100
        },
        {
          id: 'PO-003',
          vendorName: 'Silver Bracelet Factory',
          totalAmount: 45000000,
          currency: 'VND',
          status: 'PENDING',
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expectedDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          itemCount: 75
        }
      ];

      // Combine saved orders with mock orders (saved orders first - newest at top)
      setOrders([...savedOrders, ...mockOrders]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    statusFilter === 'ALL' || order.status === statusFilter
  );

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      IN_TRANSIT: { color: 'bg-blue-100 text-blue-800', icon: Package },
      DELIVERED: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    return configs[status] || configs.PENDING;
  };

  const isNewOrder = (orderId) => {
    return orderId.startsWith('PO-' + new Date().getFullYear());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(amount);
  };

  const getTotalStats = () => {
    return {
      total: orders.length,
      totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      pending: orders.filter(o => o.status === 'PENDING').length,
      inTransit: orders.filter(o => o.status === 'IN_TRANSIT').length
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="purchase-order-summary">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Banner */}
        {orders.some(o => o.id.includes(Date.now().toString().substring(0, 8))) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Purchase Orders Created!</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your vendor selections from the Vendor Selection Wizard have been converted into purchase orders below.
                  Orders marked as "NEW" are ready for review and approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inTransit}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="ml-auto text-sm text-gray-600">
              {filteredOrders.length} orders
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                const isNew = order.id.includes(Date.now().toString().substring(0, 8)); // Check if created today
                return (
                  <tr key={order.id} className={`hover:bg-gray-50 ${isNew ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                      {isNew && <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded-full">NEW</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.vendorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.itemCount} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.expectedDelivery).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusConfig.color}`}>
                        <StatusIcon size={12} />
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-sm text-gray-500">
                Try selecting a different status filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderSummary;
