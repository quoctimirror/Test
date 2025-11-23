import { useState, useEffect, useRef } from 'react';

/**
 * useMediaPipeHands Hook - Phát hiện tay trái/tay phải từ MediaPipe Hands
 *
 * Returns:
 * - detectedHand: -1 (chưa phát hiện), 0 (tay trái), 1 (tay phải)
 * - isInitialized: MediaPipe đã khởi tạo xong chưa
 */
export const useMediaPipeHands = ({ canvasRef, isARRunning }) => {
  const [detectedHand, setDetectedHand] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);
  const handsRef = useRef(null);
  const videoRef = useRef(null);
  const rafIdRef = useRef(null);

  useEffect(() => {
    if (!isARRunning || !window.Hands) return;

    const initMediaPipe = async () => {
      try {
        console.log('🤚 Initializing MediaPipe Hands...');

        // Tạo video element ẩn để capture từ canvas
        const video = document.createElement('video');
        video.style.display = 'none';
        video.autoplay = true;
        video.playsInline = true;
        document.body.appendChild(video);
        videoRef.current = video;

        // Khởi tạo MediaPipe Hands
        const hands = new window.Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1, // Chỉ detect 1 tay
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
          if (results.multiHandedness && results.multiHandedness.length > 0) {
            // MediaPipe trả về label: "Left" hoặc "Right"
            // Note: "Left" là tay trái của người trong ảnh (nhưng nếu dùng camera trước thì bị mirror)
            const handLabel = results.multiHandedness[0].label;

            // Nếu dùng camera trước (selfie mode), cần đảo ngược
            // Giả sử AR Try-On dùng camera sau nên không cần đảo
            const handIndex = handLabel === 'Left' ? 0 : 1;

            setDetectedHand(handIndex);
            console.log('✋ Detected hand:', handLabel, '→', handIndex);
          } else {
            setDetectedHand(-1);
          }
        });

        handsRef.current = hands;
        await hands.initialize();

        setIsInitialized(true);
        console.log('✅ MediaPipe Hands initialized');

        // Bắt đầu detect từ canvas
        const detect = async () => {
          if (!canvasRef.current) {
            console.warn('⚠️ canvasRef.current is NULL - cannot detect');
            return;
          }
          if (!handsRef.current || !isARRunning) return;

          try {
            // Gửi canvas frame tới MediaPipe
            await handsRef.current.send({ image: canvasRef.current });
          } catch (err) {
            console.error('MediaPipe detect error:', err);
          }

          rafIdRef.current = requestAnimationFrame(detect);
        };

        console.log('🎯 Starting hand detection loop...');
        console.log('🎯 canvasRef.current:', canvasRef.current);
        detect();

      } catch (err) {
        console.error('❌ MediaPipe Hands init error:', err);
      }
    };

    initMediaPipe();

    return () => {
      // Cleanup
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
      if (videoRef.current) {
        videoRef.current.remove();
      }
      setDetectedHand(-1);
      setIsInitialized(false);
    };
  }, [isARRunning, canvasRef]);

  return {
    detectedHand,
    isInitialized
  };
};
