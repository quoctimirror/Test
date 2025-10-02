import React, { useState } from "react";
import ProductsManager from "./ProductsManager";
import OrdersManager from "./OrdersManager";
import PaymentSchedulesManager from "./PaymentSchedulesManager";
import CategoriesManagerEnhanced from "@components/manage-products/CategoriesManagerEnhanced";
import CollectionsManager from "./CollectionsManager";
import LocationsManager from "./LocationsManager";
import ComponentsManager from "./ComponentsManager";
import UsersManager from "./UsersManager";
import VendorsManager from "./VendorsManager";
import DashboardHome from "./DashboardHome";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "payments", label: "Payment schedules" },
    { id: "categories", label: "Categories" },
    { id: "collections", label: "Collections" },
    { id: "locations", label: "Locations" },
    { id: "vendors", label: "Vendors" },
    // { id: "components", label: "Components" },
    { id: "users", label: "Users" },
  ];

  const handleHomeNavigation = () => {
    window.location.href = '/home';
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome setActiveTab={setActiveTab} />;
      case "products":
        return <ProductsManager />;
      case "orders":
        return <OrdersManager />;
      case "payments":
        return <PaymentSchedulesManager />;
      case "categories":
        return <CategoriesManagerEnhanced />;
      case "collections":
        return <CollectionsManager />;
      case "locations":
        return <LocationsManager />;
      case "vendors":
        return <VendorsManager />;
      case "components":
        return <ComponentsManager />;
      case "users":
        return <UsersManager />;
      default:
        return <DashboardHome />;
    }
  };

  const getPageInfo = () => {
    const pageMap = {
      dashboard: {
        title: "Admin Dashboard",
        description: "Overview of your Mirror Diamond management system",
      },
      products: {
        title: "Products Management",
        description:
          "Manage your diamond products, rings, necklaces, and jewelry items",
      },
      categories: {
        title: "Categories Management",
        description:
          "Organize products into categories like rings, necklaces, earrings",
      },
      orders: {
        title: "Orders Management",
        description: "Review new customer orders and coordinate follow-up",
      },
      payments: {
        title: "Payment Schedules",
        description: "Monitor installments across orders and record payments",
      },
      collections: {
        title: "Collections Management",
        description: "Manage seasonal collections and product groupings",
      },
      locations: {
        title: "Store Locations",
        description:
          "Manage store locations, addresses, and contact information",
      },
      vendors: {
        title: "Vendors Management",
        description: "Manage vendor information, contracts, and supplier details",
      },
      components: {
        title: "Components Management",
        description: "Manage product components and customizable options",
      },
      users: {
        title: "Users Management",
        description: "Manage user accounts, permissions, and access control",
      },
    };
    return pageMap[activeTab] || pageMap.dashboard;
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1 className="admin-sidebar-title">Mirror Admin</h1>
          <p className="admin-sidebar-subtitle">Management Portal</p>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-button ${
                activeTab === item.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="admin-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="home-nav-button" onClick={handleHomeNavigation}>
            <span className="home-nav-label">← Back to Home</span>
          </button>
          <div className="admin-user-info">
            <div className="admin-user-avatar">A</div>
            <div className="admin-user-details">
              <div className="admin-user-name">Admin User</div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        <div className="admin-content-header">
          <div className="admin-breadcrumb">
            <span>Admin</span>
            <span className="breadcrumb-separator">›</span>
            <span>{getPageInfo().title}</span>
          </div>
          <h1 className="admin-page-title">{getPageInfo().title}</h1>
          <p className="admin-page-description">{getPageInfo().description}</p>
        </div>

        <div className="admin-content-body">{renderActiveTab()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
