import "./Navbar.css";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoRef = useRef(null);
  const lastColorRef = useRef(null); // Cache màu cuối để tránh flicker

  useEffect(() => {
    const adjustLogoColor = () => {
      if (!logoRef.current) return;

      // 1. Tự động phát hiện màu nền thực tế phía sau
      const logoRect = logoRef.current.getBoundingClientRect();
      const centerX = logoRect.left + logoRect.width / 2;
      const centerY = logoRect.top + logoRect.height / 2;

      // Tạm thời ẩn navbar để "nhìn thấy" phía sau
      const navbar = logoRef.current.closest('.navbar');
      navbar.style.visibility = 'hidden';

      try {
        // Lấy nhiều điểm xung quanh logo (5 điểm)
        const points = [
          { x: centerX, y: centerY },           // Trung tâm
          { x: centerX - 25, y: centerY },      // Trái
          { x: centerX + 25, y: centerY },      // Phải  
          { x: centerX, y: centerY - 12 },      // Trên
          { x: centerX, y: centerY + 12 }       // Dưới
        ];

        const backgroundColors = [];

        // Tìm background color hoặc image của các elements
        points.forEach(point => {
          const element = document.elementFromPoint(point.x, point.y);
          if (element) {
            let currentElement = element;
            while (currentElement && currentElement !== document.documentElement) {
              const styles = window.getComputedStyle(currentElement);
              const bgColor = styles.backgroundColor;
              const bgImage = styles.backgroundImage;

              // Ưu tiên detect background image trước
              if (bgImage && bgImage !== 'none') {
                // Phân tích URL để estimate tone màu đồng bộ
                const imageUrl = bgImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
                console.log(`🖼️ Detected background image: ${imageUrl}`);
                
                if (imageUrl) {
                  if (imageUrl.includes('orient') || imageUrl.includes('dark') || imageUrl.includes('night') || imageUrl.includes('black')) {
                    // GIF orient hoặc các ảnh tối
                    backgroundColors.push('rgb(40, 40, 40)'); // Tối
                    console.log(`🌑 Dark image detected: ${imageUrl}`);
                  } else if (imageUrl.includes('light') || imageUrl.includes('bright') || imageUrl.includes('white') || imageUrl.includes('day')) {
                    backgroundColors.push('rgb(220, 220, 220)'); // Sáng
                    console.log(`☀️ Light image detected: ${imageUrl}`);
                  } else {
                    // Default cho unknown images - giả sử trung bình
                    backgroundColors.push('rgb(80, 80, 80)'); // Hơi tối
                    console.log(`🔍 Unknown image detected: ${imageUrl} - assuming medium-dark`);
                  }
                } else {
                  // Nếu không parse được URL, giả sử tối
                  backgroundColors.push('rgb(60, 60, 60)');
                  console.log(`❓ Could not parse image URL, assuming dark`);
                }
                break;
              }

              if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                backgroundColors.push(bgColor);
                break;
              }

              currentElement = currentElement.parentElement;
            }
          }
        });

        // Khôi phục navbar
        navbar.style.visibility = 'visible';

        // 2. Tính toán màu trung bình từ nhiều điểm để có kết quả chính xác
        let avgR = 0, avgG = 0, avgB = 0;
        let validColors = 0;

        backgroundColors.forEach(color => {
          const rgb = color.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const [r, g, b] = rgb.map(Number);
            avgR += r;
            avgG += g;
            avgB += b;
            validColors++;
          }
        });

        if (validColors > 0) {
          avgR = Math.round(avgR / validColors);
          avgG = Math.round(avgG / validColors);
          avgB = Math.round(avgB / validColors);
        } else {
          // Default: giả sử nền trắng
          avgR = avgG = avgB = 255;
        }

        // Tính luminance để quyết định màu logo
        const luminance = 0.2126 * avgR + 0.7152 * avgG + 0.0722 * avgB;

        console.log(`🎨 Detected background RGB: (${avgR}, ${avgG}, ${avgB})`);
        console.log(`💡 Background luminance: ${luminance.toFixed(1)}`);

        // 4. Calculate optimal contrast color using advanced color theory
        const calculateContrastColor = (bgR, bgG, bgB) => {
          // Convert RGB to HSL for better color manipulation
          const r = bgR / 255;
          const g = bgG / 255;
          const b = bgB / 255;
          
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h, s, l;
          
          l = (max + min) / 2;
          
          if (max === min) {
            h = s = 0; // achromatic
          } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          
          // Calculate complementary color with high contrast
          let contrastH = (h + 0.5) % 1; // Complementary hue
          let contrastS = Math.min(1, s + 0.3); // Increase saturation
          let contrastL = l > 0.5 ? Math.max(0.1, l - 0.7) : Math.min(0.9, l + 0.7); // High contrast lightness
          
          // Convert back to RGB
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          
          let contrastR, contrastG, contrastB;
          
          if (contrastS === 0) {
            contrastR = contrastG = contrastB = contrastL;
          } else {
            const q = contrastL < 0.5 ? 
              contrastL * (1 + contrastS) : 
              contrastL + contrastS - contrastL * contrastS;
            const p = 2 * contrastL - q;
            
            contrastR = hue2rgb(p, q, contrastH + 1/3);
            contrastG = hue2rgb(p, q, contrastH);
            contrastB = hue2rgb(p, q, contrastH - 1/3);
          }
          
          return {
            r: Math.round(contrastR * 255),
            g: Math.round(contrastG * 255),
            b: Math.round(contrastB * 255)
          };
        };
        
        console.log(`🎨 Detected background RGB: (${avgR}, ${avgG}, ${avgB})`);
        console.log(`💡 Background luminance: ${luminance.toFixed(1)}`);

        // 4. Tự động đổi màu với caching để tránh flicker
        const newFilter = luminance > 128 ? 'invert(1)' : 'none';
        
        // Chỉ apply filter nếu khác với lần trước
        if (lastColorRef.current !== newFilter) {
          logoRef.current.style.filter = newFilter;
          lastColorRef.current = newFilter;
          
          if (luminance > 128) {
            console.log('☀️ Light background detected -> Black logo');
          } else {
            console.log('🌙 Dark background detected -> White logo');
          }
        }

      } catch (error) {
        // Try-catch để tránh lỗi
        console.error('❌ Error detecting background:', error);
        navbar.style.visibility = 'visible';
        logoRef.current.style.filter = 'none';
      }

    };

    // Chạy khi load
    adjustLogoColor();

    // 3. Real-time monitoring với requestAnimationFrame
    let isMonitoring = true;
    
    const realTimeColorAdjustment = () => {
      if (isMonitoring) {
        adjustLogoColor();
        requestAnimationFrame(realTimeColorAdjustment);
      }
    };

    // Bắt đầu monitoring real-time
    requestAnimationFrame(realTimeColorAdjustment);

    // Backup với scroll event (throttled)
    let scrollTimer;
    const handleScroll = () => {
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        adjustLogoColor();
        scrollTimer = null;
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', adjustLogoColor, { passive: true });

    return () => {
      isMonitoring = false;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', adjustLogoColor);
      clearTimeout(scrollTimer);
    };
  }, []);

  return (
    <div className="navbar">
      <div className="menu-container">
        <div 
          className="menu-button"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <span className="menu-text">Menu</span>
        </div>
        <div 
          className={`menu-popup ${isMenuOpen ? 'active' : ''}`}
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <div className="menu-groups">
            <ul className="menu-list">
              <li>Products</li>
              <li>Service & Support</li>
              <li>About Mirror</li>
              <li>News</li>
            </ul>
            <ul className="menu-list">
              <li>Location</li>
              <li>Contact us</li>
              <li>Account</li>
            </ul>
          </div>
        </div>
      </div>
      <img 
        ref={logoRef}
        src={MirrorLogo} 
        alt="Mirror Logo" 
        className="navbar-logo"
      />
      <div className="navbar-right">
        <a href="#account" className="account-link">
          Account
        </a>
        <button className="immersive-button">Immersive Showroom</button>
      </div>
    </div>
  );
}
