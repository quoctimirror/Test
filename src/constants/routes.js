// Routes Constants - Centralized route management
// Only update routes here, all other files will use these constants

export const ROUTES = {
  // Public routes (keep original)
  HOME: "/",
  IMMERSIVE_SHOWROOM: "/immersive-showroom",
  BOOK_APPOINTMENT: "/book-an-appointment",
  MILAN_SUBMIT: "/mirror-in-milan-digital-jewelry-week",
  MILAN_SUBMIT_SUCCESS: "/mirror-in-milan-digital-jewelry-week/submit-success",
  SCAVENGER_HUNT: "/scavenger-hunt",
  VERIFY_EMAIL: "/verify-email",

  // UUID-protected routes
  WELCOME: "/5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
  HOME_PAGE: "/8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
  AUTH: "/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  AUTH_LOGIN: "/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/login",
  AUTH_REGISTER: "/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/register",
  FORGOT_PASSWORD: "/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/forgot-password",
  PRODUCTS: "/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
  COLLECTIONS: "/d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
  COLLECTION_DETAIL: "/d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a/:collectionId",
  SERVICES: "/e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
  SERVICES_DETAIL: "/e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b/detail",
  SUPPORT: "/f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c",
  SUPPORT_DETAIL: "/f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c/detail",
  CONTACT: "/a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d",
  CONTACT_V2: "/contact-v2",
  ABOUT: "/b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e",
  LOCATIONS: "/c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f",
  NEWS: "/d0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a",
  NEWS_DETAIL: "/d0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a/:slug",
  ALL_GEMS: "/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
  USER_PROFILE: "/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b",
  AR_RINGS: "/f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c/:ringId",
  AR_RINGS_HQ: "/ar/rings-hq/:ringId", // High Quality Studio Mode
  IJEWEL_AR_TRYON: "/ijewel-tryon", // IJewel AR Try-On page

  // Test routes
  PRODUCTS_V2: "/7b8e9f0a-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
  PRODUCTS_V3: "/3f4a5b6c-7d8e-9f0a-1b2c-3d4e5f6a7b8c",
  PRODUCTS_LEFT: "/4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
  VIEW_360: "/6c7d8e9f-0a1b-2c3d-4e5f-6a7b8c9d0e1f",
  HOVER_EXPAND: "/2a5f8c9d-4e3b-4a1c-9f7e-8d6c5b4a3e2f",
  UNIVERSE_FINAL: "/1f2e3d4c-5b6a-7c8d-9e0f-1a2b3c4d5e6f",
  NEWS_V2: "/5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
  SCROLL_EFFECT_TEST: "/test-scroll-effect",
  SCROLL_EFFECT_TEST_V2: "/test-scroll-effect-v2",
  NAVBAR_V2_TEST: "/test-navbar-v2",
  NAVBAR_V3_TEST: "/test-navbar-v3",
  NAVBAR_V4_TEST: "/test-navbar-v4",
  TEST_VIEWER: "/test-ijewel-viewer",

  // Dashboard routes (keep original - protected by auth)
  DASHBOARD_ADMIN: "/dashboard/admin",
  DASHBOARD_ADMIN_MANAGE: "/dashboard/admin/manage-products",
  DASHBOARD_VENDOR: "/dashboard/vendor",
  DASHBOARD_DESIGNER: "/dashboard/designer",
};

// Helper to get collection detail route with ID
export const getCollectionDetailRoute = (collectionId) => {
  return ROUTES.COLLECTION_DETAIL.replace(":collectionId", collectionId);
};

// Helper to get news detail route with slug
export const getNewsDetailRoute = (slug) => {
  return ROUTES.NEWS_DETAIL.replace(":slug", slug);
};

// Helper to get AR ring route with ID
export const getARRingRoute = (ringId) => {
  return ROUTES.AR_RINGS.replace(":ringId", ringId);
};

// Helper to get AR ring HQ route with ID
export const getARRingHQRoute = (ringId) => {
  return ROUTES.AR_RINGS_HQ.replace(":ringId", ringId);
};
