import { useRef, useState } from "react";
import "./SameCollection.css";

const SameCollection = ({ showViewProductButton = false }) => {
  const products = [
    { id: 1, name: "Lumina", image: "/products/more_r.png" },
    { id: 2, name: "Lumina", image: "/products/more_r.png" },
    { id: 3, name: "Lumina", image: "/products/more_r.png" },
    { id: 4, name: "Lumina", image: "/products/more_r.png" },
    { id: 5, name: "Lumina", image: "/products/more_r.png" },
    { id: 6, name: "Lumina", image: "/products/more_r.png" },
    { id: 7, name: "Lumina", image: "/products/more_r.png" },
    { id: 8, name: "Lumina", image: "/products/more_r.png" },
  ];

  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTime, setLastTime] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setLastX(e.pageX);
    setLastTime(Date.now());
    scrollRef.current.style.scrollBehavior = "auto";
    scrollRef.current.classList.add("dragging");
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;

    // Track velocity for momentum
    setLastX(e.pageX);
    setLastTime(Date.now());
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);
    scrollRef.current.classList.remove("dragging");

    // Calculate velocity for momentum
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;
    const xDiff = e.pageX - lastX;

    // Only apply momentum if movement was fast enough (within 100ms and significant distance)
    if (timeDiff < 100 && Math.abs(xDiff) > 5) {
      const velocity = xDiff / timeDiff; // pixels per ms
      const momentum = velocity * 80; // reduced to 60 for very gentle effect

      // Apply momentum with smooth animation
      scrollRef.current.style.scrollBehavior = "smooth";
      scrollRef.current.scrollLeft -= momentum;

      // Reset to auto after animation
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.style.scrollBehavior = "auto";
        }
      }, 300);
    }
  };

  const handleMouseLeave = (e) => {
    if (isDragging) {
      setIsDragging(false);
      scrollRef.current.classList.remove("dragging");

      // Apply same momentum logic when mouse leaves during drag
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTime;
      const xDiff = e.pageX - lastX;

      if (timeDiff < 100 && Math.abs(xDiff) > 5) {
        const velocity = xDiff / timeDiff;
        const momentum = velocity * 80;

        scrollRef.current.style.scrollBehavior = "smooth";
        scrollRef.current.scrollLeft -= momentum;

        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.style.scrollBehavior = "auto";
          }
        }, 300);
      }
    }
  };

  return (
    <section className="collection-section-4">
      <div className="same-collection-container">
        <div className="same-collection-header">
          <h2 className="same-collection-title">SAME COLLECTION</h2>
          <p className="same-collection-description">
            Mirror's curation of visionary designs - where each piece embodies
            <br />
            the essence of future luxury. From bold signatures to refined
            <br />
            silhouettes, these are the diamonds reimagined for a new era.
          </p>
        </div>

        <div
          className="same-collection-grid"
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image}
                alt={`${product.name} Ring`}
                className="product-image"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {showViewProductButton && (
          <div className="view-product-button-container">
            <button className="view-product-button">
              <svg
                width="160"
                height="50"
                viewBox="0 0 160 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="button-background"
                  d="M9 1 L151 1 L159 10 L159 41 L151 49 L9 49 L1 40 L1 9 Z"
                  fill="transparent"
                />
                <path
                  className="button-border"
                  d="M9 1 L151 1 L159 10 L159 41 L151 49 L9 49 L1 40 L1 9 Z"
                  stroke="black"
                  fill="none"
                />
                <text
                  className="button-text"
                  x="80"
                  y="30"
                  textAnchor="middle"
                  fill="black"
                  fontSize="14"
                  fontFamily="BT Beau Sans"
                >
                  View all products
                </text>
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SameCollection;
