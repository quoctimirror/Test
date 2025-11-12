import "./Lumex91.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import ShinyText from "@components/common/shiny-text/ShinyText";
import { MediaImage, MediaVideo } from "@components/common/media";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNewsDetailRoute } from "@/constants/routes";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";

const Lumex91 = () => {
  const [videoError, setVideoError] = useState(false);
  const navigate = useNavigate();

  const handleExploreClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      getNewsDetailRoute("milan")
    );
  };

  return (
    <section className="lumex91">
      <div className="lumex91-container">
        <div className="lumex91-video-box">
          {videoError ? (
            <MediaImage
              className="lumex91-video"
              src="home-page/Mirror-Lumex 91.jpg"
              alt="Mirror-Lumex 91"
            />
          ) : (
            <MediaVideo
              className="lumex91-video"
              src="home-page/MIRROR-LUMEX 91.mp4"
              poster="home-page/Mirror-Lumex 91.jpg"
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
            />
          )}
        </div>

        <div className="lumex91-content">
          <h1 className="heading-1--no-margin">
            <ShinyText text="Mirror-Lumex 91™" speed={2} />
          </h1>
          <ShineGlassButton theme="footer" onClick={handleExploreClick}>
            Explore more
          </ShineGlassButton>
        </div>
      </div>
    </section>
  );
};

export default Lumex91;
