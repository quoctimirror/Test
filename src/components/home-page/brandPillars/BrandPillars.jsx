import { useEffect, useRef, useState } from "react";
import MetaballBackground from "@components/specialEffect/MetaballBackground/MetaballBackground";
import StarlightEffect from "../universeSection/StarlightEffect";
import "./BrandPillars.css";

const BrandPillars = () => {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

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
        <MetaballBackground className="brand-pillars-background" />
        <div className="brand-pillars-gradient-overlay-top" />
        <div className="brand-pillars-gradient-overlay-bottom" />

        {/* Mobile/Tablet Sticky Scroll Overlay */}
        <div className="brand-pillars-sticky-overlay">
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
                    diamonds with the world’s most advanced cutting techniques —
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
                    future in mind — lab-grown brilliance that honors our
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
                <div className="starlight-6-oclock-wrapper">
                  <StarlightEffect direction="falling" height={60} />
                </div>
                <div className="brand-sticky-expand">
                  <p className="bodytext-4--no-margin">
                    Not defined by excess, but by meaning.You’re not just buying
                    a product — you’re entering a space of mindful beauty,
                    crafted to awaken your senses and reflect your story.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-pillars-content">
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
                    <p className="bodytext-4--no-margin">
                      Where human craft meets cutting-edge technology.
                      <br />
                      We shape diamonds with the world's most advanced
                      <br />
                      cutting techniques — each one a fusion of human
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
                <p className="bodytext-4--no-margin">
                  Made for the planet, not taken from it.
                  <br />
                  We create with the future in mind —
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
                    <p className="bodytext-4--no-margin">
                      True modern luxury is not in price tags.
                      <br />
                      You're not just buying a product — you're entering
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
