# Product Finder - Technical Documentation v2.0

> **Last Updated:** 2026-01-30
> **Status:** IMPLEMENTED & WORKING

---

## 1. TỔNG QUAN

Product Finder là hệ thống quiz 3 bước giúp user tùy chỉnh trang sức:

```
Step 1: Chọn Diamond Shape (round, oval, heart, etc.)
    ↓
Step 2: Chọn Band Style (single, double)
    ↓
Step 3: Chọn Side Stone (baguette, halfmoon)
    ↓
Result: Hiển thị 3D model + giá ước tính
```

---

## 2. FRONTEND ARCHITECTURE

### 2.1 Routes

| Route | Component | Mô tả |
|-------|-----------|-------|
| `/find-your-piece` | ProductFinderPage | Redirect → choose-shape |
| `/find-your-piece/choose-shape` | ProductFinderPage | Step 1: Chọn diamond |
| `/find-your-piece/choose-band` | ProductFinderPage | Step 2: Chọn band |
| `/find-your-piece/choose-sidestone` | ProductFinderPage | Step 3: Chọn sidestone |
| `/find-your-piece/result` | ProductFinderResultPage | Kết quả + 3D viewer |
| `/admin/product-finder/combinations` | ProductFinderAdminPage | Admin CRUD |

### 2.2 Files

```
src/pages/ProductFinder/
├── ProductFinderPage.jsx        # Quiz 3 bước với orbital UI
├── ProductFinderPage.css
├── ProductFinderResultPage.jsx  # Kết quả + iJewel 3D viewer
├── ProductFinderResultPage.css
├── ProductFinderAdminPage.jsx   # Admin panel CRUD
└── ProductFinderAdminPage.css

src/services/api.js              # productFinderAPI, productFinderAdminAPI
src/components/productsV2/shapeConfig.js  # Fallback config (legacy)
```

### 2.3 API Service (api.js)

```javascript
// Public endpoints
productFinderAPI.getDiamondShapes()   // GET /api/product-finder/diamond-shapes
productFinderAPI.getBandStyles()      // GET /api/product-finder/band-styles
productFinderAPI.getSideStones()      // GET /api/product-finder/side-stones
productFinderAPI.getRecommendation()  // POST /api/product-finder/recommend

// Admin endpoints (cần auth)
productFinderAdminAPI.getCombinations()     // GET /api/admin/product-finder/combinations
productFinderAdminAPI.createCombination()   // POST
productFinderAdminAPI.updateCombination()   // PUT /{id}
productFinderAdminAPI.toggleCombination()   // PATCH /{id}/toggle
productFinderAdminAPI.deleteCombination()   // DELETE /{id}
```

### 2.4 Image Loading Logic

**ProductFinderPage.jsx - getCenterPreview():**

```javascript
// Step 1 (Diamond): Animated GIF từ Cloudflare
getMediaUrl(option.gif || option.image)

// Step 2 (Band): Combo placeholder với baguette
`/product-finder/a1_${band}_${mainStone}_baguette.png`

// Step 3 (Sidestone): Full combo image
`/product-finder/a1_${band}_${mainStone}_${sidestone}.png`
```

**Image files hiện có:**
```
public/product-finder/
├── a1_single_round_baguette.png   (85KB)
├── a1_single_round_halfmoon.png   (92KB)
├── a1_double_round_baguette.png   (100KB)
└── a1_double_round_halfmoon.png   (5.6MB - CẦN OPTIMIZE!)
```

---

## 3. BACKEND ARCHITECTURE

### 3.1 Database Tables

#### `product_finder_combinations` (source of truth cho modelId)
```sql
CREATE TABLE product_finder_combinations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  band_code VARCHAR(50) NOT NULL,        -- 'single', 'double'
  main_stone_code VARCHAR(50) NOT NULL,  -- 'round', 'oval', etc.
  side_stone_code VARCHAR(50) NOT NULL,  -- 'baguette', 'halfmoon'
  model_id VARCHAR(100),                 -- iJewel 3D model ID
  images JSON,                           -- Array: ["/path/to/image.png"]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(band_code, main_stone_code, side_stone_code)
);
```

**Seed data hiện tại:**
| band | main_stone | side_stone | model_id | images |
|------|------------|------------|----------|--------|
| single | round | baguette | SLWfrDdYSqaqN9UFP1CXcA | ["/product-finder/a1_single_round_baguette.png"] |
| single | round | halfmoon | L9keKcLrTw-HM3ZONM_Yzg | ["/product-finder/a1_single_round_halfmoon.png"] |
| double | round | baguette | JXsWC993QZOv09hs6n3RLA | ["/product-finder/a1_double_round_baguette.png"] |
| double | round | halfmoon | Io_czZXZTXSmgotXryj5IQ | ["/product-finder/a1_double_round_halfmoon.png"] |

#### `product_finder_band_style_options`
| id | style_code | style_name | price | is_active |
|----|------------|------------|-------|-----------|
| 1 | single | Single | 800 | true |
| 2 | double | Double | 1200 | true |

#### `product_finder_side_stone_options`
| id | stone_code | stone_name | price | is_active |
|----|------------|------------|-------|-----------|
| 1 | baguette | Baguette | 500 | true |
| 2 | halfmoon | Half-Moon | 750 | true |

#### `product_finder_selections` (lưu history)
- user_id, main_stone_code, band_code, side_stone_code
- prices snapshot, estimated_total
- model_key, model_id
- color selections (mainColor, sideColor, bandColor)
- selection_type: 'view' | 'preorder'

### 3.2 Java Files

