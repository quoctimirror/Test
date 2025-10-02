import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { designersAPI } from "@/services/api";
import DesignerStatistics from "./DesignerStatistics";
import DesignerDesigns from "./DesignerDesigns";
import DesignerSales from "./DesignerSales";
import "./DesignerDashboard.css";

const DesignerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [designerInfo, setDesignerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasDesigner, setHasDesigner] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadDesignerInfo = async () => {
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

        const response = await designersAPI.getCurrentDesignerInfo();

        setDesignerInfo(response.data);
        setHasDesigner(response.hasDesigner);
      } catch (error) {
        setDesignerInfo(null);
        setHasDesigner(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDesignerInfo();
    }
  }, [user]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "designs", label: "My Designs" },
    { id: "sales", label: "Sales" },
  ];

  const handleHomeNavigation = () => {
    window.location.href = '/home';
  };

  const renderActiveTab = () => {
    if (loading) {
      return (
        <div className="designer-loading">
          <div className="loading-spinner"></div>
          <p>Loading designer information...</p>
        </div>
      );
    }

    if (!hasDesigner) {
      return (
        <div className="designer-no-access">
          <div className="no-access-content">
            <div className="no-access-icon">D</div>
            <h3>No Designer Account</h3>
            <p>
              You don't have a designer account associated with your user profile.
            </p>
            <p>Contact administrator to set up your designer account.</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <DesignerStatistics designerInfo={designerInfo} />;
      case "designs":
        return <DesignerDesigns designerInfo={designerInfo} />;
      case "sales":
        return <DesignerSales designerInfo={designerInfo} />;
      default:
        return <DesignerStatistics designerInfo={designerInfo} />;
    }
  };

  const getPageInfo = () => {
    const pageMap = {
      dashboard: {
        title: "Designer Dashboard",
        description: "Overview of your design activities and performance",
      },
      designs: {
        title: "My Designs",
        description: "Manage designs and track their performance",
      },
      sales: {
        title: "Sales Management",
        description: "Track sales and commissions for your designs",
      },
    };
    return pageMap[activeTab] || pageMap.dashboard;
  };

  return (
    <div className="designer-dashboard-container">
      {/* Sidebar Navigation */}
      <div className="designer-sidebar">
        <div className="designer-sidebar-header">
          <h1 className="designer-sidebar-title">Designer Portal</h1>
          <p className="designer-sidebar-subtitle">Creative Dashboard</p>
        </div>

        <nav className="designer-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`designer-nav-button ${
                activeTab === item.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="designer-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="designer-sidebar-footer">
          <button className="home-nav-button" onClick={handleHomeNavigation}>
            <span className="home-nav-label">← Back to Home</span>
          </button>
          <div className="designer-user-info">
            <div className="designer-user-avatar">
              {designerInfo?.name ? designerInfo.name.charAt(0).toUpperCase() : "D"}
            </div>
            <div className="designer-user-details">
              <div className="designer-user-name">
                {designerInfo?.name || user?.username || "Designer User"}
              </div>
              <div className="designer-user-role">
                {designerInfo?.code || "Designer"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="designer-main-content">
        <div className="designer-content-header">
          <div className="designer-breadcrumb">
            <span>Designer</span>
            <span className="breadcrumb-separator">›</span>
            <span>{getPageInfo().title}</span>
          </div>
          <h1 className="designer-page-title">{getPageInfo().title}</h1>
          <p className="designer-page-description">{getPageInfo().description}</p>
        </div>

        <div className="designer-content-body">{renderActiveTab()}</div>
      </div>
    </div>
  );
};

export default DesignerDashboard;