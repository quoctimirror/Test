import { useEffect, useState } from "react";
import { vendorsAPI } from "@/services/api";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendorId, setVendorId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const info = await vendorsAPI.getCurrentVendorInfo();
        if (!info.hasVendor || !info.data) {
          setVendorId(null);
          setOrders([]);
          return;
        }
        setVendorId(info.data.id);
        const res = await vendorsAPI.getVendorOrders(info.data.id);
        setOrders(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="vendor-card">
      <div className="vendor-card-header">
        <h3 className="vendor-card-title heading-3--no-margin">Orders Management</h3>
      </div>
      <div className="vendor-card-body">
        {loading && <p className="bodytext-4--no-margin">Loading orders...</p>}
        {error && <p className="bodytext-4--no-margin" style={{ color: "#dc3545" }}>{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm vendor-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Currency</th>
                  <th>Quantity</th>
                  <th>Customer</th>
                  <th>Placed At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.status}</td>
                    <td>{o.totalAmount}</td>
                    <td>{o.currency}</td>
                    <td>{o.quantity}</td>
                    <td>{o.customerName || "-"}</td>
                    <td>{o.placedAt ? new Date(o.placedAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                      No orders assigned yet. Orders are assigned by Production Ops.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
