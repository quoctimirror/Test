/**
 * MediaImage Component
 *
 * MỤC ĐÍCH: Component hiển thị ảnh với Cloudflare CDN
 *
 * TÍNH NĂNG:
 * - Tự động convert URL sang Cloudflare CDN
 * - Hỗ trợ fallback khi lỗi
 * - Giữ nguyên CSS cũ (không wrap trong div)
 *
 * ĐƠN GIẢN HÓA: Bỏ lazy loading phức tạp, dùng native loading="lazy"
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { getImageUrl } from "@utils/cloudflareMediaUtil";

const MediaImage = ({
  src,
  alt = "",
  className = "",
  style = {},
  loading = "lazy",           // Native lazy loading
  priority = false,           // Nếu true, sẽ dùng loading="eager"
  fallbackSrc = "",           // Ảnh hiển thị khi lỗi
  onLoad = () => {},
  onError = () => {},
  preloadMargin,              // Không dùng nữa, giữ để backward compatible
  ...props
}) => {
  // ========== STATE ==========
  const [hasError, setHasError] = useState(false);

  // ========== GENERATE URL ==========
  const imageUrl = getImageUrl(src);
  const fallbackUrl = fallbackSrc ? getImageUrl(fallbackSrc) : null;

  // ========== HANDLERS ==========
  const handleLoad = (e) => {
    onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError(e);
  };

  // ========== RENDER ==========
  const displaySrc = hasError && fallbackUrl ? fallbackUrl : imageUrl;

  // priority=true sẽ override loading thành "eager"
  const finalLoading = priority ? "eager" : loading;

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      style={style}
      loading={finalLoading}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

MediaImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  loading: PropTypes.oneOf(["eager", "lazy"]),
  priority: PropTypes.bool,
  fallbackSrc: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  preloadMargin: PropTypes.string,  // Deprecated, giữ để backward compatible
};

export default MediaImage;
