/**
 * Cloudflare Media Utility
 * Manages media URLs from Cloudflare CDN with fallback to public folder
 *
 * CẬP NHẬT: Thêm image transform options (width, height, quality)
 *
 * NGUYÊN TẮC ÁP DỤNG:
 * - Open/Closed: Thêm options mới mà không sửa logic cũ
 * - Backward Compatible: Code cũ vẫn hoạt động bình thường
 */

/**
 * Get Cloudflare media base URL from environment variable
 * @returns {string} Base URL for Cloudflare media
 */
const getCloudflareBaseUrl = () => {
  return import.meta.env.VITE_CLOUDFLARE_MEDIA_URL || "";
};

/**
 * Generate media URL from Cloudflare or fallback to public folder
 * @param {string} path - Media file path (e.g., "home-page/MIRROR-LUMEX 91.mp4")
 * @param {Object} options - Additional options
 * @param {boolean} options.forceCloudflare - Force using Cloudflare even without env var
 * @returns {string} Full media URL
 */
export const getMediaUrl = (path, options = {}) => {
  // If path is empty or undefined, return empty string
  if (!path) return "";

  // If path is already an absolute URL (from API), return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const { forceCloudflare = false } = options;
  const cloudflareBaseUrl = getCloudflareBaseUrl();

  // Remove leading slash if exists
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // If Cloudflare URL is configured, use it
  if (cloudflareBaseUrl) {
    // Ensure base URL doesn't end with slash
    const baseUrl = cloudflareBaseUrl.endsWith("/")
      ? cloudflareBaseUrl.slice(0, -1)
      : cloudflareBaseUrl;
    return `${baseUrl}/${cleanPath}`;
  }

  // Fallback to public folder if not forcing Cloudflare
  if (!forceCloudflare) {
    return `/${cleanPath}`;
  }

  // If forcing Cloudflare but not configured, return empty
  console.warn(
    "Cloudflare media URL not configured. Set VITE_CLOUDFLARE_MEDIA_URL in .env"
  );
  return "";
};

/**
 * Generate video URL with specific options
 * @param {string} path - Video file path
 * @param {Object} options - Video-specific options
 * @returns {string} Video URL
 */
export const getVideoUrl = (path, options = {}) => {
  return getMediaUrl(path, options);
};

/**
 * Generate image URL with specific options
 *
 * MỚI: Hỗ trợ image transform options
 *
 * @param {string} path - Image file path
 * @param {Object} options - Image-specific options
 * @param {number} options.width - Resize width
 * @param {number} options.height - Resize height
 * @param {number} options.quality - Image quality (1-100)
 * @param {string} options.format - Output format (webp, jpg, png)
 * @returns {string} Image URL
 */
export const getImageUrl = (path, options = {}) => {
  const baseUrl = getMediaUrl(path, options);

  // Nếu không có transform options, return URL gốc
  const { width, height, quality, format } = options;
  if (!width && !height && !quality && !format) {
    return baseUrl;
  }

  // Nếu là absolute URL (từ API), không thể transform
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return baseUrl;
  }

  // Build query params cho transform
  // LƯU Ý: Điều này cần CDN hỗ trợ image transforms
  // Cloudflare Images: /cdn-cgi/image/width=X,height=Y/path
  // Hoặc query params: ?w=X&h=Y&q=Z
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality) params.append('q', quality);
  if (format) params.append('f', format);

  const queryString = params.toString();
  if (!queryString) return baseUrl;

  // Thêm query params vào URL
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
};

/**
 * MỚI: Generate thumbnail URL
 *
 * @param {string} path - Image file path
 * @param {number} size - Thumbnail size (default: 100)
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (path, size = 100) => {
  return getImageUrl(path, { width: size, height: size, quality: 60 });
};

/**
 * MỚI: Generate responsive srcSet
 *
 * @param {string} path - Image file path
 * @param {number[]} widths - Array of widths
 * @returns {string} srcSet string
 */
export const getResponsiveSrcSet = (path, widths = [320, 640, 1024, 1920]) => {
  if (!path) return '';

  // Nếu là absolute URL, không thể tạo srcSet
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return '';
  }

  return widths
    .map((width) => `${getImageUrl(path, { width })} ${width}w`)
    .join(', ');
};

/**
 * MỚI: Generate blur placeholder URL (low quality)
 *
 * @param {string} path - Image file path
 * @returns {string} Low quality image URL for placeholder
 */
export const getBlurPlaceholderUrl = (path) => {
  return getImageUrl(path, { width: 20, quality: 20 });
};

/**
 * Check if Cloudflare is configured
 * @returns {boolean} True if Cloudflare URL is set
 */
export const isCloudflareConfigured = () => {
  return Boolean(getCloudflareBaseUrl());
};

export default {
  getMediaUrl,
  getVideoUrl,
  getImageUrl,
  getThumbnailUrl,
  getResponsiveSrcSet,
  getBlurPlaceholderUrl,
  isCloudflareConfigured,
};
