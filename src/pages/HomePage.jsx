// src/pages/HomePage.jsx

import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center", minHeight: '200vh' }}>
      <h1>Chào mừng đến trang chủ!</h1>
      <p>Đây là landing page chính.</p>
      <p style={{ marginTop: '2rem' }}>Scroll xuống để thấy nhiều nội dung hơn...</p>
      
      <div style={{ marginTop: "50vh" }}>
        <Link 
          // SỬA LỖI: Cập nhật đường dẫn cho đúng với file routes/index.jsx
          to="/universe-section-developing" 
          style={{
            display: "inline-block",
            padding: "1rem 2rem",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontSize: "1.1rem"
          }}
        >
          {/* Sửa lại text cho phù hợp */}
          Xem Universe Section (Đang phát triển)
        </Link>
      </div>
    </div>
  );
}