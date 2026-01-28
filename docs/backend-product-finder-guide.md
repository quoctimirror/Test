# Product Finder - Backend Implementation Guide

---

## 1. HIỆN TẠI ĐANG CÓ GÌ

### Frontend (React)

- Route `/find-your-piece` → trang quiz 2 bước (chọn diamond shape + band)
- Route `/find-your-piece/result` → trang hiển thị kết quả
- Toàn bộ data **MOCK** hardcode trong component, chưa gọi API thật
- 10 diamond shapes + 15 band styles hardcode trong file `ProductFinderPage.jsx`
- Trang result dùng hàm mock `getRecommendedProduct()` trả 1 sản phẩm cố định
- Authentication: frontend đã có hệ thống JWT (Bearer token), axios interceptor tự gắn token + header `X-User-Id`

### Backend (Spring Boot + PostgreSQL, port 8082)

**Đã có sẵn trong database:**

| Bảng | Nội dung | Dùng cho Product Finder |
|------|----------|------------------------|
| `stone_shape_options` | 10 diamond shapes (ROUND, PRINCESS, CUSHION, EMERALD, OVAL, PEAR, ASSCHER, RADIANT, MARQUISE, HEART) | ✅ Step 1 - chọn shape |
| `side_stones_options` | 6 loại side stones (DIAMONDS, SAPPHIRES, RUBIES, EMERALDS, MIXED, NONE) | ✅ Step 3 - dùng sau |
| `material_options` | Kim loại (18K WHITE/YELLOW/ROSE GOLD, PLATINUM, SILVER...) | Có thể dùng |
| `material_color_options` | Màu (WHITE, YELLOW, ROSE, TWOTONE, TRITONE) | Có thể dùng |

**`stone_shape_options` entity hiện tại chỉ có:**
```java
id, shapeCode, shapeName, description, displayOrder, isActive, createdAt, updatedAt
```
→ Thiếu: image, gif, price, heads (cần thêm cho product finder)

**Chưa có:**

| Cần tạo | Lý do |
|----------|-------|
| Bảng `band_style_options` | Chưa có bảng nào chứa band styles |
| Bảng `product_finder_selections` | Chưa có chỗ lưu selections của user |
| Controller `ProductFinderController` | Chưa có API endpoints |
| Service `ProductFinderService` | Chưa có business logic |

---

## 2. WORKFLOW TỔNG QUÁT

```
User đăng nhập
    │
    ▼
Vào /find-your-piece
    │
    ▼
Frontend gọi:
  GET /api/product-finder/diamond-shapes (public)
  GET /api/product-finder/band-styles (public)
    │
    ▼
Backend query bảng stone_shape_options + band_style_options
→ trả 2 flat lists riêng biệt
    │
    ▼
Frontend hiển thị quiz
    │
    ▼
Step 1: User chọn 1 diamond shape (trong 10)
    │
    ▼
Step 2: User chọn 1 band style (trong 15)
    │
    ▼
User click "Xem kết quả"
Frontend navigate sang /find-your-piece/result
    │
    ▼
Frontend gọi POST /api/product-finder/recommend
  Header: X-User-Id: {userId}
  Body: { "diamond": "ROUND", "band": "solitaire" }
    │
    ▼
Backend:
  1. Lấy userId từ header X-User-Id
  2. Validate diamond/band code hợp lệ
  3. Query full thông tin diamond từ stone_shape_options
  4. Query full thông tin band từ band_style_options
  5. Tính estimatedTotal = diamond.price + band.price
  6. Lưu vào product_finder_selections (gắn userId)
  7. Trả response đầy đủ
    │
    ▼
Frontend hiển thị kết quả:
  - Ảnh sản phẩm (trái)
  - Tên, mô tả, giá estimatedTotal (phải)
  - Thông tin diamond + band đã chọn
  - Buttons: Book Appointment / Wishlist / Pre-order
    │
    ▼
(Optional) User click "Thay đổi lựa chọn"
→ quay lại quiz → chọn lại → POST /recommend lần nữa
```

### Ai làm gì

