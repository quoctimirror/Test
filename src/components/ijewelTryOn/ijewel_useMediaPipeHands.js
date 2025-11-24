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
  const prevHandRef = useRef(-1); // Track previous hand to prevent unnecessary state updates

  useEffect(() => {
    if (!isARRunning || !window.Hands) return;

    const initMediaPipe = async () => {
      try {
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
            const handLabel = results.multiHandedness[0].label;
            const handIndex = handLabel === 'Left' ? 0 : 1;

            // Only update state if hand actually changed
            if (handIndex !== prevHandRef.current) {
              setDetectedHand(handIndex);
              prevHandRef.current = handIndex;
            }
          } else {
            // No hand detected
            if (prevHandRef.current !== -1) {
              setDetectedHand(-1);
              prevHandRef.current = -1;
            }
          }
        });

        handsRef.current = hands;
        await hands.initialize();

        setIsInitialized(true);

        // Bắt đầu detect từ canvas
        const detect = async () => {
          if (!canvasRef.current || !handsRef.current || !isARRunning) return;

          try {
            // Gửi canvas frame tới MediaPipe
            await handsRef.current.send({ image: canvasRef.current });
          } catch (err) {
            console.error('MediaPipe detect error:', err);
          }

          rafIdRef.current = requestAnimationFrame(detect);
        };

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
