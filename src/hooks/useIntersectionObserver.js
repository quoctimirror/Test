/**
 * useIntersectionObserver Hook
 *
 * MỤC ĐÍCH: Detect khi nào một element xuất hiện trên màn hình người dùng
 *
 * TẠI SAO CẦN:
 * - Lazy load ảnh: chỉ load khi user scroll đến
 * - Trigger animation: khi element xuất hiện
 * - Infinite scroll: load thêm data khi scroll xuống cuối
 *
 * NGUYÊN TẮC ÁP DỤNG:
 * - DRY: Viết 1 lần, dùng nhiều nơi
 * - Single Responsibility: Hook chỉ làm 1 việc - detect intersection
 * - Open/Closed: Có thể config qua options mà không sửa code
 */

import { useState, useEffect } from 'react';

/**
 * @param {React.RefObject} ref - Reference đến element cần theo dõi
 * @param {Object} options - Cấu hình cho IntersectionObserver
 * @param {string} options.rootMargin - Margin xung quanh viewport (vd: "100px" = detect sớm 100px)
 * @param {number} options.threshold - % element phải visible (0 = vừa chạm, 1 = 100% visible)
 * @param {boolean} options.triggerOnce - Chỉ trigger 1 lần rồi ngừng observe
 * @returns {boolean} isIntersecting - Element có đang trong viewport không
 */
const useIntersectionObserver = (ref, options = {}) => {
  // ========== PHẦN 1: KHỞI TẠO STATE ==========
  // State này sẽ là true khi element xuất hiện trong viewport
  // Ban đầu là false vì chưa biết element ở đâu
  const [isIntersecting, setIsIntersecting] = useState(false);

  // ========== PHẦN 2: DESTRUCTURE OPTIONS ==========
  // Lấy các options ra, nếu không có thì dùng giá trị mặc định
  const {
    rootMargin = '0px',    // Mặc định: detect đúng lúc vào viewport
    threshold = 0,          // Mặc định: vừa chạm là trigger
    triggerOnce = false,    // Mặc định: trigger nhiều lần (vào/ra viewport)
  } = options;

  // ========== PHẦN 3: SETUP OBSERVER ==========
  useEffect(() => {
    // Lấy element từ ref
    // ref.current là DOM element thực tế
    const element = ref.current;

    // Nếu không có element (chưa render xong), không làm gì
    if (!element) return;

    // Tạo IntersectionObserver
    // Callback này được gọi mỗi khi element vào/ra viewport
    const observer = new IntersectionObserver(
      (entries) => {
        // entries là array, nhưng ta chỉ observe 1 element nên lấy [0]
        const entry = entries[0];

        // Cập nhật state: element có đang intersecting không?
        setIsIntersecting(entry.isIntersecting);

        // Nếu triggerOnce = true và element đã xuất hiện
        // → Ngừng observe (không cần theo dõi nữa)
        if (triggerOnce && entry.isIntersecting) {
          observer.unobserve(element);
        }
      },
      {
        rootMargin,  // Margin xung quanh viewport
        threshold,   // % visible để trigger
      }
    );

    // Bắt đầu observe element
    observer.observe(element);

    // ========== PHẦN 4: CLEANUP ==========
    // Khi component unmount hoặc dependencies thay đổi
    // → Ngừng observe để tránh memory leak
    return () => {
      observer.unobserve(element);
    };
  }, [ref, rootMargin, threshold, triggerOnce]);
  // Dependencies: re-run effect nếu 1 trong các giá trị này thay đổi

  // ========== PHẦN 5: RETURN ==========
  // Trả về boolean để component biết element có visible không
  return isIntersecting;
};

export default useIntersectionObserver;
