import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { vendorsAPI } from "@/services/api";
import VendorProducts from "./VendorProducts";
import VendorProfile from "./VendorProfile";
import VendorOrders from "./VendorOrders";
import VendorStatistics from "./VendorStatistics";
import "./VendorDashboard.css";
import { ROUTES } from "@/constants/routes";

const VendorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get tab from URL query params
  const getTabFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'dashboard';
  }, [location.search]);

  const [activeTab, setActiveTabState] = useState(getTabFromUrl);

  // Update URL when tab changes
  const setActiveTab = useCallback((tabId) => {
    setActiveTabState(tabId);
    const params = new URLSearchParams(location.search);
    if (tabId === 'dashboard') {
      params.delete('tab');
    } else {
      params.set('tab', tabId);
    }
    const newSearch = params.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
  }, [navigate, location.pathname, location.search]);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVendor, setHasVendor] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Close sidebar when clicking a nav item on mobile
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking overlay
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

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

  // Sync state with URL when browser navigation occurs (back/forward)
  useEffect(() => {
    const urlTab = getTabFromUrl();
    if (urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [location.search, getTabFromUrl]);

  // Validate tab and redirect to valid tab if needed
  useEffect(() => {
    const urlTab = getTabFromUrl();
    const validTabIds = ['dashboard', 'products', 'orders', 'profile'];
    if (!validTabIds.includes(urlTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, getTabFromUrl, setActiveTab]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "My Products", icon: "💎" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "profile", label: "Vendor Profile", icon: "👤" },
  ];

  const handleHomeNavigation = () => {
    window.location.href = ROUTES.HOME_PAGE;
  };

  const renderActiveTab = () => {
    if (loading) {
      return (
        <div className="vendor-loading">
          <div className="loading-spinner"></div>
          <p className="bodytext-4--no-margin">Loading vendor information...</p>
        </div>
      );
    }

    if (!hasVendor) {
      return (
        <div className="vendor-no-access">
          <div className="no-access-content">
            <div className="no-access-icon heading-1--no-margin">V</div>
            <h3 className="heading-3--no-margin">No Vendor Account</h3>
            <p className="bodytext-4--no-margin">
              You don't have a vendor account associated with your user profile.
            </p>
            <p className="bodytext-4--no-margin">
              Contact administrator to set up your vendor account.
            </p>
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
      {/* Mobile Toggle Button */}
      <button
        className={`vendor-sidebar-toggle ${sidebarOpen ? "active" : ""}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <span className="vendor-sidebar-toggle-icon"></span>
      </button>

      {/* Mobile Overlay */}
      <div
        className={`vendor-sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      {/* Sidebar Navigation */}
      <div className={`vendor-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="vendor-sidebar-header">
          <div className="vendor-sidebar-logo">V</div>
          <h1 className="vendor-sidebar-title heading-3--no-margin">
            Vendor Portal
          </h1>
          <p className="vendor-sidebar-subtitle bodytext-4--no-margin">
            Partner Dashboard
          </p>
        </div>

        <nav className="vendor-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`vendor-nav-button ${
                activeTab === item.id ? "active" : ""
              }`}
              onClick={() => handleNavClick(item.id)}
              title={item.label}
            >
              <span className="vendor-nav-icon">{item.icon}</span>
              <span className="vendor-nav-label bodytext-4--no-margin">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="vendor-sidebar-footer">
          <button
            className="home-nav-button"
            onClick={handleHomeNavigation}
            title="Back to Home"
          >
            <span className="home-nav-icon">🏠</span>
            <span className="home-nav-label bodytext-5--no-margin">
              ← Back to Home
            </span>
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
          <h1 className="vendor-page-title heading-1--no-margin">
            {getPageInfo().title}
          </h1>
          <p className="vendor-page-description bodytext-4--no-margin">
            {getPageInfo().description}
          </p>
        </div>

        <div className="vendor-content-body">{renderActiveTab()}</div>
      </div>
    </div>
  );
};

export default VendorDashboard;