| Bước | Frontend | Backend |
|------|----------|---------|
| Load quiz | Gọi 2 GET endpoints | Query 2 bảng options → trả flat lists |
| User chọn | Lưu local state, render UI | Không làm gì |
| Xem kết quả | Gọi `POST /recommend` kèm X-User-Id | Validate → query → tính giá → lưu DB → trả response |
| Hiển thị | Render từ response | Không làm gì |
| Xem lịch sử | Gọi `GET /my-selections` kèm X-User-Id | Query DB theo userId → trả list |

### Authentication

| Endpoint | Auth | Lý do |
|----------|------|-------|
| `GET /api/product-finder/diamond-shapes` | Không cần (permitAll) | Ai cũng xem quiz được |
| `GET /api/product-finder/band-styles` | Không cần (permitAll) | Ai cũng xem quiz được |
| `POST /api/product-finder/recommend` | Cần (authenticated) | Lưu kết quả gắn với user |
| `GET /api/product-finder/my-selections` | Cần (authenticated) | Chỉ xem selections của mình |

---

## 3. CẦN LÀM GÌ

### 3.1 Database - Liquibase Migrations

#### Migration 1: Alter `stone_shape_options` - thêm columns

Bảng đã tồn tại, cần thêm fields cho product finder:

```sql
ALTER TABLE stone_shape_options
ADD COLUMN image VARCHAR(255),
ADD COLUMN gif VARCHAR(255),
ADD COLUMN price INT DEFAULT 0,
ADD COLUMN heads TEXT;

UPDATE stone_shape_options SET image='mirror_DMM/HEART-03.webp', gif='mirror_DMM/ROUND.gif', price=5000, heads='[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]' WHERE shape_code='ROUND';
UPDATE stone_shape_options SET image='mirror_DMM/PRINCESS.webp', gif='mirror_DMM/PRINCESS.gif', price=4500, heads='[1,3,4,5,7,8,9,10,11,13,15]' WHERE shape_code='PRINCESS';
UPDATE stone_shape_options SET image='mirror_DMM/RADIANT.webp', gif='mirror_DMM/RADIANT.gif', price=4800, heads='[1,3,4,5,7,8,9,10,11,13,15]' WHERE shape_code='RADIANT';
UPDATE stone_shape_options SET image='mirror_DMM/HEART-06.webp', gif='mirror_DMM/EMERALD.gif', price=5200, heads='[1,3,4,5,7,8,9,10,11,13,15]' WHERE shape_code='EMERALD';
UPDATE stone_shape_options SET image='mirror_DMM/HEART-07.webp', gif='mirror_DMM/MARQUISE.gif', price=4700, heads='[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]' WHERE shape_code='MARQUISE';
UPDATE stone_shape_options SET image='mirror_DMM/HEART-02.webp', gif='mirror_DMM/OVAL.gif', price=4900, heads='[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]' WHERE shape_code='OVAL';
UPDATE stone_shape_options SET image='mirror_DMM/HEART-04.webp', gif='mirror_DMM/PEAR.gif', price=4600, heads='[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]' WHERE shape_code='PEAR';
UPDATE stone_shape_options SET image='mirror_DMM/HEART-01.webp', gif='mirror_DMM/HEART.gif', price=5100, heads='[1,5,7,8,10,13,15]' WHERE shape_code='HEART';
UPDATE stone_shape_options SET image='mirror_DMM/HEART-05.webp', gif='mirror_DMM/ASSCHER.gif', price=4400, heads='[1,3,4,5,7,8,9,10,11,13,14,15]' WHERE shape_code='ASSCHER';
UPDATE stone_shape_options SET image='mirror_DMM/CUSHION.webp', gif='mirror_DMM/CUSHION.gif', price=4300, heads='[1,3,4,5,7,8,9,10,11,12,13,14,15]' WHERE shape_code='CUSHION';
```

#### Migration 2: Create `band_style_options`

Theo pattern của `stone_shape_options`:

| Column | Type | Constraint |
|--------|------|-----------|
| id | BIGINT | PK, AUTO_INCREMENT |
| style_code | VARCHAR(50) | UNIQUE, NOT NULL |
| style_name | VARCHAR(100) | NOT NULL |
| description | VARCHAR(255) | nullable |
| image | VARCHAR(255) | nullable |
| price | INT | DEFAULT 0 |
| display_order | INT | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Không có FK - bảng lookup độc lập (giống tất cả dropdown tables khác).

