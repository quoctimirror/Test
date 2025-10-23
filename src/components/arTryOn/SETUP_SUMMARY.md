# ✅ Setup Hoàn Tất - iJewel AR TryOn với iJewel Drive

## 📦 Đã Tích Hợp

Component `IJewelTryOn` đã được tích hợp hoàn toàn với:
- **iJewel Drive**: Load models từ cloud
- **shapeConfig**: Sử dụng cấu hình từ ProductsV2
- **AR TryOn SDK**: Sử dụng WebGi + VTO plugin

## 🎯 Cách Hoạt Động

```
User truy cập: /ar/ijewel/Fiston
                      ↓
Component nhận param: ringId = "Fiston"
                      ↓
Lấy config từ shapeConfig:
  - shape: "Fiston"
  - modelId: "MFGQrBe1RpiawHlEpH3fJQ"
  - metal: "Gold 24k"
  - band: "Single band"
                      ↓
Load model từ iJewel Drive:
  URL: https://releases.ijewel3d.com/drive/drive/MFGQrBe1RpiawHlEpH3fJQ/model.glb
                      ↓
Load AR config JSON (nếu có):
  URL: https://releases.ijewel3d.com/drive/drive/MFGQrBe1RpiawHlEpH3fJQ/model.glb.json
                      ↓
Khởi tạo AR TryOn
                      ↓
User có thể bật AR và thử nhẫn!
```

## 🔗 URLs để Test

### Fiston (Mặc định)
```
http://localhost:5173/ar/ijewel
http://localhost:5173/ar/ijewel/Fiston
```

### Các shapes khác
```
http://localhost:5173/ar/ijewel/Round
http://localhost:5173/ar/ijewel/Pear
http://localhost:5173/ar/ijewel/Emerald
```

## 📋 Shape Configs Hiện Có

| Shape   | Model ID                   | Metal      | Band         |
|---------|----------------------------|------------|--------------|
| Round   | U1Jy-K8MR4-qUOC_YIWkWQ     | Platinum   | Double band  |
| Pear    | OPdq2RjLTsikXl71-YvsJg     | Silver     | Single band  |
| Emerald | cpHdSLPBRlOGSeRzDiA77Q     | Rose Gold  | Single band  |
| Fiston  | MFGQrBe1RpiawHlEpH3fJQ     | Gold 24k   | Single band  |

## 🎨 UI Features

- Header hiển thị tên shape: "Try On: Fiston Ring"
- Sub-header hiển thị metal và band: "Gold 24k • Single band"
- Tự động thay đổi khi chuyển shape khác

## ⚙️ Cấu hình cần thiết

### ❌ CHƯA LÀM (Cần làm trước khi test thật):

1. **License Keys** (file: `IJewelTryOn.jsx`, dòng ~53 và ~60)
   ```javascript
   diamondPlugin.setKey('YOUR_IJEWEL_LICENSE_KEY');  // ← Cần thay
   tryon.setKey('YOUR_TRYON_LICENSE_KEY');            // ← Cần thay
   ```

2. **AR Config JSON** (Tùy chọn - để model đúng vị trí)
   - Tạo file JSON cho mỗi model trong Edit Mode
   - Upload lên iJewel Drive với tên: `model.glb.json`

## 🧪 Testing Workflow

### Bước 1: Start dev server
```bash
npm run dev
```

### Bước 2: Truy cập URL
```
http://localhost:5173/ar/ijewel/Fiston
```

### Bước 3: Kiểm tra Console
Nếu thiếu license key, sẽ thấy lỗi trong console.

### Bước 4: Cập nhật License Keys
Thay `YOUR_IJEWEL_LICENSE_KEY` và `YOUR_TRYON_LICENSE_KEY` bằng keys thật.

### Bước 5: Test lại
Reload trang và click "Bắt đầu AR"

## 📂 Files đã chỉnh sửa

### Tạo mới:
1. `src/components/arTryOn/IJewelTryOn.jsx` - Component chính
2. `src/components/arTryOn/IJewelTryOn.css` - Styling
3. `src/components/arTryOn/IJEWEL_README.md` - Docs đầy đủ
4. `src/components/arTryOn/SETUP_SUMMARY.md` - File này

### Chỉnh sửa:
1. `src/routes/AppRoutes.jsx` - Thêm route `/ar/ijewel/:ringId?`

### Đã có sẵn (không chỉnh sửa):
1. `index.html` - Scripts SDK đã được thêm sẵn
2. `src/components/productsV2/shapeConfig.js` - Shape configs

## 🔧 Troubleshooting

### Model không load?
**Kiểm tra:**
- Console log: "Loading model from iJewel Drive: {modelId}"
- Network tab: Xem request đến iJewel Drive có thành công không
- Model ID có đúng không (check trong shapeConfig.js)

### AR không bật?
**Kiểm tra:**
- License keys đã được cập nhật chưa
- Browser có quyền camera chưa
- Console có lỗi gì không

### Model hiển thị sai vị trí khi AR?
**Giải pháp:**
- Cần tạo file JSON config trong Edit Mode
- Upload file JSON lên iJewel Drive

## 🎓 Next Steps

### Nếu muốn thêm shape mới:

1. **Thêm vào shapeConfig.js:**
   ```javascript
   NewShape: {
     shape: 'NewShape',
     modelId: 'YOUR_MODEL_ID_FROM_DRIVE',
     metal: 'White Gold',
     band: 'Triple band'
   }
   ```

2. **Upload model lên iJewel Drive** và lấy modelId

3. **Truy cập:**
   ```
   http://localhost:5173/ar/ijewel/NewShape
   ```

### Nếu muốn tích hợp với ProductsV2:

Thêm button "Try On AR" trong RightConfiguration component:

```jsx
import { useNavigate } from 'react-router-dom';

const RightConfiguration = ({ currentShape }) => {
  const navigate = useNavigate();

  const handleTryOn = () => {
    navigate(`/ar/ijewel/${currentShape}`);
  };

  return (
    <button onClick={handleTryOn}>
      Try On AR
    </button>
  );
};
```

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs
2. Check Network tab
3. Đọc IJEWEL_README.md để biết chi tiết
4. Check tài liệu gốc: https://docs.ijewel3d.com/tryon/demo.html

---

**Status**: ✅ Setup hoàn tất, sẵn sàng test sau khi cập nhật license keys
