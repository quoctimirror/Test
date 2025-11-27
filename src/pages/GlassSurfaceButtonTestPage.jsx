import GlassSurfaceButton from "@components/common/button/GlassSurfaceButton";
import GlassScrollDownArrow from "@components/common/button/GlassScrollDownArrow";
import "./GlassSurfaceButtonTestPage.css";

export default function GlassSurfaceButtonTestPage() {
  return (
    <div className="glass-button-test-page">
      {/* Colorful animated background */}
      <div className="colorful-bg">
        <div className="bg-shape bg-shape--1"></div>
        <div className="bg-shape bg-shape--2"></div>
        <div className="bg-shape bg-shape--3"></div>
        <div className="bg-shape bg-shape--4"></div>
        <div className="bg-shape bg-shape--5"></div>
        <div className="bg-shape bg-shape--6"></div>
        <div className="bg-shape bg-shape--7"></div>
        <div className="bg-shape bg-shape--8"></div>
      </div>

      {/* Image grid background */}
      <div className="image-grid">
        <img src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400" alt="" />
        <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400" alt="" />
        <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400" alt="" />
        <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400" alt="" />
        <img src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400" alt="" />
        <img src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400" alt="" />
        <img src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400" alt="" />
        <img src="https://images.unsplash.com/photo-1609042169012-4a2c9ed0c272?w=400" alt="" />
        <img src="https://images.unsplash.com/photo-1551122087-f99a4f99c60c?w=400" alt="" />
      </div>

      {/* Fixed center components */}
      <div className="fixed-button-container">
        <GlassSurfaceButton
          width={280}
          height={65}
          borderRadius={32}
          distortionScale={-200}
          redOffset={5}
          greenOffset={15}
          blueOffset={25}
          displace={2}
          brightness={55}
        >
          Explore Collection
        </GlassSurfaceButton>

        <GlassScrollDownArrow
          size={54}
          distortionScale={-200}
          redOffset={5}
          greenOffset={15}
          blueOffset={25}
          displace={2}
          brightness={55}
          theme="white"
          onClick={() => window.scrollBy({ top: 300, behavior: 'smooth' })}
        />
      </div>
    </div>
  );
}
