# 📁 public/arTryOn - AR Try-On Configuration & Test Files

## 📖 Tổng Quan

Thư mục này chứa các **configuration files** (JSON) và **HTML test files** để test AR Try-On cho nhẫn kim cương sử dụng iJewel SDK.

> ⚠️ **LƯU Ý QUAN TRỌNG**: Đây là thư mục chứa **static files** và **test files**.
>
> **Component React chính thức đã được chuyển sang:** `src/components/ijewelTryOn/`
>
> Nếu bạn đang phát triển feature mới, sử dụng React component ở `src/components/ijewelTryOn/`

---

## 📂 Cấu Trúc Files

```
public/arTryOn/
├── README.md                              # File này - Documentation
│
├── Configuration Files (JSON) - ⚠️ KHÔNG XÓA
│   ├── standard.json                      # Config mặc định (scale: 0.6)
│   ├── refined_mirror_oval_config.json    # Config cho Oval model (scale: 1.6)
│   └── refined_mirror_flower_config.json  # Config cho Flower model
│
└── HTML Test Files
    ├── tryon-configuration.html           # Test file chính với Debug Panel
    ├── ijewel-tryon-test.html            # Test file đơn giản
    └── ijewel_org.html                    # File original từ iJewel
```

---

## 🔧 JSON Configuration Files

> ⚠️ **KHÔNG XÓA CÁC FILE JSON** - Đây là configuration cho từng model nhẫn

### 1. **standard.json** - Configuration Mặc Định

```json
{
  "modelScaleFactor": 0.6,        // Tỷ lệ scale của model (0.6 = 60%)
  "modelRotation": {               // Góc xoay model (đơn vị: độ)
    "x": 0,                        // Xoay theo trục X
    "y": 0,                        // Xoay theo trục Y
    "z": 0,                        // Xoay theo trục Z
    "isVector3": true
  },
  "modelPosition": {               // Vị trí model trong không gian 3D
    "x": 0,                        // Trục X (trái/phải)
    "y": 0,                        // Trục Y (lên/xuống)
    "z": 0,                        // Trục Z (gần/xa camera)
    "isVector3": true
  },
  "occluderScaleFactor": 1,        // Scale của occluder (che tay)
  "type": "RingTryonPlugin"        // Loại plugin
}
```

**Sử dụng cho các models:**

- `refined_mirror_fistion`
- `refined_mirror_heart`
- `refined_mirror_myfav`
- `refined_mirror_pear`
- `refined_mirror_trilogy`
- `refined_mirror_twin`
- `refined_mirror_ufo`

### 2. **refined_mirror_oval_config.json** - Config Riêng Cho Oval

```json
{
  "modelScaleFactor": 1.6,        // Scale lớn hơn (1.6 = 160%)
  // ... các config khác giống standard.json
}
```

**Lý do scale khác:** Model Oval có kích thước nhỏ hơn trong file GLB nên cần scale lớn hơn để hiển thị đúng kích cỡ trên tay.

### 3. **refined_mirror_flower_config.json** - Config Riêng Cho Flower

Config tùy chỉnh cho model Flower (có thể có position/rotation khác).

---

## 🧪 HTML Test Files

### 1. **tryon-configuration.html** - File Test Chính (Khuyến Nghị)

**Mục đích:** Test và điều chỉnh configuration cho từng model

**Features:**

- ✅ AR Try-On với iJewel SDK
- ✅ **Debug Panel** ở góc phải trên:
  - Điều chỉnh Position (X, Y, Z)
  - Điều chỉnh Rotation (X, Y, Z)
  - Điều chỉnh Scale
  - Export configuration ra file JSON
  - Copy configuration vào clipboard
- ✅ Shine Glass Button effects
- ✅ Loading screen với progress bar
- ✅ iOS Safari optimizations (FULL QUALITY)

**Cách sử dụng:**

1. Thay đổi model qua URL parameter `?model=<tên>`:

```
?model=heart     # Load refined_mirror_heart
?model=oval      # Load refined_mirror_oval
?model=flower    # Load refined_mirror_flower
?model=pear      # Load refined_mirror_pear
```

### 2. **ijewel-tryon-test.html** - File Test Đơn Giản

**Mục đích:** Test nhanh AR Try-On không cần debug panel

**Features:**

- ✅ AR Try-On cơ bản
- ✅ Buttons: Flip Camera, Switch Finger, Save Image
- ❌ Không có Debug Panel

**Cách sử dụng:**

```
http://localhost:5173/arTryOn/ijewel-tryon-test.html
```

### 3. **ijewel_org.html** - File Original từ iJewel

**Mục đích:** Reference implementation từ iJewel SDK

**Lưu ý:** File này là bản gốc, nên giữ lại để tham khảo.

---

## 📝 Hướng Dẫn Tạo Configuration Mới

### Khi nào cần tạo config mới?

Khi bạn có **model mới** và model đó:

- Hiển thị quá lớn hoặc quá nhỏ trên tay
- Bị lệch vị trí (không đúng vị trí ngón tay)
- Bị xoay sai hướng

### Các bước tạo config mới

#### Bước 1: Mở tryon-configuration.html với model mới

