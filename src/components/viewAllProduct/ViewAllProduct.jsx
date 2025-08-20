import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassButton from "../common/button/GlassButton";
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
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch featured products or available products
      const response = await productsAPI.getFeatured();
      const productsData = response.data || [];
      
      // If no featured products, fallback to available products
      if (productsData.length === 0) {
        const availableResponse = await productsAPI.getAvailable({ paginated: false });
        setProducts(availableResponse.data?.slice(0, 8) || []);
      } else {
        setProducts(productsData.slice(0, 8)); // Limit to 8 products
      }
      
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to load products');
      setError(errorInfo.message);
      console.error('Error fetching products:', errorInfo);
      
      // Fallback to empty array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for products to load and DOM to be ready
    if (!loading && products.length > 0) {
      const initScrollTrigger = () => {
      if (!scrollContainerRef.current) return;

      // Get all product cards
      const cards =
        scrollContainerRef.current.querySelectorAll(".product-card");
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
          },
        });

        // Animate the container moving left
        tl.to(scrollContainerRef.current, {
          x: -scrollAmount,
          ease: "none",
          duration: 1,
        });
      }

      // Refresh ScrollTrigger on window resize
      const handleResize = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    };

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initScrollTrigger, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
    }
  }, [loading, products]);

  const handleViewAllProducts = () => {
    window.scrollTo(0, 0);
    navigate("/all-gems");
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
          {loading ? (
            <div className="loading-products" style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              color: 'white'
            }}>
              <div style={{
                border: '4px solid rgba(255,255,255,0.3)',
                borderTop: '4px solid white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p>Loading our finest jewelry...</p>
            </div>
          ) : error ? (
            <div className="error-products" style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#ff6b6b'
            }}>
              <p>⚠️ {error}</p>
              <button
                onClick={fetchProducts}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  marginTop: '1rem',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products" style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'rgba(255,255,255,0.7)'
            }}>
              <p>No products available at the moment.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Please check back soon for our latest jewelry collections.
              </p>
            </div>
          ) : (
            <div 
              className="same-collection-grid-gsap"
              ref={scrollContainerRef}
            >
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <img
                    src={product.imageUrl || product.image || "/products/more_r.png"}
                    alt={`${product.name} Jewelry`}
                    className="product-image"
                    draggable={false}
                    onError={(e) => {
                      // Fallback to default image if product image fails to load
                      e.target.src = "/products/more_r.png";
                    }}
                  />
                  {product.name && (
                    <div className="product-name" style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      right: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>
                      {product.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
