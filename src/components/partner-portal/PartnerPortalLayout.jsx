import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { partnerPortalApi } from "@/services/podApi";
import "../pod-admin/PodAdminLayout.css";

const allMenuItems = [
  {
    path: ROUTES.POD_PARTNER_DASHBOARD,
    label: "Dashboard",
    icon: "chart-pie",
  },
  {
    path: ROUTES.POD_PARTNER_PODS,
    label: "My PODs",
    icon: "cube",
  },
  {
    path: ROUTES.POD_PARTNER_LOCATIONS,
    label: "Locations",
    icon: "map-pin",
  },
  {
    path: ROUTES.POD_PARTNER_QRCODES,
    label: "QR Codes",
    icon: "qrcode",
  },
  {
    path: ROUTES.POD_PARTNER_SCANS,
    label: "Scans",
    icon: "eye",
  },
  {
    path: ROUTES.POD_PARTNER_USER_ATTRIBUTIONS,
    label: "User Attributions",
    icon: "user-link",
    locationOnly: true,
  },
  {
    path: ROUTES.POD_PARTNER_COMMISSIONS,
    label: "Commissions",
    icon: "dollar-sign",
    locationOnly: true,
  },
  { divider: true, label: "Phygital", phygitalOnly: true },
  {
    path: ROUTES.POD_PARTNER_PHYGITAL_DASHBOARD,
    label: "Phygital Dashboard",
    icon: "phygital-dashboard",
    phygitalOnly: true,
  },
  {
    path: ROUTES.POD_PARTNER_INVENTORY,
    label: "Inventory",
    icon: "inventory",
    phygitalOnly: true,
  },
  {
    path: ROUTES.POD_PARTNER_WHOLESALE_ORDERS,
    label: "Wholesale Orders",
    icon: "wholesale",
    phygitalOnly: true,
  },
  {
    path: ROUTES.POD_PARTNER_SALES,
    label: "Sales",
    icon: "sales",
    phygitalOnly: true,
  },
  {
    path: ROUTES.POD_PARTNER_SALES_REPORT,
    label: "Sales Report",
    icon: "sales-report",
    phygitalOnly: true,
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
    "user-link": "\u{1F464}",
    "dollar-sign": "\u{1F4B0}",
    menu: "\u2630",
    close: "\u2715",
    home: "\u{1F3E0}",
    eye: "\u{1F441}",
    "map-pin": "\u{1F4CD}",
    "phygital-dashboard": "\u{1F4CA}",
    inventory: "\u{1F4E6}",
    wholesale: "\u{1F6D2}",
    sales: "\u{1F4B0}",
    "sales-report": "\u{1F4C8}",
  };
  return <span className="menu-icon">{icons[name] || "\u2022"}</span>;
};

export default function PartnerPortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [partnerType, setPartnerType] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await partnerPortalApi.getProfile();
      setPartnerType(response.data?.partnerType || null);
    } catch (err) {
      console.error("Error fetching partner profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const isPhygital = partnerType === "PHYGITAL";

  // Filter menu by partnerType
  const menuItems = allMenuItems.filter((item) => {
    if (item.phygitalOnly) return isPhygital;
    if (item.locationOnly) return !isPhygital;
    return true;
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={`pod-admin-layout partner-portal ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className="pod-admin-sidebar partner-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            {sidebarOpen ? "Partner Portal" : "PP"}
          </h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <Icon name={sidebarOpen ? "close" : "menu"} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {loadingProfile ? (
            <div style={{ padding: "1rem", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
              Loading...
            </div>
          ) : (
            menuItems.map((item, index) => {
              if (item.divider) {
                return (
                  <div key={`divider-${index}`} className="nav-divider">
                    {sidebarOpen && <span className="nav-divider-label">{item.label}</span>}
                    {!sidebarOpen && <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.15)", margin: "0.5rem 0.75rem" }} />}
                  </div>
                );
              }
              return (
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
              );
            })
          )}
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
