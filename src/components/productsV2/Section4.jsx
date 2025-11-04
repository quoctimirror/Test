import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import { ROUTES } from "@/constants/routes";
import "./Section4.css";

const Section4 = () => {
  const navigate = useNavigate();

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

  const handleViewAllProducts = async () => {
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.ALL_GEMS);
  };

  return (
    <>
      <section className="pv2-section4-container">
        <div className="pv2-section4-wrapper">
          <div className="pv2-section4-header">
            <h2 className="pv2-section4-title heading-1--no-margin">
              YOU MAY ALSO LIKE
            </h2>
            <p className="pv2-section4-description bodytext-4--no-margin">
              Mirror's curation of visionary designs - where each piece embodies
              the essence of future luxury. From bold signatures to refined
              silhouettes, these are reimagined for a new era.
            </p>
          </div>

          <div className="pv2-section4-scroll-wrapper">
            <div className="pv2-section4-grid">
              {products.map((product) => (
                <div key={product.id} className="pv2-section4-product-card">
                  <img
                    src={product.image}
                    alt={`${product.name} Ring`}
                    className="pv2-section4-product-image"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="pv2-section4-button-container">
        <ShineGlassButton theme="light" onClick={handleViewAllProducts}>
          View all products
        </ShineGlassButton>
      </div>
    </>
  );
};

export default Section4;
