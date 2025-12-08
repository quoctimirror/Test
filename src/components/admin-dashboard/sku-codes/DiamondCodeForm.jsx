import React, { useState } from "react";
import { diamondsAPI } from "@/services/api";

const DiamondCodeForm = ({ onCodeGenerated }) => {
  const [formData, setFormData] = useState({
    color: "",
    clarity: "",
    caratWeight: "",
    shape: "RD",
    originCountry: "IN",
    manufacturerCode: "",
    manufacturerName: "",
    manufacturerSerial: "",
    certNumber: "",
    certLab: "IGI",
    certUrl: "",
    unitPriceUsd: "",
    totalPriceUsd: "",
    invoiceNumber: "",
    invoiceDate: "",
    customsDeclaration: "",
    importDate: "",
    location: "Main Warehouse",
    notes: "",
  });

  const [generatedSku, setGeneratedSku] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const colorOptions = ["D", "E", "F", "G", "H", "I", "J", "K"];
  const clarityOptions = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"];
  const shapeOptions = [
    { value: "RD", label: "Round" },
    { value: "PR", label: "Princess" },
    { value: "CU", label: "Cushion" },
    { value: "EM", label: "Emerald" },
    { value: "OV", label: "Oval" },
    { value: "PE", label: "Pear" },
    { value: "RA", label: "Radiant" },
    { value: "AS", label: "Asscher" },
    { value: "MQ", label: "Marquise" },
    { value: "HT", label: "Heart" },
  ];
  const certLabOptions = ["IGI", "GIA", "HRD", "AGS"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateSku = async () => {
    setLoading(true);
    setError(null);
    setGeneratedSku(null);

    try {
      const skuRequest = {
        color: formData.color,
        clarity: formData.clarity,
        caratWeight: parseFloat(formData.caratWeight),
        shape: formData.shape,
        origin: formData.originCountry,
        manufacturerCode: formData.manufacturerCode,
        certNumber: formData.certNumber,
      };

      const response = await diamondsAPI.generateSku(skuRequest);
      setGeneratedSku(response.data);

      if (!response.data.isUnique) {
        setError("Warning: This SKU already exists in the system");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate SKU. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiamond = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const diamondRequest = {
        ...formData,
        caratWeight: parseFloat(formData.caratWeight),
        unitPriceUsd: formData.unitPriceUsd ? parseFloat(formData.unitPriceUsd) : null,
        totalPriceUsd: formData.totalPriceUsd ? parseFloat(formData.totalPriceUsd) : null,
      };

      await diamondsAPI.createDiamond(diamondRequest);
      setSuccess("Diamond created successfully!");

      // Reset form
      setFormData({
        color: "",
        clarity: "",
        caratWeight: "",
        shape: "RD",
        originCountry: "IN",
        manufacturerCode: "",
        manufacturerName: "",
        manufacturerSerial: "",
        certNumber: "",
        certLab: "IGI",
        certUrl: "",
        unitPriceUsd: "",
        totalPriceUsd: "",
        invoiceNumber: "",
        invoiceDate: "",
        customsDeclaration: "",
        importDate: "",
        location: "Main Warehouse",
        notes: "",
      });
      setGeneratedSku(null);

      // Notify parent to refresh the list
      if (onCodeGenerated) {
        onCodeGenerated();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create diamond. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#0f172a" }}>
          Mirror Diamond SKU Format
        </h3>
        <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <code style={{ fontSize: "0.875rem", fontFamily: "monospace" }}>
            LGD-[COLOR][CLARITY]-[CARAT]-[SHAPE]-[ORIGIN]-[MFR]-[CERT]
          </code>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.5rem" }}>
            Example: <strong>LGD-FVS1-213-RD-IN-KARP-493218</strong>
          </p>
        </div>
      </div>

      {/* Basic Diamond Information */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "1rem", color: "#0f172a" }}>
          Diamond Specifications
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <div>
            <label className="admin-label">Color *</label>
            <select
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="admin-select"
              required
            >
              <option value="">Select Color</option>
              {colorOptions.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="admin-label">Clarity *</label>
            <select
              name="clarity"
              value={formData.clarity}
              onChange={handleChange}
              className="admin-select"
              required
            >
              <option value="">Select Clarity</option>
              {clarityOptions.map((clarity) => (
                <option key={clarity} value={clarity}>{clarity}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="admin-label">Carat Weight *</label>
            <input
              type="number"
              name="caratWeight"
              value={formData.caratWeight}
              onChange={handleChange}
              className="admin-input"
              placeholder="2.13"
              step="0.01"
              min="0.01"
              max="99.99"
              required
            />
          </div>

          <div>
            <label className="admin-label">Shape *</label>
            <select
              name="shape"
              value={formData.shape}
              onChange={handleChange}
              className="admin-select"
              required
            >
              {shapeOptions.map((shape) => (
                <option key={shape.value} value={shape.value}>{shape.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="admin-label">Origin Country *</label>
            <input
              type="text"
              name="originCountry"
              value={formData.originCountry}
              onChange={handleChange}
              className="admin-input"
              placeholder="IN"
              maxLength="2"
              required
            />
          </div>

          <div>
            <label className="admin-label">Manufacturer Code *</label>
            <input
              type="text"
              name="manufacturerCode"
              value={formData.manufacturerCode}
              onChange={handleChange}
              className="admin-input"
              placeholder="KARP"
              maxLength="10"
              required
            />
          </div>
        </div>
      </div>

      {/* Certificate Information */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "1rem", color: "#0f172a" }}>
          Certification
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <div>
            <label className="admin-label">Certificate Number *</label>
            <input
              type="text"
              name="certNumber"
              value={formData.certNumber}
              onChange={handleChange}
              className="admin-input"
              placeholder="636493218"
              maxLength="20"
              required
            />
          </div>

          <div>
            <label className="admin-label">Certificate Lab *</label>
            <select
              name="certLab"
              value={formData.certLab}
              onChange={handleChange}
              className="admin-select"
              required
            >
              {certLabOptions.map((lab) => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="admin-label">Certificate URL</label>
            <input
              type="url"
              name="certUrl"
              value={formData.certUrl}
              onChange={handleChange}
              className="admin-input"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Manufacturer Details */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "1rem", color: "#0f172a" }}>
          Manufacturer Details
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          <div>
            <label className="admin-label">Manufacturer Name</label>
            <input
              type="text"
              name="manufacturerName"
              value={formData.manufacturerName}
              onChange={handleChange}
              className="admin-input"
              placeholder="KARP IMPEX LIMITED"
            />
          </div>

          <div>
            <label className="admin-label">Manufacturer Serial</label>
            <input
              type="text"
              name="manufacturerSerial"
              value={formData.manufacturerSerial}
              onChange={handleChange}
              className="admin-input"
              placeholder="1146846"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Import */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "1rem", color: "#0f172a" }}>
          Pricing & Import Information
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <div>
            <label className="admin-label">Unit Price (USD)</label>
            <input
              type="number"
              name="unitPriceUsd"
              value={formData.unitPriceUsd}
              onChange={handleChange}
              className="admin-input"
              placeholder="290.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="admin-label">Total Price (USD)</label>
            <input
              type="number"
              name="totalPriceUsd"
              value={formData.totalPriceUsd}
              onChange={handleChange}
              className="admin-input"
              placeholder="617.70"
              step="0.01"
            />
          </div>

          <div>
            <label className="admin-label">Invoice Number</label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="admin-input"
              placeholder="312521770"
            />
          </div>

          <div>
            <label className="admin-label">Invoice Date</label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Customs Declaration</label>
            <input
              type="text"
              name="customsDeclaration"
              value={formData.customsDeclaration}
              onChange={handleChange}
              className="admin-input"
              placeholder="107650143530"
            />
          </div>

          <div>
            <label className="admin-label">Import Date</label>
            <input
              type="date"
              name="importDate"
              value={formData.importDate}
              onChange={handleChange}
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="admin-input"
              placeholder="Main Warehouse"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label className="admin-label">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="admin-input"
          rows="3"
          placeholder="Additional notes about this diamond..."
        />
      </div>

      {/* Generate SKU Button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={handleGenerateSku}
          disabled={loading || !formData.color || !formData.clarity || !formData.caratWeight || !formData.certNumber}
          className="admin-button admin-button-secondary"
        >
          {loading ? "Generating..." : "Preview SKU Code"}
        </button>
      </div>

      {/* Generated SKU Preview */}
      {generatedSku && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h4 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#0f172a" }}>
            Generated SKU Code
          </h4>
          <code style={{ fontSize: "1rem", fontFamily: "monospace", fontWeight: "600" }}>
            {generatedSku.skuCode}
          </code>
          {!generatedSku.isUnique && (
            <p style={{ fontSize: "0.8125rem", color: "#dc2626", marginTop: "0.5rem" }}>
              ⚠️ Warning: This SKU already exists in the system
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", color: "#dc2626" }}>
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", color: "#166534" }}>
          {success}
        </div>
      )}

      {/* Create Diamond Button */}
      <button
        type="button"
        onClick={handleCreateDiamond}
        disabled={loading || !generatedSku || !generatedSku.isUnique}
        className="admin-button admin-button-primary"
      >
        {loading ? "Creating..." : "Create Diamond"}
      </button>
    </div>
  );
};

export default DiamondCodeForm;
