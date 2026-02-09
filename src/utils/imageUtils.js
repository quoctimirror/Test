/**
 * Image Utilities
 *
 * MỤC ĐÍCH: Các helper functions cho image optimization
 *
 * NGUYÊN TẮC ÁP DỤNG:
 * - DRY: Viết 1 lần, dùng nhiều nơi
 * - Pure Functions: Cùng input → cùng output
 * - Single Responsibility: Mỗi function làm 1 việc
 */

/**
 * Tạo srcSet cho responsive images
 *
 * @param {string} src - URL gốc của ảnh
 * @param {number[]} widths - Array các width cần generate (vd: [320, 640, 1024])
 * @returns {string} srcSet string (vd: "image-320.webp 320w, image-640.webp 640w")
 *
 * LƯU Ý: Function này giả định CDN hỗ trợ resize qua URL params
 * Nếu dùng Cloudflare Images, URL sẽ có dạng: /cdn-cgi/image/width=320/image.jpg
 */
export const generateSrcSet = (src, widths = [320, 640, 1024, 1920]) => {
  if (!src) return '';

  // Nếu src là URL tuyệt đối (từ API), không thể resize
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return '';
  }

  return widths
    .map((width) => `${src}?w=${width} ${width}w`)
    .join(', ');
};

/**
 * Tạo placeholder blur data URL
 *
 * @param {string} color - Màu placeholder (hex hoặc rgb)
 * @returns {string} Data URL của placeholder
 *
 * VÍ DỤ: generateBlurPlaceholder('#f0f0f0') → "data:image/svg+xml,..."
 */
export const generateBlurPlaceholder = (color = '#e0e0e0') => {
  // Tạo SVG đơn giản làm placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1">
      <rect width="1" height="1" fill="${color}"/>
    </svg>
  `;

  // Encode thành data URL
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
};

/**
 * Tính toán size tối ưu dựa trên viewport
 *
 * @param {number} containerWidth - Width của container chứa ảnh
 * @param {number} devicePixelRatio - Pixel ratio của device (retina = 2)
 * @returns {number} Width tối ưu để request
 */
export const getOptimalImageSize = (containerWidth, devicePixelRatio = 1) => {
  const sizes = [320, 640, 768, 1024, 1280, 1920, 2560];
  const targetWidth = containerWidth * devicePixelRatio;

  // Tìm size nhỏ nhất mà >= targetWidth
  const optimalSize = sizes.find((size) => size >= targetWidth);

  // Nếu không tìm thấy, trả về size lớn nhất
  return optimalSize || sizes[sizes.length - 1];
};

/**
 * Kiểm tra xem browser có hỗ trợ WebP không
 *
 * @returns {Promise<boolean>}
 */
export const supportsWebP = async () => {
  if (typeof window === 'undefined') return false;

  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = webpData;
  });
};

/**
 * Tạo sizes attribute cho responsive images
 *
 * @param {Object} breakpoints - Object chứa breakpoints và sizes
 * @returns {string} sizes string cho img tag
 *
 * VÍ DỤ:
 * generateSizes({ mobile: '100vw', tablet: '50vw', desktop: '33vw' })
 * → "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 */
export const generateSizes = (breakpoints = {}) => {
  const {
    mobile = '100vw',   // < 640px
    tablet = '100vw',   // < 1024px
    desktop = '100vw',  // >= 1024px
  } = breakpoints;

  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
};

/**
 * Default fallback image URL
 */
export const DEFAULT_FALLBACK_IMAGE = '/assets/images/placeholder.webp';

/**
 * Default blur placeholder color
 */
export const DEFAULT_PLACEHOLDER_COLOR = '#f5f5f5';

export default {
  generateSrcSet,
  generateBlurPlaceholder,
  getOptimalImageSize,
  supportsWebP,
  generateSizes,
  DEFAULT_FALLBACK_IMAGE,
  DEFAULT_PLACEHOLDER_COLOR,
};
