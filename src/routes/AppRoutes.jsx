// src/routes/index.jsx

import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "@components/navbar/Navbar";
import Footer from "@components/footer/Footer";
import TryOnRingLayout from '@layouts/TryOnRingLayout';
// Lazy-load components
const HomePage = lazy(() => import("@pages/HomePage"));
const ProductsPage = lazy(() => import("@pages/ProductsPage"));
const CollectionPage = lazy(() => import("@pages/CollectionPage"));
const CollectionDetailPage = lazy(() => import("@pages/CollectionDetailPage"));
const ServicesPage = lazy(() => import("@pages/ServicesPage"));
const ServicesDetailPage = lazy(() => import("@pages/ServicesDetailPage"));
const SupportPage = lazy(() => import("@pages/SupportPage"));

const UVFinal = lazy(() =>
  import("@components/universeSectionFinal/UniverseSection.jsx")
);
const HoverExpandSection = lazy(() =>
  import("@components/hoverExpandSection/HoverExpandSection.jsx")
);
const View360 = lazy(() => import("@components/view360/View360.jsx"));
// const AR = lazy(() => import("@components/arTryOn/AR.jsx"));
const TryOnRing = lazy(() => import("@components/arTryOn/TryOnRing.jsx"));
const ManageProducts = lazy(() =>
  import("@components/manage-products/ManageProducts.jsx")
);
const AuthPage = lazy(() => import("@pages/AuthPage"));
const Login = lazy(() => import("@components/login/Login"));
const Register = lazy(() => import("@components/register/Register"));






export default function AppRoutes() {
  const location = useLocation();

  const staticRoutesToHideNavBar = location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/universe-final') ||
    location.pathname.startsWith('/hover-expand') ||
    location.pathname.startsWith('/ar/rings') || 
    location.pathname.startsWith('/dashboard/admin/manage-products');

  const staticRoutesToHideFooter = location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/universe-final') ||
    location.pathname.startsWith('/hover-expand') ||
    location.pathname.startsWith('/ar/rings') || 
    location.pathname.startsWith("/dashboard/admin/manage-products");

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
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>



          <Route path="/products" element={<ProductsPage />} />

          <Route path="/collections" element={<CollectionPage />} />

          <Route
            path="/collections/:collectionId"
            element={<CollectionDetailPage />}
          />

          <Route path="/services" element={<ServicesPage />} />
          
          <Route path="/services/detail" element={<ServicesDetailPage />} />

          <Route path="/support" element={<SupportPage />} />

          <Route path="/universe-final" element={<UVFinal />} />

          <Route path="/hover-expand" element={<HoverExpandSection />} />

          <Route path="/view-360" element={<View360 />} />
          <Route path="/collections" element={<Collections />} />

          <Route element={<TryOnRingLayout />}>
            <Route path="/ar/rings/:ringId" element={<TryOnRing />} />
          </Route>

          <Route
            path="dashboard/admin/manage-products"
            element={<ManageProducts />}
          />

          {/* FIX: Add route for non-existent paths */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Suspense>

      {/* Conditional Footer */}
      {shouldShowFooter && <Footer />}
    </>
  );
}
