// src/routes/index.jsx

import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "../components/navbar/Navbar";

// Lazy-load components
const HomePage = lazy(() => import("../pages/HomePage"));

const UVFinal = lazy(() =>
  import("../components/universeSectionFinal/UniverseSection.jsx")
);
const HoverExpandSection = lazy(() =>
  import("../components/hoverExpandSection/HoverExpandSection.jsx")
);
const View360 = lazy(() => import("../components/view360/View360.jsx"));
const AR = lazy(() => import("../components/arTryOn/AR.jsx"));

export default function AppRoutes() {
  const location = useLocation();

  // Routes that should NOT show the navbar
  const routesWithoutNavbar = ["/universe-final"];
  const shouldShowNavbar = !routesWithoutNavbar.includes(location.pathname);

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

          <Route path="/universe-final" element={<UVFinal />} />

          <Route path="/hover-expand" element={<HoverExpandSection />} />

          <Route path="/view-360" element={<View360 />} />

          <Route path="/ar/rings/:ringId" element={<AR />} />
          {/* SỬA LỖI: Thêm route cho các đường dẫn không tồn tại */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Suspense>
    </>
  );
}
