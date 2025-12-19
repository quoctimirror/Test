import { getImageUrl } from "@utils/cloudflareMediaUtil";
import PropTypes from "prop-types";

/**
 * MediaImage Component
 * Automatically uses Cloudflare CDN for images with fallback to public folder
 *
 * @example
 * <MediaImage src="home-page/banner.jpg" alt="Banner" />
 * // Automatically converts to: https://cloudflare-url/home-page/banner.jpg
 */
const MediaImage = ({ src, alt = "", className = "", ...props }) => {
  // Generate Cloudflare URL or fallback to public folder
  const imageUrl = getImageUrl(src);

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      {...props}
    />
  );
};

MediaImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default MediaImage;
