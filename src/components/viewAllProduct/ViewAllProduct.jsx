import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlassButton from '../common/GlassButton';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ViewAllProduct.css";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ViewAllProduct = ({ showViewProductButton = false }) => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
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

  useEffect(() => {
    // Wait for DOM to be ready
    const initScrollTrigger = () => {
      if (!scrollContainerRef.current) return;
      
      // Get all product cards
      const cards = scrollContainerRef.current.querySelectorAll('.product-card');
      if (cards.length === 0) return;
      
      // Calculate dimensions
      const containerWidth = scrollContainerRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollAmount = containerWidth - viewportWidth;
      
      // Only create horizontal scroll if container is wider than viewport
      if (scrollAmount > 0) {
        // Create the horizontal scroll animation
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 1,
            start: "center center", // Start when section reaches center
            end: () => `+=${scrollAmount * 1.5}`, // Extra scroll distance to see last image fully
            invalidateOnRefresh: true,
          }
        });
        
        // Animate the container moving left
        tl.to(scrollContainerRef.current, {
          x: -scrollAmount,
          ease: "none",
          duration: 1
        });
      }
      
      // Refresh ScrollTrigger on window resize
      const handleResize = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    };
    
    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initScrollTrigger, 100);
    
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleViewAllProducts = () => {
    window.scrollTo(0, 0);
    navigate('/all-gems');
  };

  return (
    <section className="collection-section-4-gsap" ref={sectionRef}>
      <div className="same-collection-container" ref={containerRef}>
        <div className="same-collection-header">
          <h2 className="heading-1 same-collection-title">MORE GEMS</h2>
          <p className="bodytext-4 same-collection-description">
            Mirror's curation of visionary designs - where each piece embodies
            the essence of future
            <br />
            luxury. From bold signatures to refined silhouettes, these are the
            diamonds reimagined for
            <br />a new era.
          </p>
        </div>

        <div className="horizontal-scroll-wrapper">
          <div 
            className="same-collection-grid-gsap"
            ref={scrollContainerRef}
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

        {showViewProductButton && (
          <div className="view-product-button-container">
            <GlassButton 
              width={189} 
              height={57} 
              fontSize={14} 
              theme="light"
              onClick={handleViewAllProducts}
            >
              View all products
            </GlassButton>
          </div>
        )}
      </div>
    </section>
  );
};

export default ViewAllProduct;