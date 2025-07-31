import React, { useState } from "react";
import CategoriesManager from "./CategoriesManager";
import ComponentsManager from "./ComponentsManager";
import ComponentOptionalsManager from "./ComponentOptionalsManager";
import ItemVariantsManager from "./ItemVariantsManager";
import ItemVariantConfigsManager from "./ItemVariantConfigsManager";
import "./ManageProducts.css";

const ManageProducts = () => {
  const [activeTab, setActiveTab] = useState("categories");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "categories":
        return <CategoriesManager />;
      case "components":
        return <ComponentsManager />;
      case "component-optionals":
        return <ComponentOptionalsManager />;
      case "item-variants":
        return <ItemVariantsManager />;
      case "item-variant-configs":
        return <ItemVariantConfigsManager />;
      default:
        return <CategoriesManager />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "categories":
        return "Categories Management";
      case "components":
        return "Components Management";
      case "component-optionals":
        return "Component Options Management";
      case "item-variants":
        return "Item Variants Management";
      case "item-variant-configs":
        return "Item Variant Configs Management";
      default:
        return "Categories Management";
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case "categories":
        return "Manage product categories - rings, necklaces, earrings, etc.";
      case "components":
        return "Manage individual components within each category";
      case "component-optionals":
        return "Manage customizable options for each component";
      case "item-variants":
        return "Manage item variants with URL, description";
      case "item-variant-configs":
        return "Manage configurations linking item variants with component options";
      default:
        return "Manage product categories";
    }
  };

  return (
    <div className="manage-products-container">
      {/* Sidebar Navigation */}
      <div className="sidebar-navigation">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Product Management</h1>
        </div>

        <div className="sidebar-menu">
          <button
            className={`tab-button ${
              activeTab === "categories" ? "active" : ""
            }`}
            data-tab="categories"
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </button>
          <button
            className={`tab-button ${
              activeTab === "components" ? "active" : ""
            }`}
            data-tab="components"
            onClick={() => setActiveTab("components")}
          >
            Components
          </button>
          <button
            className={`tab-button ${
              activeTab === "component-optionals" ? "active" : ""
            }`}
            data-tab="component-optionals"
            onClick={() => setActiveTab("component-optionals")}
          >
            Component Options
          </button>
          <button
            className={`tab-button ${
              activeTab === "item-variants" ? "active" : ""
            }`}
            data-tab="item-variants"
            onClick={() => setActiveTab("item-variants")}
          >
            Item Variants
          </button>
          <button
            className={`tab-button ${
              activeTab === "item-variant-configs" ? "active" : ""
            }`}
            data-tab="item-variant-configs"
            onClick={() => setActiveTab("item-variant-configs")}
          >
            Item Variant Configs
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1>{getPageTitle()}</h1>
          <p>{getPageDescription()}</p>
        </div>

        <div className="tab-content">{renderActiveTab()}</div>
      </div>
    </div>
  );
};

export default ManageProducts;