```
src/main/java/com/mirror/product/
├── entity/
│   ├── ProductFinderCombination.java
│   ├── ProductFinderBandStyleOption.java
│   ├── ProductFinderSideStoneOption.java
│   └── ProductFinderSelection.java
├── repository/
│   ├── ProductFinderCombinationRepository.java
│   ├── ProductFinderBandStyleOptionRepository.java
│   ├── ProductFinderSideStoneOptionRepository.java
│   └── ProductFinderSelectionRepository.java
├── dto/productfinder/
│   ├── DiamondShapeResponse.java
│   ├── BandStyleResponse.java
│   ├── SideStoneResponse.java
│   ├── RecommendRequest.java
│   ├── RecommendResponse.java
│   └── CombinationDTO.java
├── service/
│   ├── ProductFinderService.java
│   └── ProductFinderAdminService.java
└── controller/
    ├── ProductFinderController.java
    └── ProductFinderAdminController.java
```

### 3.3 API Endpoints

#### Public Endpoints

| Endpoint | Method | Response |
|----------|--------|----------|
| `/api/product-finder/diamond-shapes` | GET | List<DiamondShapeResponse> |
| `/api/product-finder/band-styles` | GET | List<BandStyleResponse> |
| `/api/product-finder/side-stones` | GET | List<SideStoneResponse> |
| `/api/product-finder/recommend` | POST | RecommendResponse |

#### Admin Endpoints (cần ADMIN/IT_ADMIN/SUPER_ADMIN role)

| Endpoint | Method | Response |
|----------|--------|----------|
| `/api/admin/product-finder/combinations` | GET | List<CombinationDTO> |
| `/api/admin/product-finder/combinations` | POST | CombinationDTO |
| `/api/admin/product-finder/combinations/{id}` | PUT | CombinationDTO |
| `/api/admin/product-finder/combinations/{id}/toggle` | PATCH | CombinationDTO |
| `/api/admin/product-finder/combinations/{id}` | DELETE | void |

---

## 4. DATA FLOW CHI TIẾT

### 4.1 Quiz Flow

```
[Frontend]                              [Backend]
    │
    │ ── GET /diamond-shapes ──────────→ Query stone_shape_options
    │ ←─ [{id, name, price, image, gif}] ─┘
    │
    │ ── GET /band-styles ─────────────→ Query product_finder_band_style_options
    │ ←─ [{id, name, price, image}] ──────┘
    │
    │ ── GET /side-stones ─────────────→ Query product_finder_side_stone_options
    │ ←─ [{id, name, price, isActive}] ───┘
    │
    │ User completes 3 steps
    │
    │ ── POST /recommend ──────────────→ 1. Validate selections
    │    {diamond, band, sidestone}      2. Query product_finder_combinations
    │                                       WHERE band_code=band
    │                                         AND main_stone_code=diamond
    │                                         AND side_stone_code=sidestone
    │                                    3. Get modelId + images from DB
    │                                    4. Calculate estimatedTotal
    │                                    5. Save to product_finder_selections
    │ ←─ {modelId, images, total, ...} ──┘
    │
    │ Load 3D model
    │ ijewelViewer.loadModelById(modelId)
```

### 4.2 Recommend Response

```json
{
  "name": "Single Round Baguette Ring",
  "description": "Round diamond with single band and baguette side stones.",
  "image": "/product-finder/a1_single_round_baguette.png",
  "images": ["/product-finder/a1_single_round_baguette.png"],
  "estimatedTotal": 6300.00,
  "estimatedTotalFormatted": "$6,300",
  "modelId": "SLWfrDdYSqaqN9UFP1CXcA",
  "modelKey": "single_round_baguette",
  "diamond": { "id": "round", "name": "Round", "price": 5000, ... },
  "band": { "id": "single", "name": "Single", "price": 800, ... },
  "sidestone": { "id": "baguette", "name": "Baguette", "price": 500, ... }
}
```

---

## 5. ADMIN PANEL

**URL:** `/admin/product-finder/combinations`

**Chức năng:**
- Xem danh sách tất cả combinations
- Thêm combination mới (band + diamond + sidestone + modelId + images)
- Sửa combination (modelId, images)
- Toggle active/inactive
- Xóa combination

**Khi thêm combination mới cần:**
1. iJewel model ID từ iJewel platform
2. Image files upload vào `/public/product-finder/`
3. Đặt tên theo format: `a1_{band}_{mainStone}_{sidestone}.png`

---

## 6. TESTING

```bash
# Test public endpoints
curl http://localhost:8082/api/product-finder/diamond-shapes
curl http://localhost:8082/api/product-finder/band-styles
curl http://localhost:8082/api/product-finder/side-stones

# Test recommend
curl -X POST http://localhost:8082/api/product-finder/recommend \
  -H "Content-Type: application/json" \
  -d '{"diamond":"round","band":"single","sidestone":"baguette"}'

# Expected: modelId = SLWfrDdYSqaqN9UFP1CXcA
```

---

## 7. KNOWN ISSUES

1. **Image file `a1_double_round_halfmoon.png` quá lớn (5.6MB)**
   - Cần optimize xuống ~100KB như các file khác

2. **Chỉ có 4 combinations** (round + single/double + baguette/halfmoon)
   - Cần thêm combinations cho các diamond shapes khác khi có model

---

## 8. MIGRATION FILES

```
db/changelog/
├── 117-create-product-finder-tables.xml      # Base tables
├── 119-fix-product-finder-selections-schema.xml
├── 120-recreate-product-finder-selections.xml
├── 121-add-single-double-band-styles.xml     # single/double bands
├── 122a-drop-old-product-finder-combinations.xml  # Drop old schema
└── 122-create-product-finder-combinations-table.xml  # New schema + seed
```
