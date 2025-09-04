// src/routes/index.jsx

import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "@components/navbar/Navbar";
import Footer from "@components/footer/Footer";
import TryOnRingLayout from "@layouts/TryOnRingLayout";
// Lazy-load components
const HomePage = lazy(() => import("@pages/HomePage"));
const ProductsPage = lazy(() => import("@pages/ProductsPage"));
const CollectionPage = lazy(() => import("@pages/CollectionPage"));
const CollectionDetailPage = lazy(() => import("@pages/CollectionDetailPage"));
const ServicesPage = lazy(() => import("@pages/ServicesPage"));
const ServicesDetailPage = lazy(() => import("@pages/ServicesDetailPage"));
const SupportPage = lazy(() => import("@pages/SupportPage"));
const NotFoundPage = lazy(() => import("@pages/NotFoundPage"));

const UniverseSection = lazy(() =>
  import("@components/home-page/universeSection/MirrorExp.jsx")
);
const HoverExpandSection = lazy(() =>
  import("@components/home-page/hoverExpandSection/HoverExpandSection.jsx")
);
const View360 = lazy(() => import("@components/view360/View360.jsx"));
// const AR = lazy(() => import("@components/arTryOn/AR.jsx"));
const TryOnRing = lazy(() => import("@components/arTryOn/Occluder.jsx"));
const ManageProducts = lazy(() =>
  import("@components/manage-products/ManageProducts.jsx")
);
const AdminDashboard = lazy(() =>
  import("@components/admin-dashboard/AdminDashboard.jsx")
);
const AuthPage = lazy(() => import("@pages/AuthPage"));
const Login = lazy(() => import("@components/login/Login"));
const Register = lazy(() => import("@components/register/Register"));
const Profile = lazy(() => import("@components/profile/Profile"));
const ProtectedRoute = lazy(() => import("@components/auth/ProtectedRoute"));
const AllGemsPage = lazy(() => import("@pages/AllGemsPage"));
const AllNewsPage = lazy(() => import("@pages/AllNewsPage"));
const NewCutPage = lazy(() => import("@pages/NewCutPage"));
const ContactPage = lazy(() => import("@pages/ContactPage"));
const AboutPage = lazy(() => import("@pages/AboutPage"));
const LocationsPage = lazy(() => import("@pages/LocationsPage"));
const WelcomePage = lazy(() => import("@pages/WelcomePage"));

export default function AppRoutes() {
  const location = useLocation();
  const staticRoutesToHideNavBar =
    location.pathname.startsWith("/universe-final") ||
    location.pathname.startsWith("/hover-expand") ||
    location.pathname.startsWith("/ar/rings") ||
    location.pathname.startsWith("/dashboard/admin") ||
    location.pathname === "/welcome" ||
    location.pathname === "/";

  const staticRoutesToHideFooter =
    location.pathname.startsWith("/universe-final") ||
    location.pathname.startsWith("/hover-expand") ||
    location.pathname.startsWith("/ar/rings") ||
    location.pathname.startsWith("/dashboard/admin") ||
    location.pathname === "/welcome" ||
    location.pathname === "/";

  const shouldShowNavbar = !staticRoutesToHideNavBar;
  const shouldShowFooter = !staticRoutesToHideFooter;

  return (
    <>
      {/* Conditional Navbar */}
      {shouldShowNavbar && <Navbar />}

      {/* Routes */}
      <Suspense
        fallback={
          <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
        }
      >
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          
          <Route path="/home" element={<HomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />

          <Route path="/auth" element={<AuthPage />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          <Route path="/products" element={<ProductsPage />} />

          <Route path="/all-gems" element={<AllGemsPage />} />

          <Route path="/collections" element={<CollectionPage />} />

          <Route
            path="/collections/:collectionId"
            element={<CollectionDetailPage />}
          />

          <Route path="/services" element={<ServicesPage />} />

          <Route path="/services/detail" element={<ServicesDetailPage />} />

          <Route path="/support" element={<SupportPage />} />

          <Route path="/contact" element={<ContactPage />} />

          <Route path="/about" element={<AboutPage />} />

          <Route path="/locations" element={<LocationsPage />} />

          <Route path="/news" element={<AllNewsPage />} />

          <Route path="/news/:slug" element={<NewCutPage />} />

          {/* for observing UI universe-section final */}
          {/* <Route path="/universe-section" element={<UniverseSection />} /> */}

          <Route path="/hover-expand" element={<HoverExpandSection />} />

          <Route path="/view-360" element={<View360 />} />

          <Route path="/user-profile" element={<Profile />} />

          <Route element={<TryOnRingLayout />}>
            <Route path="/ar/rings/:ringId" element={<TryOnRing />} />
          </Route>

          <Route
            path="dashboard/admin/manage-products"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ManageProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="dashboard/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 - Catch all route for non-existent paths */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Conditional Footer */}
      {shouldShowFooter && <Footer />}
    </>
  );
}