```bash
# Giả sử model mới tên là "refined_mirror_newmodel"
http://localhost:8000/arTryOn/tryon-configuration.html?model=newmodel
```

#### Bước 2: Bật AR Try-On

1. Click nút **TryOn** ở giữa dưới
2. Cho phép camera access
3. Đưa tay vào camera

#### Bước 3: Mở Debug Panel

1. Click nút **🔧 Debug** ở góc phải trên
2. Debug Panel sẽ hiện ra bên phải

#### Bước 4: Điều Chỉnh Configuration

**Scale (Kích thước):**

- Nếu nhẫn quá nhỏ → Tăng Scale (VD: 0.8, 1.0, 1.5)
- Nếu nhẫn quá to → Giảm Scale (VD: 0.4, 0.5, 0.6)

**Position (Vị trí):**

- **X**: Trái (-) / Phải (+)
- **Y**: Xuống (-) / Lên (+)
- **Z**: Xa (-) / Gần (+)

**Rotation (Xoay):**

- **X**: Xoay theo chiều ngang
- **Y**: Xoay theo chiều dọc
- **Z**: Xoay theo chiều nghiêng

**Tips:**

- Điều chỉnh từ từ, mỗi lần tăng/giảm 0.001 (Position) hoặc 1° (Rotation)
- Quan sát trực tiếp trên tay để thấy thay đổi real-time

#### Bước 5: Export Configuration

1. Khi đã điều chỉnh ổn, click **Export Configuration**
2. File JSON sẽ tự động download về máy
3. Đổi tên file thành: `refined_mirror_<model>_config.json`
4. Copy file vào folder `public/arTryOn/`

#### Bước 6: Update Code

Mở file `src/components/ijewelTryOn/ijewel_useARTryOn.js` và thêm model mới:

```javascript
const modelConfigs = {
  // ... existing models
  refined_mirror_newmodel: {
    glb: "/models/rings/refined_mirror_newmodel.glb",
    json: "/arTryOn/refined_mirror_newmodel_config.json"  // ← Config mới
  }
};
```

#### Bước 7: Test

```bash
npm run dev
# Truy cập: http://localhost:5173/ijewel-tryon?model=newmodel
```

---

## 🔍 Chi Tiết Configuration Parameters

### modelScaleFactor

**Mô tả:** Tỷ lệ scale tổng thể của model

**Giá trị thường dùng:**

- `0.6` - Standard (mặc định cho hầu hết models)
- `1.0` - 100% kích thước gốc
- `1.6` - Cho models nhỏ (như Oval)
- `0.4-0.5` - Cho models to

**Công thức:** `finalSize = originalSize * modelScaleFactor`

### modelPosition

**Mô tả:** Vị trí của model trong không gian 3D

**Đơn vị:** Meters (m) trong không gian 3D

**Giá trị phổ biến:**

- `x: 0` - Giữa ngón tay
- `y: 0` - Ngang đốt ngón tay
- `z: 0` - Sát mặt da

**Điều chỉnh:**

- `x` tăng → Di chuyển sang phải
- `x` giảm → Di chuyển sang trái
- `y` tăng → Di chuyển lên trên
- `y` giảm → Di chuyển xuống dưới
- `z` tăng → Di chuyển ra xa camera
- `z` giảm → Di chuyển vào gần camera

### modelRotation

**Mô tả:** Góc xoay của model

**Đơn vị:** Degrees (độ)

**Giá trị phổ biến:**

- Hầu hết models: `x: 0, y: 0, z: 0`

**Điều chỉnh:**

- `x` rotation → Xoay ngang (như mở nắp hộp)
- `y` rotation → Xoay dọc (như xoay cái chai)
- `z` rotation → Xoay nghiêng (như nghiêng đầu)

### occluderScaleFactor

**Mô tả:** Scale của occluder (phần che tay để model không bị lộ qua tay)

**Giá trị:** Thường để `1` (100%)

**Khi nào thay đổi:**

- Thấy model bị lộ qua tay → Tăng lên `1.1`, `1.2`
- Occluder che quá nhiều → Giảm xuống `0.9`, `0.8`

---

## ⚠️ Troubleshooting

### 1. Model không hiển thị / Canvas đen

**Nguyên nhân:**

- GLB file không tồn tại
- JSON config không đúng format

**Giải pháp:**

- Kiểm tra đường dẫn GLB file trong console log
- Kiểm tra JSON config có đúng format không
- Thử với model khác để xác định lỗi

### 2. Model quá lớn / quá nhỏ

**Giải pháp:**

- Mở Debug Panel
- Điều chỉnh **Scale** lên/xuống
- Export config mới

### 3. Model bị lệch vị trí

**Giải pháp:**

- Mở Debug Panel
- Điều chỉnh **Position X, Y, Z**
- Export config mới

### 4. Camera không hoạt động

**Nguyên nhân:**

- Chưa cho phép camera permission
- Không phải HTTPS (trên production)
- Camera đang được dùng bởi app khác

**Giải pháp:**

- Check Settings → Allow camera
- Đảm bảo đang chạy localhost hoặc HTTPS
- Đóng các app khác đang dùng camera

### 5. iOS Safari crash / "A problem repeatedly occurred"

**Giải pháp:**

- Component mới đã tối ưu FULL QUALITY cho iOS
- Nếu vẫn crash: Đóng các tab khác, restart Safari
- Component tự động giảm memory khi chuyển tab

---

## 🚀 Migration to React Component

### ⚠️ Thông Báo Quan Trọng

Files HTML trong folder này là **legacy test files**.

**Component React chính thức:**

- **Location:** `src/components/ijewelTryOn/`
- **Main File:** `ijewel_TryOnAR.jsx`
- **Route:** `/ijewel-tryon?model=<tên>`

**Ưu điểm React component:**

- ✅ State management tốt hơn
- ✅ Dễ maintain và extend
- ✅ Tích hợp tốt với app routing
- ✅ TypeScript ready
- ✅ Hot reload khi dev

**Khi nào dùng HTML files:**

- Test nhanh configuration
- Debug model mới
- Reference implementation

**Khi nào dùng React component:**

- Production deployment
- Feature development
- Integration với app

### Migration Guide

Nếu bạn đang dùng HTML files và muốn chuyển sang React:

1. **Import component:**

```javascript
import IJewelTryOnAR from '@/components/ijewelTryOn';
```

2. **Sử dụng:**

```jsx
<IJewelTryOnAR
  modelName="heart"
  onError={(err) => console.error(err)}
  onModelLoad={(model) => console.log('Loaded:', model)}
/>
```

3. **Route:**

```
http://localhost:5173/ijewel-tryon?model=heart
```

Xem thêm: `src/components/ijewelTryOn/IJEWEL_AR_README.md`

---

## 🔗 URL Reference

### Model Names (Short Form)

```
heart    → refined_mirror_heart
oval     → refined_mirror_oval
flower   → refined_mirror_flower
pear     → refined_mirror_pear
trilogy  → refined_mirror_trilogy
twin     → refined_mirror_twin
ufo      → refined_mirror_ufo
myfav    → refined_mirror_myfav
fistion  → refined_mirror_fistion
demo     → demo_tryon
```

### Local URLs (HTML Test Files)

```bash
# HTML Test Files (Static)
http://localhost:8000/arTryOn/tryon-configuration.html?model=heart
http://localhost:8000/arTryOn/tryon-configuration.html?model=oval
http://localhost:8000/arTryOn/tryon-configuration.html?model=flower

# React Component (Development)
http://localhost:5173/ijewel-tryon?model=heart
http://localhost:5173/ijewel-tryon?model=oval
http://localhost:5173/ijewel-tryon?model=flower
```

### Production URLs (Vercel)

```bash
# React Component (Production)
https://test-beryl-five-56.vercel.app/ijewel-tryon?model=heart
https://test-beryl-five-56.vercel.app/ijewel-tryon?model=oval
https://test-beryl-five-56.vercel.app/ijewel-tryon?model=flower
```

---

## 📚 Tài Liệu Liên Quan

### Internal Docs

- **React Component:** `src/components/ijewelTryOn/IJEWEL_AR_README.md`
- **React Component Source:** `src/components/ijewelTryOn/`
- **Page Component:** `src/pages/IJewelARTryOnPage.jsx`

### iJewel SDK Docs

- **WebGI Runtime:** <https://releases.ijewel3d.com/webgi/runtime/>
- **Web VTO SDK:** <https://releases.ijewel3d.com/libs/web-vto/>

### Model Files

- **GLB Models:** `public/models/rings/*.glb`
- **Configs:** `public/arTryOn/*.json` ⚠️ KHÔNG XÓA

---

## 📋 Quick Reference

### Common Scale Values

```
0.4-0.5  → Models rất to
0.6      → Standard (mặc định)
0.8-1.0  → Models trung bình
1.5-1.6  → Models nhỏ (như Oval)
```

### Common Issues & Solutions

```
❌ Model không hiển thị    → Check console, verify GLB path
❌ Model quá to/nhỏ        → Adjust Scale in Debug Panel
❌ Model lệch vị trí       → Adjust Position X/Y/Z
❌ Camera không hoạt động  → Check permissions, HTTPS
❌ iOS Safari crash        → Use React component (optimized)
```

---

## ⚠️ IMPORTANT NOTES

### DO NOT DELETE

- ✅ **JSON files** - Configuration cho models
- ✅ **tryon-configuration.html** - Tool để tạo config mới
- ✅ **GLB files** (trong `/models/rings/`) - 3D models

### CAN DELETE (Optional)

- ❓ **ijewel-tryon-test.html** - Nếu không cần test đơn giản
- ❓ **ijewel_org.html** - Nếu không cần reference

### RECOMMENDED

- 📱 Sử dụng **React component** cho production
- 🧪 Sử dụng **HTML files** cho testing/debugging
- 📝 Giữ **JSON configs** cho tất cả models

---

**Last Updated:** 2025-11-03
**Maintained by:** Mirror Diamond Development Team
**Version:** 2.0 (React Migration)

---

**PLEASE DO NOT DELETE JSON FILES** - Đây là configuration quan trọng cho AR Try-On!
