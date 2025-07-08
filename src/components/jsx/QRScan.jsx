import React from 'react';
import '../css/QRScan.css'; // Giữ nguyên nếu bạn đã tạo file CSS

const QRScan = () => {
  return (
    <div className="qr-scan-container">
      {/* Tiêu đề tiếng Anh */}
      {/* <div className="qr-scan-title">
        <span className="qr-scan-icon" role="img" aria-label="ring">💍</span>
        Virtual Ring Try-On
      </div> */}

      {/* Mã QR từ thư mục public */}
      <img 
        src="/ar_try_on_rings_qr.png" 
        alt="AR Ring Try-On QR Code" 
        className="qr-code-image" 
      />

      {/* Tiêu đề tiếng Việt */}
      {/* <h2 className="qr-scan-subtitle">
        Trải nghiệm AR Thử Nhẫn
      </h2> */}
    </div>
  );
};

export default QRScan;
