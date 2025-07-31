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

const UVFinal = lazy(() =>
  import("@components/universeSectionFinal/UniverseSection.jsx")
);
const HoverExpandSection = lazy(() =>
  import("@components/hoverExpandSection/HoverExpandSection.jsx")
);
const View360 = lazy(() => import("@components/view360/View360.jsx"));
// const AR = lazy(() => import("@components/arTryOn/AR.jsx"));
const TryOnRing = lazy(() => import("@components/arTryOn/TryOnRing.jsx"));
const ManageProducts = lazy(() => import("@components/manage-products/ManageProducts.jsx"));


export default function AppRoutes() {
  const location = useLocation();


  // Danh sách các route tĩnh khác cần ẩn Navbar/Footer
  const staticRoutesToHideNavBar = ["/universe-final", "/hover-expand", "/manage-products"];
  const staticRoutesToHideFooter = ["/universe-final", "/hover-expand", "/manage-products"];

  // Kiểm tra xem đường dẫn có phải là trang AR hay không, bất kể ID của nhẫn là gì.
  const isARPage = location.pathname.startsWith('/ar/rings');
  const shouldShowNavbar = !staticRoutesToHideNavBar.includes(location.pathname) && !isARPage;
  const shouldShowFooter = !staticRoutesToHideFooter.includes(location.pathname) && !isARPage;

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

          <Route path="/products" element={<ProductsPage />} />
          
          <Route path="/collections" element={<CollectionPage />} />
          
          <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />

          <Route path="/universe-final" element={<UVFinal />} />

          <Route path="/hover-expand" element={<HoverExpandSection />} />

          <Route path="/view-360" element={<View360 />} />

          <Route element={<TryOnRingLayout />}>
            <Route path="/ar/rings/:ringId" element={<TryOnRing />} />
          </Route>

          <Route path="/manage-products" element={<ManageProducts />} />
          
          {/* FIX: Add route for non-existent paths */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Suspense>

      {/* Conditional Footer */}
      {shouldShowFooter && <Footer />}
    </>
  );
}
