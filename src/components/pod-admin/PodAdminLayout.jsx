import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import "./PodAdminLayout.css";

const menuItems = [
  {
    path: ROUTES.POD_ADMIN_DASHBOARD,
    label: "Dashboard",
    icon: "chart-pie",
  },
  {
    path: ROUTES.POD_ADMIN_PARTNERS,
    label: "Partners",
    icon: "users",
  },
  {
    path: ROUTES.POD_ADMIN_PODS,
    label: "PODs",
    icon: "cube",
  },
  {
    path: ROUTES.POD_ADMIN_QRCODES,
    label: "QR Codes",
    icon: "qrcode",
  },
  {
    path: ROUTES.POD_ADMIN_ATTRIBUTIONS,
    label: "Attributions",
    icon: "link",
  },
  {
    path: ROUTES.POD_ADMIN_COMMISSIONS,
    label: "Commissions",
    icon: "dollar-sign",
  },
];

// Simple icon component using unicode/emoji
const Icon = ({ name }) => {
  const icons = {
    "chart-pie": "\u{1F4CA}",
    users: "\u{1F465}",
    cube: "\u{1F4E6}",
    qrcode: "\u{1F4F1}",
    link: "\u{1F517}",
    "dollar-sign": "\u{1F4B0}",
    menu: "\u2630",
    close: "\u2715",
    home: "\u{1F3E0}",
  };
  return <span className="menu-icon">{icons[name] || "\u2022"}</span>;
};

export default function PodAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={`pod-admin-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className="pod-admin-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            {sidebarOpen ? "POD Admin" : "POD"}
          </h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <Icon name={sidebarOpen ? "close" : "menu"} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive || location.pathname.startsWith(item.path.replace(/\/:.*/, "")) ? "active" : ""}`
              }
            >
              <Icon name={item.icon} />
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/" className="nav-item back-home">
            <Icon name="home" />
            {sidebarOpen && <span className="nav-label">Back to Site</span>}
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pod-admin-main">
        <Outlet />
      </main>
    </div>
  );
}
