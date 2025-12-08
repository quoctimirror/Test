import React, { useState, useEffect } from "react";
import { collectionsAPI, productsAPI, handleAPIError } from "@services/api";
import { getImageUrl } from "@utils/cloudflareMediaUtil";
import { SkeletonList } from "./Skeleton";

const CollectionsManager = () => {
  const [collections, setCollections] = useState([]);
  const [collectionProducts, setCollectionProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState({});
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCollections, setExpandedCollections] = useState({});
  // New state for product management
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentCollectionId, setCurrentCollectionId] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [loadingAvailableProducts, setLoadingAvailableProducts] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    season: "",
    year: new Date().getFullYear().toString(),
    theme: "",
    imageUrl: "",
    bannerImageUrl: "",
    imageUrls: "",
    status: "ACTIVE",
    featured: false,
    sortOrder: 0,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await collectionsAPI.getAll();
      const collectionsData = response.data || [];
      setCollections(collectionsData);

      // Fetch products for each collection to get the full product data
      const productsMap = {};

      for (const collection of collectionsData) {
        try {
          // Use getWithProducts endpoint to get products with full metadata
          const withProductsRes = await collectionsAPI.getWithProducts(
            collection.id
          );

          // Extract products array from the CollectionResponse
          const collectionData = withProductsRes.data;
          const productsWithMeta = collectionData?.products || [];

          // Convert CollectionProductResponse to ProductResponse format for display
          const products = productsWithMeta
            .map((cp) => {
              const product = cp.product;
              if (product) {
                // Add metadata fields directly to product for easier access
                product.isHeroProduct = cp.isHeroProduct;
                product.sortOrder = cp.sortOrder;
                product.collectionProductId = cp.id;
              }
              return product;
            })
            .filter((product) => product != null);

          productsMap[collection.id] = products;
        } catch (err) {
          productsMap[collection.id] = [];
        }
      }

      setCollectionProducts(productsMap);
      setLoadingProducts({});
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to load collections");
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandCollection = (collectionId) => {
    setExpandedCollections((prev) => ({
      ...prev,
      [collectionId]: !prev[collectionId],
    }));
  };

  // Helper functions for collection-product metadata
  const isHeroProduct = (collectionId, productId) => {
    const products = collectionProducts[collectionId] || [];
    const product = products.find((p) => p.id === productId);
    return product?.isHeroProduct || false;
  };

  // Product Management Functions
  const handleManageProducts = async (collectionId) => {
    setCurrentCollectionId(collectionId);
    setIsProductModalOpen(true);
    await fetchAvailableProducts();
  };

  const fetchAvailableProducts = async () => {
    setLoadingAvailableProducts(true);
    try {
      const response = await productsAPI.getAll();
      setAvailableProducts(response.data || []);
    } catch (err) {
      const errorInfo = handleAPIError(
        err,
        "Failed to load available products"
      );
      setError(errorInfo.message);
    } finally {
      setLoadingAvailableProducts(false);
    }
  };

  const addProductToCollection = async (productId) => {
    if (!currentCollectionId) return;

    try {
      const requestData = {
        collectionId: currentCollectionId,
        productId: productId,
        sortOrder: 0,
        isHeroProduct: false,
      };

      await collectionsAPI.addProductToCollection(
        currentCollectionId,
        requestData
      );

      // Refresh the collection data to get updated products with metadata from backend
      await fetchCollections();

      setError(null);
    } catch (err) {
      const errorInfo = handleAPIError(
        err,
        "Failed to add product to collection"
      );
      setError(errorInfo.message);
    }
  };

  const removeProductFromCollection = async (productId) => {
    if (!currentCollectionId) return;

    if (
      !window.confirm(
        "Are you sure you want to remove this product from the collection?"
      )
    ) {
      return;
    }

    try {
      await collectionsAPI.removeProductFromCollection(
        currentCollectionId,
        productId
      );

      // Refresh the collection data to get updated products from backend
      await fetchCollections();

      setError(null);
    } catch (err) {
      const errorInfo = handleAPIError(
        err,
        "Failed to remove product from collection"
      );
      setError(errorInfo.message);
    }
  };

  const toggleHeroProduct = async (
    productId,
    collectionId = currentCollectionId
  ) => {
    if (!collectionId) return;

    try {
      await collectionsAPI.toggleHeroProduct(collectionId, productId);

      // Refresh the collection data to get updated hero status from backend
      await fetchCollections();

      setError(null);
    } catch (err) {
      const errorInfo = handleAPIError(
        err,
        "Failed to toggle hero product status"
      );
      setError(errorInfo.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      description: "",
      season: "",
      year: new Date().getFullYear().toString(),
      theme: "",
      imageUrl: "",
      bannerImageUrl: "",
      imageUrls: "",
      status: "ACTIVE",
      featured: false,
      sortOrder: 0,
      startDate: "",
      endDate: "",
    });
    setEditingCollection(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (collection) => {
    setFormData({
      name: collection.name || "",
      title: collection.title || "",
      description: collection.description || "",
      season: collection.season || "",
      year: collection.year?.toString() || new Date().getFullYear().toString(),
      theme: collection.theme || "",
      imageUrl: collection.imageUrl || "",
      bannerImageUrl: collection.bannerImageUrl || "",
      imageUrls: Array.isArray(collection.imageUrls)
        ? collection.imageUrls.join(", ")
        : "",
      status: collection.status || "ACTIVE",
      featured: collection.featured || false,
      sortOrder: collection.sortOrder?.toString() || "0",
      startDate: collection.startDate || "",
      endDate: collection.endDate || "",
    });
    setEditingCollection(collection);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        name: formData.name,
        title: formData.title,
        description: formData.description,
        season: formData.season || null,
        year: parseInt(formData.year) || null,
        theme: formData.theme || null,
        imageUrl: formData.imageUrl || null,
        bannerImageUrl: formData.bannerImageUrl || null,
        imageUrls: formData.imageUrls
          ? JSON.stringify(
              formData.imageUrls
                .split(",")
                .map((url) => url.trim())
                .filter((url) => url)
            )
          : null,
        status: formData.status,
        featured: formData.featured,
        sortOrder: parseInt(formData.sortOrder) || 0,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      if (editingCollection) {
        await collectionsAPI.update(editingCollection.id, submitData);
      } else {
        await collectionsAPI.create(submitData);
      }

      await fetchCollections();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to save collection");
      setError(errorInfo.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) {
      return;
    }

    try {
      await collectionsAPI.delete(id);
      await fetchCollections();
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to delete collection");
      setError(errorInfo.message);
    }
  };

  const toggleFeatured = async (collection) => {
    try {
      const updateData = {
        name: collection.name,
        title: collection.title,
        description: collection.description,
        season: collection.season,
        year: collection.year,
        theme: collection.theme,
        imageUrl: collection.imageUrl,
        bannerImageUrl: collection.bannerImageUrl,
        status: collection.status,
        featured: !collection.featured,
        sortOrder: collection.sortOrder,
        startDate: collection.startDate,
        endDate: collection.endDate,
      };
      await collectionsAPI.update(collection.id, updateData);
      await fetchCollections();
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to update featured status");
      setError(errorInfo.message);
    }
  };

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      collection.season?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  if (loading) {
    return (
      <div className="collections-manager">
        <div className="admin-card admin-p-lg admin-mb-lg">
          <div className="skeleton" style={{ width: '200px', height: '1.5rem', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ width: '350px', height: '1rem' }} />
        </div>
        <SkeletonList items={4} />
      </div>
    );
  }

  return (
    <div className="admin-card" style={{ padding: "1.5rem" }}>
      {error && (
        <div className="admin-error-state" style={{ marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {/* Header Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search collections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input"
          style={{ flex: 1, maxWidth: "400px" }}
        />
        <button
          onClick={handleAdd}
          className="admin-button admin-button-primary"
          title="Add Collection"
        >
          Add Collection
        </button>
      </div>

      {/* Collections Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1rem" }}>
        {filteredCollections.map((collection) => (
          <div
            key={collection.id}
            className="admin-card"
            style={{ overflow: "hidden" }}
          >
            {collection.imageUrl && (
              <div
                style={{
                  height: "200px",
                  backgroundImage: `url(${collection.imageUrl.startsWith('http') ? collection.imageUrl : getImageUrl(collection.imageUrl)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                {collection.featured && (
                  <div className="status-pill" style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      backgroundColor: "#0f172a",
                      color: "white",
                      borderColor: "#0f172a"
                    }}
                  >
                    Featured
                  </div>
                )}
              </div>
            )}

            <div style={{ padding: "1rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", fontWeight: "600", color: "#0f172a" }}>
                  {collection.name}
                </h3>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.5rem" }}>
                  ID: <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", fontSize: "0.6875rem" }}>
                    {collection.id}
                  </code>
                </div>
                <p style={{ margin: "0", fontSize: "0.8125rem", color: "#64748b", lineHeight: "1.4" }}>
                  {collection.description || "No description provided"}
                </p>
              </div>

              {/* Collection Info */}
              <div style={{  margin: "1rem 0", padding: "0.75rem", backgroundColor: "#fafbfc", borderRadius: "6px", fontSize: "0.75rem", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <span style={{ color: "#64748b", fontWeight: "500" }}>Season:</span>
                    <span style={{ marginLeft: "0.5rem", color: "#0f172a" }}>
                      {collection.season || "All Seasons"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontWeight: "500" }}>Year:</span>
                    <span style={{ marginLeft: "0.5rem", color: "#0f172a" }}>
                      {collection.year || currentYear}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontWeight: "500" }}>Products:</span>
                    <span style={{ marginLeft: "0.5rem", color: "#0f172a" }}>
                      {collectionProducts[collection.id]?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontWeight: "500" }}>Status:</span>
                    <span style={{ marginLeft: "0.5rem", color: collection.isActive !== false ? "#059669" : "#dc2626", fontWeight: "500" }}>
                      {collection.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products List Section */}
              {collectionProducts[collection.id] &&
                collectionProducts[collection.id].length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                        padding: "0.5rem",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: "1px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e9ecef";
                        e.currentTarget.style.borderColor = "#dee2e6";
                        e.currentTarget.style.transform = "translateX(2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                      onClick={() => toggleExpandCollection(collection.id)}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#495057",
                        }}
                      >
                         Products in Collection
                      </h4>
                      <span
                        style={{
                          fontSize: "16px",
                          color: "#6c757d",
                          transition: "transform 0.2s ease",
                          transform: expandedCollections[collection.id]
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                        }}
                      >
                        ▶
                      </span>
                    </div>

                    {expandedCollections[collection.id] && (
                      <div
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          border: "2px solid #e9ecef",
                          borderRadius: "8px",
                          padding: "0.75rem",
                          backgroundColor: "#ffffff",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                          marginTop: "0.5rem",
                        }}
                      >
                        {loadingProducts[collection.id] ? (
                          <div
                            style={{
                              textAlign: "center",
                              color: "#6c757d",
                              fontSize: "14px",
                            }}
                          >
                            Loading products...
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.5rem",
                            }}
                          >
                            {collectionProducts[collection.id].map(
                              (product, index) => (
                                <div
                                  key={product.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0.5rem",
                                    backgroundColor:
                                      index % 2 === 0 ? "#f8f9fa" : "white",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    border: "1px solid transparent",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#e3f2fd";
                                    e.currentTarget.style.borderColor =
                                      "#90caf9";
                                    e.currentTarget.style.transform =
                                      "translateX(4px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 2px 4px rgba(0,0,0,0.1)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      index % 2 === 0 ? "#f8f9fa" : "white";
                                    e.currentTarget.style.borderColor =
                                      "transparent";
                                    e.currentTarget.style.transform =
                                      "translateX(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                  }}
                                >
                                  {product.imageUrl && (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                        marginRight: "0.75rem",
                                      }}
                                    />
                                  )}
                                  <div style={{ flex: 1 }}>
                                    <div
                                      style={{
                                        fontWeight: "500",
                                        color: "#212529",
                                      }}
                                    >
                                      {product.name}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        color: "#6c757d",
                                      }}
                                    >
                                      SKU: {product.skuCode || "N/A"} | Price:{" "}
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: product.currency || "VND",
                                      }).format(product.price || 0)}
                                    </div>
                                  </div>
                                  {product.featured && (
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        color: "#bc224c",
                                        fontWeight: "500",
                                        marginLeft: "0.5rem",
                                      }}
                                    >
                                      
                                    </span>
                                  )}
                                  {isHeroProduct(collection.id, product.id) && (
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        color: "#ffc107",
                                        fontWeight: "500",
                                        marginLeft: "0.25rem",
                                      }}
                                    >
                                      ★
                                    </span>
                                  )}
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.25rem",
                                      marginLeft: "0.5rem",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleHeroProduct(
                                          product.id,
                                          collection.id
                                        );
                                      }}
                                      className="admin-button"
                                      style={{
                                        padding: "0.125rem 0.375rem",
                                        fontSize: "10px",
                                        backgroundColor: isHeroProduct(
                                          collection.id,
                                          product.id
                                        )
                                          ? "#ffc107"
                                          : "#6c757d",
                                        color: "white",
                                        border: "none",
                                      }}
                                      title={
                                        isHeroProduct(collection.id, product.id)
                                          ? "Remove as Hero"
                                          : "Set as Hero"
                                      }
                                    >
                                      {isHeroProduct(collection.id, product.id)
                                        ? "★"
                                        : "☆"}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeProductFromCollection(product.id);
                                      }}
                                      className="admin-button"
                                      style={{
                                        padding: "0.125rem 0.375rem",
                                        fontSize: "10px",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                      }}
                                      title="Remove from Collection"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleEdit(collection)}
                  className="admin-button admin-button-outline"
                  style={{ flex: 1, minWidth: "80px", padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleManageProducts(collection.id)}
                  className="admin-button admin-button-secondary"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
                >
                  Manage Products
                </button>
                <button
                  onClick={() => toggleFeatured(collection)}
                  className="admin-button admin-button-secondary"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
                >
                  {collection.featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  onClick={() => handleDelete(collection.id)}
                  className="admin-button admin-button-danger"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <div className="admin-empty-state">
          No collections found. {searchTerm ? "Try adjusting your search." : "Add your first collection to get started."}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "1.5rem" }}>
              <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", fontWeight: "600", color: "#0f172a", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0" }}>
                {editingCollection ? "Edit Collection" : "Add New Collection"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", fontSize: "0.8125rem", color: "#0f172a" }}>
                        Collection Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="admin-input"
                        placeholder="e.g., Spring Elegance"
                        required
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
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="admin-input"
                        placeholder="e.g., Elegant Spring Jewelry Collection"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="admin-input"
                      rows="3"
                      placeholder="Describe this collection's theme and style..."
                    />
                  </div>

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
                        Season
                      </label>
                      <select
                        value={formData.season}
                        onChange={(e) =>
                          setFormData({ ...formData, season: e.target.value })
                        }
                        className="admin-input"
                      >
                        <option value="">All Seasons</option>
                        <option value="SPRING">Spring</option>
                        <option value="SUMMER">Summer</option>
                        <option value="AUTUMN">Autumn</option>
                        <option value="WINTER">Winter</option>
                        <option value="HOLIDAY">Holiday</option>
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
                        Year
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        className="admin-input"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
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
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sortOrder: e.target.value,
                          })
                        }
                        className="admin-input"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Theme
                    </label>
                    <input
                      type="text"
                      value={formData.theme}
                      onChange={(e) =>
                        setFormData({ ...formData, theme: e.target.value })
                      }
                      className="admin-input"
                      placeholder="e.g., Floral, Vintage, Modern"
                    />
                  </div>

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
                        Collection Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        className="admin-input"
                        placeholder="https://example.com/collection-image.jpg"
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
                        Banner Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.bannerImageUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bannerImageUrl: e.target.value,
                          })
                        }
                        className="admin-input"
                        placeholder="https://example.com/banner-image.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Additional Images (comma-separated URLs)
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrls}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrls: e.target.value })
                      }
                      className="admin-input"
                      placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                    />
                  </div>

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
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
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
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      alignItems: "end",
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
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="admin-input"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              featured: e.target.checked,
                            })
                          }
                        />
                        <span style={{ fontWeight: "500" }}>
                          Featured Collection
                        </span>
                      </label>
                    </div>
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
                    {editingCollection
                      ? "Update Collection"
                      : "Create Collection"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Management Modal */}
      {isProductModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px", maxHeight: "80vh", overflow: "hidden" }}
          >
            <div
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2
                  style={{ margin: "0", fontSize: "24px", fontWeight: "600" }}
                >
                  Manage Products in Collection
                </h2>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "0.25rem",
                    color: "#6c757d",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Current Collection Products */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "1rem",
                    color: "#495057",
                  }}
                >
                  Current Products in Collection (
                  {collectionProducts[currentCollectionId]?.length || 0})
                </h3>

                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {collectionProducts[currentCollectionId]?.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      {collectionProducts[currentCollectionId].map(
                        (product) => (
                          <div
                            key={product.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "0.75rem",
                              backgroundColor: "white",
                              borderRadius: "6px",
                              border: "1px solid #dee2e6",
                            }}
                          >
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  marginRight: "1rem",
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: "600",
                                  color: "#212529",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {product.name}
                              </div>
                              <div
                                style={{ fontSize: "13px", color: "#6c757d" }}
                              >
                                SKU: {product.skuCode || "N/A"} |{" "}
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: product.currency || "VND",
                                }).format(product.price || 0)}
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                alignItems: "center",
                              }}
                            >
                              {isHeroProduct(
                                currentCollectionId,
                                product.id
                              ) && (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#ffc107",
                                    fontWeight: "500",
                                    marginRight: "0.5rem",
                                  }}
                                >
                                  ★ Hero
                                </span>
                              )}
                              <button
                                onClick={() => toggleHeroProduct(product.id)}
                                className="admin-button"
                                style={{
                                  padding: "0.375rem 0.75rem",
                                  fontSize: "12px",
                                  backgroundColor: isHeroProduct(
                                    currentCollectionId,
                                    product.id
                                  )
                                    ? "#ffc107"
                                    : "#6c757d",
                                  color: "white",
                                  border: "none",
                                }}
                              >
                                {isHeroProduct(currentCollectionId, product.id)
                                  ? "Remove Hero"
                                  : "Set Hero"}
                              </button>
                              <button
                                onClick={() =>
                                  removeProductFromCollection(product.id)
                                }
                                className="admin-button"
                                style={{
                                  padding: "0.375rem 0.75rem",
                                  fontSize: "12px",
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#6c757d",
                        padding: "2rem",
                      }}
                    >
                      No products in this collection yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Available Products to Add */}
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "0",
                      color: "#495057",
                    }}
                  >
                    Available Products
                  </h3>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="admin-input"
                    style={{ width: "250px" }}
                  />
                </div>

                <div
                  style={{
                    flex: 1,
                    maxHeight: "300px",
                    overflowY: "auto",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    backgroundColor: "#ffffff",
                  }}
                >
                  {loadingAvailableProducts ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#6c757d",
                      }}
                    >
                      Loading products...
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      {availableProducts
                        .filter((product) => {
                          // Filter out products already in collection
                          const alreadyInCollection = collectionProducts[
                            currentCollectionId
                          ]?.some((cp) => cp.id === product.id);
                          // Filter by search term
                          const matchesSearch =
                            !productSearchTerm ||
                            product.name
                              .toLowerCase()
                              .includes(productSearchTerm.toLowerCase()) ||
                            product.sku
                              .toLowerCase()
                              .includes(productSearchTerm.toLowerCase());
                          return !alreadyInCollection && matchesSearch;
                        })
                        .map((product) => (
                          <div
                            key={product.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "0.75rem",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                              border: "1px solid #dee2e6",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#e9ecef";
                              e.currentTarget.style.transform =
                                "translateX(2px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                              e.currentTarget.style.transform = "translateX(0)";
                            }}
                          >
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  marginRight: "1rem",
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: "600",
                                  color: "#212529",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {product.name}
                              </div>
                              <div
                                style={{ fontSize: "13px", color: "#6c757d" }}
                              >
                                SKU: {product.skuCode || "N/A"} |{" "}
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: product.currency || "VND",
                                }).format(product.price || 0)}
                              </div>
                            </div>
                            <button
                              onClick={() => addProductToCollection(product.id)}
                              className="admin-button admin-button-primary"
                              style={{
                                padding: "0.5rem 1rem",
                                fontSize: "14px",
                              }}
                            >
                              Add to Collection
                            </button>
                          </div>
                        ))}

                      {availableProducts.filter((product) => {
                        const alreadyInCollection = collectionProducts[
                          currentCollectionId
                        ]?.some((cp) => cp.id === product.id);
                        const matchesSearch =
                          !productSearchTerm ||
                          product.name
                            .toLowerCase()
                            .includes(productSearchTerm.toLowerCase()) ||
                          product.sku
                            .toLowerCase()
                            .includes(productSearchTerm.toLowerCase());
                        return !alreadyInCollection && matchesSearch;
                      }).length === 0 && (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#6c757d",
                            padding: "2rem",
                          }}
                        >
                          {productSearchTerm
                            ? "No products found matching your search."
                            : "No more products available to add."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="admin-button admin-button-primary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsManager;