**Seed data:**

```sql
INSERT INTO band_style_options (style_code, style_name, image, price, display_order, is_active, created_at, updated_at) VALUES
('solitaire', 'Solitaire', 'products/band-solitaire.webp', 800, 1, true, NOW(), NOW()),
('knife-edge-solitaire', 'Knife Edge Solitaire', 'products/band-knife-edge-solitaire.webp', 850, 2, true, NOW(), NOW()),
('split-ring-solitaire', 'Split Ring Solitaire', 'products/band-split-ring-solitaire.webp', 900, 3, true, NOW(), NOW()),
('french-pave', 'French Pavé', 'products/band-french-pave.webp', 1200, 4, true, NOW(), NOW()),
('cathedral-pave', 'Cathedral Pave', 'products/band-cathedral-pave.webp', 1100, 5, true, NOW(), NOW()),
('triple-row-pave', 'Triple Row Pave', 'products/band-triple-row-pave.webp', 1500, 6, true, NOW(), NOW()),
('round-channel', 'Round Channel', 'products/band-round-channel.webp', 1000, 7, true, NOW(), NOW()),
('baguette-channel', 'Baguette Channel', 'products/band-baguette-channel.webp', 1050, 8, true, NOW(), NOW()),
('floating-station', 'Floating Station', 'products/band-floating-station.webp', 950, 9, true, NOW(), NOW()),
('alternating-marquise', 'Alternating Marquise', 'products/band-alternating-marquise.webp', 1300, 10, true, NOW(), NOW()),
('three-stone', 'Three Stone', 'products/band-three-stone.webp', 1800, 11, true, NOW(), NOW()),
('knife-edge-pave', 'Knife Edge Pave', 'products/band-knife-edge-pave.webp', 1150, 12, true, NOW(), NOW()),
('floral-bypass', 'Floral Bypass', 'products/band-floral-bypass.webp', 1400, 13, true, NOW(), NOW()),
('twist-pave', 'Twist Pave', 'products/band-twist-pave.webp', 1250, 14, true, NOW(), NOW()),
('alternating-baguette', 'Alternating Baguette', 'products/band-alternating-baguette.webp', 1350, 15, true, NOW(), NOW());
```

#### Migration 3: Create `product_finder_selections`

| Column | Type | Constraint |
|--------|------|-----------|
| id | BIGINT | PK, AUTO_INCREMENT |
| user_id | VARCHAR(255) | NOT NULL |
| diamond_shape_code | VARCHAR(50) | NOT NULL |
| band_style_code | VARCHAR(50) | NOT NULL |
| diamond_price | INT | NOT NULL |
| band_price | INT | NOT NULL |
| estimated_total | INT | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

- `user_id` là **VARCHAR(255)**, không FK (giống pattern Order entity)
- `diamond_shape_code` / `band_style_code` là raw String, không FK (giống pattern toàn bộ dropdown tables)
- `diamond_price` / `band_price` lưu giá tại thời điểm chọn (denormalization có chủ đích - giá options có thể thay đổi sau)

```sql
CREATE INDEX idx_pfs_user_id ON product_finder_selections(user_id);
```

---

### 3.2 Java Code - Package Structure

```
src/main/java/com/mirror/product/
├── entity/
│   ├── BandStyleOption.java              ← NEW
│   └── ProductFinderSelection.java       ← NEW
├── repository/
│   ├── BandStyleOptionRepository.java    ← NEW
│   └── ProductFinderSelectionRepository.java ← NEW
├── dto/
│   └── productfinder/
│       ├── RecommendRequest.java         ← NEW
│       ├── DiamondShapeResponse.java     ← NEW
│       ├── BandStyleResponse.java        ← NEW
│       └── RecommendResponse.java        ← NEW
├── service/
│   └── ProductFinderService.java         ← NEW
└── controller/
    └── ProductFinderController.java      ← NEW
```

---

### 3.3 Entity Classes

#### `BandStyleOption.java`

