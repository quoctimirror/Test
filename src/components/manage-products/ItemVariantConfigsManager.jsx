import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";

const ItemVariantConfigsManager = () => {
  const [itemVariantConfigs, setItemVariantConfigs] = useState([]);
  const [itemVariants, setItemVariants] = useState([]);
  const [componentOptionals, setComponentOptionals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    itemVariantId: "",
    componentOptionalId: "",
    isActive: true,
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [isErrorFadingOut, setIsErrorFadingOut] = useState(false);

  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      setIsErrorFadingOut(false);
      const timer = setTimeout(() => {
        setIsErrorFadingOut(true);
        setTimeout(() => {
          setErrorMessage(null);
          setIsErrorFadingOut(false);
        }, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Close error message manually
  const closeErrorMessage = () => {
    setIsErrorFadingOut(true);
    setTimeout(() => {
      setErrorMessage(null);
      setIsErrorFadingOut(false);
    }, 300);
  };

  // API calls
  const fetchData = async () => {
    try {
      // Fetch item variants
      const itemVariantsResponse = await api.get("/api/item-variants");
      if (itemVariantsResponse.status === 200) {
        const itemVariantsData = itemVariantsResponse.data;
        const transformedItemVariants = itemVariantsData.map((item) => ({
          itemVariantId: item.itemVariantId || item.id,
          itemVariantName: item.itemVariantName || item.name,
          itemVariantUrl: item.itemVariantUrl,
          description: item.description,
        }));
        setItemVariants(transformedItemVariants);
      } else {
        console.error("Failed to fetch item variants");
        setItemVariants([
          { itemVariantId: "ITEM0001", itemVariantName: "Sample Item Variant 1", itemVariantUrl: "test", description: "URL model 1" },
          { itemVariantId: "ITEM0002", itemVariantName: "Sample Item Variant 2", itemVariantUrl: "test-2", description: "URL model 2" },
        ]);
      }

      // Fetch component optionals
      const componentOptionalsResponse = await api.get("/api/component-optionals");
      if (componentOptionalsResponse.status === 200) {
        const componentOptionalsData = componentOptionalsResponse.data;
        const transformedComponentOptionals = componentOptionalsData.map((item) => ({
          componentOptionalId: item.componentOptionalId || item.id,
          componentOptionalName: item.componentOptionalName,
          description: item.description,
        }));
        setComponentOptionals(transformedComponentOptionals);
      } else {
        console.error("Failed to fetch component optionals");
        setComponentOptionals([
          { componentOptionalId: "OPT001", componentOptionalName: "White Gold Option", description: "White gold material" },
          { componentOptionalId: "OPT002", componentOptionalName: "Rose Gold Option", description: "Rose gold material" },
        ]);
      }

      // Fetch item variant configs
      const configsResponse = await api.get("/api/item-variant-configs");
      if (configsResponse.status === 200) {
        const configsData = configsResponse.data;
        console.log("API Item Variant Configs data:", configsData);

        const transformedConfigs = configsData.map((item) => ({
          id: item.itemVariantConfigId,
          itemVariantConfigId: item.itemVariantConfigId,
          itemVariantId: item.itemVariantId,
          itemVariantName: item.itemVariantUrl || "Unknown",
          componentOptionalId: item.componentOptionalId,
          componentOptionalName: item.componentOptionalName || "Unknown",
          isActive: item.isActive,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
        }));

        console.log("Transformed Item Variant Configs:", transformedConfigs);
        setItemVariantConfigs(transformedConfigs);
      } else {
        console.error("Failed to fetch item variant configs");
        setItemVariantConfigs([
          {
            id: "IVCF0001",
            itemVariantConfigId: "IVCF0001",
            itemVariantId: "ITEM0001",
            itemVariantName: "test 1",
            componentOptionalId: "COPT0001",
            componentOptionalName: "White Gold Option",
            isActive: true,
            createdBy: "system",
          },
          {
            id: "IVCF0002",
            itemVariantConfigId: "IVCF0002",
            itemVariantId: "ITEM0002",
            itemVariantName: "test 2",
            componentOptionalId: "COPT0002",
            componentOptionalName: "Rose Gold Option",
            isActive: true,
            createdBy: "system",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to mock data
      setItemVariants([
        { itemVariantId: "ITEM0001", itemVariantName: "Sample Item Variant 1", itemVariantUrl: "test", description: "URL model 1" },
        { itemVariantId: "ITEM0002", itemVariantName: "Sample Item Variant 2", itemVariantUrl: "test-2", description: "URL model 2" },
      ]);
      setComponentOptionals([
        { componentOptionalId: "OPT001", componentOptionalName: "White Gold Option", description: "White gold material" },
        { componentOptionalId: "OPT002", componentOptionalName: "Rose Gold Option", description: "Rose gold material" },
      ]);
      setItemVariantConfigs([
        {
          id: "IVCF0001",
          itemVariantConfigId: "IVCF0001",
          itemVariantId: "ITEM0001",
          itemVariantName: "test 1",
          componentOptionalId: "COPT0001",
          componentOptionalName: "White Gold Option",
          isActive: true,
          createdBy: "system",
        },
        {
          id: "IVCF0002",
          itemVariantConfigId: "IVCF0002",
          itemVariantId: "ITEM0002",
          itemVariantName: "test 2",
          componentOptionalId: "COPT0002",
          componentOptionalName: "Rose Gold Option",
          isActive: true,
          createdBy: "system",
        },
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (editingConfig) {
        // Update existing config
        const response = await api.put(`/api/item-variant-configs/${editingConfig.id}`, formData);

        if (response.status === 200) {
          const updatedConfig = response.data;
          const transformedConfig = {
            ...updatedConfig,
            id: updatedConfig.itemVariantConfigId,
            itemVariantConfigId: updatedConfig.itemVariantConfigId,
            itemVariantName: updatedConfig.itemVariantUrl || "Unknown",
            componentOptionalName: updatedConfig.componentOptionalName || "Unknown",
          };
          setItemVariantConfigs(
            itemVariantConfigs.map((config) =>
              config.id === editingConfig.id ? transformedConfig : config
            )
          );
        } else {
          console.error("Failed to update item variant config:", response.data);
          setErrorMessage(response.data?.message || "Failed to update item variant config");
          return;
        }
      } else {
        // Add new config
        const response = await api.post("/api/item-variant-configs", formData);

        if (response.status === 201 || response.status === 200) {
          const newConfig = response.data;
          const transformedConfig = {
            ...newConfig,
            id: newConfig.itemVariantConfigId,
            itemVariantConfigId: newConfig.itemVariantConfigId,
            itemVariantName: newConfig.itemVariantUrl || "Unknown",
            componentOptionalName: newConfig.componentOptionalName || "Unknown",
          };
          setItemVariantConfigs([...itemVariantConfigs, transformedConfig]);
        } else {
          console.error("Failed to create item variant config:", response.data);
          setErrorMessage(response.data?.message || "Failed to create item variant config");
          return;
        }
      }

      closeModal();
    } catch (error) {
      console.error("Error submitting item variant config:", error);
      setErrorMessage("A network error occurred. Please try again.");
    }
  };

  const handleEdit = (config) => {
    setErrorMessage(null);
    setEditingConfig(config);
    setFormData({
      itemVariantId: config.itemVariantId,
      componentOptionalId: config.componentOptionalId,
      isActive: config.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setErrorMessage(null);
    if (window.confirm("Are you sure you want to delete this item variant config?")) {
      try {
        const response = await api.delete(`/api/item-variant-configs/${id}`);

        if (response.status === 200 || response.status === 204) {
          setItemVariantConfigs(itemVariantConfigs.filter((config) => config.id !== id));
        } else {
          console.error("Failed to delete item variant config:", response.data);
          setErrorMessage(response.data?.message || "Failed to delete item variant config");
        }
      } catch (error) {
        console.error("Error deleting item variant config:", error);
        setErrorMessage("A network error occurred. Please try again.");
      }
    }
  };

  const openModal = () => {
    setErrorMessage(null);
    setEditingConfig(null);
    setFormData({
      itemVariantId: "",
      componentOptionalId: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
    setFormData({
      itemVariantId: "",
      componentOptionalId: "",
      isActive: true,
    });
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Item Variant Configs Management</h2>
        <button className="add-button" onClick={openModal}>
          Add New Config
        </button>
      </div>

      {errorMessage && (
        <div className={`error-message-container ${isErrorFadingOut ? 'fade-out' : ''}`}>
          <p>{errorMessage}</p>
          <button className="error-close-button" onClick={closeErrorMessage}>
            ×
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Config ID</th>
              <th>Item Variant Name</th>
              <th>Component Option</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {itemVariantConfigs.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Loading item variant configs...
                </td>
              </tr>
            ) : (
              itemVariantConfigs.map((config) => {
                console.log("Rendering item variant config:", config);
                return (
                  <tr key={config.id || config.itemVariantConfigId || `config-${config.itemVariantId}-${config.componentOptionalId}`}>
                    <td>{config.itemVariantConfigId}</td>
                    <td>{config.itemVariantName}</td>
                    <td>{config.componentOptionalName}</td>
                    <td>{config.createdBy}</td>
                    <td>
                      <span className={`status-badge ${config.isActive ? 'active' : 'inactive'}`}>
                        {config.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(config)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(config.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingConfig ? "Edit Item Variant Config" : "Add New Item Variant Config"}
              </h3>
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="itemVariantId">Item Variant:</label>
                <select
                  id="itemVariantId"
                  value={formData.itemVariantId}
                  onChange={(e) =>
                    setFormData({ ...formData, itemVariantId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Item Variant</option>
                  {itemVariants.map((variant) => (
                    <option key={variant.itemVariantId} value={variant.itemVariantId}>
                      {variant.itemVariantId} - {variant.itemVariantName || variant.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="componentOptionalId">Component Option:</label>
                <select
                  id="componentOptionalId"
                  value={formData.componentOptionalId}
                  onChange={(e) =>
                    setFormData({ ...formData, componentOptionalId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Component Option</option>
                  {componentOptionals.map((option) => (
                    <option key={option.componentOptionalId} value={option.componentOptionalId}>
                      {option.componentOptionalName} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="isActive">Status:</label>
                <select
                  id="isActive"
                  value={formData.isActive.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.value === 'true' })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingConfig ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemVariantConfigsManager;