/**
 * useImageLoader Hook
 *
 * MỤC ĐÍCH: Quản lý trạng thái loading của image
 *
 * TẠI SAO CẦN:
 * - Biết khi nào ảnh đang load → hiện placeholder
 * - Biết khi nào ảnh load xong → hiện ảnh thật
 * - Biết khi nào ảnh lỗi → hiện fallback
 *
 * NGUYÊN TẮC ÁP DỤNG:
 * - Single Responsibility: Chỉ quản lý loading state
 * - DRY: Dùng chung cho tất cả image components
 */

import { useState, useEffect } from 'react';

/**
 * @param {string} src - URL của ảnh cần load
 * @returns {Object} { isLoading, isLoaded, hasError }
 */
const useImageLoader = (src) => {
  // ========== STATE ==========
  const [isLoading, setIsLoading] = useState(true);   // Đang load?
  const [isLoaded, setIsLoaded] = useState(false);    // Load xong?
  const [hasError, setHasError] = useState(false);    // Có lỗi?

  useEffect(() => {
    // Reset state khi src thay đổi
    setIsLoading(true);
    setIsLoaded(false);
    setHasError(false);

    // Nếu không có src, không làm gì
    if (!src) {
      setIsLoading(false);
      return;
    }

    // Tạo Image object để preload
    const img = new Image();

    // Khi load thành công
    img.onload = () => {
      setIsLoading(false);
      setIsLoaded(true);
      setHasError(false);
    };

    // Khi load thất bại
    img.onerror = () => {
      setIsLoading(false);
      setIsLoaded(false);
      setHasError(true);
    };

    // Bắt đầu load ảnh
    img.src = src;

    // Cleanup: hủy load nếu component unmount
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { isLoading, isLoaded, hasError };
};

export default useImageLoader;
