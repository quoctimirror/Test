import { useEffect, useRef, lazy, Suspense } from "react";
import Logo from "@assets/images/Logo.svg";
import SoundIcon from "@assets/images/button/sound.svg";
import ArrowButton from "@assets/images/button/arrow-button.svg";

// Lazy load heavy components
const ScrollEffect = lazy(() =>
  import("@components/home-page/scrollEffect/ScrollEffect")
);
const BrandPillars = lazy(() =>
  import("@components/home-page/brandPillars/BrandPillars")
);
const Lumex91 = lazy(() => import("@components/home-page/lumex91/Lumex91"));
const UniverseSection = lazy(() =>
  import("@components/home-page/universeSection/MirrorExp")
);
const FutureDiamond = lazy(() =>
  import("@components/home-page/futureDiamond/FutureDiamond")
);
const IntroSubmit = lazy(() =>
  import("@components/submit/intro-submit/IntroSubmit")
);
const ImmersiveShowroom = lazy(() =>
  import("@components/home-page/immersiveShowroom/ImmersiveShowroom")
);

const ImmersiveShowroomPage = () => {
  const finalGradientRef = useRef(null);
  const elementsToFadeRef = useRef(null);

  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem("scrollToTop") === "true") {
      window.scrollTo(0, 0);
      sessionStorage.removeItem("scrollToTop");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const animationStart = 0;
      const animationEnd = window.innerHeight;

      let progress = 0;
      if (scrollY >= animationStart && scrollY <= animationEnd) {
        progress = (scrollY - animationStart) / (animationEnd - animationStart);
      } else if (scrollY > animationEnd) {
        progress = 1;
      }

      if (finalGradientRef.current) {
        // Calculation MUST go from POSITIVE to NEGATIVE (120 -> -20)
        const wipePosition = 400 - progress * 350;
        finalGradientRef.current.style.setProperty(
          "--wipe-progress",
          `${wipePosition}%`
        );
      }

      if (elementsToFadeRef.current) {
        const fadeProgress = Math.min(1, Math.max(0, (progress - 0.5) * 2));
        elementsToFadeRef.current.style.opacity = 1 - fadeProgress;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* <div className="scroll-container">
        <div className="homepage">
          <div className="gradient-initial">
            <div className="gradient-top"></div>
            <div className="gradient-bottom"></div>
          </div>

          <div className="gradient-final" ref={finalGradientRef}></div>

          <div className="logo-center">
            <img src={Logo} alt="Mirror Logo" className="main-logo" />
          </div>

          <div className="elements-to-fade" ref={elementsToFadeRef}>
            <div className="scroll-down">
              <button>
                <img src={ArrowButton} alt="Arrow Button" />
              </button>
            </div>
            <div className="vetor-button">
              <button>
                <img src={SoundIcon} alt="Sound" />
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* <MirrorIntroduce /> */}

      <Suspense
        fallback={
          <div style={{ minHeight: "100vh", background: "#000" }}>
            Loading...
          </div>
        }
      >
        <ScrollEffect />

        <FutureDiamond />

        <Lumex91 />

        <BrandPillars />

        <UniverseSection />

        <ImmersiveShowroom />

        <IntroSubmit />
      </Suspense>
    </>
  );
};

export default ImmersiveShowroomPage;
