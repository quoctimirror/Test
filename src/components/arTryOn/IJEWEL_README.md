# iJewel AR TryOn - Hướng dẫn Setup và Sử dụng

## 📋 Tổng quan

Component `IJewelTryOn` sử dụng iJewel3D SDK để tạo trải nghiệm AR thử nhẫn theo tài liệu chính thức từ https://docs.ijewel3d.com/tryon/demo.html

## 📦 Dependencies

### SDK đã được include trong `index.html`:

```html
<!-- WebGi Runtime Bundle -->
<script src="https://releases.ijewel3d.com/webgi/runtime/bundle-0.15.0.js"></script>

<!-- Quan trọng: Set window.webgi -->
<script>window.webgi = window;</script>

<!-- Web VTO Module -->
<script src="https://releases.ijewel3d.com/libs/web-vto/0.0.36/web-vto.js"></script>
```

**Lưu ý**: Dòng `window.webgi = window;` là BẮT BUỘC để VTO plugin hoạt động!

## 📁 Files đã tạo

1. **Component**: `src/components/arTryOn/IJewelTryOn.jsx`
2. **CSS**: `src/components/arTryOn/IJewelTryOn.css`
3. **Route**: Đã thêm vào `src/routes/AppRoutes.jsx`

## 🚀 Cách sử dụng

### 1. Truy cập URL

Component tự động load models từ iJewel Drive dựa trên shapeConfig.

**Mặc định (Fiston):**
```
http://localhost:5173/ar/ijewel
```

**Với shape cụ thể:**
```
http://localhost:5173/ar/ijewel/Fiston
http://localhost:5173/ar/ijewel/Round
http://localhost:5173/ar/ijewel/Pear
http://localhost:5173/ar/ijewel/Emerald
```

Các shapes được định nghĩa trong `src/components/productsV2/shapeConfig.js`

### 2. License Keys

**QUAN TRỌNG**: Bạn cần cập nhật license keys trong file `IJewelTryOn.jsx`:

```javascript
// Dòng ~60-61 trong IJewelTryOn.jsx
diamondPlugin.setKey('YOUR_IJEWEL_LICENSE_KEY');  // Thay bằng key thật
tryon.setKey('YOUR_TRYON_LICENSE_KEY');            // Thay bằng key thật
```

### 3. Model Configuration

**Models được tự động load từ iJewel Drive!**

Component sử dụng `shapeConfig.js` để map shapes với model IDs:

```javascript
// src/components/productsV2/shapeConfig.js
export const SHAPE_CONFIGS = {
  Fiston: {
    shape: 'Fiston',
    modelId: 'MFGQrBe1RpiawHlEpH3fJQ',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Round: {
    shape: 'Round',
    modelId: 'U1Jy-K8MR4-qUOC_YIWkWQ',
    metal: 'Platinum',
    band: 'Double band'
  },
  // ... và các shapes khác
};
```

Component tự động:
1. Lấy modelId từ shapeConfig
2. Tạo URL: `https://releases.ijewel3d.com/drive/drive/{modelId}/model.glb`
3. Load model và JSON config (nếu có)

## 🎮 Các chức năng

1. **Bắt đầu AR**: Mở camera và bật chế độ AR
2. **Đổi Camera**: Chuyển giữa camera trước/sau
3. **Chụp Ảnh**: Lưu screenshot
4. **Dừng AR**: Tắt chế độ AR

## 🛠️ Tạo file JSON cấu hình

### Bước 1: Truy cập Edit Mode

Thêm `?edit` vào URL demo của iJewel:

```
https://releases.ijewel3d.com/demo.html?edit
```

### Bước 2: Upload model

1. Drag & drop file GLB vào trang
2. Mở folder "Ring TryOn"
3. Click nút "enterSetupMode"

### Bước 3: Điều chỉnh

Điều chỉnh các tham số:
- `modelRotation`: Xoay model
- `modelScale`: Kích thước model
- `modelPosition`: Vị trí model

Mục tiêu: Model phải vừa vặn với ngón tay và căn giữa

### Bước 4: Download JSON

Click menu 3 chấm ở góc trên phải → Download file JSON

### Bước 5: Upload lên server

Upload cả 2 files:
- `ring-001.glb` (model)
- `ring-001.glb.json` (cấu hình)

## 📝 Cấu trúc Component

```jsx
IJewelTryOn/
├── useEffect: Khởi tạo WebGi + Plugins
├── handleStartAR: Bật AR mode
├── handleStopAR: Tắt AR mode
├── handleFlipCamera: Đổi camera
└── handleSaveImage: Chụp ảnh
```

## 🎨 Customization

### Thay đổi header text

Trong `IJewelTryOn.jsx`:

```jsx
<div id="header-text" className="header-text">
  Tên app của bạn  {/* Thay đổi ở đây */}
</div>
```

### Thay đổi màu buttons

Trong `IJewelTryOn.css`, tìm các class:
- `.start-ar-btn`: Nút bắt đầu AR
- `.flip-camera-btn`: Nút đổi camera
- `.save-image-btn`: Nút chụp ảnh
- `.stop-ar-btn`: Nút dừng AR

## ⚠️ Lưu ý quan trọng

### 1. Canvas sizing

Theo tài liệu iJewel, **KHÔNG ĐƯỢC** thay đổi kích thước canvas trực tiếp:

```css
/* ĐÚNG - Thay đổi container */
.canvas-container {
  width: 100%;
  height: 100%;
}

/* SAI - Không thay đổi canvas */
.webgi-canvas {
  width: 500px; /* ❌ Không làm thế này */
}
```

### 2. Camera permissions

AR mode **KHÔNG THỂ** tự động bật khi load trang. Phải có user interaction (click button) để xin quyền camera.

### 3. Mobile debugging

Có thể thêm Eruda console để debug trên mobile. Thêm vào `index.html`:

```html
<script>
;(function () {
  var src = '//cdn.jsdelivr.net/npm/eruda';
  if (!/debug/.test(window.location) && localStorage.getItem('active-eruda') != 'true') return;
  document.write('<scr' + 'ipt src="' + src + '"></scr' + 'ipt>');
  document.write('<scr' + 'ipt>eruda.init();</scr' + 'ipt>');
})();
</script>
```

Sau đó truy cập với `?debug` trong URL.

### 4. Tối ưu hóa

Nếu tất cả models có kích thước nhất quán, có thể:
- Dùng chung 1 file JSON cho tất cả
- Hoặc generate settings runtime dựa trên logic

## 🔍 Troubleshooting

### Lỗi: "iJewel SDK chưa được load"

**Nguyên nhân**: Scripts chưa được load trong `index.html`

**Giải pháp**: Kiểm tra xem 3 script tags đã được thêm chưa (WebGi, window.webgi, VTO)

### Lỗi: "TryOn plugin chưa sẵn sàng"

**Nguyên nhân**: License key sai hoặc plugin chưa init xong

**Giải pháp**:
1. Kiểm tra license keys
2. Đợi loading message biến mất trước khi click

### Lỗi: Model không hiện

**Nguyên nhân**: URL model sai hoặc file JSON thiếu

**Giải pháp**:
1. Kiểm tra URL model (mở trực tiếp trên browser)
2. Đảm bảo file JSON cùng tên với GLB + thêm `.json`
3. Check console để xem lỗi network

### AR không bật

**Nguyên nhân**: Camera permissions bị từ chối

**Giải pháp**:
1. Check browser settings → Camera permissions
2. Thử browser khác
3. Trên HTTPS (không phải HTTP)

## 📚 Tài liệu tham khảo

- [iJewel3D TryOn Docs](https://docs.ijewel3d.com/tryon/demo.html)
- [WebGi Documentation](https://releases.ijewel3d.com/)
- [Video Tutorial](https://docs.ijewel3d.com/tryon/demo.html#edit-mode) (trong phần Edit Mode)

## 🧪 Testing checklist

- [ ] License keys đã được cập nhật
- [ ] Model URLs đã được cập nhật
- [ ] File JSON cấu hình đã được tạo và upload
- [ ] Camera permissions được cấp
- [ ] AR mode bật được
- [ ] Đổi camera hoạt động
- [ ] Chụp ảnh hoạt động
- [ ] Model hiển thị đúng vị trí trên ngón tay
- [ ] Test trên mobile device
- [ ] Test trên desktop với webcam

## 🎯 Next steps

1. **Tích hợp với backend**: Load model URLs từ database thay vì hardcode
2. **Tối ưu loading**: Preload models phổ biến
3. **Analytics**: Track usage metrics (AR sessions, photos captured)
4. **Social sharing**: Cho phép share ảnh chụp lên social media
5. **Model gallery**: Tạo UI để user chọn nhiều models khác nhau
