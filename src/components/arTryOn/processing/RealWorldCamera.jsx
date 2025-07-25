// src/components/jsx/RealWorldCamera.jsx
import React, { useEffect, forwardRef } from 'react';
import '../css/RealWorldCamera.css';

// Sử dụng forwardRef để component có thể nhận một ref từ cha và gán nó cho thẻ video
const RealWorldCamera = forwardRef(({ onVideoLoaded, onCameraError }, ref) => {

    useEffect(() => {
        const enableWebcam = async () => {
            if (!ref) return; // Nếu không có ref được truyền vào, không làm gì cả

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (ref.current) {
                    ref.current.srcObject = stream;
                    // Gắn một event listener để báo cho component cha khi video đã tải xong metadata
                    ref.current.addEventListener('loadeddata', () => {
                        // Gọi callback onVideoLoaded nếu nó được truyền vào
                        if (onVideoLoaded) {
                            onVideoLoaded();
                        }
                    });
                }
            } catch (err) {
                console.error("Lỗi khi truy cập camera:", err);
                // Gọi callback onCameraError nếu có lỗi
                if (onCameraError) {
                    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                        onCameraError("Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt và tải lại trang.");
                    } else {
                        onCameraError("Đã xảy ra lỗi khi cố gắng truy cập camera.");
                    }
                }
            }
        };

        enableWebcam();

        // Hàm dọn dẹp
        return () => {
            if (ref.current && ref.current.srcObject) {
                ref.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [ref, onVideoLoaded, onCameraError]);

    // Component này chỉ render thẻ video.
    // Các thông báo lỗi/loading sẽ do component cha quản lý.
    return (
        // Gán `ref` được chuyển tiếp từ cha vào thẻ video này
        <video ref={ref} className="real-world-camera-video" autoPlay playsInline muted />
    );
});

export default RealWorldCamera;



