import { useState, useEffect } from "react";
import {
  vendorsAPI,
  handleAPIError,
} from "@services/api";

const VendorsManager = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedVendorType, setSelectedVendorType] = useState("all");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    country: "",
    countryOfOrigin: "",
    paymentTerms: "",
    commissionTerm: "",
    importTaxPercent: "",
    vatTaxPercent: "",
    taxCustomsPercent: "",
    shippingFee: "",
    avgLaborCostPerPiece: "",
    avgProductCost: "",
    productionLeadTimeDays: "",
    vendorType: "PARTS_ONLY",
    laborCostFactors: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  // Vendor types for dropdown
  const vendorTypes = [
    { value: "PARTS_ONLY", label: "Parts Only" },
    { value: "WHOLE_PIECE_ONLY", label: "Whole Piece Only" },
    { value: "BOTH", label: "Both" },
  ];

  // Common countries for dropdown
  const countries = [
    "Vietnam", "China", "India", "Thailand", "Myanmar", "Indonesia", 
    "Malaysia", "Philippines", "Singapore", "South Korea", "Japan", "Other"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await vendorsAPI.getAll();
      setVendors(response.data || []);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to load vendors");
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      country: "",
      countryOfOrigin: "",
      paymentTerms: "",
      commissionTerm: "",
      importTaxPercent: "",
      vatTaxPercent: "",
      taxCustomsPercent: "",
      shippingFee: "",
      avgLaborCostPerPiece: "",
      avgProductCost: "",
      productionLeadTimeDays: "",
      vendorType: "PARTS_ONLY",
      laborCostFactors: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
    });
    setEditingVendor(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (vendor) => {
    setFormData({
      code: vendor.code || "",
      name: vendor.name || "",
      country: vendor.country || "",
      countryOfOrigin: vendor.countryOfOrigin || "",
      paymentTerms: vendor.paymentTerms || "",
      commissionTerm: vendor.commissionTerm || "",
      importTaxPercent: vendor.importTaxPercent?.toString() || "",
      vatTaxPercent: vendor.vatTaxPercent?.toString() || "",
      taxCustomsPercent: vendor.taxCustomsPercent?.toString() || "",
      shippingFee: vendor.shippingFee?.toString() || "",
      avgLaborCostPerPiece: vendor.avgLaborCostPerPiece?.toString() || "",
      avgProductCost: vendor.avgProductCost?.toString() || "",
      productionLeadTimeDays: vendor.productionLeadTimeDays?.toString() || "",
      vendorType: vendor.vendorType || "PARTS_ONLY",
      laborCostFactors: vendor.laborCostFactors || "",
      contactPerson: vendor.contactPerson || "",
      contactEmail: vendor.contactEmail || "",
      contactPhone: vendor.contactPhone || "",
      address: vendor.address || "",
    });
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        ...formData,
        importTaxPercent: formData.importTaxPercent ? parseFloat(formData.importTaxPercent) : null,
        vatTaxPercent: formData.vatTaxPercent ? parseFloat(formData.vatTaxPercent) : null,
        taxCustomsPercent: formData.taxCustomsPercent ? parseFloat(formData.taxCustomsPercent) : null,
        shippingFee: formData.shippingFee ? parseFloat(formData.shippingFee) : null,
        avgLaborCostPerPiece: formData.avgLaborCostPerPiece ? parseFloat(formData.avgLaborCostPerPiece) : null,
        avgProductCost: formData.avgProductCost ? parseFloat(formData.avgProductCost) : null,
        productionLeadTimeDays: formData.productionLeadTimeDays ? parseInt(formData.productionLeadTimeDays) : null,
      };

      if (editingVendor) {
        await vendorsAPI.update(editingVendor.id, submitData);
      } else {
        await vendorsAPI.create(submitData);
      }

      await fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to save vendor");
      setError(errorInfo.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) {
      return;
    }

    try {
      await vendorsAPI.delete(id);
      await fetchData();
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to delete vendor");
      setError(errorInfo.message);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this vendor?")) {
      return;
    }

    try {
      await vendorsAPI.deactivate(id);
      await fetchData();
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to deactivate vendor");
      setError(errorInfo.message);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry =
      selectedCountry === "all" || vendor.country === selectedCountry;
    
    const matchesVendorType =
      selectedVendorType === "all" || vendor.vendorType === selectedVendorType;
    
    return matchesSearch && matchesCountry && matchesVendorType;
  });

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getVendorTypeLabel = (type) => {
    const typeMap = {
      PARTS_ONLY: "Parts Only",
      WHOLE_PIECE_ONLY: "Whole Piece Only",
      BOTH: "Both",
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div
        className="admin-card"
        style={{ padding: "3rem", textAlign: "center" }}
      >
        <div>Loading vendors...</div>
      </div>
    );
  }

  return (
    <div className="vendors-manager">
      {error && (
        <div
          className="admin-card"
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: "#fee",
            borderColor: "#feb2b2",
          }}
        >
          <div style={{ color: "#c53030" }}>{error}</div>
        </div>
      )}

      {/* Header Controls */}
      <div
        className="admin-card"
        style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "300px" }}
          >
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ flex: 1 }}
            />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="admin-input"
              style={{ width: "150px" }}
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <select
              value={selectedVendorType}
              onChange={(e) => setSelectedVendorType(e.target.value)}
              className="admin-input"
              style={{ width: "150px" }}
            >
              <option value="all">All Types</option>
              {vendorTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="admin-button admin-button-primary"
            title="Add Vendor"
          >
            +
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Country</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Avg Cost</th>
              <th>Lead Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>
                  <code
                    style={{
                      background: "#f8f9fa",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {vendor.code}
                  </code>
                </td>
                <td>
                  <div style={{ fontWeight: "500" }}>{vendor.name}</div>
                  {vendor.countryOfOrigin && vendor.countryOfOrigin !== vendor.country && (
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      Origin: {vendor.countryOfOrigin}
                    </div>
                  )}
                </td>
                <td>{vendor.country}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500",
                      backgroundColor: vendor.vendorType === "BOTH" ? "#e7f3ff" : 
                                     vendor.vendorType === "PARTS_ONLY" ? "#fff3cd" : "#d4edda",
                      color: vendor.vendorType === "BOTH" ? "#0066cc" : 
                             vendor.vendorType === "PARTS_ONLY" ? "#856404" : "#155724",
                    }}
                  >
                    {getVendorTypeLabel(vendor.vendorType)}
                  </span>
                </td>
                <td>
                  <div>{vendor.contactPerson || "N/A"}</div>
                  {vendor.contactEmail && (
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {vendor.contactEmail}
                    </div>
                  )}
                </td>
                <td>{formatCurrency(vendor.avgProductCost)}</td>
                <td>
                  {vendor.productionLeadTimeDays ? `${vendor.productionLeadTimeDays} days` : "N/A"}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="admin-button admin-button-outline"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "12px" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(vendor.id)}
                      className="admin-button admin-button-secondary"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "12px" }}
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="admin-button"
                      style={{
                        padding: "0.25rem 0.5rem",
                        fontSize: "12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVendors.length === 0 && (
          <div
            style={{ padding: "3rem", textAlign: "center", color: "#6c757d" }}
          >
            No vendors found.{" "}
            {searchTerm || selectedCountry !== "all" || selectedVendorType !== "all"
              ? "Try adjusting your filters."
              : "Add your first vendor to get started."}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "2rem", maxHeight: "80vh", overflowY: "auto" }}>
              <h2
                style={{
                  margin: "0 0 1.5rem 0",
                  fontSize: "24px",
                  fontWeight: "600",
                }}
              >
                {editingVendor ? "Edit Vendor" : "Add New Vendor"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {/* Basic Information */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Vendor Code *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                        className="admin-input"
                        required
                        placeholder="e.g., VEN001"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Vendor Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="admin-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Country *
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="admin-input"
                        required
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Country of Origin
                      </label>
                      <select
                        value={formData.countryOfOrigin}
                        onChange={(e) =>
                          setFormData({ ...formData, countryOfOrigin: e.target.value })
                        }
                        className="admin-input"
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Vendor Type *
                      </label>
                      <select
                        value={formData.vendorType}
                        onChange={(e) =>
                          setFormData({ ...formData, vendorType: e.target.value })
                        }
                        className="admin-input"
                        required
                      >
                        {vendorTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Import Tax (%)
                      </label>
                      <input
                        type="number"
                        value={formData.importTaxPercent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            importTaxPercent: e.target.value,
                          })
                        }
                        className="admin-input"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        VAT Tax (%)
                      </label>
                      <input
                        type="number"
                        value={formData.vatTaxPercent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vatTaxPercent: e.target.value,
                          })
                        }
                        className="admin-input"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Customs Tax (%)
                      </label>
                      <input
                        type="number"
                        value={formData.taxCustomsPercent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            taxCustomsPercent: e.target.value,
                          })
                        }
                        className="admin-input"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Cost Information */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Shipping Fee ($)
                      </label>
                      <input
                        type="number"
                        value={formData.shippingFee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shippingFee: e.target.value,
                          })
                        }
                        className="admin-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Avg Labor Cost ($)
                      </label>
                      <input
                        type="number"
                        value={formData.avgLaborCostPerPiece}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            avgLaborCostPerPiece: e.target.value,
                          })
                        }
                        className="admin-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Avg Product Cost ($)
                      </label>
                      <input
                        type="number"
                        value={formData.avgProductCost}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            avgProductCost: e.target.value,
                          })
                        }
                        className="admin-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Lead Time (Days)
                      </label>
                      <input
                        type="number"
                        value={formData.productionLeadTimeDays}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            productionLeadTimeDays: e.target.value,
                          })
                        }
                        className="admin-input"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Payment Terms
                      </label>
                      <input
                        type="text"
                        value={formData.paymentTerms}
                        onChange={(e) =>
                          setFormData({ ...formData, paymentTerms: e.target.value })
                        }
                        className="admin-input"
                        placeholder="e.g., Net 30, 50% advance"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Commission Term
                      </label>
                      <input
                        type="text"
                        value={formData.commissionTerm}
                        onChange={(e) =>
                          setFormData({ ...formData, commissionTerm: e.target.value })
                        }
                        className="admin-input"
                        placeholder="Commission structure"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) =>
                          setFormData({ ...formData, contactPerson: e.target.value })
                        }
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, contactEmail: e.target.value })
                        }
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, contactPhone: e.target.value })
                        }
                        className="admin-input"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="admin-input"
                      rows="3"
                      placeholder="Full address of the vendor"
                    />
                  </div>

                  {/* Labor Cost Factors */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Labor Cost Factors
                    </label>
                    <textarea
                      value={formData.laborCostFactors}
                      onChange={(e) =>
                        setFormData({ ...formData, laborCostFactors: e.target.value })
                      }
                      className="admin-input"
                      rows="2"
                      placeholder="Additional labor cost factors or notes"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "2rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="admin-button admin-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-button admin-button-primary"
                  >
                    {editingVendor ? "Update Vendor" : "Create Vendor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsManager;