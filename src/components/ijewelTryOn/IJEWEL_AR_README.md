# IJewel AR Try-On Component - Hướng Dẫn Sử Dụng

## 📁 Cấu Trúc Files

```
src/
├── components/
│   └── arTryOn/
│       ├── ijewel_TryOnAR.jsx           # Main React component
│       ├── ijewel_TryOnAR.module.css    # CSS modules
│       ├── ijewel_useARTryOn.js         # Custom hook cho AR logic
│       └── ijewel_useDebugControls.js   # Custom hook cho debug controls
├── pages/
│   └── IJewelARTryOnPage.jsx            # Page component (với URL routing)
├── routes/
│   └── AppRoutes.jsx                    # Route configuration (đã add route)
└── constants/
    └── routes.js                         # Route constants (đã add IJEWEL_AR_TRYON)
```

## 🚀 Cách Chạy

### 1. Start Development Server

```bash
cd /home/quocti/mirror-diamond-website
npm run dev
```

### 2. Truy Cập URL

Mở browser và truy cập:

```
# URL mặc định (model Oval)
http://localhost:5173/ijewel-tryon

# URL với model cụ thể (tên rút gọn)
http://localhost:5173/ijewel-tryon?model=heart
http://localhost:5173/ijewel-tryon?model=flower
http://localhost:5173/ijewel-tryon?model=pear
http://localhost:5173/ijewel-tryon?model=oval
http://localhost:5173/ijewel-tryon?model=trilogy
http://localhost:5173/ijewel-tryon?model=twin
http://localhost:5173/ijewel-tryon?model=ufo
http://localhost:5173/ijewel-tryon?model=myfav
http://localhost:5173/ijewel-tryon?model=fistion
```

## 📱 Test Trên Điện Thoại

1. Lấy IP của máy tính:

```bash
hostname -I
# hoặc
ip addr show | grep "inet "
```

2. Trên điện thoại, truy cập:

```
http://<YOUR_IP>:5173/ijewel-tryon?model=heart
```

**Lưu ý**: Camera chỉ hoạt động trên HTTPS hoặc localhost. Để test trên phone qua IP local, bạn cần:

- Sử dụng ngrok hoặc localtunnel để tạo HTTPS tunnel
- Hoặc config Vite để chạy HTTPS

## 🎮 Các Tính Năng

### 1. Model Selection

- Thay đổi model bằng cách thay query param `?model=<tên>`
- Hỗ trợ tên rút gọn: `heart`, `oval`, `flower`, etc.

### 2. AR Controls (Khi AR đang chạy)

- **TryOn/Stop**: Bật/tắt AR camera
- **Flip Camera**: Chuyển camera trước/sau
- **Switch Finger**: Chuyển ngón tay đeo nhẫn (5 ngón)
- **Save Image**: Chụp ảnh màn hình

### 3. Debug Panel (Góc trên trái)

- Click nút **🔧 Debug** để mở panel
- Điều chỉnh:
  - **Position** (X, Y, Z)
  - **Rotation** (X, Y, Z) - đơn vị độ
  - **Scale** (uniform)
- Export configuration ra JSON
- Copy configuration vào clipboard

## ⚙️ Configuration

### Models Path

Models được load từ:

- GLB files: `/public/models/rings/*.glb`
- JSON configs: `/public/arTryOn/*.json`

### Thêm Model Mới

Mở file `src/components/arTryOn/ijewel_useARTryOn.js` và thêm vào object `modelConfigs`:

```javascript
const modelConfigs = {
  // ... existing models
  your_new_model: {
    glb: "/models/rings/your_new_model.glb",
    json: "/arTryOn/your_new_model_config.json"
  }
};
```

Sau đó có thể truy cập: `/ijewel-tryon?model=your_new_model`

## 🍎 iOS Safari Optimization

Component đã được tối ưu **FULL QUALITY** cho iOS:

- ✅ Canvas scaling: **1.0** (100% resolution - không giảm chất lượng)
- ✅ Camera: **FULL frame rate** (không throttle)
- ✅ MSAA: **Enabled** (anti-aliasing đầy đủ)
- ✅ Memory protection:
  - WebGL context lost handlers
  - Page visibility handlers (auto cleanup khi chuyển tab)
  - Emergency cleanup trước khi page unload

## 🔧 Development Notes

### Component Props

**IJewelTryOnAR Component:**

```jsx
<IJewelTryOnAR
  modelName="heart"                    // Tên model (required)
  onError={(err) => console.error(err)} // Error callback (optional)
  onModelLoad={(model) => console.log(model)} // Model load callback (optional)
/>
```

### Custom Hooks

**useIJewelARTryOn:**

```javascript
const {
  isLoading,        // Boolean: đang loading hay không
  loadingProgress,  // Number: 0-100
  loadingText,      // String: text hiển thị khi loading
  isARRunning,      // Boolean: AR đang chạy hay không
  error,            // String|null: error message
  startAR,          // Function: start AR
  stopAR,           // Function: stop AR
  flipCamera,       // Function: flip camera
  switchFinger,     // Function: switch finger
  saveImage,        // Function: save screenshot
  viewer,           // Object: WebGI viewer instance
  tryon             // Object: Tryon plugin instance
} = useIJewelARTryOn({ canvasRef, modelName, onError, onModelLoad });
```

**useIJewelDebugControls:**

```javascript
const {
  position,         // Object: { x, y, z }
  rotation,         // Object: { x, y, z }
  scale,            // Number
  updatePosition,   // Function(axis, value)
  updateRotation,   // Function(axis, value)
  updateScale,      // Function(value)
  exportConfig,     // Function: export to JSON file
  copyToClipboard   // Function: copy to clipboard
} = useIJewelDebugControls({ tryon, modelName });
```

## 🐛 Troubleshooting

### Camera không hoạt động

- Kiểm tra HTTPS (camera chỉ chạy trên HTTPS hoặc localhost)
- Kiểm tra permission camera trong browser settings
- Thử refresh page

### Model không load

- Kiểm tra đường dẫn GLB và JSON file
- Mở Console để xem error logs
- Kiểm tra network tab xem file có load được không

### Lỗi "ViewerApp is not defined"

- iJewel SDK scripts chưa load xong
- Đợi thêm 1-2 giây rồi refresh page
- Kiểm tra index.html có scripts:

  ```html
  <script src="https://releases.ijewel3d.com/webgi/runtime/bundle-0.15.2.js"></script>
  <script src="https://releases.ijewel3d.com/libs/web-vto/0.0.35/web-vto-instore.js"></script>
  ```

### iOS Safari crash

- Component đã tối ưu FULL QUALITY
- Nếu vẫn crash, kiểm tra:
  - Memory usage trong iOS Settings
  - Đóng các tab/app khác
  - Restart Safari

## 📝 Change Log

### v1.0.0 (Current)

- ✅ React component với hooks architecture
- ✅ URL routing với query params
- ✅ Debug panel với export/import config
- ✅ iOS Safari full quality optimization
- ✅ Progressive loading với progress bar
- ✅ Error handling user-friendly
- ✅ Shine glass button effects
- ✅ Watermark removal

## 🎯 Next Steps

Nếu muốn extend component:

1. **Thêm model selector UI**: Dropdown để chọn model thay vì dùng URL
2. **Save configurations**: Lưu settings vào localStorage
3. **Share feature**: Tạo shareable link với configuration
4. **Analytics**: Track user interactions
5. **A/B testing**: Test different AR configurations

---

**Author**: Claude Code
**Created**: 2025-11-03
**Tech Stack**: React, Vite, iJewel SDK, WebGI
