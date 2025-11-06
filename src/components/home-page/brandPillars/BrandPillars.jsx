import { useEffect, useRef, useState } from "react";
import MetaballBackground from "@components/specialEffect/MetaballBackground/MetaballBackground";
import StarlightEffect from "../universeSection/StarlightEffect";
import "./BrandPillars.css";

const BrandPillars = () => {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Background gradient configuration (same as TestBackground)
  const baseColor = "#660620";

  const horizontalGradient = {
    enabled: true,
    color1: "#660620",
    stop1: "0%",
    opacity1: "80",
    color2: "#000000",
    stop2: "50%",
    opacity2: "80",
    color3: "#660620",
    stop3: "100%",
    opacity3: "80",
  };

  const verticalGradient = {
    enabled: true,
    color1: "#000000",
    stop1: "0%",
    opacity1: "100",
    color2: "#000000",
    stop2: "20%",
    opacity2: "0",
    color3: "#000000",
    stop3: "80%",
    opacity3: "0",
    color4: "#000000",
    stop4: "100%",
    opacity4: "100",
  };

  // Helper to convert hex + opacity to rgba
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  // Build gradient styles
  const buildGradientStyle = () => {
    let layers = [];

    // Add vertical gradient first (on top)
    if (verticalGradient.enabled) {
      const vGrad = `linear-gradient(180deg, ${hexToRgba(
        verticalGradient.color1,
        verticalGradient.opacity1
      )} ${verticalGradient.stop1}, ${hexToRgba(
        verticalGradient.color2,
        verticalGradient.opacity2
      )} ${verticalGradient.stop2}, ${hexToRgba(
        verticalGradient.color3,
        verticalGradient.opacity3
      )} ${verticalGradient.stop3}, ${hexToRgba(
        verticalGradient.color4,
        verticalGradient.opacity4
      )} ${verticalGradient.stop4})`;
      layers.push(vGrad);
    }

    // Add horizontal gradient second (middle)
    if (horizontalGradient.enabled) {
      const hGrad = `linear-gradient(90deg, ${hexToRgba(
        horizontalGradient.color1,
        horizontalGradient.opacity1
      )} ${horizontalGradient.stop1}, ${hexToRgba(
        horizontalGradient.color2,
        horizontalGradient.opacity2
      )} ${horizontalGradient.stop2}, ${hexToRgba(
        horizontalGradient.color3,
        horizontalGradient.opacity3
      )} ${horizontalGradient.stop3})`;
      layers.push(hGrad);
    }

    // Add base color last (bottom)
    layers.push(baseColor);

    return { background: layers.join(", ") };
  };

  const gradientStyle = buildGradientStyle();

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll progress within this section
      const scrollTop = -rect.top;
      const scrollHeight = sectionHeight - windowHeight;
      const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="brand-pillars-wrapper">
      <div className="brand-pillars">
        {/* Mobile/Tablet: Gradient Background */}
        <div
          className="brand-pillars-mobile-background"
          style={gradientStyle}
        />

        {/* Desktop: Metaball Background */}
        <MetaballBackground className="brand-pillars-background" />
        <div className="brand-pillars-gradient-overlay-top" />
        <div className="brand-pillars-gradient-overlay-bottom" />

        {/* Mobile/Tablet Sticky Scroll Overlay */}
        <div className="brand-pillars-sticky-overlay">
          {/* Quote Text - Mobile/Tablet Version */}
          <div className="brand-pillars-quote brand-pillars-quote-mobile">
            <span className="brand-pillars-quote-line bodytext-4--no-margin">
              MIRROR was never made to follow. It was born to uphold its own
              code...
            </span>
          </div>

          <div className="brand-pillars-sticky-content">
            {/* Content 1: PRECISION TECHNOLOGY */}
            <div
              className="brand-pillars-sticky-item"
              style={{
                opacity:
                  scrollProgress <= 0.25
                    ? Math.min(1, scrollProgress * 4)
                    : scrollProgress <= 0.4
                    ? 1
                    : scrollProgress <= 0.5
                    ? 1 - (scrollProgress - 0.4) * 10
                    : 0,
                transform: `translateY(${
                  scrollProgress <= 0.4
                    ? 0
                    : scrollProgress <= 0.5
                    ? -(scrollProgress - 0.4) * 200
                    : -20
                }px)`,
              }}
            >
              <div className="brand-sticky-group">
                <div className="brand-sticky-header-group">
                  <span className="brand-sticky-header bodytext-6--no-margin">
                    SHAPED BY
                  </span>
                  <div className="brand-sticky-lines">
                    <span className="brand-sticky-line heading-2--no-margin">
                      Precision
                    </span>
                    <span className="brand-sticky-line heading-2--no-margin">
                      technology
                    </span>
                  </div>
                </div>
                <div className="starlight-6-oclock-wrapper">
                  <StarlightEffect direction="falling" height={60} />
                </div>
                <div className="brand-sticky-expand">
                  <p className="bodytext-4--no-margin">
                    Where human craft meets cutting-edge technology. We shape
                    diamonds with the world’s most advanced cutting techniques -
                    each one a fusion of human artistry and scientific
                    precision.
                  </p>
                </div>
              </div>
            </div>

            {/* Content 2: SUSTAINABILITY */}
            <div
              className="brand-pillars-sticky-item"
              style={{
                opacity:
                  scrollProgress <= 0.45
                    ? 0
                    : scrollProgress <= 0.7
                    ? Math.min(1, (scrollProgress - 0.45) * 4)
                    : scrollProgress <= 0.85
                    ? 1
                    : scrollProgress <= 0.95
                    ? 1 - (scrollProgress - 0.85) * 10
                    : 0,
                transform: `translateY(${
                  scrollProgress <= 0.85
                    ? 0
                    : scrollProgress <= 0.95
                    ? -(scrollProgress - 0.85) * 200
                    : -20
                }px)`,
              }}
            >
              <div className="brand-sticky-group">
                <div className="brand-sticky-header-group">
                  <span className="brand-sticky-header bodytext-6--no-margin">
                    POWERED BY
                  </span>
                  <span className="brand-sticky-line heading-2--no-margin">
                    Sustainability
                  </span>
                </div>
                <div className="starlight-6-oclock-wrapper">
                  <StarlightEffect direction="falling" height={60} />
                </div>
                <div className="brand-sticky-expand">
                  <p className="bodytext-4--no-margin">
                    Made for the planet, not taken from it. We create with the
                    future in mind - lab-grown brilliance that honors our
                    planet, not extracts from it.
                  </p>
                </div>
              </div>
            </div>

            {/* Content 3: REDEFINING LUXURY */}
            <div
              className="brand-pillars-sticky-item"
              style={{
                opacity:
                  scrollProgress <= 0.9
                    ? 0
                    : Math.min(1, (scrollProgress - 0.9) * 10),
                transform: `translateY(${scrollProgress <= 0.9 ? 20 : 0}px)`,
              }}
            >
              <div className="brand-sticky-group">
                <div className="brand-sticky-header-group">
                  <span className="brand-sticky-header bodytext-6--no-margin">
                    DEVOTED TO
                  </span>
                  <div className="brand-sticky-lines">
                    <span className="brand-sticky-line heading-2--no-margin">
                      Redefining
                    </span>
                    <span className="brand-sticky-line heading-2--no-margin">
                      luxury
                    </span>
                  </div>
                </div>
                <div className="brand-sticky-expand">
                  <p className="bodytext-4--no-margin">
                    Not defined by excess, but by meaning.You're not just buying
                    a product - you're entering a space of mindful beauty,
                    crafted to awaken your senses and reflect your story.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-pillars-content">
          {/* Quote Text - Above Brand Pillars */}
          <div className="brand-pillars-quote">
            <span className="brand-pillars-quote-line bodytext-4--no-margin">
              MIRROR was never made to follow. It was born to uphold its own
              code...
            </span>
          </div>

          <h1 className="brand-pillars-text">
            <div className="brand-group">
              <div className="brand-main-text">
                <span className="brand-line">PRECISION</span>
                <div className="brand-line-with-expand">
                  <span className="brand-line">TECHNOLOGY</span>
                  <div className="starlight-6-oclock-wrapper">
                    <StarlightEffect direction="falling" height={60} />
                  </div>
                  <div className="brand-expand-text">
                    <p className="bodytext-6--no-margin">
                      Where human craft meets cutting-edge technology.
                      <br />
                      We shape diamonds with the world's most advanced
                      <br />
                      cutting techniques - each one a fusion of human
                      <br />
                      artistry and scientific precision.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="brand-group">
              <div className="starlight-6-oclock-wrapper">
                <StarlightEffect direction="falling" height={60} />
              </div>
              <div className="brand-expand-text">
                <p className="bodytext-6--no-margin">
                  Made for the planet, not taken from it.
                  <br />
                  We create with the future in mind -
                  <br /> lab-grown brilliance that honors our
                  <br />
                  planet, not extracts from it.
                </p>
              </div>
              <div className="brand-main-text">
                <span className="brand-line">SUSTAINABILITY</span>
              </div>
            </div>
            <div className="brand-group">
              <div className="brand-main-text">
                <div className="brand-line-with-expand">
                  <span className="brand-line">REDEFINING</span>
                  <div className="starlight-6-oclock-wrapper">
                    <StarlightEffect direction="falling" height={60} />
                  </div>
                  <div className="brand-expand-text">
                    <p className="bodytext-6--no-margin">
                      True modern luxury is not in price tags.
                      <br />
                      You're not just buying a product - you're entering
                      <br /> a space of mindful beauty, crafted to awaken
                      <br />
                      your senses and reflect your story.
                    </p>
                  </div>
                </div>
                <span className="brand-line">LUXURY</span>
              </div>
            </div>
          </h1>
        </div>
      </div>
    </section>
  );
};

export default BrandPillars;
