import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";

const ComponentsManager = () => {
  const [components, setComponents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [formData, setFormData] = useState({
    componentName: "",
    categoryId: "",
    description: "",
    isActive: true
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
      // Fetch categories
      const categoriesResponse = await api.get('/api/categories');
      if (categoriesResponse.status === 200) {
        const categoriesData = categoriesResponse.data;
        // Transform API data to match our component structure
        const transformedCategories = categoriesData.map(item => ({
          categoryId: item.categoryId || item.id,
          categoryName: item.categoryName || item.name,
        }));
        
        setCategories(transformedCategories);
      } else {
        console.error('Failed to fetch categories');
        setCategories([
          { categoryId: "CAT001", categoryName: "Rings" },
          { categoryId: "CAT002", categoryName: "Necklaces" },
          { categoryId: "CAT003", categoryName: "Earrings" }
        ]);
      }

      // Fetch components
      const componentsResponse = await api.get('/api/components');
      if (componentsResponse.status === 200) {
        const componentsData = componentsResponse.data;
        console.log('API Components data:', componentsData); // Debug log
        
        // Transform API data to match our component structure
        const transformedComponents = componentsData.map(item => ({
          id: item.componentId || item.id,
          componentName: item.componentName || item.name,
          categoryId: item.category?.categoryId || item.categoryId,
          categoryName: item.category?.categoryName || item.categoryName || 'Unknown Category',
          description: item.description || '',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
          isActive: item.isActive
        }));
        
        console.log('Transformed Components:', transformedComponents); // Debug log
        setComponents(transformedComponents);
      } else {
        console.error('Failed to fetch components');
        setComponents([
          { 
            id: "COMP001", 
            componentName: "Diamond Ring Base", 
            categoryId: "CAT001", 
            categoryName: "Rings",
            description: "14K gold ring base", 
            isActive: true,
            createdBy: "system"
          },
          { 
            id: "COMP002", 
            componentName: "Gold Chain", 
            categoryId: "CAT002", 
            categoryName: "Necklaces",
            description: "18K gold chain necklace", 
            isActive: true,
            createdBy: "system"
          },
          { 
            id: "COMP003", 
            componentName: "Diamond Studs", 
            categoryId: "CAT003", 
            categoryName: "Earrings",
            description: "Classic diamond stud earrings", 
            isActive: false,
            createdBy: "system"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setCategories([
        { categoryId: "CAT001", categoryName: "Rings" },
        { categoryId: "CAT002", categoryName: "Necklaces" },
        { categoryId: "CAT003", categoryName: "Earrings" }
      ]);
      setComponents([
        { 
          id: 1, 
          name: "Diamond Ring Base", 
          categoryId: 1, 
          categoryName: "Rings",
          description: "14K gold ring base", 
          price: 1200,
          status: "active" 
        },
        { 
          id: 2, 
          name: "Gold Chain", 
          categoryId: 2, 
          categoryName: "Necklaces",
          description: "18K gold chain necklace", 
          price: 800,
          status: "active" 
        },
        { 
          id: 3, 
          name: "Diamond Studs", 
          categoryId: 3, 
          categoryName: "Earrings",
          description: "Classic diamond stud earrings", 
          price: 600,
          status: "inactive" 
        }
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
      if (editingComponent) {
        // Update existing component
        const response = await api.put(`/api/components/${editingComponent.id}`, formData);

        if (response.status === 200) {
          const updatedComponent = response.data;
          setComponents(
            components.map((comp) =>
              comp.id === editingComponent.id ? {
                ...updatedComponent,
                id: updatedComponent.componentId,
                componentName: updatedComponent.componentName,
                categoryName: updatedComponent.category?.categoryName || 'Unknown Category'
              } : comp
            )
          );
        } else {
          console.error("Failed to update component:", response.data);
          setErrorMessage(response.data?.message || "Failed to update component");
          return;
        }
      } else {
        // Add new component
        const response = await api.post("/api/components", formData);

        if (response.status === 201 || response.status === 200) {
          const newComponent = response.data;
          setComponents([...components, {
            ...newComponent,
            id: newComponent.componentId,
            componentName: newComponent.componentName,
            categoryName: newComponent.category?.categoryName || 'Unknown Category'
          }]);
        } else {
          console.error("Failed to create component:", response.data);
          setErrorMessage(response.data?.message || "Failed to create component");
          return;
        }
      }

      closeModal();
    } catch (error) {
      console.error("Error submitting component:", error);
      setErrorMessage("A network error occurred. Please try again.");
    }
  };

  const handleEdit = (component) => {
    setErrorMessage(null);
    setEditingComponent(component);
    setFormData({
      componentName: component.componentName,
      categoryId: component.categoryId.toString(),
      description: component.description,
      isActive: component.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setErrorMessage(null);
    if (window.confirm("Are you sure you want to delete this component?")) {
      try {
        const response = await api.delete(`/api/components/${id}`);

        if (response.status === 200 || response.status === 204) {
          setComponents(components.filter((comp) => comp.id !== id));
        } else {
          console.error("Failed to delete component:", response.data);
          setErrorMessage(response.data?.message || "Failed to delete component");
        }
      } catch (error) {
        console.error("Error deleting component:", error);
        setErrorMessage("A network error occurred. Please try again.");
      }
    }
  };

  const openModal = () => {
    setErrorMessage(null);
    setEditingComponent(null);
    setFormData({ componentName: "", categoryId: "", description: "", isActive: true });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingComponent(null);
    setFormData({ componentName: "", categoryId: "", description: "", isActive: true });
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Components Management</h2>
        <button className="add-button" onClick={openModal}>
          Add New Component
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
              <th>Component Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {components.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading components...
                </td>
              </tr>
            ) : (
              components.map((component) => {
                console.log('Rendering component:', component); // Debug log
                return (
                  <tr key={component.id || component.componentId || `component-${component.componentName}`}>
                    <td>{component.id}</td>
                    <td>{component.componentName}</td>
                    <td>{component.categoryName}</td>
                    <td>{component.description}</td>
                    <td>{component.createdBy}</td>
                    <td>
                      <span className={`status-badge ${component.isActive ? 'active' : 'inactive'}`}>
                        {component.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="edit-button"
                        onClick={() => handleEdit(component)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(component.id)}
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
              <h3>{editingComponent ? "Edit Component" : "Add New Component"}</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="componentName">Component Name:</label>
                <input
                  type="text"
                  id="componentName"
                  value={formData.componentName}
                  onChange={(e) => setFormData({...formData, componentName: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="categoryId">Category:</label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="isActive">Status:</label>
                <select
                  id="isActive"
                  value={formData.isActive.toString()}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={closeModal} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingComponent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentsManager;