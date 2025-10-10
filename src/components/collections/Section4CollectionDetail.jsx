import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import { collectionsAPI } from "@services/api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Section4CollectionDetail.css";
import { ROUTES } from "@/constants/routes";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Section4CollectionDetail = ({
  collectionId,
  showViewProductButton = false,
}) => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to convert slug back to name for API lookup
  const slugToName = (slug) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Fetch products from collection
  useEffect(() => {
    // Add abort controller to prevent duplicate requests
    const abortController = new AbortController();

    if (!collectionId) {
      setLoading(false);
      setProducts(getDefaultProducts());
      return;
    }

    const fetchCollectionProducts = async () => {
      try {
        setLoading(true);

        // First, get all collections to find the one matching our slug
        const collectionsResponse = await collectionsAPI.getAll();
        const collections =
          collectionsResponse.data.data || collectionsResponse.data || [];

        // Convert slug back to name and find matching collection
        const collectionName = slugToName(collectionId);
        // Try multiple matching strategies
        const matchingCollection = collections.find((col) => {
          const matches =
            col.slug === collectionId || // Direct slug match
            col.name === collectionId || // Direct name match (for case where name IS the slug)
            col.name.toLowerCase() === collectionId.toLowerCase() || // Case-insensitive match
            col.name.toLowerCase() === collectionName.toLowerCase() ||
            col.name.toLowerCase() ===
              collectionId.replace(/-/g, " ").toLowerCase() ||
            col.name.toLowerCase().replace(/\s+/g, "-") === collectionId; // Name to slug

          return matches;
        });

        if (matchingCollection) {
          // Try different API endpoints
          let collectionProducts = [];

          try {
            // Try getWithProducts first (gets collection with its products)
            const withProductsResponse = await collectionsAPI.getWithProducts(
              matchingCollection.id
            );
            // The response structure is: data.products where each item has a 'product' object
            const collectionData = withProductsResponse.data;
            // Check different possible structures
            if (
              collectionData?.products &&
              Array.isArray(collectionData.products)
            ) {
              if (collectionData.products.length > 0) {
                // Check if each item has a 'product' property
                if (collectionData.products[0].product) {
                  collectionProducts = collectionData.products
                    .map((cp) => cp.product)
                    .filter((p) => p);
                } else {
                  collectionProducts = collectionData.products;
                }
              }
            } else if (Array.isArray(collectionData)) {
              // Maybe the response is directly an array
              collectionProducts = collectionData;
            } else {
              // Fallback structure if different
              collectionProducts = withProductsResponse.data?.products || [];
            }
          } catch (err1) {
            try {
              // Fallback to getProductsInCollection
              const productsResponse =
                await collectionsAPI.getProductsInCollection(
                  matchingCollection.id
                );
              collectionProducts =
                productsResponse.data?.data || productsResponse.data || [];
            } catch (err2) {}
          }

          // Check if request was aborted
          if (abortController.signal.aborted) {
            return;
          }

          // Check if we have products
          if (!collectionProducts || collectionProducts.length === 0) {
            setProducts(getDefaultProducts());
            return;
          }

          // Map products to the format needed for display
          const formattedProducts = collectionProducts.map((product) => {
            // Use imageUrl as primary field (matching admin dashboard)
            const imageUrl =
              product.imageUrl ||
              product.image ||
              (product.images && product.images.length > 0
                ? product.images[0]
                : null) ||
              product.mainImage ||
              product.primaryImage ||
              product.thumbnail ||
              product.featuredImage ||
              "/collections/collectionDetail/collectionDetail_more.png";

            return {
              id: product.id,
              name:
                product.name ||
                product.title ||
                product.productName ||
                "Product",
              image: imageUrl,
            };
          });

          setProducts(formattedProducts);
        } else {
          setProducts(getDefaultProducts());
        }

        setError(null);
      } catch (err) {
        // Check if error is due to abort
        if (err.name === "AbortError") {
          return;
        }
        setError("Failed to load products");
        // Use default products as fallback
        setProducts(getDefaultProducts());
      } finally {
        // Only set loading to false if not aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCollectionProducts();

    // Cleanup function to abort request if component unmounts or effect reruns
    return () => {
      abortController.abort();
    };
  }, [collectionId]);

  // Default products for fallback
  const getDefaultProducts = () => {
    return Array(8)
      .fill(null)
      .map((_, index) => ({
        id: index + 1,
        name: "Lumina",
        image: "/collections/collectionDetail/collectionDetail_more.png",
      }));
  };

  useEffect(() => {
    // Wait for DOM to be ready
    const initScrollTrigger = () => {
      if (!scrollContainerRef.current || !sectionRef.current) return;

      // Kill any existing ScrollTriggers for this component
      ScrollTrigger.getAll()
        .filter((trigger) => trigger.trigger === sectionRef.current)
        .forEach((trigger) => trigger.kill());

      // Get all product cards
      const cards = scrollContainerRef.current.querySelectorAll(
        ".collection-detail-product-card"
      );
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
            start: "top top", // Start when section reaches center
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
        ScrollTrigger.getAll()
          .filter((trigger) => trigger.trigger === sectionRef.current)
          .forEach((trigger) => trigger.kill());
      };
    };

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initScrollTrigger, 100);

    // Listen for page transition complete event to reinitialize
    const handleTransitionComplete = () => {
      setTimeout(initScrollTrigger, 200);
    };
    window.addEventListener("pageTransitionComplete", handleTransitionComplete);

    return () => {
      clearTimeout(timer);
      window.removeEventListener(
        "pageTransitionComplete",
        handleTransitionComplete
      );
      ScrollTrigger.getAll()
        .filter((trigger) => trigger.trigger === sectionRef.current)
        .forEach((trigger) => trigger.kill());
    };
  }, [products, loading]); // Depend on products and loading state

  // Refresh ScrollTrigger when products change
  useEffect(() => {
    if (!loading && products.length > 0) {
      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);

      return () => clearTimeout(refreshTimer);
    }
  }, [products, loading]);

  const handleViewAllProducts = async () => {
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.ALL_GEMS);
  };

  return (
    <>
      <section className="collection-detail-section-gsap" ref={sectionRef}>
        <div className="collection-detail-container" ref={containerRef}>
          <div className="collection-detail-header">
            <h2 className="section4-collection-title heading-1--no-margin">
              EXPLORE THIS COLLECTION GEMS
            </h2>
          </div>

          <div className="horizontal-scroll-wrapper">
            <div
              className="collection-detail-grid-gsap"
              ref={scrollContainerRef}
            >
              {loading ? (
                // Show loading state
                Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={`loading-${index}`}
                      className="collection-detail-product-card"
                    >
                      <div className="collection-detail-product-image-loading">
                        Loading...
                      </div>
                    </div>
                  ))
              ) : products.length > 0 ? (
                // Show products from API
                products.map((product) => (
                  <div
                    key={product.id}
                    className="collection-detail-product-card"
                  >
                    <img
                      src={product.image}
                      alt={`${product.name}`}
                      className="collection-detail-product-image"
                      draggable={false}
                      onError={(e) => {
                        // Fallback image if API image fails to load
                        e.target.src =
                          "/collections/collectionDetail/collectionDetail_more.png";
                      }}
                    />
                  </div>
                ))
              ) : (
                // Show message when no products found
                <div className="collection-detail-no-products-message">
                  No products found in this collection
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showViewProductButton && (
        <div className="collection-detail-button-container">
          <ShineGlassButton
            theme="light"
            onClick={handleViewAllProducts}
          >
            View all products
          </ShineGlassButton>
        </div>
      )}
    </>
  );
};

export default Section4CollectionDetail;
