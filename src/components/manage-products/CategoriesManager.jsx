import React, { useState, useEffect } from "react";

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
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
        }, 300); // Wait for fade out animation to complete
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
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        console.log("API Categories data:", data); // Debug log

        // Transform API data to match our component structure if needed
        const transformedData = data.map((item) => ({
          id: item.categoryId || item.id,
          categoryName: item.categoryName || item.name,
          description: item.description || "",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
          isActive: item.isActive,
        }));

        console.log("Transformed Categories:", transformedData); // Debug log
        setCategories(transformedData);
      } else {
        console.error("Failed to fetch categories:", response.status);
        // Fallback to mock data if API fails
        const mockCategories = [
          {
            id: "CAT001",
            categoryName: "Rings",
            description: "Wedding and engagement rings",
            isActive: true,
            createdBy: "system",
          },
          {
            id: "CAT002",
            categoryName: "Necklaces",
            description: "Diamond necklaces collection",
            isActive: true,
            createdBy: "system",
          },
          {
            id: "CAT003",
            categoryName: "Earrings",
            description: "Premium earrings",
            isActive: false,
            createdBy: "system",
          },
        ];
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to mock data if API fails
      const mockCategories = [
        {
          id: "CAT001",
          categoryName: "Rings",
          description: "Wedding and engagement rings",
          isActive: true,
          createdBy: "system",
        },
        {
          id: "CAT002",
          categoryName: "Necklaces",
          description: "Diamond necklaces collection",
          isActive: true,
          createdBy: "system",
        },
        {
          id: "CAT003",
          categoryName: "Earrings",
          description: "Premium earrings",
          isActive: false,
          createdBy: "system",
        },
      ];
      setCategories(mockCategories);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== HANDLE SUBMIT CALLED ===');
    console.log('Current formData:', formData);

    try {
      if (editingCategory) {
        // Update existing category
        console.log('Updating category with ID:', editingCategory.id);
        console.log('Form data being sent:', formData);
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        console.log('Update response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Update failed with error:', errorText);
        }

        if (response.ok) {
          const updatedCategory = await response.json();
          console.log('API response after update:', updatedCategory);
          const transformedCategory = {
            ...updatedCategory,
            id: updatedCategory.categoryId || updatedCategory.id,
            categoryName: updatedCategory.categoryName,
            description: updatedCategory.description,
            isActive: updatedCategory.isActive,
            createdBy: updatedCategory.createdBy,
            updatedBy: updatedCategory.updatedBy,
            createdAt: updatedCategory.createdAt,
            updatedAt: updatedCategory.updatedAt
          };
          console.log('Updating category:', editingCategory.id, 'with data:', transformedCategory);
          setCategories(
            categories.map((cat) => {
              if (cat.id === editingCategory.id) {
                console.log('Found matching category, updating:', cat.id);
                return transformedCategory;
              }
              return cat;
            })
          );
          console.log('Categories after update:', categories);
        } else {
          console.error("Failed to update category");
          // Fallback to local update
          setCategories(
            categories.map((cat) =>
              cat.id === editingCategory.id ? { ...cat, ...formData } : cat
            )
          );
        }
      } else {
        // Add new category
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newCategory = await response.json();
          const transformedCategory = {
            ...newCategory,
            id: newCategory.categoryId || newCategory.id,
            categoryName: newCategory.categoryName,
            description: newCategory.description,
            isActive: newCategory.isActive,
            createdBy: newCategory.createdBy,
            updatedBy: newCategory.updatedBy,
            createdAt: newCategory.createdAt,
            updatedAt: newCategory.updatedAt
          };
          setCategories([...categories, transformedCategory]);
        } else {
          console.error("Failed to create category");
          // Fallback to local add
          const newCategory = {
            id: Date.now(),
            ...formData,
          };
          setCategories([...categories, newCategory]);
        }
      }

      closeModal();
    } catch (error) {
      console.error("Error submitting category:", error);
      // Fallback to local operations
      if (editingCategory) {
        setCategories(
          categories.map((cat) =>
            cat.id === editingCategory.id ? { ...cat, ...formData } : cat
          )
        );
      } else {
        const newCategory = {
          id: Date.now(),
          ...formData,
        };
        setCategories([...categories, newCategory]);
      }
      closeModal();
    }
  };

  const handleEdit = (category) => {
    setErrorMessage(null);
    setEditingCategory(category);
    setFormData({
      categoryName: category.categoryName,
      description: category.description,
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setErrorMessage(null);
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setCategories(categories.filter((cat) => cat.id !== id));
        } else {
          const errorText = await response.text();
          console.error("Failed to delete category:", errorText);

          setErrorMessage(errorText);
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        setErrorMessage("An network error occurred. Please try again.");
      }
    }
  };

  const openModal = () => {
    setErrorMessage(null);
    setEditingCategory(null);
    setFormData({ categoryName: "", description: "", isActive: true });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ categoryName: "", description: "", isActive: true });
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Categories Management</h2>
        <button className="add-button" onClick={openModal}>
          Add New Category
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
              <th>Category Name</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Loading categories...
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                console.log("Rendering category:", category); // Debug log
                return (
                  <tr key={category.id || category.categoryId || `category-${category.categoryName}`}>
                    <td>{category.id}</td>
                    <td>{category.categoryName}</td>
                    <td>{category.description}</td>
                    <td>{category.createdBy}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          category.isActive ? "active" : "inactive"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(category.id)}
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
              <h3>{editingCategory ? "Edit Category" : "Add New Category"}</h3>
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="categoryName">Category Name:</label>
                <input
                  type="text"
                  id="categoryName"
                  value={formData.categoryName}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryName: e.target.value })
                  }
                  required
                />
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
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;
