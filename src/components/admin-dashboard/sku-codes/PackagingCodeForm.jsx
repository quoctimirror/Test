import React, { useState } from "react";
import { skuCodesAPI } from "@/services/api";
import { useDropdownOptions } from "@/hooks/useDropdownOptions";
import CodeGenerationHelpModal from "./CodeGenerationHelpModal";
import "./CodeForms.css";

const PackagingCodeForm = ({ onCodeGenerated }) => {
  const [formData, setFormData] = useState({
    prefix: "",
    material: "",
    size: "",
    color: "",
    type: "",
    finish: "",
    countryOfOrigin: "",
    itemName: "",
    notes: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);

  // Fetch dropdown options
  const { options, loading: optionsLoading, error: optionsError } = useDropdownOptions();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Don't uppercase dropdown values (prefix, countryOfOrigin)
    if (name === "prefix" || name === "countryOfOrigin") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await skuCodesAPI.generatePackagingSku(formData);
      setResult(response.data);
      if (onCodeGenerated) {
        onCodeGenerated({
          ...response.data,
          type: "packaging",
          inputs: formData,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate SKU. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      prefix: "",
      material: "",
      size: "",
      color: "",
      type: "",
      finish: "",
      countryOfOrigin: "",
      itemName: "",
      notes: "",
    });
    setResult(null);
    setError(null);
  };

  const handleBulkFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    setBulkFile(file || null);
    setBulkError(null);
    setBulkResult(null);
  };

  const handleBulkGenerate = async () => {
    if (!bulkFile) {
      setBulkError("Please attach a CSV file with required columns including prefix and country_of_origin.");
      return;
    }

    setBulkLoading(true);
    setBulkError(null);

    try {
      const response = await skuCodesAPI.importPackagingSkus(bulkFile);
      setBulkResult(response.data);
      if (onCodeGenerated) {
        onCodeGenerated();
      }
    } catch (bulkException) {
      setBulkResult(null);
      setBulkError(
        bulkException.response?.data?.message ||
          "Failed to process the CSV file. Please verify the format."
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const helpSections = [
    {
      heading: "Required fields",
      items: [
        "Prefix and Country of Origin are required for all packaging SKUs.",
        "Prefix is selected from pre-configured options (BOX, BAG, TAG, etc.).",
        "Country of Origin options include China (CN), India (IN), Thailand (TH), and Hongkong (HK).",
      ],
    },
    {
      heading: "Optional details are flexible",
      items: [
        "Material, size, color, type, finish, and notes are optional—include only what matters.",
        "Inputs are automatically uppercased and stripped of spaces or special characters.",
        "Common packaging terms are abbreviated (LEATHERETTE → LTHRTTE, MICROFIBER → MF).",
      ],
    },
    {
      heading: "What happens after generation",
      items: [
        "Every successful result is saved with a unique barcode for MISA export.",
        "You can copy the SKU and barcode from the confirmation card or from the catalog history tab.",
      ],
    },
    {
      heading: "Length management",
      items: [
        "Codes cannot exceed 30 characters. The generator trims trailing segments if needed.",
        "If trimming is required, you will see the \"Truncated\" warning in the result card.",
      ],
    },
  ];

  if (optionsLoading) {
    return (
      <div className="code-form-container">
        <div className="loading-state">
          <p>Loading dropdown options...</p>
        </div>
      </div>
    );
  }

  if (optionsError) {
    return (
      <div className="code-form-container">
        <div className="error-state">
          <p>{optionsError}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="code-form-container">
      <div className="form-header-actions">
        <button
          type="button"
          className="code-help-button"
          onClick={() => setShowHelp(true)}
        >
          How packaging SKU generation works
        </button>
      </div>

      <form onSubmit={handleSubmit} className="code-form">
        <div className="form-section">
          <h3>Required Fields</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="prefix">
                Prefix <span className="required">*</span>
              </label>
              <select
                id="prefix"
                name="prefix"
                value={formData.prefix}
                onChange={handleInputChange}
                required
              >
                <option value="">Select prefix...</option>
                {options.prefixes.map((opt) => (
                  <option key={opt.id} value={opt.code}>
                    {opt.name} ({opt.code})
                  </option>
                ))}
              </select>
              <span className="hint">Packaging category (e.g., BOX, BAG)</span>
            </div>

            <div className="form-group">
              <label htmlFor="countryOfOrigin">
                Country of Origin <span className="required">*</span>
              </label>
              <select
                id="countryOfOrigin"
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleInputChange}
                required
              >
                <option value="">Select country...</option>
                {options.countries.map((opt) => (
                  <option key={opt.id} value={opt.code}>
                    {opt.name} ({opt.code})
                  </option>
                ))}
              </select>
              <span className="hint">Manufacturing country</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Optional Fields</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="material">Material</label>
              <input
                type="text"
                id="material"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                placeholder="MICROFIBER, LEATHERETTE"
              />
              <span className="hint">Packaging material</span>
            </div>

            <div className="form-group">
              <label htmlFor="size">Size</label>
              <input
                type="text"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="LARGE, SMALL, MEDIUM"
              />
              <span className="hint">Package size</span>
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="NAVY, RED, BRIGHTSILVER"
              />
              <span className="hint">Package color</span>
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="RING, NECKLACE, BRACELET"
              />
              <span className="hint">Intended product type</span>
            </div>

            <div className="form-group">
              <label htmlFor="finish">Finish</label>
              <input
                type="text"
                id="finish"
                name="finish"
                value={formData.finish}
                onChange={handleInputChange}
                placeholder="MATTE, GLOSSY"
              />
              <span className="hint">Surface finish</span>
            </div>

            <div className="form-group">
              <label htmlFor="itemName">
                Item Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="e.g., Ring Box"
                required
              />
              <span className="hint">Descriptive product name</span>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <input
                type="text"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional specifications"
              />
              <span className="hint">Extra details</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Generating..." : "Generate SKU"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset Form
          </button>
        </div>
      </form>

      {error && (
        <div className="code-result error">
          <div className="result-header">
            <span className="result-icon">❌</span>
            <h4>Error</h4>
          </div>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="code-result success">
          <div className="result-header">
            <span className="result-icon">✅</span>
            <h4>Generated SKU</h4>
          </div>
          <div className="result-code-display">
            <code className="generated-code">{result.code}</code>
            <button
              className="btn-copy"
              onClick={() => navigator.clipboard.writeText(result.code)}
            >
              📋 Copy
            </button>
          </div>
          {result.barcode && (
            <div className="result-code-display">
              <code className="generated-barcode">{result.barcode}</code>
              <button
                className="btn-copy"
                onClick={() => navigator.clipboard.writeText(result.barcode)}
              >
                📋 Copy Barcode
              </button>
            </div>
          )}
          <div className="result-details">
            <div className="result-detail-item">
              <span className="detail-label">Length:</span>
              <span className="detail-value">
                {result.length} / 30 characters
              </span>
            </div>
            <div className="result-detail-item">
              <span className="detail-label">Truncated:</span>
              <span className={`detail-value ${result.truncated ? "warning" : ""}`}>
                {result.truncated ? "Yes ⚠️" : "No"}
              </span>
            </div>
            <div className="result-detail-item">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{result.description}</span>
            </div>
          </div>
        </div>
      )}

      <CodeGenerationHelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Packaging SKU Rules"
        sections={helpSections}
        footer="Prefix and Country of Origin are now required for all packaging SKUs."
      />

      <div className="bulk-upload-section">
        <div className="bulk-upload-header">
          <div>
            <h3>Bulk Generate from CSV</h3>
            <p>
              Upload a CSV file with required columns: prefix, country_of_origin, <strong>item_name</strong>, and optional columns: material, size, color, type, finish, notes.{" "}
              <a
                href="/api/sku-codes/templates/packaging"
                download="packaging_items_template.csv"
                style={{color: '#007bff', textDecoration: 'underline'}}
              >
                Download CSV Template
              </a>
            </p>
          </div>
        </div>
        <div className="bulk-upload-controls">
          <input
            type="file"
            accept=".csv"
            onChange={handleBulkFileChange}
            className="bulk-upload-input"
          />
          <button
            type="button"
            className="btn-primary"
            onClick={handleBulkGenerate}
            disabled={bulkLoading}
          >
            {bulkLoading ? "Processing..." : "Generate SKUs from CSV"}
          </button>
        </div>

        {bulkError && <div className="bulk-upload-error">{bulkError}</div>}

        {bulkResult && (
          <div className="bulk-upload-summary">
            <p>
              Generated {bulkResult.successCount} of {bulkResult.totalRows} rows.
              {bulkResult.failureCount > 0 && " Some rows could not be processed."}
            </p>
            {Array.isArray(bulkResult.generatedCodes) &&
              bulkResult.generatedCodes.length > 0 && (
                <div className="bulk-upload-codes">
                  <h4>Sample SKUs</h4>
                  <ul>
                    {bulkResult.generatedCodes.slice(0, 5).map((item) => (
                      <li key={item.skuCode}>
                        <code>{item.skuCode}</code>
                        {item.barcode && <span className="barcode-preview"> • Barcode: {item.barcode}</span>}
                        {item.itemName ? ` – ${item.itemName}` : ""}
                      </li>
                    ))}
                  </ul>
                  {bulkResult.generatedCodes.length > 5 && (
                    <p className="bulk-upload-note">
                      Showing first 5 of {bulkResult.generatedCodes.length} SKUs.
                    </p>
                  )}
                  <p className="bulk-upload-note">
                    All generated SKUs with unique barcodes are saved in the Generated SKUs tab.
                  </p>
                </div>
              )}
            {bulkResult.errors && bulkResult.errors.length > 0 && (
              <details className="bulk-upload-errors">
                <summary>View {bulkResult.errors.length} import notices</summary>
                <ul>
                  {bulkResult.errors.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagingCodeForm;
