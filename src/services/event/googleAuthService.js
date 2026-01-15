/**
 * Google Auth Service - Direct Google Sign-In (không qua Supabase Auth)
 * OAuth redirect về domain của bạn, chỉ dùng Supabase để lưu data
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
 * Trigger Google Sign-In popup
 * Uses OAuth2 popup flow as primary method (more reliable than One Tap)
 */
export function signInWithGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    console.error('Google Client ID chưa được cấu hình');
    return;
  }

  // Use OAuth2 popup flow (more reliable across browsers)
  const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

  // Create popup window
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: window.location.origin,
    response_type: 'token id_token',
    scope: 'openid email profile',
    nonce: Math.random().toString(36).substring(2),
    prompt: 'select_account',
  });

  const popup = window.open(
    `${oauth2Endpoint}?${params.toString()}`,
    'Google Sign In',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
  );

  // Listen for popup redirect
  const checkPopup = setInterval(() => {
    try {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        // User closed popup - just reset loading state, don't show error
        if (oauthErrorCallback) {
          oauthErrorCallback(null);
        }
        return;
      }

      // Check if popup redirected back to our origin
      if (popup.location.origin === window.location.origin) {
        clearInterval(checkPopup);

        // Get token from URL hash
        const hash = popup.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');

        popup.close();

        if (idToken) {
          const userData = decodeJwtToken(idToken);
          if (userData && oauthSuccessCallback) {
            oauthSuccessCallback(userData);
          } else if (oauthErrorCallback) {
            oauthErrorCallback('Không thể đọc thông tin user');
          }
        } else if (oauthErrorCallback) {
          oauthErrorCallback('Đăng nhập thất bại');
        }
      }
    } catch (e) {
      // Cross-origin error - popup still on Google's page, keep waiting
    }
  }, 500);

  // Timeout after 5 minutes
  setTimeout(() => {
    clearInterval(checkPopup);
    if (popup && !popup.closed) {
      popup.close();
    }
  }, 5 * 60 * 1000);
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
