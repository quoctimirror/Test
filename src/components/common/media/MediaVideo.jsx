import { getVideoUrl, getImageUrl } from "@utils/cloudflareMediaUtil";
import PropTypes from "prop-types";

/**
 * MediaVideo Component
 * Automatically uses Cloudflare CDN for videos and posters with fallback to public folder
 *
 * @example
 * <MediaVideo
 *   src="home-page/video.mp4"
 *   poster="home-page/poster.jpg"
 *   autoPlay
 *   loop
 *   muted
 * />
 * // Automatically converts both video and poster to Cloudflare URLs
 */
const MediaVideo = ({
  src,
  poster,
  className = "",
  ...props
}) => {
  // Generate Cloudflare URLs or fallback to public folder
  const videoUrl = getVideoUrl(src);
  const posterUrl = poster ? getImageUrl(poster) : undefined;

  return (
    <video
      src={videoUrl}
      poster={posterUrl}
      className={className}
      {...props}
    />
  );
};

MediaVideo.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  className: PropTypes.string,
};

export default MediaVideo;
