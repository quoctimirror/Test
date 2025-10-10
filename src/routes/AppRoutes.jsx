// src/routes/index.jsx

import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "@components/navbar/Navbar";
import Footer from "@components/footer/Footer";
import TryOnRingLayout from "@layouts/TryOnRingLayout";
import { ROUTES } from "@/constants/routes";
// Lazy-load components
const HomePage = lazy(() => import("@pages/HomePage"));
const ProductsPage = lazy(() => import("@pages/ProductsPage"));
const CollectionPage = lazy(() => import("@pages/CollectionPage"));
const CollectionDetailPage = lazy(() => import("@pages/CollectionDetailPage"));
const ServicesPage = lazy(() => import("@pages/ServicesPage"));
const ServicesDetailPage = lazy(() => import("@pages/ServicesDetailPage"));
const SupportPage = lazy(() => import("@pages/SupportPage"));
const NotFoundPage = lazy(() => import("@pages/NotFoundPage"));

// const UniverseSection = lazy(() =>
//   import("@components/home-page/universeSection/MirrorExp.jsx")
// );
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
const VendorDashboard = lazy(() =>
  import("@components/vendor-dashboard/VendorDashboard.jsx")
);
const DesignerDashboard = lazy(() =>
  import("@components/designer-dashboard/DesignerDashboard.jsx")
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
const ImmersiveShowroomPage = lazy(() =>
  import("@pages/ImmersiveShowroomPage")
);
const SubmitPage = lazy(() => import("@pages/SubmitPage"));
const SubmitSuccessPage = lazy(() => import("@pages/SubmitSuccessPage"));
const ProductsV2 = lazy(() => import("@components/productsV2/Products.jsx"));
const ProductsLeft = lazy(() =>
  import("@components/productsV2/ProductsLeft.jsx")
);
const BODMemberV2Page = lazy(() => import("@pages/BODMemberV2Page"));
const ScavengerHunt = lazy(() =>
  import("@components/scavenger-hunt/ScavengerHunt")
);

export default function AppRoutes() {
  const location = useLocation();

  // Check if current path matches any defined route (to detect 404)
  const isNotFoundPage = () => {
    const definedRoutes = [
      ROUTES.HOME,
      ROUTES.HOME_PAGE,
      ROUTES.WELCOME,
      ROUTES.AUTH,
      `${ROUTES.AUTH}/login`,
      `${ROUTES.AUTH}/register`,
      ROUTES.PRODUCTS,
      ROUTES.PRODUCTS_V2,
      ROUTES.ALL_GEMS,
      ROUTES.COLLECTIONS,
      ROUTES.SERVICES,
      ROUTES.SERVICES_DETAIL,
      ROUTES.SUPPORT,
      ROUTES.CONTACT,
      ROUTES.ABOUT,
      ROUTES.LOCATIONS,
      ROUTES.NEWS,
      ROUTES.IMMERSIVE_SHOWROOM,
      ROUTES.MILAN_SUBMIT,
      `${ROUTES.MILAN_SUBMIT}/submit-success`,
      ROUTES.HOVER_EXPAND,
      ROUTES.PRODUCTS_LEFT,
      ROUTES.BOD_MEMBER_V2,
      ROUTES.VIEW_360,
      ROUTES.USER_PROFILE,
      ROUTES.SCAVENGER_HUNT,
      ROUTES.DASHBOARD_ADMIN_MANAGE,
      ROUTES.DASHBOARD_ADMIN,
      ROUTES.DASHBOARD_VENDOR,
      ROUTES.DASHBOARD_DESIGNER,
      ROUTES.UNIVERSE_FINAL,
      ROUTES.FORGOT_PASSWORD,
    ];

    // Check exact matches
    if (definedRoutes.includes(location.pathname)) {
      return false;
    }

    // Check dynamic routes (with params)
    if (
      location.pathname.startsWith(ROUTES.COLLECTIONS + '/') ||
      location.pathname.startsWith(ROUTES.NEWS + '/') ||
      location.pathname.startsWith(ROUTES.AR_RINGS.split(':')[0]) ||
      location.pathname.startsWith(ROUTES.DASHBOARD_ADMIN) ||
      location.pathname.startsWith(ROUTES.DASHBOARD_VENDOR) ||
      location.pathname.startsWith(ROUTES.DASHBOARD_DESIGNER) ||
      location.pathname.startsWith(ROUTES.UNIVERSE_FINAL) ||
      location.pathname.startsWith(ROUTES.HOVER_EXPAND) ||
      location.pathname.startsWith(ROUTES.SCAVENGER_HUNT) ||
      location.pathname.startsWith(ROUTES.MILAN_SUBMIT)
    ) {
      return false;
    }

    return true; // It's a 404
  };

  const is404 = isNotFoundPage();

  const staticRoutesToHideNavBar =
    is404 ||
    location.pathname.startsWith(ROUTES.UNIVERSE_FINAL) ||
    location.pathname.startsWith(ROUTES.HOVER_EXPAND) ||
    location.pathname.startsWith(ROUTES.AR_RINGS.split(':')[0]) ||
    location.pathname.startsWith(ROUTES.SCAVENGER_HUNT) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_ADMIN) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_VENDOR) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_DESIGNER) ||
    location.pathname === ROUTES.WELCOME ||
    location.pathname === ROUTES.HOME;

  const staticRoutesToHideFooter =
    is404 ||
    location.pathname.startsWith(ROUTES.UNIVERSE_FINAL) ||
    location.pathname.startsWith(ROUTES.HOVER_EXPAND) ||
    location.pathname.startsWith(ROUTES.AR_RINGS.split(':')[0]) ||
    location.pathname.startsWith(ROUTES.SCAVENGER_HUNT) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_ADMIN) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_VENDOR) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_DESIGNER) ||
    location.pathname === ROUTES.WELCOME ||
    location.pathname === ROUTES.HOME ||
    location.pathname === ROUTES.IMMERSIVE_SHOWROOM ||
    location.pathname.startsWith(ROUTES.MILAN_SUBMIT);

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
          <Route path={ROUTES.HOME} element={<WelcomePage />} />

          <Route path={ROUTES.HOME_PAGE} element={<HomePage />} />
          <Route path={ROUTES.WELCOME} element={<WelcomePage />} />

          <Route path={ROUTES.AUTH} element={<AuthPage />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />

          <Route path={ROUTES.PRODUCTS_V2} element={<ProductsV2 />} />

          <Route path={ROUTES.ALL_GEMS} element={<AllGemsPage />} />

          <Route path={ROUTES.COLLECTIONS} element={<CollectionPage />} />

          <Route
            path={ROUTES.COLLECTION_DETAIL}
            element={<CollectionDetailPage />}
          />

          <Route path={ROUTES.SERVICES} element={<ServicesPage />} />

          <Route path={ROUTES.SERVICES_DETAIL} element={<ServicesDetailPage />} />

          <Route path={ROUTES.SUPPORT} element={<SupportPage />} />

          <Route path={ROUTES.CONTACT} element={<ContactPage />} />

          <Route path={ROUTES.ABOUT} element={<AboutPage />} />

          <Route path={ROUTES.LOCATIONS} element={<LocationsPage />} />

          <Route path={ROUTES.NEWS} element={<AllNewsPage />} />

          <Route path={ROUTES.NEWS_DETAIL} element={<NewCutPage />} />

          <Route
            path={ROUTES.IMMERSIVE_SHOWROOM}
            element={<ImmersiveShowroomPage />}
          />

          <Route path={ROUTES.MILAN_SUBMIT}>
            <Route index element={<SubmitPage />} />
            <Route path="submit-success" element={<SubmitSuccessPage />} />
          </Route>

          {/* for observing UI universe-section final */}
          {/* <Route path="/universe-section" element={<UniverseSection />} /> */}

          <Route path={ROUTES.HOVER_EXPAND} element={<HoverExpandSection />} />

          {/* Test route for ProductsLeft */}
          <Route path={ROUTES.PRODUCTS_LEFT} element={<ProductsLeft />} />

          {/* Test route for BODMemberV2 */}
          <Route path={ROUTES.BOD_MEMBER_V2} element={<BODMemberV2Page />} />

          <Route path={ROUTES.VIEW_360} element={<View360 />} />

          <Route path={ROUTES.USER_PROFILE} element={<Profile />} />

          <Route element={<TryOnRingLayout />}>
            <Route path={ROUTES.AR_RINGS} element={<TryOnRing />} />
          </Route>

          <Route path={ROUTES.SCAVENGER_HUNT} element={<ScavengerHunt />} />

          <Route
            path={ROUTES.DASHBOARD_ADMIN_MANAGE}
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ManageProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.DASHBOARD_ADMIN}
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.DASHBOARD_VENDOR}
            element={
              <ProtectedRoute requiredRole="VENDOR">
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.DASHBOARD_DESIGNER}
            element={
              <ProtectedRoute requiredRole="DESIGNER">
                <DesignerDashboard />
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
