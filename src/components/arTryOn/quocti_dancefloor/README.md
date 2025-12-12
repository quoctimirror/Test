# SimpleMeshInspector - Cấu trúc dự án

## 📁 Cấu trúc thư mục

```
quocti_dancefloor/
├── components/              # Các component con (tách riêng)
│   ├── Ring3D.jsx          # Render 3D model
│   ├── Scene3D.jsx         # Quản lý 3D scene (lighting, env, camera)
│   ├── ModelUploader.jsx   # Upload file GLB/GLTF
│   ├── TransformControls.jsx # UI controls (rotation, position, scale)
│   └── MeshList.jsx        # Danh sách mesh + color picker
│
├── SimpleMeshInspector.jsx # COMPONENT CHÍNH (tổng hợp tất cả)
└── README.md               # File này
```

---

## 🎯 Nhiệm vụ từng file

### **1. Ring3D.jsx**
**Nhiệm vụ:** Render 3D model của nhẫn/trang sức
- Nhận danh sách `nodes` từ GLTF model
- Hiển thị từng mesh với material tương ứng
- Hỗ trợ highlight mesh được chọn (màu đỏ)
- Hỗ trợ đổi màu từng mesh qua `meshColors`
- Auto-rotate nếu được bật

**Props:**
```js
{
  nodes,        // Danh sách nodes từ GLTF
  env,          // Environment map (HDR)
  selectedMesh, // Mesh đang được chọn
  transform,    // Transform data (rotation, position, scale)
  meshColors    // Object chứa màu của từng mesh
}
```

---

### **2. Scene3D.jsx**
**Nhiệm vụ:** Quản lý toàn bộ 3D scene
- Load model GLTF
- Load environment map (HDR)
- Thêm lighting (spotlight)
- Thêm OrbitControls để xoay camera
- Trích xuất danh sách mesh từ model và gửi lên parent

**Props:**
```js
{
  modelPath,      // Đường dẫn file model
  selectedMesh,   // Mesh đang được chọn
  onMeshListLoad, // Callback khi load xong mesh list
  transform,      // Transform data
  meshColors      // Màu của từng mesh
}
```

---

### **3. ModelUploader.jsx**
**Nhiệm vụ:** Upload file GLB/GLTF model
- Input file để chọn model từ máy
- Validate chỉ chấp nhận .glb và .gltf
- Tạo URL object từ file và update modelPath

**Props:**
```js
{
  modelPath,    // Đường dẫn model hiện tại
  onFileUpload  // Callback khi upload file mới
}
```

---

### **4. TransformControls.jsx**
**Nhiệm vụ:** UI controls để điều chỉnh transform của model
- Rotation X, Y, Z (góc xoay)
- Position Y (vị trí theo trục Y)
- Scale (kích thước)
- Auto Rotate checkbox

**Props:**
```js
{
  transform,    // Object chứa transform data
  setTransform  // Function để update transform
}
```

---

### **5. MeshList.jsx**
**Nhiệm vụ:** Hiển thị danh sách mesh và color picker
- Hiển thị từng mesh với tên và type
- Click vào mesh để select/deselect (highlight)
- Color picker (visual) để chọn màu
- Text input để nhập mã HEX trực tiếp

**Props:**
```js
{
  meshList,       // Danh sách mesh [{name, type}, ...]
  selectedMesh,   // Mesh đang được chọn
  setSelectedMesh,// Function để chọn mesh
  meshColors,     // Object chứa màu của từng mesh
  setMeshColors   // Function để update màu
}
```

---

### **6. SimpleMeshInspector.jsx** (COMPONENT CHÍNH)
**Nhiệm vụ:** Tổng hợp tất cả component con
- Quản lý state chung (selectedMesh, meshList, modelPath, meshColors, transform)
- Khởi tạo màu mặc định cho mesh
- Xử lý upload file
- Render UI (sidebar + canvas)

**State:**
```js
{
  selectedMesh,  // Mesh đang được highlight
  meshList,      // Danh sách tất cả mesh
  modelPath,     // Đường dẫn file model
  meshColors,    // Màu của từng mesh
  transform      // Transform controls
}
```

---

## 🚀 Cách sử dụng

1. **Import component chính:**
```jsx
import SimpleMeshInspector from './SimpleMeshInspector';

function App() {
  return <SimpleMeshInspector />;
}
```

2. **Upload model:**
   - Click "Choose File" → chọn file .glb hoặc .gltf
   - Hoặc dùng model mặc định: `/models/myfav.glb`

3. **Điều chỉnh transform:**
   - Kéo slider Rotation X/Y/Z
   - Kéo slider Position Y
   - Kéo slider Scale
   - Bật/tắt Auto Rotate

4. **Đổi màu mesh:**
   - Click vào mesh trong danh sách để highlight
   - Click color picker để chọn màu
   - Hoặc nhập mã HEX trực tiếp (ví dụ: `#ffaf83`)

---

## 📝 Màu mặc định

Màu sẽ tự động được set theo tên mesh:

| Loại mesh | Màu mặc định | HEX |
|-----------|-------------|-----|
| Ring (tên chứa "ring") | Vàng hồng | `#ffaf83` |
| Diamond/Gem/Stone | Xanh nhạt | `#b5cbdd` |
| Khác | Trắng | `#ffffff` |

---

## ✅ Tương thích

- **React:** 19.x
- **Three.js:** 0.178.0
- **@react-three/fiber:** 9.x
- **@react-three/drei:** 10.x
- **Không dùng:** Leva (không tương thích React 19)
