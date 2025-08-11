import { useRef, useState } from "react";
import "./Section4CollectionDetail.css";

const Section4CollectionDetail = ({ showViewProductButton = false }) => {
  const collections = [
    {
      id: 1,
      name: "Lumina",
      image: "/collections/collectionDetail/collectionDetail_more.png",
    },
    {
      id: 2,
      name: "Lumina",
      image: "/collections/collectionDetail/collectionDetail_more.png",
    },
    {
      id: 3,
      name: "Lumina",
      image: "/collections/collectionDetail/collectionDetail_more.png",
    },
    {
      id: 4,
      name: "Lumina",
      image: "/collections/collectionDetail/collectionDetail_more.png",
    },
    {
      id: 5,
      name: "Lumina",
      image: "/collections/collectionDetail/collectionDetail_more.png",
    },
    {
      id: 6,
      name: "Lumina",
      image: "/collections/collectionDetail/collectionDetail_more.png",
    },
    {
      id: 7,
      name: "Lumina",
      image: "/collections/collectionDetail/collectionDetail_more.png",
    },
    {
      id: 8,
      name: "Lumina",
      image: "/collections/collectionDetail/collectionDetail_more.png",
    },
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
    <section className="collection-section-4-detail">
      <div className="same-collection-container">
        <div className="same-collection-header">
          <h2 className="same-collection-title heading-1">
            EXPLORE THIS COLLECTION GEMS
          </h2>
        </div>

        <div
          className="same-collection-grid"
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {collections.map((collection) => (
            <div key={collection.id} className="product-card">
              <img
                src={collection.image}
                alt={`${collection.name} Ring`}
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
                width="189"
                height="57"
                viewBox="0 0 189 57"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="188"
                  height="56"
                  rx="28"
                  fill="rgba(0, 0, 0, 0.1)"
                  stroke="rgba(0, 0, 0, 0.5)"
                  className="button-background"
                />
                <text
                  x="94.5"
                  y="34"
                  textAnchor="middle"
                  fill="rgba(0, 0, 0, 0.75)"
                  className="button-text bodytext-4"
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

export default Section4CollectionDetail;
