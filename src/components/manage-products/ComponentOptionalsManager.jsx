import React, { useState, useEffect } from "react";

const ComponentOptionalsManager = () => {
  const [componentOptionals, setComponentOptionals] = useState([]);
  const [components, setComponents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [formData, setFormData] = useState({
    componentOptionalName: "",
    componentId: "",
    description: "",
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
      // Fetch components
      const componentsResponse = await fetch("/api/components");
      if (componentsResponse.ok) {
        const componentsData = await componentsResponse.json();
        console.log("API Components data (for options):", componentsData); // Debug log

        // Transform API data to match our component structure
        const transformedComponents = componentsData.map((item) => ({
          componentId: item.componentId || item.id,
          componentName: item.componentName || item.name,
        }));

        console.log(
          "Transformed Components (for options):",
          transformedComponents
        ); // Debug log
        setComponents(transformedComponents);
      } else {
        console.error("Failed to fetch components");
        setComponents([
          { componentId: "COMP001", componentName: "Diamond Ring Base" },
          { componentId: "COMP002", componentName: "Gold Chain" },
          { componentId: "COMP003", componentName: "Diamond Studs" },
        ]);
      }

      // Fetch component optionals
      const optionalsResponse = await fetch("/api/component-optionals");
      if (optionalsResponse.ok) {
        const optionalsData = await optionalsResponse.json();
        console.log("API Component Optionals data:", optionalsData); // Debug log

        // Transform API data to match our component structure
        const transformedOptionals = optionalsData.map((item) => ({
          id: item.componentOptionalId || item.id,
          componentOptionalName: item.componentOptionalName || item.name,
          componentId: item.component?.componentId || item.componentId,
          componentName: item.component?.componentName || item.componentName || "Unknown Component",
          description: item.description || "",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
          isActive: item.isActive,
        }));

        console.log("Transformed Component Optionals:", transformedOptionals); // Debug log
        setComponentOptionals(transformedOptionals);
      } else {
        console.error("Failed to fetch component optionals");
        setComponentOptionals([
          {
            id: "OPT001",
            componentOptionalName: "White Gold Option",
            componentId: "COMP001",
            componentName: "Diamond Ring Base",
            description: "White gold material option",
            isActive: true,
            createdBy: "system",
          },
          {
            id: "OPT002",
            componentOptionalName: "Rose Gold Option",
            componentId: "COMP001",
            componentName: "Diamond Ring Base",
            description: "Rose gold material option",
            isActive: true,
            createdBy: "system",
          },
          {
            id: "OPT003",
            componentOptionalName: "Size 6 Option",
            componentId: "COMP001",
            componentName: "Diamond Ring Base",
            description: "Ring size 6",
            isActive: true,
            createdBy: "system",
          },
          {
            id: "OPT004",
            componentOptionalName: "18 Inch Chain",
            componentId: "COMP002",
            componentName: "Gold Chain",
            description: "Chain length 18 inches",
            isActive: true,
            createdBy: "system",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to mock data
      setComponents([
        { componentId: "COMP001", componentName: "Diamond Ring Base" },
        { componentId: "COMP002", componentName: "Gold Chain" },
        { componentId: "COMP003", componentName: "Diamond Studs" },
      ]);
      setComponentOptionals([
        {
          id: "OPT001",
          componentOptionalName: "White Gold Option",
          componentId: "COMP001",
          componentName: "Diamond Ring Base",
          description: "White gold material option",
          isActive: true,
          createdBy: "system",
        },
        {
          id: "OPT002",
          componentOptionalName: "Rose Gold Option",
          componentId: "COMP001",
          componentName: "Diamond Ring Base",
          description: "Rose gold material option",
          isActive: true,
          createdBy: "system",
        },
        {
          id: "OPT003",
          componentOptionalName: "Size 6 Option",
          componentId: "COMP001",
          componentName: "Diamond Ring Base",
          description: "Ring size 6",
          isActive: true,
          createdBy: "system",
        },
        {
          id: "OPT004",
          componentOptionalName: "18 Inch Chain",
          componentId: "COMP002",
          componentName: "Gold Chain",
          description: "Chain length 18 inches",
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
      if (editingOption) {
        // Update existing component optional
        const response = await fetch(`/api/component-optionals/${editingOption.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedOption = await response.json();
          setComponentOptionals(
            componentOptionals.map((option) =>
              option.id === editingOption.id ? {
                ...updatedOption,
                id: updatedOption.componentOptionalId,
                componentOptionalName: updatedOption.componentOptionalName,
                componentName: updatedOption.component?.componentName || 'Unknown Component'
              } : option
            )
          );
        } else {
          const errorText = await response.text();
          console.error("Failed to update component optional:", errorText);
          setErrorMessage(errorText);
          return;
        }
      } else {
        // Add new component optional
        const response = await fetch("/api/component-optionals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newOption = await response.json();
          setComponentOptionals([...componentOptionals, {
            ...newOption,
            id: newOption.componentOptionalId,
            componentOptionalName: newOption.componentOptionalName,
            componentName: newOption.component?.componentName || 'Unknown Component'
          }]);
        } else {
          const errorText = await response.text();
          console.error("Failed to create component optional:", errorText);
          setErrorMessage(errorText);
          return;
        }
      }

      closeModal();
    } catch (error) {
      console.error("Error submitting component optional:", error);
      setErrorMessage("A network error occurred. Please try again.");
    }
  };

  const handleEdit = (option) => {
    setErrorMessage(null);
    setEditingOption(option);
    setFormData({
      componentOptionalName: option.componentOptionalName,
      componentId: option.componentId.toString(),
      description: option.description,
      isActive: option.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setErrorMessage(null);
    if (
      window.confirm("Are you sure you want to delete this component option?")
    ) {
      try {
        const response = await fetch(`/api/component-optionals/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setComponentOptionals(
            componentOptionals.filter((option) => option.id !== id)
          );
        } else {
          const errorText = await response.text();
          console.error("Failed to delete component optional:", errorText);
          setErrorMessage(errorText);
        }
      } catch (error) {
        console.error("Error deleting component optional:", error);
        setErrorMessage("A network error occurred. Please try again.");
      }
    }
  };

  const openModal = () => {
    setErrorMessage(null);
    setEditingOption(null);
    setFormData({
      componentOptionalName: "",
      componentId: "",
      description: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOption(null);
    setFormData({
      componentOptionalName: "",
      componentId: "",
      description: "",
      isActive: true,
    });
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Component Options Management</h2>
        <button className="add-button" onClick={openModal}>
          Add New Option
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
              <th>ID</th>
              <th>Option Name</th>
              <th>Component</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {componentOptionals.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Loading component options...
                </td>
              </tr>
            ) : (
              componentOptionals.map((option) => {
                console.log("Rendering component option:", option); // Debug log
                return (
                  <tr key={option.id || option.componentOptionalId || `option-${option.componentOptionalName}`}>
                    <td>{option.id}</td>
                    <td>{option.componentOptionalName}</td>
                    <td>{option.componentName}</td>
                    <td>{option.description}</td>
                    <td>{option.createdBy}</td>
                    <td>
                      <span className={`status-badge ${option.isActive ? 'active' : 'inactive'}`}>
                        {option.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(option)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(option.id)}
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
                {editingOption
                  ? "Edit Component Option"
                  : "Add New Component Option"}
              </h3>
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="componentOptionalName">Option Name:</label>
                <input
                  type="text"
                  id="componentOptionalName"
                  value={formData.componentOptionalName}
                  onChange={(e) =>
                    setFormData({ ...formData, componentOptionalName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="componentId">Component:</label>
                <select
                  id="componentId"
                  value={formData.componentId}
                  onChange={(e) =>
                    setFormData({ ...formData, componentId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Component</option>
                  {components.map((component) => (
                    <option key={component.componentId} value={component.componentId}>
                      {component.componentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                />
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
                  {editingOption ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentOptionalsManager;
