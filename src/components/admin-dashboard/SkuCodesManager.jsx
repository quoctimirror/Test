import React, { useState, useEffect, useCallback } from "react";
import JewelryCodeForm from "./sku-codes/JewelryCodeForm";
import PackagingCodeForm from "./sku-codes/PackagingCodeForm";
import CodeSearch from "./sku-codes/CodeSearch";
import { skuCodesAPI } from "@/services/api";
import "./SkuCodesManager.css";

const DEFAULT_PAGE_SIZE = 25;

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }

  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(numberValue);
};

const SkuCodesManager = () => {
  const [activeTab, setActiveTab] = useState("jewelry");
  const [generatedSkus, setGeneratedSkus] = useState([]);
  const [generatedMeta, setGeneratedMeta] = useState({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    totalPages: 0,
    totalElements: 0,
  });
  const [generatedLoading, setGeneratedLoading] = useState(false);
  const [generatedError, setGeneratedError] = useState(null);

  const fetchGeneratedSkus = useCallback(
    async ({ page, size } = {}) => {
      const nextPage = page ?? 0;
      const nextSize = size ?? generatedMeta.size;

      setGeneratedLoading(true);
      setGeneratedError(null);

      try {
        const response = await skuCodesAPI.getGeneratedSkus({
          page: nextPage,
          size: nextSize,
          sortBy: "createdAt",
          direction: "DESC",
        });

        const data = response.data || {};
        setGeneratedSkus(data.codes || []);
        setGeneratedMeta({
          page: data.page ?? nextPage,
          size: data.size ?? nextSize,
          totalPages: data.totalPages ?? 0,
          totalElements: data.totalElements ?? 0,
        });
      } catch (error) {
        setGeneratedError(
          error.response?.data?.message ||
            "Failed to load generated SKUs. Please try again."
        );
      } finally {
        setGeneratedLoading(false);
      }
    },
    [generatedMeta.size]
  );

  useEffect(() => {
    if (activeTab === "history") {
      fetchGeneratedSkus({ page: 0 });
    }
  }, [activeTab, fetchGeneratedSkus]);

  const handleSkuGenerated = useCallback(() => {
    if (activeTab === "history") {
      fetchGeneratedSkus({ page: 0 });
    }
  }, [activeTab, fetchGeneratedSkus]);

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    if (Number.isNaN(newSize)) {
      return;
    }
    fetchGeneratedSkus({ page: 0, size: newSize });
  };

  const goToPreviousPage = () => {
    if (generatedMeta.page === 0) {
      return;
    }
    fetchGeneratedSkus({ page: generatedMeta.page - 1 });
  };

  const goToNextPage = () => {
    if (generatedMeta.page >= generatedMeta.totalPages - 1) {
      return;
    }
    fetchGeneratedSkus({ page: generatedMeta.page + 1 });
  };

  const handleRefresh = () => {
    fetchGeneratedSkus({ page: generatedMeta.page });
  };

  const handleCopySku = (sku) => {
    if (!sku || !navigator?.clipboard) {
      return;
    }
    navigator.clipboard.writeText(sku).catch(() => {
      // Clipboard write failures are non-fatal; silently ignore.
    });
  };

  const handleCopyBarcode = (barcode) => {
    if (!barcode || !navigator?.clipboard) {
      return;
    }
    navigator.clipboard.writeText(barcode).catch(() => {
      // Clipboard write failures are non-fatal; silently ignore.
    });
  };

  const handleExportToMisa = async () => {
    try {
      setGeneratedLoading(true);
      setGeneratedError(null);

      const response = await skuCodesAPI.exportAllToMisa();

      // Extract filename from Content-Disposition header
      let filename = 'MISA_Import.xls';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up
      window.URL.revokeObjectURL(url);

    } catch (error) {
      setGeneratedError(
        error.response?.data?.message ||
          "Failed to export to MISA template. Please try again."
      );
    } finally {
      setGeneratedLoading(false);
    }
  };

  const tabs = [
    { id: "jewelry", label: "Generate Jewelry SKU" },
    { id: "packaging", label: "Generate Packaging SKU" },
    { id: "history", label: "Generated SKUs" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "jewelry":
        return <JewelryCodeForm onCodeGenerated={handleSkuGenerated} />;
      case "packaging":
        return <PackagingCodeForm onCodeGenerated={handleSkuGenerated} />;
      case "history":
        return (
          <div className="generated-codes-tab">
            <div className="generated-codes-search">
              <CodeSearch />
            </div>

            <div className="generated-codes-section">
              <div className="generated-codes-header">
                <div>
                  <h3>Generated SKUs</h3>
                  <p className="generated-codes-subtitle">
                    Showing SKUs saved in the mirror_products catalog (newest first)
                  </p>
                </div>

                <div className="generated-codes-controls">
                  <label className="generated-page-size">
                    <span>Results per page:</span>
                    <select
                      value={generatedMeta.size}
                      onChange={handlePageSizeChange}
                      disabled={generatedLoading}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    className="generated-refresh-btn"
                    onClick={handleRefresh}
                    disabled={generatedLoading}
                  >
                    {generatedLoading ? "Refreshing..." : "Refresh"}
                  </button>

                  <button
                    type="button"
                    className="generated-export-misa-btn"
                    onClick={handleExportToMisa}
                    disabled={generatedLoading || generatedSkus.length === 0}
                    title="Download MISA Import Template"
                  >
                    📥 Export to MISA
                  </button>
                </div>
              </div>

              {generatedError ? (
                <div className="generated-codes-error">
                  <div>
                    <strong>Unable to load generated SKUs.</strong>
                    <p>{generatedError}</p>
                  </div>
                  <button type="button" onClick={handleRefresh}>
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="generated-codes-table-wrapper">
                    <table className="generated-codes-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Barcode</th>
                          <th>Item Name</th>
                          <th>Category</th>
                          <th>MISA Item Code</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedLoading ? (
                          <tr>
                            <td colSpan="8" className="generated-table-message">
                              Loading generated SKUs...
                            </td>
                          </tr>
                        ) : generatedSkus.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="generated-table-message">
                              No generated SKUs found.
                            </td>
                          </tr>
                        ) : (
                          generatedSkus.map((item) => (
                            <tr key={item.skuCode}>
                              <td>
                                <div className="generated-code-cell">
                                  <code>{item.skuCode}</code>
                                  <button
                                    type="button"
                                    className="btn-copy-small"
                                    onClick={() => handleCopySku(item.skuCode)}
                                    title="Copy SKU"
                                  >
                                    📋
                                  </button>
                                </div>
                              </td>
                              <td>
                                {item.barcode ? (
                                  <div className="generated-code-cell">
                                    <code>{item.barcode}</code>
                                    <button
                                      type="button"
                                      className="btn-copy-small"
                                      onClick={() => handleCopyBarcode(item.barcode)}
                                      title="Copy Barcode"
                                    >
                                      📋
                                    </button>
                                  </div>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td>{item.itemName || "—"}</td>
                              <td>{item.category || "—"}</td>
                              <td>{item.misaItemCode || "—"}</td>
                              <td>{
                                item.currentQuantity !== null && item.currentQuantity !== undefined
                                  ? item.currentQuantity
                                  : "—"
                              }</td>
                              <td>{formatCurrency(item.price)}</td>
                              <td>{formatDateTime(item.createdAt)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="generated-codes-pagination">
                    <button
                      type="button"
                      className="generated-page-btn"
                      onClick={goToPreviousPage}
                      disabled={generatedLoading || generatedMeta.page === 0}
                    >
                      ← Previous
                    </button>

                    <span className="generated-page-info">
                      Page {generatedMeta.totalPages === 0 ? 0 : generatedMeta.page + 1} of {generatedMeta.totalPages}
                      <span className="generated-total-count">
                        ({generatedMeta.totalElements} total)
                      </span>
                    </span>

                    <button
                      type="button"
                      className="generated-page-btn"
                      onClick={goToNextPage}
                      disabled={
                        generatedLoading ||
                        generatedMeta.totalPages === 0 ||
                        generatedMeta.page >= generatedMeta.totalPages - 1
                      }
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sku-codes-manager">
      <div className="sku-codes-header">
        <h2>SKU Generator & Search</h2>
        <p className="sku-codes-description">
          Generate standardized product SKUs for jewelry and packaging, then browse or search the catalog of existing SKUs.
        </p>
      </div>

      <div className="sku-codes-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="sku-codes-content">{renderTabContent()}</div>
    </div>
  );
};

export default SkuCodesManager;
