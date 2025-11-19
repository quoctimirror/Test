// src/routes/index.jsx

import { Routes, Route, useLocation, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
import NavbarV3 from "@components/navbar/NavbarV3";
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
const SupportDetailPage = lazy(() => import("@pages/SupportDetailPage"));
const NotFoundPage = lazy(() => import("@pages/NotFoundPage"));

const UniverseSection = lazy(() =>
  import("@components/home-page/universeSection/MirrorExp.jsx")
);
const HoverExpandSection = lazy(() =>
  import("@components/home-page/hoverExpandSection/HoverExpandSection.jsx")
);
const View360 = lazy(() => import("@components/view360/View360.jsx"));
// const AR = lazy(() => import("@components/arTryOn/AR.jsx"));
const TryOnRing = lazy(() => import("@components/arTryOn/Occluder3.jsx"));
const TryOnRingHQ = lazy(() => import("@components/arTryOn/Occluder4.jsx"));
// KHÔNG lazy load QuocTiar vì nó cần khởi tạo camera/Canvas ngay lập tức
import QuocTiar from "@components/arTryOn/QuocTiar.jsx";
const SimpleMeshInspector = lazy(() =>
  import("@components/arTryOn/quocti_dancefloor/SimpleMeshInspector.jsx")
);
const IJewelTryOn = lazy(() => import("@components/arTryOn/IJewelTryOn.jsx"));
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
const ForgotPassword = lazy(() =>
  import("@components/forgot-password/ForgotPassword")
);
const EmailVerification = lazy(() =>
  import("@components/email-verification/EmailVerification")
);
const Profile = lazy(() => import("@components/profile/Profile"));
const ProtectedRoute = lazy(() => import("@components/auth/ProtectedRoute"));
const AllGemsPage = lazy(() => import("@pages/AllGemsPage"));
const AllNewsPage = lazy(() => import("@pages/AllNewsPage"));
const AllNewsPageV2 = lazy(() => import("@pages/AllNewsPageV2"));
const NewCutPage = lazy(() => import("@pages/NewCutPage"));
const MilanPage = lazy(() => import("@pages/MilanPage"));
const ContactPage = lazy(() => import("@pages/ContactPage"));
const ContactPageV2 = lazy(() => import("@pages/ContactPageV2"));

// News Detail Wrapper Component
const NewsDetailWrapper = () => {
  const { slug } = useParams();

  // Map slugs to their respective components
  const newsPages = {
    'milan': MilanPage,
    'new-cut': NewCutPage,
    // Add more news article slugs here
  };

  const PageComponent = newsPages[slug] || NewCutPage;
  return <PageComponent />;
};
const AboutPage = lazy(() => import("@pages/AboutPage"));
const LocationsPage = lazy(() => import("@pages/LocationsPage"));
const WelcomePage = lazy(() => import("@pages/WelcomePage"));
const ImmersiveShowroomPage = lazy(() =>
  import("@pages/ImmersiveShowroomPage")
);
const SubmitPage = lazy(() => import("@pages/SubmitPage"));
const SubmitSuccessPage = lazy(() => import("@pages/SubmitSuccessPage"));
const ProductsV2 = lazy(() => import("@components/productsV2/Products.jsx"));
const ProductsV3 = lazy(() => import("@components/productsV2/Products2.jsx"));
const ProductsLeft = lazy(() =>
  import("@components/productsV2/ProductsLeft.jsx")
);
const ScavengerHunt = lazy(() =>
  import("@components/scavenger-hunt/ScavengerHunt")
);
const BookAppointmentPage = lazy(() => import("@pages/BookAppointmentPage"));
const IJewelARTryOnPage = lazy(() => import("@pages/IJewelARTryOnPage"));
const ScrollEffectTestPage = lazy(() => import("@pages/ScrollEffectTestPage"));
const ScrollEffectTestV2Page = lazy(() => import("@pages/ScrollEffectTestV2Page"));
const NavbarV2TestPage = lazy(() => import("@pages/NavbarV2TestPage"));
const NavbarV3TestPage = lazy(() => import("@pages/NavbarV3TestPage"));
const NavbarV4TestPage = lazy(() => import("@pages/NavbarV4TestPage"));
const TestViewer = lazy(() => import("@components/productsV2/TestViewer.jsx"));

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
      ROUTES.VERIFY_EMAIL,
      ROUTES.PRODUCTS,
      ROUTES.PRODUCTS_V2,
      ROUTES.PRODUCTS_V3,
      ROUTES.ALL_GEMS,
      ROUTES.COLLECTIONS,
      ROUTES.SERVICES,
      ROUTES.SERVICES_DETAIL,
      ROUTES.SUPPORT,
      ROUTES.SUPPORT_DETAIL,
      ROUTES.CONTACT,
      ROUTES.CONTACT_V2,
      ROUTES.ABOUT,
      ROUTES.LOCATIONS,
      ROUTES.NEWS,
      ROUTES.NEWS_V2,
      ROUTES.IMMERSIVE_SHOWROOM,
      ROUTES.BOOK_APPOINTMENT,
      ROUTES.MILAN_SUBMIT,
      `${ROUTES.MILAN_SUBMIT}/submit-success`,
      ROUTES.HOVER_EXPAND,
      ROUTES.PRODUCTS_LEFT,
      ROUTES.VIEW_360,
      ROUTES.USER_PROFILE,
      ROUTES.SCAVENGER_HUNT,
      ROUTES.DASHBOARD_ADMIN_MANAGE,
      ROUTES.DASHBOARD_ADMIN,
      ROUTES.DASHBOARD_VENDOR,
      ROUTES.DASHBOARD_DESIGNER,
      ROUTES.UNIVERSE_FINAL,
      ROUTES.FORGOT_PASSWORD,
      ROUTES.SCROLL_EFFECT_TEST,
      ROUTES.SCROLL_EFFECT_TEST_V2,
      ROUTES.NAVBAR_V2_TEST,
      ROUTES.NAVBAR_V3_TEST,
      ROUTES.NAVBAR_V4_TEST,
      ROUTES.TEST_VIEWER,
      ROUTES.IJEWEL_AR_TRYON,
    ];

    // Check exact matches
    if (definedRoutes.includes(location.pathname)) {
      return false;
    }

    // Check dynamic routes (with params)
    if (
      location.pathname.startsWith(ROUTES.COLLECTIONS + "/") ||
      location.pathname.startsWith(ROUTES.NEWS + "/") ||
      location.pathname.startsWith(ROUTES.AR_RINGS.split(":")[0]) ||
      location.pathname.startsWith(ROUTES.AR_RINGS_HQ.split(":")[0]) ||
      location.pathname.startsWith("/ar/ijewel") ||
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
    location.pathname.startsWith(ROUTES.AR_RINGS.split(":")[0]) ||
    location.pathname.startsWith(ROUTES.AR_RINGS_HQ.split(":")[0]) ||
    location.pathname.startsWith("/ar/quoc-ti") ||
    location.pathname.startsWith("/ar/mesh-inspector") ||
    location.pathname.startsWith("/ar/ijewel") ||
    location.pathname.startsWith(ROUTES.SCAVENGER_HUNT) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_ADMIN) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_VENDOR) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_DESIGNER) ||
    location.pathname === ROUTES.WELCOME ||
    location.pathname === ROUTES.HOME ||
    location.pathname === ROUTES.SCROLL_EFFECT_TEST ||
    location.pathname === ROUTES.SCROLL_EFFECT_TEST_V2 ||
    location.pathname === ROUTES.NAVBAR_V2_TEST ||
    location.pathname === ROUTES.NAVBAR_V3_TEST ||
    location.pathname === ROUTES.NAVBAR_V4_TEST ||
    location.pathname === ROUTES.TEST_VIEWER ||
    location.pathname === ROUTES.IJEWEL_AR_TRYON;

  const staticRoutesToHideFooter =
    is404 ||
    location.pathname.startsWith(ROUTES.UNIVERSE_FINAL) ||
    location.pathname.startsWith(ROUTES.HOVER_EXPAND) ||
    location.pathname.startsWith(ROUTES.AR_RINGS.split(":")[0]) ||
    location.pathname.startsWith(ROUTES.AR_RINGS_HQ.split(":")[0]) ||
    location.pathname.startsWith("/ar/quoc-ti") ||
    location.pathname.startsWith("/ar/mesh-inspector") ||
    location.pathname.startsWith("/ar/ijewel") ||
    location.pathname.startsWith(ROUTES.SCAVENGER_HUNT) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_ADMIN) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_VENDOR) ||
    location.pathname.startsWith(ROUTES.DASHBOARD_DESIGNER) ||
    location.pathname === ROUTES.WELCOME ||
    location.pathname === ROUTES.HOME ||
    location.pathname === ROUTES.IMMERSIVE_SHOWROOM ||
    location.pathname.startsWith(ROUTES.MILAN_SUBMIT) ||
    location.pathname === ROUTES.SCROLL_EFFECT_TEST ||
    location.pathname === ROUTES.SCROLL_EFFECT_TEST_V2 ||
    location.pathname === ROUTES.NAVBAR_V2_TEST ||
    location.pathname === ROUTES.NAVBAR_V3_TEST ||
    location.pathname === ROUTES.NAVBAR_V4_TEST ||
    location.pathname === ROUTES.TEST_VIEWER ||
    location.pathname === ROUTES.IJEWEL_AR_TRYON;

  const shouldShowNavbar = !staticRoutesToHideNavBar;
  const shouldShowFooter = !staticRoutesToHideFooter;

  return (
    <>
      {/* Conditional Navbar */}
      {shouldShowNavbar && <NavbarV3 />}

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

          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<EmailVerification />} />

          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />

          <Route path={ROUTES.PRODUCTS_V2} element={<ProductsV2 />} />

          <Route path={ROUTES.PRODUCTS_V3} element={<ProductsV3 />} />

          <Route path={ROUTES.ALL_GEMS} element={<AllGemsPage />} />

          <Route path={ROUTES.COLLECTIONS} element={<CollectionPage />} />

          <Route
            path={ROUTES.COLLECTION_DETAIL}
            element={<CollectionDetailPage />}
          />

          <Route path={ROUTES.SERVICES} element={<ServicesPage />} />

          <Route
            path={ROUTES.SERVICES_DETAIL}
            element={<ServicesDetailPage />}
          />

          <Route path={ROUTES.SUPPORT} element={<SupportPage />} />

          <Route
            path={ROUTES.SUPPORT_DETAIL}
            element={<SupportDetailPage />}
          />

          <Route path={ROUTES.CONTACT} element={<ContactPage />} />

          <Route path={ROUTES.CONTACT_V2} element={<ContactPageV2 />} />

          <Route path={ROUTES.ABOUT} element={<AboutPage />} />

          <Route path={ROUTES.LOCATIONS} element={<LocationsPage />} />

          <Route path={ROUTES.NEWS} element={<AllNewsPage />} />

          <Route path={ROUTES.NEWS_V2} element={<AllNewsPageV2 />} />

          <Route path={ROUTES.NEWS_DETAIL} element={<NewsDetailWrapper />} />

          <Route
            path={ROUTES.IMMERSIVE_SHOWROOM}
            element={<ImmersiveShowroomPage />}
          />

          <Route
            path={ROUTES.BOOK_APPOINTMENT}
            element={<BookAppointmentPage />}
          />

          <Route path={ROUTES.MILAN_SUBMIT}>
            <Route index element={<SubmitPage />} />
            <Route path="submit-success" element={<SubmitSuccessPage />} />
          </Route>

          {/* for observing UI universe-section final */}
          <Route path="/universe-section" element={<UniverseSection />} />

          <Route path={ROUTES.HOVER_EXPAND} element={<HoverExpandSection />} />

          {/* Test route for ProductsLeft */}
          <Route path={ROUTES.PRODUCTS_LEFT} element={<ProductsLeft />} />

          <Route path={ROUTES.VIEW_360} element={<View360 />} />

          <Route path={ROUTES.USER_PROFILE} element={<Profile />} />

          <Route element={<TryOnRingLayout />}>
            <Route path={ROUTES.AR_RINGS} element={<TryOnRing />} />
          </Route>

          {/* High Quality Studio Mode AR Try-On */}
          <Route element={<TryOnRingLayout />}>
            <Route path={ROUTES.AR_RINGS_HQ} element={<TryOnRingHQ />} />
          </Route>

          {/* IJewel AR Try-On Route - Support query params: ?model=oval */}
          <Route path={ROUTES.IJEWEL_AR_TRYON} element={<IJewelARTryOnPage />} />

          <Route
            path="/ar/quoc-ti"
            element={<QuocTiar modelPath="/models/rings/myfav.glb" />}
          />

          <Route path="/ar/mesh-inspector" element={<SimpleMeshInspector />} />

          <Route path="/ar/ijewel/:ringId?" element={<IJewelTryOn />} />

          <Route path={ROUTES.SCAVENGER_HUNT} element={<ScavengerHunt />} />

          {/* Test route for ScrollEffect */}
          <Route
            path={ROUTES.SCROLL_EFFECT_TEST}
            element={<ScrollEffectTestPage />}
          />

          {/* Test route for ScrollEffect V2 */}
          <Route
            path={ROUTES.SCROLL_EFFECT_TEST_V2}
            element={<ScrollEffectTestV2Page />}
          />

          {/* Test route for NavbarV2 */}
          <Route
            path={ROUTES.NAVBAR_V2_TEST}
            element={<NavbarV2TestPage />}
          />

          {/* Test route for NavbarV3 */}
          <Route
            path={ROUTES.NAVBAR_V3_TEST}
            element={<NavbarV3TestPage />}
          />

          {/* Test route for NavbarV4 */}
          <Route
            path={ROUTES.NAVBAR_V4_TEST}
            element={<NavbarV4TestPage />}
          />

          {/* Test route for iJewel Viewer */}
          <Route
            path={ROUTES.TEST_VIEWER}
            element={<TestViewer />}
          />

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
