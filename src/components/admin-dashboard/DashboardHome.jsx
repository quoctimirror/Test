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

  const StatCard = ({ title, value, icon, color, description, trend, progress }) => (
    <div className="admin-card stat-card">
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="stat-card-info">
          <h3 className="stat-card-title">{title}</h3>
          <div className="stat-card-value">
            {stats.loading ? (
              <span className="skeleton-loader" />
            ) : (
              <>
                {value}
                {trend && (
                  <span className={`stat-card-trend ${trend.type}`}>
                    {trend.type === 'positive' ? '↑' : '↓'} {trend.value}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="stat-card-description">{description}</div>
      {progress && (
        <div className="stat-card-progress">
          <div
            className="stat-card-progress-bar"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${color}, ${color}dd)`
            }}
          />
        </div>
      )}
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
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Products"
          value={stats.products}
          description="Active jewelry items in catalog"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          description="Product categories from MISA"
        />
        <StatCard
          title="Collections"
          value={stats.collections}
          description="Curated seasonal collections"
        />
        <StatCard
          title="Locations"
          value={stats.locations}
          description="Retail and showroom locations"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <QuickAction
            title="Add New Product"
            description="Create a new jewelry product with specifications"
            onClick={() => setActiveTab("products")}
          />
          <QuickAction
            title="Manage Categories"
            description="View and organize MISA product categories"
            onClick={() => setActiveTab("categories")}
          />
          <QuickAction
            title="Create Collection"
            description="Curate seasonal jewelry collections"
            onClick={() => setActiveTab("collections")}
          />
          <QuickAction
            title="Add Store Location"
            description="Register a new retail location"
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
