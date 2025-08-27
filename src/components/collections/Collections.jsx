// Thêm 'useState', 'useRef' từ React
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collectionsAPI, handleAPIError } from "../../services/api";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import CollectionHeroSection from "./CollectionHeroSection";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import "./Collections.css";

// Removed hardcoded products - will be loaded from API

function Collection({ collectionId = "treasure-of-the-orient" }) {
  const section2Ref = useRef(null);
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [otherCollections, setOtherCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load collection data from API
  useEffect(() => {
    fetchCollectionData();
  }, [collectionId]);

  const fetchCollectionData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch main collection with products and other collections in parallel
      const [collectionResponse, allCollectionsResponse] = await Promise.all([
        collectionsAPI.getByName(collectionId).catch(() => collectionsAPI.getById(collectionId)),
        collectionsAPI.getAll()
      ]);
      
      const collectionData = collectionResponse.data;
      const allCollectionsData = allCollectionsResponse.data || [];
      
      if (!collectionData) {
        throw new Error('Collection not found');
      }
      
      setCollection(collectionData);
      
      // Load collection products
      if (collectionData.id) {
        try {
          const productsResponse = await collectionsAPI.getWithProducts(collectionData.id);
          setProducts(productsResponse.data?.products || []);
        } catch (productsErr) {
          console.warn('Failed to load collection products:', productsErr);
          setProducts([]);
        }
      }
      
      // Filter out current collection from others list
      const others = allCollectionsData.filter(c => 
        c.id !== collectionData.id && c.status === 'ACTIVE'
      );
      setOtherCollections(others);
      
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to load collection');
      setError(errorInfo.message);
      console.error('Error fetching collection:', errorInfo);
      
      // Fallback data
      setCollection(null);
      setProducts([]);
      setOtherCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // MỚI: Hàm handleNext được đơn giản hóa tối đa
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  // MỚI: Hàm handlePrevious được đơn giản hóa tối đa
  const handlePrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + products.length) % products.length
    );
  };

  const currentProduct = products[currentIndex];

  const handleExploreCollection = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      `/collections/${collectionId}`
    );
  };

  if (loading) {
    return (
      <div className="collection-page">
        <CollectionHeroSection onScrollToSection2={handleScrollToSection2} />
        <div className="section-2" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Loading collection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="collection-page">
        <CollectionHeroSection onScrollToSection2={handleScrollToSection2} />
        <div className="section-2" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>⚠️ {error || 'Collection not found'}</p>
            <button
              onClick={fetchCollectionData}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="collection-page">
      {/* --- SECTION 1 --- */}
      <CollectionHeroSection onScrollToSection2={handleScrollToSection2} />

      {/* --- SECTION 2 --- */}
      <div className="section-2" ref={section2Ref}>
        <div className="collection-hero-content">
          <div className="collection-hero-subtitle">
            {collection.season && collection.year ? 
              `${collection.season.replace('_', ' ')} ${collection.year}` : 
              'THE NEWEST COLLECTION'
            }
          </div>
          <div className="collection-hero-title">
            <div className="text-treasure">{collection.title || collection.name}</div>
          </div>
          <div className="collection-hero-description">
            {collection.description || 
             "Discover our latest jewelry collection featuring exquisite craftsmanship and timeless elegance."}
          </div>
          <ShineGlassButton
            width={221}
            height={57}
            theme="footer"
            onClick={handleExploreCollection}
            className="collection-hero-explore-button"
          >
            Explore this collection
          </ShineGlassButton>
        </div>

        <div className="collection-content-panel full-width">
          <div className="product-slider">
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(255,255,255,0.7)' }}>
                <p>No products available in this collection yet.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Please check back soon for our latest pieces.
                </p>
              </div>
            ) : (
              <>
                <div className="slider-main-row">
                  <button
                    className="slider-arrow"
                    aria-label="Previous Product"
                    onClick={handlePrevious}
                    disabled={products.length <= 1}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M23.75 15L6.25 15M6.25 15L13.75 7.5M6.25 15L13.75 22.5"
                        stroke="#797979"
                        strokeWidth="2"
                        strokeLinecap="square"
                      />
                    </svg>
                  </button>

                  {/* MỚI: Áp dụng class 'slide-effect' và quan trọng nhất là 'key' */}
                  <div
                    className="product-image-container slide-effect"
                    key={currentProduct?.id || 0}
                  >
                    <img
                      src={currentProduct?.imageUrl || currentProduct?.image || "/collections/pendant.png"}
                      alt={currentProduct?.name || "Product"}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = "/collections/pendant.png";
                      }}
                    />
                  </div>

                  <button
                    className="slider-arrow"
                    aria-label="Next Product"
                    onClick={handleNext}
                    disabled={products.length <= 1}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.25 15L23.75 15M23.75 15L16.25 22.5M23.75 15L16.25 7.5"
                        stroke="#797979"
                        strokeWidth="2"
                        strokeLinecap="square"
                      />
                    </svg>
                  </button>
                </div>

                {/* MỚI: Áp dụng tương tự cho phần thông tin sản phẩm */}
                <div
                  className="product-info slide-effect"
                  key={(currentProduct?.id || 0) + "-info"}
                >
                  <h2 className="product-title">{currentProduct?.name || "Product"}</h2>
                  <button className="shop-now-button">
                    <span className="hover-underline">Shop now</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- SECTION 3 --- */}
      <div className="section-3">
        <div className="other-collections-content">
          <div className="other-collections-subtitle">OTHER COLLECTION</div>
          <div className="collection-names">
            {otherCollections.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '2rem' }}>
                <p>No other collections available</p>
              </div>
            ) : (
              otherCollections.slice(0, 8).map((otherCollection) => (
                <div 
                  key={otherCollection.id} 
                  className="collection-name"
                  onClick={() => navigate(`/collections/${otherCollection.name}`)}
                  style={{ cursor: 'pointer' }}
                  title={`View ${otherCollection.title} collection`}
                >
                  {otherCollection.title}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Collection;
