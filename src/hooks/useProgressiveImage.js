/**
 * useProgressiveImage Hook
 *
 * MỤC ĐÍCH: Load ảnh theo kiểu progressive (blur → rõ)
 *
 * TẠI SAO CẦN:
 * - User thấy placeholder mờ ngay lập tức
 * - Sau đó ảnh rõ dần lên
 * - Tạo cảm giác nhanh hơn (perceived performance)
 *
 * NGUYÊN TẮC ÁP DỤNG:
 * - Single Responsibility: Chỉ xử lý progressive loading
 * - Composition: Kết hợp với useImageLoader
 */

import { useState, useEffect } from 'react';

/**
 * @param {string} lowQualitySrc - URL ảnh chất lượng thấp (placeholder)
 * @param {string} highQualitySrc - URL ảnh chất lượng cao (ảnh thật)
 * @returns {Object} { src, isLoading, isHighQualityLoaded }
 */
const useProgressiveImage = (lowQualitySrc, highQualitySrc) => {
  // State: URL ảnh hiện tại đang hiển thị
  const [src, setSrc] = useState(lowQualitySrc || highQualitySrc);

  // State: Đang load ảnh chất lượng cao?
  const [isLoading, setIsLoading] = useState(true);

  // State: Ảnh chất lượng cao đã load xong?
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    // Reset khi src thay đổi
    setSrc(lowQualitySrc || highQualitySrc);
    setIsLoading(true);
    setIsHighQualityLoaded(false);

    // Nếu không có ảnh chất lượng cao, dừng
    if (!highQualitySrc) {
      setIsLoading(false);
      return;
    }

    // Load ảnh chất lượng cao
    const img = new Image();

    img.onload = () => {
      // Khi load xong, chuyển sang ảnh chất lượng cao
      setSrc(highQualitySrc);
      setIsLoading(false);
      setIsHighQualityLoaded(true);
    };

    img.onerror = () => {
      // Nếu lỗi, giữ nguyên ảnh placeholder
      setIsLoading(false);
    };

    img.src = highQualitySrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [lowQualitySrc, highQualitySrc]);

  return { src, isLoading, isHighQualityLoaded };
};

export default useProgressiveImage;
