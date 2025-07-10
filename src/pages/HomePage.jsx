import { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Logo from "../assets/images/Logo.svg";
import Vector2 from "../assets/images/Vector_2.svg";
import "../styles/home.css";

export default function HomePage() {
  // Tạo các ref để tham chiếu đến các DOM element
  const whiteOverlayRef = useRef(null);
  const elementsToFadeRef = useRef(null); // Ref cho group các element cần làm mờ

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const animationDistance = window.innerHeight; 
      const totalAnimationDistance = animationDistance * 2; // Gấp đôi không gian cuộn
      
      // GIAI ĐOẠN 1: Dải trắng di chuyển từ phải sang trái (0-100vh)
      if (scrollY < animationDistance) {
        // Tính toán tiến trình animation (từ 0 đến 1)
        let progress = scrollY / animationDistance;
        progress = Math.min(progress, 1);

        // 1. Điều khiển lớp phủ màu trắng
        if (whiteOverlayRef.current) {
          // Di chuyển lớp phủ từ phải (100%) vào trong màn hình (0%)
          whiteOverlayRef.current.style.transform = `translateX(${100 - progress * 100}%)`;
        }

        // 2. Làm mờ các button và text
        if (elementsToFadeRef.current) {
          // Opacity giảm từ 1 xuống 0
          elementsToFadeRef.current.style.opacity = 1 - progress;
        }
      } else if (scrollY < totalAnimationDistance) {
        // GIAI ĐOẠN 2: Dải trắng đã phủ hết, chờ cuộn thêm để bắt đầu chuyển section
        if (whiteOverlayRef.current) {
          whiteOverlayRef.current.style.transform = `translateX(0%)`;
        }
        if (elementsToFadeRef.current) {
          elementsToFadeRef.current.style.opacity = 0;
        }
      } else {
        // GIAI ĐOẠN 3: Sau 200vh, bắt đầu cuộn bình thường đến section 2
        if (whiteOverlayRef.current) {
          whiteOverlayRef.current.style.transform = `translateX(0%)`;
        }
        if (elementsToFadeRef.current) {
          elementsToFadeRef.current.style.opacity = 0;
        }
      }
    };

    // Thêm event listener khi component được mount
    window.addEventListener("scroll", handleScroll);

    // Dọn dẹp event listener khi component bị unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Mảng rỗng đảm bảo effect chỉ chạy một lần

  return (
    <>
      {/* CONTAINER: Chứa toàn bộ hiệu ứng cuộn */}
      <div className="scroll-container">
        <div className="homepage">
          {/* Nội dung bên trong .homepage giữ nguyên */}
          <div className="gradient-top"></div>
          <div className="gradient-bottom"></div>
          <div className="white-overlay" ref={whiteOverlayRef}></div>
          <div className="logo-center">
            <img src={Logo} alt="Mirror Logo" className="main-logo" />
          </div>
          <div className="elements-to-fade" ref={elementsToFadeRef}>
            <Navbar />
            <div className="tagline-section">
              <div className="tagline-top">Exploring The Universe Of</div>
              <div className="tagline-bottom">
                <span className="future-text">Future</span>
                <span className="diamond-text">Diamond</span>
              </div>
            </div>
            <div className="scroll-down">
              <button>
                <img src="/src/assets/images/arrow-right.svg" alt="Arrow Right" />
              </button>
            </div>
            <div className="vetor-button">
              <button>
                <img src={Vector2} alt="Vetor 2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Section này sẽ xuất hiện sau khi hoàn thành hiệu ứng */}
      <div className="next-section">
        <h1>Welcome to the Main Content</h1>
        <p>This content will now scroll up from underneath the sticky hero section.</p>
      </div>
    </>
  );
}
