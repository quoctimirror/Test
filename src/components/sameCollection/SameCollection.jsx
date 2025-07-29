import { useRef, useState } from "react";
import "./same-collection/SameCollection.css";

const SameCollection = () => {
  const products = [
    { id: 1, name: "Lumina", image: "/products/more_r.png" },
    { id: 2, name: "Lumina", image: "/products/more_r.png" },
    { id: 3, name: "Lumina", image: "/products/more_r.png" },
    { id: 4, name: "Lumina", image: "/products/more_r.png" },
    { id: 5, name: "Lumina", image: "/products/more_r.png" },
    { id: 6, name: "Lumina", image: "/products/more_r.png" },
    { id: 7, name: "Lumina", image: "/products/more_r.png" },
    { id: 8, name: "Lumina", image: "/products/more_r.png" }
  ];

  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollBehavior = 'auto';
    scrollRef.current.classList.add('dragging');
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    scrollRef.current.style.scrollBehavior = 'smooth';
    scrollRef.current.classList.remove('dragging');
    
    // Add momentum effect
    const velocity = (scrollRef.current.scrollLeft - scrollLeft) * 0.1;
    scrollRef.current.scrollLeft += velocity;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    scrollRef.current.style.scrollBehavior = 'smooth';
    scrollRef.current.classList.remove('dragging');
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
      </div>
    </section>
  );
};

export default SameCollection;
