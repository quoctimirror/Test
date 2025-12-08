import React, { useState, useEffect } from "react";
import { productsAPI, fileUploadAPI } from "@/services/api";
import "./ProductFulfillment.css";

const ProductStatus = {
  DRAFT: "DRAFT",
  READY_FOR_RELEASE: "READY_FOR_RELEASE",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED"
};

const ProductFulfillment = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Image management
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const [fulfillmentData, setFulfillmentData] = useState({
    description: "",
    videoUrls: [],
    has3DModel: false,
    iJewel3DUrl: "",
    hasARTryOn: false,
    markReadyForRelease: false
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const showConfirmDialog = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  };

  const handleConfirmDialogClose = (confirmed) => {
    if (confirmed && confirmDialog?.onConfirm) {
      confirmDialog.onConfirm();
    }
    setConfirmDialog(null);
  };

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (filter === "pending") {
        response = await productsAPI.getPendingFulfillment();
      } else if (filter === "ready") {
        response = await productsAPI.getFulfilledDrafts();
      } else {
        response = await productsAPI.getDraft();
      }
      setProducts(response.data || response);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);

    // Load existing images
    const existingUrls = [];
    if (product.imageUrl && !product.imageUrl.includes('example.com')) {
      existingUrls.push(product.imageUrl);
    }
    if (Array.isArray(product.imageUrls)) {
      product.imageUrls.forEach(url => {
        if (url && !url.includes('example.com') && !existingUrls.includes(url)) {
          existingUrls.push(url);
        }
      });
    }
    setExistingImages(existingUrls);
    setImageFiles([]);

    setFulfillmentData({
      description: product.description || "",
      videoUrls: [],
      has3DModel: false,
      iJewel3DUrl: "",
      hasARTryOn: false,
      markReadyForRelease: false
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImageFiles(prev => [...prev, ...newImageFiles]);
  };

  const removeImage = (index, isExisting) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles(prev => {
        const newFiles = prev.filter((_, i) => i !== index);
        // Revoke the URL for the removed file
        if (prev[index]) {
          URL.revokeObjectURL(prev[index].preview);
        }
        return newFiles;
      });
    }
  };

  const moveImage = (index, direction, isExisting) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (isExisting) {
      const newArray = [...existingImages];
      [newArray[index], newArray[newIndex]] = [newArray[newIndex], newArray[index]];
      setExistingImages(newArray);
    } else {
      // Handle moving between existing and new
      const totalExisting = existingImages.length;
      const actualCurrentIndex = totalExisting + index;
      const actualNewIndex = direction === 'up' ? actualCurrentIndex - 1 : actualCurrentIndex + 1;

      if (actualNewIndex < totalExisting) {
        // Moving new image to existing array
        const [movedFile] = imageFiles.splice(index, 1);
        setExistingImages(prev => [...prev, movedFile.preview]);
        setImageFiles([...imageFiles]);
      } else if (actualCurrentIndex < totalExisting && actualNewIndex >= totalExisting) {
        // Moving existing image to new array
        const [movedUrl] = existingImages.splice(index, 1);
        setImageFiles(prev => [{file: null, preview: movedUrl}, ...prev]);
        setExistingImages([...existingImages]);
      } else {
        // Moving within new images
        const newArray = [...imageFiles];
        [newArray[index], newArray[newIndex - totalExisting]] = [newArray[newIndex - totalExisting], newArray[index]];
        setImageFiles(newArray);
      }
    }
  };

  const handleFulfill = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    setError(null);
    try {
      // Upload new images to S3
      let newUploadedUrls = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const uploadPromises = imageFiles.map(async (img) => {
          if (img.file) {
            try {
              const response = await fileUploadAPI.upload(img.file, "Product image", "mirror-storage", "products");
              return response.data.publicUrl || response.data.downloadUrl;
            } catch (err) {
              console.error("Failed to upload image:", err);
              return null;
            }
          }
          return img.preview; // Already a URL
        });
        newUploadedUrls = await Promise.all(uploadPromises);
        setUploadingImages(false);
      }

      // Combine all images
      const allImageUrls = [
        ...existingImages,
        ...newUploadedUrls.filter(url => url)
      ];

      // First image becomes imageUrl, rest go to imageUrls
      const imageUrl = allImageUrls[0] || "";
      const imageUrls = allImageUrls.length > 0 ? allImageUrls : [];

      const submitData = {
        description: fulfillmentData.description,
        imageUrl: imageUrl,
        imageUrls: imageUrls,
        // Keep existing product data
        name: selectedProduct.name,
        skuId: selectedProduct.skuId,
        price: selectedProduct.price || 0, // Default to 0 if not set
        currency: selectedProduct.currency || "VND",
        metalType: selectedProduct.metalType,
        metalPurity: selectedProduct.metalPurity,
        stoneType: selectedProduct.stoneType,
        weightGrams: selectedProduct.weightGrams,
        dimensions: selectedProduct.dimensions,
        tags: selectedProduct.tags,
        status: selectedProduct.status || "DRAFT",
        featured: selectedProduct.featured || false,
        stockQuantity: selectedProduct.stockQuantity || 0,
        minStockLevel: selectedProduct.minStockLevel || 1,
      };

      // Use the regular update endpoint instead of fulfill
      await productsAPI.update(selectedProduct.id, submitData);

      if (fulfillmentData.markReadyForRelease) {
        await productsAPI.markReadyForRelease(selectedProduct.id);
      }

      showNotification("Product fulfilled successfully!");
      setSelectedProduct(null);
      setExistingImages([]);
      setImageFiles([]);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fulfill product");
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleMarkReadyForRelease = async (productId) => {
    showConfirmDialog("Mark this product as ready for release?", async () => {
      setLoading(true);
      setError(null);
      try {
        await productsAPI.markReadyForRelease(productId);
        showNotification("Product marked as ready for release!");
        loadProducts();
        setSelectedProduct(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to mark product ready");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleArchive = async (productId) => {
    showConfirmDialog("Archive this product?", async () => {
      setLoading(true);
      setError(null);
      try {
        await productsAPI.archive(productId);
        showNotification("Product archived successfully!");
        loadProducts();
        setSelectedProduct(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to archive product");
      } finally {
        setLoading(false);
      }
    });
  };

  const addVideoUrl = () => {
    setFulfillmentData(prev => ({
      ...prev,
      videoUrls: [...prev.videoUrls, ""]
    }));
  };

  const updateVideoUrl = (index, value) => {
    setFulfillmentData(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const removeVideoUrl = (index) => {
    setFulfillmentData(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, i) => i !== index)
    }));
  };

  const getCompletionStatus = (product) => {
    const checks = {
      hasImages: (product.imageUrls?.length || 0) > 0 || product.imageUrl,
      hasDescription: product.description && product.description.length > 0
    };
    const completed = Object.values(checks).filter(Boolean).length;
    const total = Object.values(checks).length;
    return { completed, total, checks };
  };

  return (
    <div className="fulfillment-container">
      {error && (
        <div className="fulfillment-alert error">
          <span className="alert-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="fulfillment-header">
        <div className="header-title">
          <h1>Product Fulfillment</h1>
          <p>Complete product details for website publishing</p>
        </div>
        <div className="filter-tabs">
          <button
            onClick={() => setFilter("pending")}
            className={`filter-tab ${filter === "pending" ? "active" : ""}`}
          >
            Pending Fulfillment
            <span className="tab-count">{filter === "pending" ? products.length : ""}</span>
          </button>
          <button
            onClick={() => setFilter("ready")}
            className={`filter-tab ${filter === "ready" ? "active" : ""}`}
          >
            Ready to Release
            <span className="tab-count">{filter === "ready" ? products.length : ""}</span>
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
          >
            All Drafts
            <span className="tab-count">{filter === "all" ? products.length : ""}</span>
          </button>
          <button
            onClick={loadProducts}
            disabled={loading}
            className="refresh-button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C9.84171 2 11.4667 2.85429 12.5 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12.5 2V4.2H10.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="fulfillment-workspace">
        {/* Products List */}
        <div className="products-panel">
          <div className="panel-header">
            <h2>Products Queue</h2>
            <span className="queue-count">{products.length}</span>
          </div>
          <div className="products-list">
            {products.map((product) => {
              const status = getCompletionStatus(product);
              const progressPercent = (status.completed / status.total) * 100;

              return (
                <div
                  key={product.id}
                  className={`product-card ${selectedProduct?.id === product.id ? "selected" : ""}`}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="product-card-header">
                    <h3>{product.name}</h3>
                    <span className={`status-badge ${product.status.toLowerCase()}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="product-card-meta">
                    <span className="meta-item">SKU: {product.skuCode || "N/A"}</span>
                  </div>
                  <div className="completion-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="progress-text">{status.completed}/{status.total} completed</span>
                  </div>
                  <div className="completion-checklist">
                    <div className={`check-item ${status.checks.hasImages ? 'complete' : ''}`}>
                      <span className="check-icon">{status.checks.hasImages ? '✓' : '○'}</span>
                      Images
                    </div>
                    <div className={`check-item ${status.checks.hasDescription ? 'complete' : ''}`}>
                      <span className="check-icon">{status.checks.hasDescription ? '✓' : '○'}</span>
                      Description
                    </div>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && !loading && (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"/>
                  <path d="M32 20V44M20 32H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
                </svg>
                <p>No products pending fulfillment</p>
              </div>
            )}
          </div>
        </div>

        {/* Fulfillment Form */}
        <div className="fulfillment-panel">
          {selectedProduct ? (
            <div className="fulfillment-form-wrapper">
              <div className="panel-header">
                <div>
                  <h2>{selectedProduct.name}</h2>
                  <p className="product-subtitle">SKU: {selectedProduct.skuId}</p>
                </div>
                <button
                  className="close-button"
                  onClick={() => setSelectedProduct(null)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleFulfill} className="fulfillment-form">
                {/* Image Management */}
                <div className="form-section">
                  <div className="section-header">
                    <h3>Product Images</h3>
                    <span className="section-required">Required</span>
                  </div>
                  <p className="section-description">Upload high-quality product images. First image will be the main display image.</p>

                  <div className="image-upload-zone">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="image-upload" className="upload-trigger">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Click to upload images</span>
                      <span className="upload-hint">PNG, JPG up to 10MB each</span>
                    </label>
                  </div>

                  {(existingImages.length > 0 || imageFiles.length > 0) && (
                    <div className="image-gallery">
                      {/* Existing Images */}
                      {existingImages.map((url, index) => {
                        const actualIndex = index;
                        return (
                          <div key={`existing-${index}`} className={`gallery-item ${actualIndex === 0 ? 'main-image' : ''}`}>
                            {actualIndex === 0 && (
                              <div className="image-label main">MAIN</div>
                            )}
                            <div className="image-wrapper">
                              <img src={url} alt={`Product ${index + 1}`} />
                            </div>
                            <div className="image-controls">
                              {actualIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'up', true)}
                                  className="control-btn"
                                  title="Move up"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              {actualIndex < existingImages.length + imageFiles.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'down', true)}
                                  className="control-btn"
                                  title="Move down"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 4V12M8 12L4 8M8 12L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index, true)}
                                className="control-btn delete"
                                title="Delete"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* New Image Files */}
                      {imageFiles.map((img, index) => {
                        const actualIndex = existingImages.length + index;
                        return (
                          <div key={`new-${index}`} className={`gallery-item ${actualIndex === 0 ? 'main-image' : ''}`}>
                            {actualIndex === 0 && (
                              <div className="image-label main">MAIN</div>
                            )}
                            <div className="image-label new">NEW</div>
                            <div className="image-wrapper">
                              <img src={img.preview} alt={`New ${index + 1}`} />
                            </div>
                            <div className="image-controls">
                              {actualIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'up', false)}
                                  className="control-btn"
                                  title="Move up"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              {actualIndex < existingImages.length + imageFiles.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'down', false)}
                                  className="control-btn"
                                  title="Move down"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 4V12M8 12L4 8M8 12L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index, false)}
                                className="control-btn delete"
                                title="Delete"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="form-section">
                  <div className="section-header">
                    <h3>Product Description</h3>
                    <span className="section-required">Required</span>
                  </div>
                  <p className="section-description">Write a compelling description highlighting the product's features and craftsmanship.</p>
                  <textarea
                    value={fulfillmentData.description}
                    onChange={(e) =>
                      setFulfillmentData({
                        ...fulfillmentData,
                        description: e.target.value
                      })
                    }
                    className="form-textarea"
                    rows={6}
                    placeholder="Describe the product's materials, craftsmanship, design inspiration, and unique features..."
                  />
                  <div className="character-count">
                    {fulfillmentData.description.length} characters
                  </div>
                </div>

                {/* Video URLs */}
                <div className="form-section">
                  <div className="section-header">
                    <h3>Product Videos</h3>
                    <span className="section-optional">Optional</span>
                  </div>
                  <p className="section-description">Add video URLs showcasing the product from different angles.</p>

                  {fulfillmentData.videoUrls.map((url, index) => (
                    <div key={index} className="url-input-group">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateVideoUrl(index, e.target.value)}
                        className="form-input"
                        placeholder="https://example.com/video.mp4"
                      />
                      <button
                        type="button"
                        onClick={() => removeVideoUrl(index)}
                        className="remove-url-btn"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addVideoUrl}
                    className="add-url-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Add Video URL
                  </button>
                </div>

                {/* 3D Model */}
                <div className="form-section">
                  <div className="section-header">
                    <h3>3D Model & AR</h3>
                    <span className="section-optional">Optional</span>
                  </div>
                  <p className="section-description">Enable 3D visualization and AR try-on features for enhanced customer experience.</p>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={fulfillmentData.has3DModel}
                        onChange={(e) =>
                          setFulfillmentData({
                            ...fulfillmentData,
                            has3DModel: e.target.checked,
                            hasARTryOn: e.target.checked ? fulfillmentData.hasARTryOn : false,
                            iJewel3DUrl: e.target.checked ? fulfillmentData.iJewel3DUrl : ""
                          })
                        }
                      />
                      <span className="checkbox-text">3D Model Available</span>
                    </label>
                  </div>

                  {fulfillmentData.has3DModel && (
                    <div className="conditional-fields">
                      <div className="form-group">
                        <label className="form-label">iJewel3D URL</label>
                        <input
                          type="url"
                          value={fulfillmentData.iJewel3DUrl}
                          onChange={(e) =>
                            setFulfillmentData({
                              ...fulfillmentData,
                              iJewel3DUrl: e.target.value
                            })
                          }
                          className="form-input"
                          placeholder="https://drive.ijewel3d.com/..."
                          required={fulfillmentData.has3DModel}
                        />
                      </div>

                      <div className="checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={fulfillmentData.hasARTryOn}
                            onChange={(e) =>
                              setFulfillmentData({
                                ...fulfillmentData,
                                hasARTryOn: e.target.checked
                              })
                            }
                          />
                          <span className="checkbox-text">AR Try-On Enabled</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mark Ready for Release */}
                <div className="form-section">
                  <div className="checkbox-group">
                    <label className="checkbox-label highlight">
                      <input
                        type="checkbox"
                        checked={fulfillmentData.markReadyForRelease}
                        onChange={(e) =>
                          setFulfillmentData({
                            ...fulfillmentData,
                            markReadyForRelease: e.target.checked
                          })
                        }
                      />
                      <span className="checkbox-text">Mark as ready for release after saving</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loading || uploadingImages}
                    className="submit-button"
                  >
                    {uploadingImages ? "Uploading Images..." : loading ? "Saving..." : "Save & Fulfill Product"}
                  </button>
                </div>
              </form>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  {selectedProduct.status === ProductStatus.DRAFT && (
                    <button
                      onClick={() => handleMarkReadyForRelease(selectedProduct.id)}
                      disabled={loading}
                      className="action-button primary"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16.25 5L7.5 13.75L3.75 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Mark Ready for Release
                    </button>
                  )}
                  <button
                    onClick={() => handleArchive(selectedProduct.id)}
                    disabled={loading}
                    className="action-button danger"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 5H17.5M8.33333 9.16667V14.1667M11.6667 9.16667V14.1667M3.33333 5L4.16667 15.8333C4.16667 16.2754 4.34226 16.6993 4.65482 17.0118C4.96738 17.3244 5.39131 17.5 5.83333 17.5H14.1667C14.6087 17.5 15.0326 17.3244 15.3452 17.0118C15.6577 16.6993 15.8333 16.2754 15.8333 15.8333L16.6667 5M7.5 5V3.33333C7.5 3.11232 7.5878 2.90036 7.74408 2.74408C7.90036 2.5878 8.11232 2.5 8.33333 2.5H11.6667C11.8877 2.5 12.0996 2.5878 12.2559 2.74408C12.4122 2.90036 12.5 3.11232 12.5 3.33333V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Archive Product
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-selection">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" opacity="0.2"/>
                <path d="M60 35L60 85M35 60L85 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
              </svg>
              <h3>Select a Product</h3>
              <p>Choose a product from the queue to begin fulfillment</p>
            </div>
          )}
        </div>
      </div>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === "success" ? "✓" : "!"}
            </div>
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="confirm-dialog-overlay" onClick={() => handleConfirmDialogClose(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-content">
              <h3 className="confirm-dialog-title">Confirm Action</h3>
              <p className="confirm-dialog-message">{confirmDialog.message}</p>
              <div className="confirm-dialog-actions">
                <button
                  className="confirm-button confirm-cancel"
                  onClick={() => handleConfirmDialogClose(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-button confirm-ok"
                  onClick={() => handleConfirmDialogClose(true)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFulfillment;