```java
package com.mirror.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "band_style_options")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class BandStyleOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "style_code", nullable = false, unique = true, length = 50)
    private String styleCode;

    @Column(name = "style_name", nullable = false, length = 100)
    private String styleName;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "image", length = 255)
    private String image;

    @Column(name = "price")
    @Builder.Default
    private Integer price = 0;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
```

#### `ProductFinderSelection.java`

```java
package com.mirror.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "product_finder_selections",
       indexes = @Index(name = "idx_pfs_user_id", columnList = "user_id"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ProductFinderSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "diamond_shape_code", nullable = false, length = 50)
    private String diamondShapeCode;

    @Column(name = "band_style_code", nullable = false, length = 50)
    private String bandStyleCode;

    @Column(name = "diamond_price", nullable = false)
    private Integer diamondPrice;

    @Column(name = "band_price", nullable = false)
    private Integer bandPrice;

    @Column(name = "estimated_total", nullable = false)
    private Integer estimatedTotal;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
```

#### `StoneShapeOption.java` - CẦN THÊM FIELDS

Thêm vào entity hiện tại:

```java
@Column(name = "image", length = 255)
private String image;

@Column(name = "gif", length = 255)
private String gif;

@Column(name = "price")
@Builder.Default
private Integer price = 0;

@Column(name = "heads", columnDefinition = "TEXT")
private String heads;  // JSON string: "[1,2,3,...]"
```

---

### 3.4 Repositories

#### `BandStyleOptionRepository.java`

```java
package com.mirror.product.repository;

import com.mirror.product.entity.BandStyleOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BandStyleOptionRepository extends JpaRepository<BandStyleOption, Long> {
    List<BandStyleOption> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<BandStyleOption> findByStyleCode(String styleCode);
}
```

#### `ProductFinderSelectionRepository.java`

```java
package com.mirror.product.repository;

import com.mirror.product.entity.ProductFinderSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductFinderSelectionRepository extends JpaRepository<ProductFinderSelection, Long> {
    List<ProductFinderSelection> findByUserIdOrderByCreatedAtDesc(String userId);
}
```

#### `StoneShapeOptionRepository.java` - đã có, cần đảm bảo có:

```java
List<StoneShapeOption> findByIsActiveTrueOrderByDisplayOrderAsc();
Optional<StoneShapeOption> findByShapeCode(String shapeCode);
```

---

### 3.5 DTOs

#### `DiamondShapeResponse.java`

```java
package com.mirror.product.dto.productfinder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiamondShapeResponse {
    private String id;          // shapeCode lowercase
    private String name;        // shapeName
    private String image;
    private String gif;
    private Integer price;
    private List<Integer> heads;
    private Integer displayOrder;
}
```

#### `BandStyleResponse.java`

```java
package com.mirror.product.dto.productfinder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BandStyleResponse {
    private String id;          // styleCode
    private String name;        // styleName
    private String image;
    private Integer price;
    private Integer displayOrder;
}
```

#### `RecommendRequest.java`

```java
package com.mirror.product.dto.productfinder;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendRequest {
    @NotBlank(message = "Diamond shape is required")
    private String diamond;

    @NotBlank(message = "Band style is required")
    private String band;
}
```

#### `RecommendResponse.java`

```java
package com.mirror.product.dto.productfinder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendResponse {
    private String name;
    private String image;
    private String description;
    private Integer estimatedTotal;
    private String estimatedTotalFormatted;
    private DiamondShapeResponse diamond;
    private BandStyleResponse band;
}
```

#### `SelectionHistoryResponse.java`

```java
package com.mirror.product.dto.productfinder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelectionHistoryResponse {
    private Long id;
    private DiamondShapeResponse diamond;
    private BandStyleResponse band;
    private Integer estimatedTotal;
    private Instant createdAt;
}
```

---

### 3.6 Service

