import React, { useState, useEffect } from "react";
import { productsAPI } from "@/services/api";

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

  const [fulfillmentData, setFulfillmentData] = useState({
    description: "",
    imageUrls: [],
    assetUrls: [],
    markReadyForRelease: false
  });

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response =
        filter === "pending"
          ? await productsAPI.getPendingFulfillment()
          : await productsAPI.getDraft();
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setFulfillmentData({
      description: product.description || "",
      imageUrls: product.imageUrls || [],
      assetUrls: [],
      markReadyForRelease: false
    });
  };

  const handleFulfill = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    setError(null);
    try {
      await productsAPI.fulfill(selectedProduct.id, fulfillmentData);
      alert("Product fulfilled successfully!");
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fulfill product");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReadyForRelease = async (productId) => {
    if (!window.confirm("Mark this product as ready for release?")) return;

    setLoading(true);
    setError(null);
    try {
      await productsAPI.markReadyForRelease(productId);
      alert("Product marked as ready for release!");
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark product ready");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (productId) => {
    if (!window.confirm("Publish this product to the website?")) return;

    setLoading(true);
    setError(null);
    try {
      await productsAPI.publish(productId);
      alert("Product published successfully!");
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish product");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (productId) => {
    if (!window.confirm("Archive this product?")) return;

    setLoading(true);
    setError(null);
    try {
      await productsAPI.archive(productId);
      alert("Product archived successfully!");
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to archive product");
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setFulfillmentData((prev) => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), url]
      }));
    }
  };

  const removeImageUrl = (index) => {
    setFulfillmentData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || []
    }));
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case ProductStatus.DRAFT:
        return "bg-gray-500";
      case ProductStatus.READY_FOR_RELEASE:
        return "bg-blue-500";
      case ProductStatus.PUBLISHED:
        return "bg-green-500";
      case ProductStatus.ARCHIVED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Product Fulfillment</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded ${
            filter === "pending" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Pending Fulfillment
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All Draft Products
        </button>
        <button
          onClick={loadProducts}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Products ({products.length})
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedProduct?.id === product.id
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => handleSelectProduct(product)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs text-white ${getStatusBadgeColor(
                      product.status
                    )}`}
                  >
                    {product.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  SKU: {product.skuId || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Images: {product.imageUrls?.length || 0}
                </p>
                <p className="text-sm text-gray-600">
                  Description: {product.description ? "✓" : "✗"}
                </p>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No products found
              </p>
            )}
          </div>
        </div>

        {/* Fulfillment Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {selectedProduct ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Fulfill Product: {selectedProduct.name}
              </h2>

              <form onSubmit={handleFulfill} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={fulfillmentData.description}
                    onChange={(e) =>
                      setFulfillmentData({
                        ...fulfillmentData,
                        description: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image URLs
                  </label>
                  <div className="space-y-2">
                    {fulfillmentData.imageUrls?.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => {
                            const newUrls = [
                              ...(fulfillmentData.imageUrls || [])
                            ];
                            newUrls[index] = e.target.value;
                            setFulfillmentData({
                              ...fulfillmentData,
                              imageUrls: newUrls
                            });
                          }}
                          className="flex-1 px-3 py-2 border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="w-full px-3 py-2 border-2 border-dashed rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500"
                    >
                      + Add Image URL
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={fulfillmentData.markReadyForRelease}
                    onChange={(e) =>
                      setFulfillmentData({
                        ...fulfillmentData,
                        markReadyForRelease: e.target.checked
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm">
                    Mark as ready for release after fulfillment
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
                >
                  {loading ? "Processing..." : "Fulfill Product"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t space-y-2">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                {selectedProduct.status === ProductStatus.DRAFT && (
                  <button
                    onClick={() =>
                      handleMarkReadyForRelease(selectedProduct.id)
                    }
                    disabled={loading}
                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  >
                    Mark Ready for Release
                  </button>
                )}
                {selectedProduct.status === ProductStatus.READY_FOR_RELEASE && (
                  <button
                    onClick={() => handlePublish(selectedProduct.id)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    Publish to Website
                  </button>
                )}
                <button
                  onClick={() => handleArchive(selectedProduct.id)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Archive Product
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>Select a product from the list to fulfill it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFulfillment;
