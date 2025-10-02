import React, { useState, useEffect } from "react";
import {
  productsAPI,
  categoriesAPI,
  collectionsAPI,
  locationsAPI,
} from "@services/api";

const DashboardHome = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    collections: 0,
    locations: 0,
    loading: true,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [productsRes, categoriesRes, collectionsRes, locationsRes] =
        await Promise.all([
          productsAPI.getAll().catch(() => ({ data: [] })),
          categoriesAPI.getAll().catch(() => ({ data: [] })),
          collectionsAPI.getAll().catch(() => ({ data: [] })),
          locationsAPI.getAll().catch(() => ({ data: [] })),
        ]);

      setStats({
        products: productsRes.data?.length || 0,
        categories: categoriesRes.data?.length || 0,
        collections: collectionsRes.data?.length || 0,
        locations: locationsRes.data?.length || 0,
        loading: false,
      });
    } catch (error) {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className="admin-card stat-card">
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="stat-card-info">
          <h3 className="stat-card-title">{title}</h3>
          <div className="stat-card-value">{stats.loading ? "..." : value}</div>
        </div>
      </div>
      <div className="stat-card-description">{description}</div>
    </div>
  );

  const QuickAction = ({ title, description, icon, onClick, color }) => (
    <div className="admin-card quick-action-card" onClick={onClick}>
      <div className="quick-action-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="quick-action-content">
        <h4 className="quick-action-title">{title}</h4>
        <p className="quick-action-description">{description}</p>
      </div>
      <div className="quick-action-arrow">›</div>
    </div>
  );

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="admin-card welcome-card">
        <h2 className="welcome-title">Welcome to Mirror Admin Dashboard</h2>
        <p className="welcome-description">
          Manage your diamond jewelry business with ease. Monitor your
          inventory, update product catalogs, and oversee store operations all
          in one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Products"
          value={stats.products}
          icon=""
          color="#bc224c"
          description="Total jewelry products in inventory"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon=""
          color="#17a2b8"
          description="Product categories and types"
        />
        <StatCard
          title="Collections"
          value={stats.collections}
          icon=""
          color="#28a745"
          description="Seasonal and themed collections"
        />
        <StatCard
          title="Locations"
          value={stats.locations}
          icon=""
          color="#ffc107"
          description="Store locations and outlets"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <QuickAction
            title="Add New Product"
            description="Create a new jewelry product with specifications"
            icon=""
            color="#bc224c"
            onClick={() => setActiveTab("products")}
          />
          <QuickAction
            title="Manage Categories"
            description="Organize products into categories"
            icon=""
            color="#17a2b8"
            onClick={() => setActiveTab("categories")}
          />
          <QuickAction
            title="Create Collection"
            description="Group products into seasonal collections"
            icon=""
            color="#28a745"
            onClick={() => setActiveTab("collections")}
          />
          <QuickAction
            title="Add Store Location"
            description="Register a new store or outlet"
            icon=""
            color="#ffc107"
            onClick={() => setActiveTab("locations")}
          />
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="admin-card recent-activity-card">
        <h3 className="section-title">Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon"></div>
            <div className="activity-content">
              <div className="activity-title">Product "Lumina Diamond Ring" updated</div>
              <div className="activity-time">2 hours ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon"></div>
            <div className="activity-content">
              <div className="activity-title">New category "Bracelets" created</div>
              <div className="activity-time">1 day ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon"></div>
            <div className="activity-content">
              <div className="activity-title">Store location "District 1 Flagship" added</div>
              <div className="activity-time">3 days ago</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default DashboardHome;