```java
package com.mirror.product.service;

import com.mirror.product.dto.productfinder.*;
import com.mirror.product.entity.BandStyleOption;
import com.mirror.product.entity.ProductFinderSelection;
import com.mirror.product.entity.StoneShapeOption;
import com.mirror.product.repository.BandStyleOptionRepository;
import com.mirror.product.repository.ProductFinderSelectionRepository;
import com.mirror.product.repository.StoneShapeOptionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductFinderService {

    private final StoneShapeOptionRepository shapeRepo;
    private final BandStyleOptionRepository bandRepo;
    private final ProductFinderSelectionRepository selectionRepo;
    private final ObjectMapper objectMapper;

    /**
     * Lấy danh sách diamond shapes (active, sorted)
     */
    public List<DiamondShapeResponse> getDiamondShapes() {
        return shapeRepo.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toDiamondResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách band styles (active, sorted)
     */
    public List<BandStyleResponse> getBandStyles() {
        return bandRepo.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toBandResponse)
                .collect(Collectors.toList());
    }

    /**
     * Xử lý recommendation + lưu selection
     */
    public RecommendResponse recommend(String userId, RecommendRequest request) {
        // 1. Query diamond shape
        StoneShapeOption diamond = shapeRepo.findByShapeCode(request.getDiamond().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid diamond shape: " + request.getDiamond()));

        // 2. Query band style
        BandStyleOption band = bandRepo.findByStyleCode(request.getBand())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid band style: " + request.getBand()));

        // 3. Tính estimated total
        int estimatedTotal = (diamond.getPrice() != null ? diamond.getPrice() : 0)
                           + (band.getPrice() != null ? band.getPrice() : 0);

        // 4. Lưu selection vào DB
        ProductFinderSelection selection = ProductFinderSelection.builder()
                .userId(userId)
                .diamondShapeCode(diamond.getShapeCode())
                .bandStyleCode(band.getStyleCode())
                .diamondPrice(diamond.getPrice() != null ? diamond.getPrice() : 0)
                .bandPrice(band.getPrice() != null ? band.getPrice() : 0)
                .estimatedTotal(estimatedTotal)
                .build();
        selectionRepo.save(selection);

        // 5. Build response
        String description = diamond.getShapeName() + " diamond shape with "
                + band.getStyleName() + " band in 18K gold.";

        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.US);
        currencyFormat.setMaximumFractionDigits(0);

        return RecommendResponse.builder()
                .name("Lumina Olivia")
                .image("products/ring-result.webp")
                .description(description)
                .estimatedTotal(estimatedTotal)
                .estimatedTotalFormatted(currencyFormat.format(estimatedTotal))
                .diamond(toDiamondResponse(diamond))
                .band(toBandResponse(band))
                .build();
    }

    /**
     * Lấy lịch sử selections của user
     */
    public List<SelectionHistoryResponse> getMySelections(String userId) {
        List<ProductFinderSelection> selections =
                selectionRepo.findByUserIdOrderByCreatedAtDesc(userId);

        return selections.stream().map(sel -> {
            // Lookup full info
            DiamondShapeResponse diamondResp = shapeRepo.findByShapeCode(sel.getDiamondShapeCode())
                    .map(this::toDiamondResponse)
                    .orElse(DiamondShapeResponse.builder()
                            .id(sel.getDiamondShapeCode().toLowerCase())
                            .name(sel.getDiamondShapeCode())
                            .price(sel.getDiamondPrice())
                            .build());

            BandStyleResponse bandResp = bandRepo.findByStyleCode(sel.getBandStyleCode())
                    .map(this::toBandResponse)
                    .orElse(BandStyleResponse.builder()
                            .id(sel.getBandStyleCode())
                            .name(sel.getBandStyleCode())
                            .price(sel.getBandPrice())
                            .build());

            return SelectionHistoryResponse.builder()
                    .id(sel.getId())
                    .diamond(diamondResp)
                    .band(bandResp)
                    .estimatedTotal(sel.getEstimatedTotal())
                    .createdAt(sel.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    // ===== Mappers =====

    private DiamondShapeResponse toDiamondResponse(StoneShapeOption entity) {
        List<Integer> headsList = parseHeads(entity.getHeads());
        return DiamondShapeResponse.builder()
                .id(entity.getShapeCode().toLowerCase())
                .name(entity.getShapeName())
                .image(entity.getImage())
                .gif(entity.getGif())
                .price(entity.getPrice())
                .heads(headsList)
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    private BandStyleResponse toBandResponse(BandStyleOption entity) {
        return BandStyleResponse.builder()
                .id(entity.getStyleCode())
                .name(entity.getStyleName())
                .image(entity.getImage())
                .price(entity.getPrice())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    private List<Integer> parseHeads(String headsJson) {
        if (headsJson == null || headsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(headsJson, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse heads JSON: {}", headsJson, e);
            return List.of();
        }
    }
}
```

