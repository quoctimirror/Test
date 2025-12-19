import { useMemo } from "react";
import { PRODUCT_CONFIG } from "./productConfig";
import "./ProductsLeft.css";

const ProductsLeftDrive = ({ modelId }) => {
  // Get modelId from prop or use default
  const currentModelId = modelId || PRODUCT_CONFIG.defaultModelId;

  // Build iframe URL with all parameters for correct material rendering
  const iframeUrl = useMemo(() => {
    const baseUrl = 'https://drive.ijewel3d.com/drive/files';
    const params = new URLSearchParams({
      slug: currentModelId,
      isAutoplay: 'true',
      isRemoveHologram: 'true',
      isRemoveLogo: 'true',
      isRemoveLogoLink: 'true',
      isConfigurator: 'false',
      isEnabledZoom: 'true',
      isShare: 'false',
      isResetView: 'false',
      isRotateCamera: 'true',
      isPlayCameraViews: 'false',
      isPlayAnimations: 'false',
      isFullScreen: 'false'
    });

    return `${baseUrl}/${currentModelId}/embedded?${params.toString()}`;
  }, [currentModelId]);

  return (
    <div id="pv2-viewer-root" style={{ width: '100%', height: '100%' }}>
      <iframe
        title="iJewel 3D Viewer"
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        frameBorder="0"
        allow="camera; autoplay; fullscreen; xr-spatial-tracking; web-share"
        allowFullScreen
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
      />
    </div>
  );
};

export default ProductsLeftDrive;