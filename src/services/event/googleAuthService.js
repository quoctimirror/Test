/**
 * Google Auth Service - Direct Google Sign-In (không qua Supabase Auth)
 * OAuth redirect về domain của bạn, chỉ dùng Supabase để lưu data
 *
 * SỬ DỤNG GOOGLE IDENTITY SERVICES SDK
 * - Google SDK tự mở popup (không dùng window.open)
 * - Hoạt động trong in-app browser (Zalo, Messenger, Instagram, TikTok)
 * - Giống cách ticketbox.vn implement
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let googleAuthInitialized = false;

/**
 * Load Google Identity Services script
 */
export function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Initialize Google Sign-In
 * @param {Function} onSuccess - Callback with user data
 * @param {Function} onError - Callback with error
 */
export async function initGoogleSignIn(onSuccess, onError) {
  try {
    await loadGoogleScript();

    if (!GOOGLE_CLIENT_ID) {
      throw new Error('VITE_GOOGLE_CLIENT_ID chưa được cấu hình');
    }

    // Store callbacks for OAuth popup flow
    oauthSuccessCallback = onSuccess;
    oauthErrorCallback = onError;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          // Decode JWT to get user info
          const userData = decodeJwtToken(response.credential);
          onSuccess(userData);
        } else {
          onError('Đăng nhập thất bại');
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      // Disable FedCM to avoid CORS issues, use traditional popup instead
      use_fedcm_for_prompt: false,
    });

    googleAuthInitialized = true;
  } catch (error) {
    console.error('Google Sign-In init error:', error);
    onError(error.message);
  }
}

// Store callbacks for OAuth popup flow
let oauthSuccessCallback = null;
let oauthErrorCallback = null;

/**
 * Set OAuth callbacks (called from initGoogleSignIn)
 */
export function setOAuthCallbacks(onSuccess, onError) {
  oauthSuccessCallback = onSuccess;
  oauthErrorCallback = onError;
}

/**
 * ============================================================
 * THAY ĐỔI CHÍNH: Dùng Google Identity Services SDK
 * - Google SDK TỰ MỞ popup
 * - Hoạt động trong in-app browser (Zalo, Messenger, Instagram, TikTok)
 * ============================================================
 */
export async function signInWithGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    console.error('Google Client ID chưa được cấu hình');
    if (oauthErrorCallback) {
      oauthErrorCallback('Google Client ID chưa được cấu hình');
    }
    return;
  }

  try {
    // Đảm bảo Google script đã load
    await loadGoogleScript();

    // Dùng google.accounts.id.prompt() - Google SDK tự hiển thị UI đăng nhập
    // Callback đã được set trong initGoogleSignIn()
    window.google.accounts.id.prompt((notification) => {
      // Xử lý các trạng thái của prompt
      if (notification.isNotDisplayed()) {
        // Prompt không hiển thị được, có thể do:
        // - User đã đăng nhập
        // - Browser chặn popup
        // - Không có session Google
        console.log('Prompt not displayed:', notification.getNotDisplayedReason());

        // Fallback: Dùng OAuth2 token client
        fallbackToTokenClient();
      } else if (notification.isSkippedMoment()) {
        // User bỏ qua prompt
        console.log('Prompt skipped:', notification.getSkippedReason());
      } else if (notification.isDismissedMoment()) {
        // User đóng prompt
        console.log('Prompt dismissed:', notification.getDismissedReason());
        if (notification.getDismissedReason() === 'credential_returned') {
          // Đăng nhập thành công, callback sẽ được gọi từ initialize()
          return;
        }
      }
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    if (oauthErrorCallback) {
      oauthErrorCallback(error.message || 'Đăng nhập thất bại');
    }
  }
}

/**
 * Fallback khi prompt không hiển thị được
 * Dùng OAuth2 token client
 */
async function fallbackToTokenClient() {
  try {
    // Tạo mới tokenClient mỗi lần để đảm bảo callback đúng
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          console.error('Token error:', tokenResponse.error);
          if (oauthErrorCallback) {
            oauthErrorCallback(tokenResponse.error);
          }
          return;
        }

        // Lấy thông tin user từ Google API
        try {
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          });
          const userData = await userInfo.json();

          if (userData && oauthSuccessCallback) {
            oauthSuccessCallback({
              id: userData.sub,
              email: userData.email,
              displayName: userData.name,
              firstName: userData.given_name,
              lastName: userData.family_name,
              avatarUrl: userData.picture,
              emailVerified: userData.email_verified,
              provider: 'google',
            });
          } else if (oauthErrorCallback) {
            oauthErrorCallback('Không thể lấy thông tin user');
          }
        } catch (err) {
          console.error('Error fetching user info:', err);
          if (oauthErrorCallback) {
            oauthErrorCallback('Không thể lấy thông tin user');
          }
        }
      },
      error_callback: (error) => {
        console.error('Google OAuth error:', error);
        if (oauthErrorCallback) {
          oauthErrorCallback(error.message || 'Đăng nhập thất bại');
        }
      },
    });

    // Request token - Google SDK tự mở popup
    client.requestAccessToken({ prompt: 'select_account' });
  } catch (error) {
    console.error('Fallback error:', error);
    if (oauthErrorCallback) {
      oauthErrorCallback(error.message || 'Đăng nhập thất bại');
    }
  }
}

/**
 * Render Google Sign-In button
 * @param {HTMLElement} element - Container element
 * @param {Object} options - Button options
 */
export function renderGoogleButton(element, options = {}) {
  if (!googleAuthInitialized || !element) return;

  window.google.accounts.id.renderButton(element, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: element.offsetWidth || 300,
    ...options,
  });
}

/**
 * Decode Google JWT token to get user info
 */
function decodeJwtToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    return {
      id: payload.sub, // Google user ID
      email: payload.email,
      displayName: payload.name,
      firstName: payload.given_name,
      lastName: payload.family_name,
      avatarUrl: payload.picture,
      emailVerified: payload.email_verified,
      provider: 'google',
    };
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * Sign out (clear Google session)
 */
export function signOutGoogle() {
  if (window.google?.accounts) {
    window.google.accounts.id.disableAutoSelect();
  }
}
