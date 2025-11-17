import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { vendorsAPI } from "@/services/api";
import VendorProducts from "./VendorProducts";
import VendorProfile from "./VendorProfile";
import VendorOrders from "./VendorOrders";
import VendorStatistics from "./VendorStatistics";
import "./VendorDashboard.css";
import { ROUTES } from "@/constants/routes";

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVendor, setHasVendor] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadVendorInfo = async () => {
      try {
        setLoading(true);

        // Decode current JWT to see userId
        const token = localStorage.getItem("accessToken");
        if (token) {
          try {
            const base64Payload = token.split(".")[1];
            const payload = JSON.parse(atob(base64Payload));
          } catch (decodeError) {
            // Error decoding JWT
          }
        }

        const response = await vendorsAPI.getCurrentVendorInfo();

        setVendorInfo(response.data);
        setHasVendor(response.hasVendor);
      } catch (error) {
        setVendorInfo(null);
        setHasVendor(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadVendorInfo();
    }
  }, [user]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "products", label: "My Products" },
    { id: "orders", label: "Orders" },
    { id: "profile", label: "Vendor Profile" },
  ];

  const handleHomeNavigation = () => {
    window.location.href = ROUTES.HOME_PAGE;
  };

  const renderActiveTab = () => {
    if (loading) {
      return (
        <div className="vendor-loading">
          <div className="loading-spinner"></div>
          <p>Loading vendor information...</p>
        </div>
      );
    }

    if (!hasVendor) {
      return (
        <div className="vendor-no-access">
          <div className="no-access-content">
            <div className="no-access-icon">V</div>
            <h3>No Vendor Account</h3>
            <p>
              You don't have a vendor account associated with your user profile.
            </p>
            <p>Contact administrator to set up your vendor account.</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <VendorStatistics vendorInfo={vendorInfo} />;
      case "products":
        return <VendorProducts vendorInfo={vendorInfo} />;
      case "orders":
        return <VendorOrders vendorInfo={vendorInfo} />;
      case "profile":
        return <VendorProfile vendorInfo={vendorInfo} />;
      default:
        return <VendorStatistics vendorInfo={vendorInfo} />;
    }
  };

  const getPageInfo = () => {
    const pageMap = {
      dashboard: {
        title: "Vendor Dashboard",
        description: "Overview of your vendor activities and performance",
      },
      products: {
        title: "My Products",
        description: "Manage products associated with your vendor account",
      },
      orders: {
        title: "Orders Management",
        description: "Track and manage orders for your products",
      },
      profile: {
        title: "Vendor Profile",
        description: "Manage your vendor information and settings",
      },
    };
    return pageMap[activeTab] || pageMap.dashboard;
  };

  return (
    <div className="vendor-dashboard-container">
      {/* Sidebar Navigation */}
      <div className="vendor-sidebar">
        <div className="vendor-sidebar-header">
          <h1 className="vendor-sidebar-title heading-2--no-margin">Vendor Portal</h1>
          <p className="vendor-sidebar-subtitle bodytext-4--no-margin">Partner Dashboard</p>
        </div>

        <nav className="vendor-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`vendor-nav-button ${
                activeTab === item.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="vendor-nav-label bodytext-4--no-margin">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="vendor-sidebar-footer">
          <button className="home-nav-button" onClick={handleHomeNavigation}>
            <span className="home-nav-label bodytext-5--no-margin">← Back to Home</span>
          </button>
          <div className="vendor-user-info">
            <div className="vendor-user-avatar">
              {vendorInfo?.name ? vendorInfo.name.charAt(0).toUpperCase() : "V"}
            </div>
            <div className="vendor-user-details">
              <div className="vendor-user-name bodytext-5--no-margin">
                {vendorInfo?.name || user?.username || "Vendor User"}
              </div>
              <div className="vendor-user-role bodytext-6--no-margin">
                {vendorInfo?.code || "Partner"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="vendor-main-content">
        <div className="vendor-content-header">
          <div className="vendor-breadcrumb bodytext-6--no-margin">
            <span>Vendor</span>
            <span className="breadcrumb-separator">›</span>
            <span>{getPageInfo().title}</span>
          </div>
          <h1 className="vendor-page-title heading-1--no-margin">{getPageInfo().title}</h1>
          <p className="vendor-page-description bodytext-4--no-margin">{getPageInfo().description}</p>
        </div>

        <div className="vendor-content-body">{renderActiveTab()}</div>
      </div>
    </div>
  );
};

export default VendorDashboard;
