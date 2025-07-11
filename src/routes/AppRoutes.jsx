// src/routes/index.jsx

import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy-load components
const HomePage = lazy(() => import("../pages/HomePage"));
const UniverseSection = lazy(() => import("../components/UniverseSection/UniverseSection"));
const UniverseSection1_Nam = lazy(() => import("../components/UniverseSection"));
const UVFinal = lazy(() => import("../components/UniverseSectionFinal/UniverseSection"));
const HoverExpandSection = lazy(() =>
  import("../components/HoverExpandSection")
);

export default function AppRoutes() {
  return (
    // SỬA LỖI: Bọc Routes bằng Suspense để lazy loading hoạt động
    // Fallback là UI sẽ hiển thị trong khi component đang được tải
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/universe-section-developing"
          element={<UniverseSection />}
        />
        <Route
          path="/universe-final"
          element={<UVFinal />}
        />
        <Route
          path="/universe-section-developing-nam"
          element={<UniverseSection1_Nam />}
        />
        <Route path="/hover-expand" element={<HoverExpandSection />} />
        {/* SỬA LỖI: Thêm route cho các đường dẫn không tồn tại */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Suspense>
  );
}
