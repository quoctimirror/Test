import React, { useState, useEffect } from "react";
import "./ParallaxScrolling.css";

const ParallaxScrolling = () => {
  const [scrollY, setScrollY] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const animationDuration = screenHeight * 3;
    const progress = Math.min(scrollY / animationDuration, 1);

    if (progress < 0.5) {
      setCurrentImage(0);
    } else if (progress < 0.9) {
      setCurrentImage(1);
    } else {
      setCurrentImage(2);
    }
  }, [scrollY]);

  const getImageTransform = (imageIndex) => {
    const screenHeight = window.innerHeight;
    const stickyStart = 0; // Bắt đầu sticky ngay từ đầu trang
    const animationDuration = screenHeight * 3; // Animation diễn ra trong 3 screen heights
    const stickyEnd = stickyStart + animationDuration;

    // Trong vùng sticky: chạy animation
    const stickyScrollY = Math.max(
      0,
      Math.min(scrollY - stickyStart, animationDuration)
    );
    const progress = stickyScrollY / animationDuration;

    let opacity = 0;
    let translateX = 0;
    let scale = 1;
    let rotate = 0;
    let zIndex = 1;

    // Ảnh 1: hiển thị từ 0-40%, fade out hoàn toàn trước 50%
    if (imageIndex === 0) {
      if (progress < 0.4) {
        opacity = 1;
        translateX = 0;
        scale = 1;
        rotate = 0;
        zIndex = 3;
      } else if (progress < 0.5) {
        const fadeProgress = (progress - 0.4) / 0.1; // 10% để fade out
        opacity = 1 - fadeProgress;
        translateX = -fadeProgress * 30;
        scale = 1 - fadeProgress * 0.1;
        rotate = fadeProgress * 3;
        zIndex = 2;
      } else {
        opacity = 0;
        translateX = -30;
        scale = 0.9;
        rotate = 3;
        zIndex = 1;
      }
    }

    // Ảnh 2: bắt đầu xuất hiện từ 50% (sau khi ảnh 1 biến mất), fade out hoàn toàn trước 80%
    else if (imageIndex === 1) {
      if (progress < 0.5) {
        opacity = 0;
        translateX = 30;
        scale = 0.9;
        rotate = -3;
        zIndex = 1;
      } else if (progress < 0.65) {
        const fadeInProgress = (progress - 0.5) / 0.15; // 15% để fade in
        opacity = fadeInProgress;
        translateX = 30 - fadeInProgress * 30;
        scale = 0.9 + fadeInProgress * 0.1;
        rotate = -3 + fadeInProgress * 3;
        zIndex = 3;
      } else if (progress < 0.8) {
        opacity = 1;
        translateX = 0;
        scale = 1;
        rotate = 0;
        zIndex = 3;
      } else if (progress < 0.9) {
        const fadeOutProgress = (progress - 0.8) / 0.1; // 10% để fade out
        opacity = 1 - fadeOutProgress;
        translateX = -fadeOutProgress * 30;
        scale = 1 - fadeOutProgress * 0.1;
        rotate = fadeOutProgress * 3;
        zIndex = 2;
      } else {
        opacity = 0;
        translateX = -30;
        scale = 0.9;
        rotate = 3;
        zIndex = 1;
      }
    }

    // Ảnh 3: bắt đầu xuất hiện từ 90% (sau khi ảnh 2 biến mất hoàn toàn)
    else if (imageIndex === 2) {
      if (progress < 0.9) {
        opacity = 0;
        translateX = 30;
        scale = 0.9;
        rotate = -3;
        zIndex = 1;
      } else {
        const fadeInProgress = (progress - 0.9) / 0.1; // 10% để fade in
        opacity = fadeInProgress;
        translateX = 30 - fadeInProgress * 30;
        scale = 0.9 + fadeInProgress * 0.1;
        rotate = -3 + fadeInProgress * 3;
        zIndex = 3;
      }
    }

    return {
      opacity,
      transform: `translateX(${translateX}%) scale(${scale}) rotate(${rotate}deg)`,
      zIndex,
      transition: "none",
    };
  };

  const images = [
    { src: "/parallaxScrolling/3_rings.jpg", alt: "Bộ ba nhẫn vàng ánh đỏ" },
    { src: "/parallaxScrolling/1_ring.png", alt: "Nhẫn ba vòng lồng vào nhau" },
    { src: "/parallaxScrolling/snake_h.png", alt: "Vòng tay và nhẫn hình rắn" },
  ];

  return (
    <div className="parallax-container">
      {/* MÀN HÌNH 1 - STICKY */}
      <section className="screen sticky-screen">
        <div className="split-container">
          <div className="image-pane parallax-image-container">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                className="parallax-image"
                style={getImageTransform(index)}
              />
            ))}
          </div>
          <div className="text-pane">
            <div className="text-content">
              <h4>THE ICONIC COLLECTION</h4>
              <p>
                Sự kết hợp táo bạo giữa hình khối kiến trúc và vẻ đẹp của đá quý
                tự nhiên. Mỗi thiết kế là một tuyên ngôn về phong cách độc đáo,
                mạnh mẽ và đầy cá tính, nơi nghệ thuật và trang sức hòa quyện
                làm một.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MÀN HÌNH 2 */}
      <section className="screen">
        <div className="split-container">
          <div className="image-pane">
            <img
              src="/parallaxScrolling/1_ring.png"
              alt="Nhẫn ba vòng lồng vào nhau"
            />
          </div>
          <div className="image-pane">
            <img
              src="/parallaxScrolling/snake_h.png"
              alt="Vòng tay và nhẫn hình rắn"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ParallaxScrolling;
