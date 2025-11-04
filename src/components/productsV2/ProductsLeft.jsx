import React, { useEffect, useRef } from "react";
import "./ProductsLeft.css";

const ProductsLeft = () => {
  // Tạo ref để tham chiếu đến DOM element chứa viewer
  const viewerRootRef = useRef(null);

  useEffect(() => {
    // Kiểm tra xem DOM element đã render chưa và SDK đã load chưa
    if (!viewerRootRef.current || !window.ijewelViewer) return;

    // URL model 3D local từ public/models
    const model = "/models/rings/refine-mirror-fiston.glb";

    // Khởi tạo iJewel3D Viewer
    // Tham số 1: DOM element để render viewer
    // Tham số 2: project config - chứa modelUrl và basePath
    // Tham số 3: viewer options - các tùy chọn hiển thị
    new window.ijewelViewer.Viewer(
      viewerRootRef.current,
      { modelUrl: model }, // project
      { showCard: false } // viewer options - ẩn card thông tin
    );

    // Event listener khi viewer đã sẵn sàng
    const handleViewerReady = async (ev) => {
      const viewer = ev.detail.viewer; // Lấy instance của viewer
      // Có thể sử dụng viewer instance để control viewer (zoom, rotate, etc.)
    };

    // Đăng ký event listener
    window.addEventListener("webgi-viewer-ready", handleViewerReady);

    // Cleanup function - xóa event listener khi component unmount
    return () => {
      window.removeEventListener("webgi-viewer-ready", handleViewerReady);
    };
  }, []); // Empty dependency array - chỉ chạy 1 lần khi component mount

  return (
    // Element để render viewer vào
    <div id="pv2-viewer-root" ref={viewerRootRef}></div>
  );
};

export default ProductsLeft;
