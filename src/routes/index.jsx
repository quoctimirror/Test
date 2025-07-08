import { Routes, Route } from "react-router-dom";
import { lazy } from "react";

const HomePage = lazy(() => import("../pages/HomePage"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
