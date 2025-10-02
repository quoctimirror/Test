import { useState, useEffect } from "react";
import { vendorsAPI, handleAPIError } from "@services/api";

const VendorProducts = ({ vendorInfo }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (vendorInfo) {
      fetchVendorProducts();
    }
  }, [vendorInfo]);

  const fetchVendorProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user's vendor products through vendor API
      const response = await vendorsAPI.getCurrentVendorProducts();
      setProducts(response.data || []);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to load vendor products");
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    return (
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(price || 0);
  };

  if (!vendorInfo) {
    return (
      <div className="vendor-card">
        <div className="vendor-card-body" style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🏢</div>
          <h3>No Vendor Account</h3>
          <p>Unable to load products without vendor information.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vendor-card">
        <div className="vendor-card-body" style={{ textAlign: "center", padding: "3rem" }}>
          Loading your products...
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="vendor-card" style={{ marginBottom: "1rem", backgroundColor: "#fee" }}>
          <div className="vendor-card-body" style={{ color: "#c53030" }}>
            {error}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="vendor-card" style={{ marginBottom: "1.5rem" }}>
        <div className="vendor-card-body">
          <input
            type="text"
            placeholder="Search your products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="vendor-card">
        <div className="vendor-card-header">
          <h3 className="vendor-card-title">
            My Products ({filteredProducts.length})
            {vendorInfo && (
              <span style={{ fontSize: "14px", color: "#666", fontWeight: "normal", marginLeft: "0.5rem" }}>
                - {vendorInfo.name} ({vendorInfo.code})
              </span>
            )}
          </h3>
        </div>
        <div className="vendor-card-body" style={{ padding: 0 }}>
          {filteredProducts.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#6c757d" }}>
              {searchTerm ? "No products found matching your search." : "You don't have any products yet."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ margin: 0, tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40%', textAlign: 'left' }}>Product</th>
                    <th style={{ width: '15%', textAlign: 'left' }}>SKU</th>
                    <th style={{ width: '15%', textAlign: 'left' }}>Category</th>
                    <th style={{ width: '12%', textAlign: 'left' }}>Stock</th>
                    <th style={{ width: '10%', textAlign: 'left' }}>Status</th>
                    <th style={{ width: '8%', textAlign: 'left' }}>Featured</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "4px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: "500" }}>{product.name}</div>
                            {product.description && (
                              <div style={{ fontSize: "12px", color: "#666", maxWidth: "200px" }}>
                                {product.description.length > 50 
                                  ? product.description.substring(0, 50) + "..."
                                  : product.description
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <code style={{
                          background: "#f8f9fa",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}>
                          {product.sku}
                        </code>
                      </td>
                      <td>{product.category?.name || "No Category"}</td>
                      <td>
                        <span style={{
                          color: product.stockQuantity <= product.minStockLevel ? "#dc3545" : "#28a745",
                          fontWeight: "500",
                        }}>
                          {product.stockQuantity || 0}
                        </span>
                        {product.stockQuantity <= product.minStockLevel && (
                          <span style={{
                            fontSize: "12px",
                            color: "#dc3545",
                            marginLeft: "4px",
                          }}>
                            Low
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: product.status === "ACTIVE" ? "#d4edda" : "#f8d7da",
                          color: product.status === "ACTIVE" ? "#155724" : "#721c24",
                        }}>
                          {product.status || "ACTIVE"}
                        </span>
                      </td>
                      <td>
                        {product.featured ? (
                          <span style={{ color: "#bc224c", fontWeight: "500" }}> Yes</span>
                        ) : (
                          <span style={{ color: "#666" }}>No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;