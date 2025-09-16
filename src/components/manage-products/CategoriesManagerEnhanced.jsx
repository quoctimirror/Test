import React, { useState, useEffect } from "react";
import api from "@api/axiosConfig";
import "./CategoriesManagerEnhanced.css";

const CategoriesManagerEnhanced = () => {
  const [categories, setCategories] = useState([]);
  const [components, setComponents] = useState({});
  const [componentOptions, setComponentOptions] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingComponent, setEditingComponent] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [selectedCategoryForComponent, setSelectedCategoryForComponent] = useState(null);
  const [selectedComponentForOption, setSelectedComponentForOption] = useState(null);
  // Removed expandedCategories since we always show components

  const [categoryFormData, setCategoryFormData] = useState({
    categoryName: "",
    description: "",
    isActive: true,
  });

  const [componentFormData, setComponentFormData] = useState({
    componentName: "",
    description: "",
    isActive: true,
  });

  const [optionFormData, setOptionFormData] = useState({
    componentOptionalName: "",
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

  const closeErrorMessage = () => {
    setIsErrorFadingOut(true);
    setTimeout(() => {
      setErrorMessage(null);
      setIsErrorFadingOut(false);
    }, 300);
  };

  // API calls
  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      if (response.status === 200) {
        const transformedData = response.data.map((item) => ({
          id: item.categoryId || item.id,
          categoryName: item.categoryName || item.name,
          description: item.description || "",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
          isActive: item.isActive,
        }));
        setCategories(transformedData);
        
        // Fetch components for each category
        transformedData.forEach(category => {
          fetchComponentsForCategory(category.id);
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setErrorMessage("Failed to fetch categories");
    }
  };

  const fetchComponentsForCategory = async (categoryId) => {
    try {
      const response = await api.get(`/api/components/category/${categoryId}`);
      if (response.status === 200) {
        const transformedData = response.data.map((item) => ({
          id: item.componentId || item.id,
          componentName: item.componentName || item.name,
          description: item.description || "",
          categoryId: item.categoryId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
          isActive: item.isActive,
        }));
        setComponents(prev => ({ ...prev, [categoryId]: transformedData }));
        
        // Fetch options for each component
        transformedData.forEach(component => {
          if (component.id && component.id.trim()) {
            fetchOptionsForComponent(component.id);
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching components for category ${categoryId}:`, error);
    }
  };

  const fetchOptionsForComponent = async (componentId) => {
    try {
      const response = await api.get(`/api/component-optionals/component/${componentId}`);
      if (response.status === 200) {
        const data = Array.isArray(response.data) ? response.data : [];
        const transformedData = data.map((item) => ({
          id: item.componentOptionalId || item.id,
          componentOptionalName: item.componentOptionalName || item.name,
          description: item.description || "",
          componentId: item.componentId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
          isActive: item.isActive,
        }));
        setComponentOptions(prev => ({ ...prev, [componentId]: transformedData }));
      }
    } catch (error) {
      // Handle both 404 (component not found) and other errors gracefully
      setComponentOptions(prev => ({ ...prev, [componentId]: [] }));
      if (error.response?.status !== 404) {
        console.error(`Error fetching options for component ${componentId}:`, error);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Removed toggleCategoryExpansion since we always show components

  // Category handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const response = await api.put(`/api/categories/${editingCategory.id}`, categoryFormData);
        if (response.status === 200) {
          const transformedCategory = {
            ...response.data,
            id: response.data.categoryId || response.data.id,
            categoryName: response.data.categoryName,
            description: response.data.description,
            isActive: response.data.isActive,
          };
          setCategories(categories.map((cat) =>
            cat.id === editingCategory.id ? transformedCategory : cat
          ));
        }
      } else {
        const response = await api.post("/api/categories", categoryFormData);
        if (response.status === 201 || response.status === 200) {
          const transformedCategory = {
            ...response.data,
            id: response.data.categoryId || response.data.id,
            categoryName: response.data.categoryName,
            description: response.data.description,
            isActive: response.data.isActive,
          };
          setCategories([...categories, transformedCategory]);
        }
      }
      closeCategoryModal();
    } catch (error) {
      console.error("Error submitting category:", error);
      setErrorMessage("Failed to save category");
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      categoryName: category.categoryName,
      description: category.description,
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await api.delete(`/api/categories/${id}`);
        if (response.status === 200 || response.status === 204) {
          setCategories(categories.filter((cat) => cat.id !== id));
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        setErrorMessage("Failed to delete category");
      }
    }
  };

  const openCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({ categoryName: "", description: "", isActive: true });
    setIsModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryFormData({ categoryName: "", description: "", isActive: true });
  };

  // Component handlers
  const handleComponentSubmit = async (e) => {
    e.preventDefault();
    const requestData = {
      componentName: componentFormData.componentName,
      description: componentFormData.description,
      categoryId: selectedCategoryForComponent,
    };

    try {
      if (editingComponent) {
        const response = await api.put(`/api/components/${editingComponent.id}`, requestData);
        if (response.status === 200) {
          const updatedComponent = {
            ...response.data,
            id: response.data.componentId || response.data.id,
          };
          setComponents(prev => ({
            ...prev,
            [selectedCategoryForComponent]: prev[selectedCategoryForComponent].map(comp =>
              comp.id === editingComponent.id ? updatedComponent : comp
            )
          }));
        }
      } else {
        const response = await api.post("/api/components", requestData);
        if (response.status === 201 || response.status === 200) {
          const newComponent = {
            ...response.data,
            id: response.data.componentId || response.data.id,
          };
          setComponents(prev => ({
            ...prev,
            [selectedCategoryForComponent]: [...(prev[selectedCategoryForComponent] || []), newComponent]
          }));
        }
      }
      closeComponentModal();
    } catch (error) {
      console.error("Error submitting component:", error);
      console.error("Error response:", error.response?.data);
      setErrorMessage(error.response?.data || "Failed to save component");
    }
  };

  const handleComponentEdit = (component, categoryId) => {
    setEditingComponent(component);
    setSelectedCategoryForComponent(categoryId);
    setComponentFormData({
      componentName: component.componentName,
      description: component.description || "",
    });
    setIsComponentModalOpen(true);
  };

  const handleComponentDelete = async (componentId, categoryId) => {
    if (window.confirm("Are you sure you want to delete this component?")) {
      try {
        const response = await api.delete(`/api/components/${componentId}`);
        if (response.status === 200 || response.status === 204) {
          setComponents(prev => ({
            ...prev,
            [categoryId]: prev[categoryId].filter(comp => comp.id !== componentId)
          }));
        }
      } catch (error) {
        console.error("Error deleting component:", error);
        setErrorMessage("Failed to delete component");
      }
    }
  };

  const openComponentModal = (categoryId) => {
    setEditingComponent(null);
    setSelectedCategoryForComponent(categoryId);
    setComponentFormData({ componentName: "", description: "", isActive: true });
    setIsComponentModalOpen(true);
  };

  const closeComponentModal = () => {
    setIsComponentModalOpen(false);
    setEditingComponent(null);
    setSelectedCategoryForComponent(null);
    setComponentFormData({ componentName: "", description: "", isActive: true });
  };

  // Component Option handlers
  const handleOptionSubmit = async (e) => {
    e.preventDefault();
    const requestData = {
      componentOptionalName: optionFormData.componentOptionalName,
      description: optionFormData.description,
      componentId: selectedComponentForOption,
    };

    try {
      if (editingOption) {
        const response = await api.put(`/api/component-optionals/${editingOption.id}`, requestData);
        if (response.status === 200) {
          const updatedOption = {
            ...response.data,
            id: response.data.componentOptionalId || response.data.id,
          };
          setComponentOptions(prev => ({
            ...prev,
            [selectedComponentForOption]: prev[selectedComponentForOption].map(opt =>
              opt.id === editingOption.id ? updatedOption : opt
            )
          }));
        }
      } else {
        const response = await api.post("/api/component-optionals", requestData);
        if (response.status === 201 || response.status === 200) {
          const newOption = {
            ...response.data,
            id: response.data.componentOptionalId || response.data.id,
          };
          setComponentOptions(prev => ({
            ...prev,
            [selectedComponentForOption]: [...(prev[selectedComponentForOption] || []), newOption]
          }));
        }
      }
      closeOptionModal();
    } catch (error) {
      console.error("Error submitting option:", error);
      console.error("Error response:", error.response?.data);
      setErrorMessage(error.response?.data || "Failed to save option");
    }
  };

  const handleOptionEdit = (option, componentId) => {
    setEditingOption(option);
    setSelectedComponentForOption(componentId);
    setOptionFormData({
      componentOptionalName: option.componentOptionalName,
      description: option.description || "",
    });
    setIsOptionModalOpen(true);
  };

  const handleOptionDelete = async (optionId, componentId) => {
    if (window.confirm("Are you sure you want to delete this option?")) {
      try {
        const response = await api.delete(`/api/component-optionals/${optionId}`);
        if (response.status === 200 || response.status === 204) {
          setComponentOptions(prev => ({
            ...prev,
            [componentId]: prev[componentId].filter(opt => opt.id !== optionId)
          }));
        }
      } catch (error) {
        console.error("Error deleting option:", error);
        setErrorMessage("Failed to delete option");
      }
    }
  };

  const openOptionModal = (componentId) => {
    setEditingOption(null);
    setSelectedComponentForOption(componentId);
    setOptionFormData({ componentOptionalName: "", description: "", isActive: true });
    setIsOptionModalOpen(true);
  };

  const closeOptionModal = () => {
    setIsOptionModalOpen(false);
    setEditingOption(null);
    setSelectedComponentForOption(null);
    setOptionFormData({ componentOptionalName: "", description: "", isActive: true });
  };

  return (
    <div className="categories-enhanced-container">
      <div className="enhanced-header">
        <div>
          <h2>Categories Management</h2>
          <p>Organize products into categories like rings, necklaces, earrings</p>
        </div>
        <button className="add-category-btn" onClick={openCategoryModal}>
          +
        </button>
      </div>

      {errorMessage && (
        <div className={`error-message-container ${isErrorFadingOut ? 'fade-out' : ''}`}>
          <p>{errorMessage}</p>
          <button className="error-close-button" onClick={closeErrorMessage}>×</button>
        </div>
      )}

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="loading-state">Loading categories...</div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <div className="category-info">
                  <h3>{category.categoryName}</h3>
                  <p className="category-id">ID: {category.id}</p>
                  <p className="category-description">{category.description}</p>
                  <span className={`status-badge ${category.isActive ? "active" : "inactive"}`}>
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="category-actions">
                  <button className="edit-btn" onClick={() => handleCategoryEdit(category)} title="Edit Category">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button className="delete-btn" onClick={() => handleCategoryDelete(category.id)} title="Delete Category">
                    ×
                  </button>
                </div>
              </div>

              <div className="components-section">
                <div className="components-header">
                  <h4 className="components-title">
                    Components ({components[category.id]?.length || 0})
                  </h4>
                  <button 
                    className="add-component-btn"
                    onClick={() => openComponentModal(category.id)}
                    title="Add Component"
                  >
                    +
                  </button>
                </div>

                <div className="components-list">
                  {components[category.id] && components[category.id].length > 0 ? (
                    components[category.id].map((component) => (
                      <div key={component.id} className="component-container">
                        <div className="component-item">
                        <div className="component-info">
                          <h4>{component.componentName}</h4>
                        </div>
                        <div className="component-actions">
                          <button 
                            className="edit-btn small"
                            onClick={() => handleComponentEdit(component, category.id)}
                            title="Edit Component"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button 
                            className="delete-btn small"
                            onClick={() => handleComponentDelete(component.id, category.id)}
                            title="Delete Component"
                          >
                            ×
                          </button>
                          <button 
                            className="add-option-btn small"
                            onClick={() => openOptionModal(component.id)}
                            title="Add Option"
                          >
                            +
                          </button>
                        </div>
                        </div>

                        {componentOptions[component.id] && componentOptions[component.id].length > 0 && (
                          <div className="options-list">
                            <h5>Options:</h5>
                            {componentOptions[component.id].map((option) => (
                              <div key={option.id} className="option-item">
                                <div className="option-info">
                                  <span className="option-name">{option.componentOptionalName}</span>
                                </div>
                                <div className="option-actions">
                                  <button 
                                    className="edit-btn mini"
                                    onClick={() => handleOptionEdit(option, component.id)}
                                    title="Edit Option"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                  </button>
                                  <button 
                                    className="delete-btn mini"
                                    onClick={() => handleOptionDelete(option.id, component.id)}
                                    title="Delete Option"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-components">No components yet</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCategory ? "Edit Category" : "Add New Category"}</h3>
              <button className="close-button" onClick={closeCategoryModal}>×</button>
            </div>
            <form onSubmit={handleCategorySubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="categoryName">Category Name:</label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryFormData.categoryName}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, categoryName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="isActive">Status:</label>
                <select
                  id="isActive"
                  value={categoryFormData.isActive.toString()}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={closeCategoryModal} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Component Modal */}
      {isComponentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingComponent ? "Edit Component" : "Add New Component"}</h3>
              <button className="close-button" onClick={closeComponentModal}>×</button>
            </div>
            <form onSubmit={handleComponentSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="componentName">Component Name:</label>
                <input
                  type="text"
                  id="componentName"
                  value={componentFormData.componentName}
                  onChange={(e) => setComponentFormData({ ...componentFormData, componentName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="componentDescription">Description:</label>
                <textarea
                  id="componentDescription"
                  value={componentFormData.description}
                  onChange={(e) => setComponentFormData({ ...componentFormData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={closeComponentModal} className="cancel-button">
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

      {/* Option Modal */}
      {isOptionModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingOption ? "Edit Option" : "Add New Option"}</h3>
              <button className="close-button" onClick={closeOptionModal}>×</button>
            </div>
            <form onSubmit={handleOptionSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="optionName">Option Name:</label>
                <input
                  type="text"
                  id="optionName"
                  value={optionFormData.componentOptionalName}
                  onChange={(e) => setOptionFormData({ ...optionFormData, componentOptionalName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="optionDescription">Description:</label>
                <textarea
                  id="optionDescription"
                  value={optionFormData.description}
                  onChange={(e) => setOptionFormData({ ...optionFormData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={closeOptionModal} className="cancel-button">
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

export default CategoriesManagerEnhanced;