---

### 3.7 Controller

```java
package com.mirror.product.controller;

import com.mirror.product.dto.productfinder.*;
import com.mirror.product.service.ProductFinderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product-finder")
@RequiredArgsConstructor
@Slf4j
public class ProductFinderController {

    private final ProductFinderService productFinderService;

    /**
     * GET /api/product-finder/diamond-shapes
     * Public - trả danh sách diamond shapes
     */
    @GetMapping("/diamond-shapes")
    public ResponseEntity<List<DiamondShapeResponse>> getDiamondShapes() {
        log.debug("Fetching diamond shape options for product finder");
        return ResponseEntity.ok(productFinderService.getDiamondShapes());
    }

    /**
     * GET /api/product-finder/band-styles
     * Public - trả danh sách band styles
     */
    @GetMapping("/band-styles")
    public ResponseEntity<List<BandStyleResponse>> getBandStyles() {
        log.debug("Fetching band style options for product finder");
        return ResponseEntity.ok(productFinderService.getBandStyles());
    }

    /**
     * POST /api/product-finder/recommend
     * Authenticated - nhận selections, lưu DB, trả recommendation
     */
    @PostMapping("/recommend")
    public ResponseEntity<?> recommend(
            @RequestHeader(value = "X-User-Id", required = true) String userId,
            @Valid @RequestBody RecommendRequest request) {
        try {
            log.info("Product finder recommendation for user: {}", userId);
            RecommendResponse response = productFinderService.recommend(userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid product finder selection: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "INVALID_SELECTION",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/product-finder/my-selections
     * Authenticated - trả lịch sử selections của user
     */
    @GetMapping("/my-selections")
    public ResponseEntity<List<SelectionHistoryResponse>> getMySelections(
            @RequestHeader(value = "X-User-Id", required = true) String userId) {
        log.debug("Fetching selections for user: {}", userId);
        return ResponseEntity.ok(productFinderService.getMySelections(userId));
    }
}
```

---

### 3.8 Security Config

Thêm vào `SecurityConfig.java` (trong block `.authorizeHttpRequests`):

```java
// ==================== PRODUCT FINDER ====================
// Public - browse diamond shapes and band styles
.requestMatchers(HttpMethod.GET, "/api/product-finder/diamond-shapes").permitAll()
.requestMatchers(HttpMethod.GET, "/api/product-finder/band-styles").permitAll()
// Authenticated - recommend and view history
.requestMatchers(HttpMethod.POST, "/api/product-finder/recommend").authenticated()
.requestMatchers(HttpMethod.GET, "/api/product-finder/my-selections").authenticated()
```

---

## 4. API REQUEST / RESPONSE CHI TIẾT

### `GET /api/product-finder/diamond-shapes`

**Auth:** Không cần

**Response `200`:**
```json
[
  {
    "id": "round",
    "name": "Round",
    "image": "mirror_DMM/HEART-03.webp",
    "gif": "mirror_DMM/ROUND.gif",
    "price": 5000,
    "heads": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    "displayOrder": 1
  },
  {
    "id": "heart",
    "name": "Heart",
    "image": "mirror_DMM/HEART-01.webp",
    "gif": "mirror_DMM/HEART.gif",
    "price": 5100,
    "heads": [1,5,7,8,10,13,15],
    "displayOrder": 8
  }
]
```

### `GET /api/product-finder/band-styles`

**Auth:** Không cần

**Response `200`:**
```json
[
  {
    "id": "solitaire",
    "name": "Solitaire",
    "image": "products/band-solitaire.webp",
    "price": 800,
    "displayOrder": 1
  },
  {
    "id": "french-pave",
    "name": "French Pavé",
    "image": "products/band-french-pave.webp",
    "price": 1200,
    "displayOrder": 4
  }
]
```

### `POST /api/product-finder/recommend`

**Auth:** Cần header `X-User-Id`

**Request Headers:**
```
X-User-Id: usr_12345
Content-Type: application/json
```

