import React, { useEffect, useMemo, useState } from "react";
import ProductsManager from "./ProductsManager";
import UnifiedOrdersManager from "./UnifiedOrdersManager";
import ProductFulfillment from "./ProductFulfillment";
import VendorMatching from "./VendorMatching";
import VendorOptimization from "./VendorOptimization";
import MultiCurrencyCalculator from "./MultiCurrencyCalculator";
import PreciousMetalDashboard from "./PreciousMetalDashboard";
import UnitConversionCalculator from "./UnitConversionCalculator";
import PaymentSchedulesManager from "./PaymentSchedulesManager";
import CategoriesManagerEnhanced from "@components/manage-products/CategoriesManagerEnhanced";
import CollectionsManager from "./CollectionsManager";
import LocationsManager from "./LocationsManager";
import ComponentsManager from "./ComponentsManager";
import UsersManager from "./UsersManager";
import VendorsManager from "./VendorsManager";
import SkuCodesManager from "./SkuCodesManager";
import DashboardHome from "./DashboardHome";
import CollectionPlanWizard from "./CollectionPlanWizard";
import CustomsComplianceManager from "./CustomsComplianceManager";
import JewelrySpecificationManager from "./JewelrySpecificationManager";
import MarketTrendDashboard from "./MarketTrendDashboard";
import PurchaseOrderSummary from "./PurchaseOrderSummary";
import VendorSelectionWizard from "./VendorSelectionWizard";
import RBACMatrix from "./RBACMatrix";
import "./AdminDashboard.css";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdminLike = roles.includes("ADMIN") || roles.includes("IT_ADMIN");

  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "products", label: "Products" },
    { id: "product-fulfillment", label: "Product Fulfillment" },
    { id: "sku-codes", label: "SKU Codes" },
    { id: "orders", label: "Orders" },
    { id: "payments", label: "Payment schedules" },
    { id: "categories", label: "Categories" },
    { id: "collections", label: "Collections" },
    { id: "locations", label: "Locations" },
    { id: "vendors", label: "Vendors" },
    { id: "vendor-matching", label: "Vendor Matching" },
    { id: "vendor-optimization", label: "Vendor Optimization" },
    { id: "vendor-selection-wizard", label: "Vendor Selection Wizard" },
    { id: "currency-calculator", label: "Currency Calculator" },
    { id: "metal-prices", label: "Metal Prices" },
    { id: "unit-converter", label: "Unit Converter" },
    { id: "collection-plan-wizard", label: "Collection Plan Wizard" },
    { id: "jewelry-specifications", label: "Jewelry Specifications" },
    { id: "purchase-orders", label: "Purchase Orders" },
    { id: "market-trends", label: "Market Trends" },
    { id: "customs-compliance", label: "Customs & Compliance" },
    // { id: "components", label: "Components" },
    { id: "users", label: "Users" },
    { id: "rbac-matrix", label: "RBAC Matrix" },
  ];

  const tabAccess = useMemo(
    () => ({
      dashboard: roles,
      products: ["CREATIVE_DESIGN", "ADMIN", "IT_ADMIN"],
      "product-fulfillment": ["CREATIVE_DESIGN", "MARKETING", "PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      "sku-codes": ["CREATIVE_DESIGN", "ADMIN", "IT_ADMIN"],
      orders: ["SALES_CUSTOMER_OPS", "FINANCE", "PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      payments: ["FINANCE", "SALES_CUSTOMER_OPS", "ADMIN", "IT_ADMIN"],
      categories: ["MARKETING", "CREATIVE_DESIGN", "ADMIN", "IT_ADMIN"],
      collections: ["MARKETING", "CREATIVE_DESIGN", "ADMIN", "IT_ADMIN"],
      locations: ["ADMIN", "IT_ADMIN"],
      vendors: ["PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      "vendor-matching": ["PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      "vendor-optimization": ["PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      "vendor-selection-wizard": ["PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      "currency-calculator": ["FINANCE", "PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      "metal-prices": ["FINANCE", "PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      "unit-converter": ["PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      "collection-plan-wizard": ["PRODUCTION_OPS", "CREATIVE_DESIGN", "ADMIN", "IT_ADMIN"],
      "jewelry-specifications": ["PRODUCTION_OPS", "CREATIVE_DESIGN", "ADMIN", "IT_ADMIN"],
      "purchase-orders": ["PRODUCTION_OPS", "FINANCE", "ADMIN", "IT_ADMIN"],
      "market-trends": ["MARKETING", "PRODUCTION_OPS", "ADMIN", "IT_ADMIN"],
      "customs-compliance": ["PRODUCTION_OPS", "LEGAL", "ADMIN", "IT_ADMIN"],
      users: ["ADMIN", "IT_ADMIN"],
      "rbac-matrix": ["ADMIN", "IT_ADMIN"],
    }),
    [roles]
  );

  const isTabAllowed = (id) => {
    const allowed = tabAccess[id];
    if (!allowed || allowed.length === 0) return isAdminLike;
    return isAdminLike || roles.some((r) => allowed.includes(r));
  };

  const visibleMenuItems = menuItems.filter((item) => isTabAllowed(item.id));

  useEffect(() => {
    if (!isTabAllowed(activeTab) && visibleMenuItems.length > 0) {
      setActiveTab(visibleMenuItems[0].id);
    }
  }, [activeTab, visibleMenuItems]);

  const handleHomeNavigation = () => {
    window.location.href = ROUTES.HOME_PAGE;
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome setActiveTab={setActiveTab} />;
      case "products":
        return <ProductsManager />;
      case "product-fulfillment":
        return <ProductFulfillment />;
      case "sku-codes":
        return <SkuCodesManager />;
      case "orders":
        return <UnifiedOrdersManager />;
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
      case "vendor-matching":
        return <VendorMatching />;
      case "vendor-optimization":
        return <VendorOptimization />;
      case "vendor-selection-wizard":
        return <VendorSelectionWizard onBack={() => setActiveTab("dashboard")} onComplete={() => setActiveTab("purchase-orders")} />;
      case "currency-calculator":
        return <MultiCurrencyCalculator />;
      case "metal-prices":
        return <PreciousMetalDashboard />;
      case "unit-converter":
        return <UnitConversionCalculator />;
      case "collection-plan-wizard":
        return <CollectionPlanWizard collectionPlanId="1" onBack={() => setActiveTab("dashboard")} onNext={() => setActiveTab("vendor-matching")} />;
      case "jewelry-specifications":
        return <JewelrySpecificationManager />;
      case "purchase-orders":
        return <PurchaseOrderSummary />;
      case "market-trends":
        return <MarketTrendDashboard />;
      case "customs-compliance":
        return <CustomsComplianceManager />;
      case "components":
        return <ComponentsManager />;
      case "users":
        return <UsersManager />;
      case "rbac-matrix":
        return <RBACMatrix />;
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
      "product-fulfillment": {
        title: "Product Fulfillment",
        description:
          "Complete product details, add images, and publish products to the website",
      },
      categories: {
        title: "Categories Management",
        description:
          "Organize products into categories like rings, necklaces, earrings",
      },
      "sku-codes": {
        title: "SKU Codes Management",
        description:
          "Generate standardized SKU codes and search existing SKUs with fuzzy matching",
      },
      orders: {
        title: "Orders Management",
        description: "Review new customer orders and coordinate follow-up",
      },
      "order-workflow": {
        title: "Order Workflow & Production",
        description: "Manage order lifecycle from confirmation to completion with MISA SKU enforcement",
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
      "vendor-matching": {
        title: "Vendor Matching & Selection",
        description: "AI-powered vendor matching and selection for optimal sourcing",
      },
      "vendor-optimization": {
        title: "Vendor Optimization Engine",
        description: "Find optimal vendors based on cost, quality, and timeline constraints",
      },
      "currency-calculator": {
        title: "Multi-Currency Cost Calculator",
        description: "Calculate import costs with real-time exchange rates and customs duties",
      },
      "metal-prices": {
        title: "Precious Metal Price Tracker",
        description: "Real-time gold, silver, platinum prices with material cost calculations",
      },
      "unit-converter": {
        title: "Jewelry Unit Converter",
        description: "Convert between grams, ounces, lượng, and chỉ for jewelry measurements",
      },
      components: {
        title: "Components Management",
        description: "Manage product components and customizable options",
      },
      users: {
        title: "Users Management",
        description: "Manage user accounts, permissions, and access control",
      },
      "vendor-selection-wizard": {
        title: "Vendor Selection Wizard",
        description: "Guided workflow to find and select optimal vendors for your requirements",
      },
      "collection-plan-wizard": {
        title: "Collection Plan Wizard",
        description: "Step-by-step planning for new jewelry collections and product lines",
      },
      "jewelry-specifications": {
        title: "Jewelry Specifications",
        description: "Manage synthetic diamond jewelry designs and specifications",
      },
      "purchase-orders": {
        title: "Purchase Orders",
        description: "Track and manage all purchase orders from vendors",
      },
      "market-trends": {
        title: "Market Trend Analysis",
        description: "Vietnam jewelry import market intelligence and trend analysis",
      },
      "customs-compliance": {
        title: "Customs & Compliance",
        description: "Research duty rates and manage regulatory compliance for jewelry imports",
      },
      "rbac-matrix": {
        title: "RBAC Matrix",
        description: "View role purposes, UI access, and allowed actions",
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
          {visibleMenuItems.map((item) => (
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
