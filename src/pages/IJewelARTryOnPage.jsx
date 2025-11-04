import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import IJewelTryOnAR from '../components/ijewelTryOn';

/**
 * IJewel AR Try-On Page
 *
 * Sử dụng:
 * - URL: /ijewel-ar-tryon?model=heart
 * - URL: /ijewel-ar-tryon?model=oval
 * - URL: /ijewel-ar-tryon (mặc định: oval)
 *
 * Các model hỗ trợ (tên rút gọn):
 * - oval, heart, flower, pear, trilogy, twin, ufo, myfav, fistion, demo
 */
const IJewelARTryOnPage = () => {
  const [searchParams] = useSearchParams();
  const [modelName, setModelName] = useState('oval');

  useEffect(() => {
    // Đọc model từ URL query parameter
    const modelParam = searchParams.get('model');

    if (modelParam) {
      console.log('📌 Model from URL:', modelParam);
      setModelName(modelParam);
    } else {
      console.log('📌 No model specified, using default: oval');
      setModelName('oval');
    }
  }, [searchParams]);

  const handleError = (error) => {
    console.error('AR Try-On Error:', error);
  };

  const handleModelLoad = (model) => {
    console.log('✅ Model loaded:', model);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <IJewelTryOnAR
        modelName={modelName}
        onError={handleError}
        onModelLoad={handleModelLoad}
      />
    </div>
  );
};

export default IJewelARTryOnPage;