**Request Body:**
```json
{
  "diamond": "round",
  "band": "solitaire"
}
```

**Response `200`:**
```json
{
  "name": "Lumina Olivia",
  "image": "products/ring-result.webp",
  "description": "Round diamond shape with Solitaire band in 18K gold.",
  "estimatedTotal": 5800,
  "estimatedTotalFormatted": "$5,800",
  "diamond": {
    "id": "round",
    "name": "Round",
    "image": "mirror_DMM/HEART-03.webp",
    "gif": "mirror_DMM/ROUND.gif",
    "price": 5000,
    "heads": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    "displayOrder": 1
  },
  "band": {
    "id": "solitaire",
    "name": "Solitaire",
    "image": "products/band-solitaire.webp",
    "price": 800,
    "displayOrder": 1
  }
}
```

**Response `400`:**
```json
{
  "error": "INVALID_SELECTION",
  "message": "Invalid diamond shape: xyz"
}
```

### `GET /api/product-finder/my-selections`

**Auth:** Cần header `X-User-Id`

**Response `200`:**
```json
[
  {
    "id": 1,
    "diamond": {
      "id": "round",
      "name": "Round",
      "image": "mirror_DMM/HEART-03.webp",
      "gif": "mirror_DMM/ROUND.gif",
      "price": 5000,
      "heads": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
      "displayOrder": 1
    },
    "band": {
      "id": "solitaire",
      "name": "Solitaire",
      "image": "products/band-solitaire.webp",
      "price": 800,
      "displayOrder": 1
    },
    "estimatedTotal": 5800,
    "createdAt": "2026-01-23T10:30:00Z"
  }
]
```

---

## 5. FRONTEND INTEGRATION

Thêm vào `src/services/api.js`:

```javascript
// ===== PRODUCT FINDER API =====
export const productFinderAPI = {
  // Public
  getDiamondShapes: () => api.get("/api/product-finder/diamond-shapes"),
  getBandStyles: () => api.get("/api/product-finder/band-styles"),
  // Authenticated (axios interceptor tự gắn token + X-User-Id)
  getRecommendation: (data) => api.post("/api/product-finder/recommend", data),
  getMySelections: () => api.get("/api/product-finder/my-selections"),
};
```

---

## 6. TEST

```bash
# Public - lấy diamond shapes
curl http://localhost:8082/api/product-finder/diamond-shapes

# Public - lấy band styles
curl http://localhost:8082/api/product-finder/band-styles

# Authenticated - lấy recommendation
curl -X POST http://localhost:8082/api/product-finder/recommend \
  -H "X-User-Id: usr_12345" \
  -H "Content-Type: application/json" \
  -d '{"diamond":"round","band":"solitaire"}'

# Authenticated - xem lịch sử
curl http://localhost:8082/api/product-finder/my-selections \
  -H "X-User-Id: usr_12345"

# Test invalid diamond → 400
curl -X POST http://localhost:8082/api/product-finder/recommend \
  -H "X-User-Id: usr_12345" \
  -H "Content-Type: application/json" \
  -d '{"diamond":"invalid","band":"solitaire"}'
```

---

## 7. THỨ TỰ IMPLEMENTATION

```
1. Liquibase migration: alter stone_shape_options (thêm image, gif, price, heads)
2. Liquibase migration: create band_style_options + seed 15 records
3. Liquibase migration: create product_finder_selections
4. Update Entity: StoneShapeOption.java (thêm 4 fields)
5. Tạo Entity: BandStyleOption.java
6. Tạo Entity: ProductFinderSelection.java
7. Tạo Repository: BandStyleOptionRepository.java
8. Tạo Repository: ProductFinderSelectionRepository.java
9. Tạo DTOs: DiamondShapeResponse, BandStyleResponse, RecommendRequest, RecommendResponse, SelectionHistoryResponse
10. Tạo Service: ProductFinderService.java
11. Tạo Controller: ProductFinderController.java
12. Update SecurityConfig: thêm product-finder rules
13. Test với cURL/Postman
14. Frontend: thêm productFinderAPI vào api.js
15. Frontend: update ProductFinderPage.jsx
16. Frontend: update ProductFinderResultPage.jsx
```
