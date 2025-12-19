# 📱 PRODUCTSV2 BREAKPOINTS - MOBILE FIRST

**Standard: Bootstrap 5 Breakpoints**
**Approach: Mobile First (min-width)**

---

## 🎯 BREAKPOINTS THEO NHÓM THIẾT BỊ

### 📱 **MOBILE GROUP**

#### **BASE - Small Mobile (xs)**
- **Range:** `< 576px`
- **Devices:** iPhone SE (375px), iPhone 8 (375px)
- **CSS:** Không cần `@media` query (default styles)
- **Variable:** `--bp-mobile-sm: 0px`

#### **Large Mobile (sm)**
- **Breakpoint:** `≥ 576px`
- **Devices:** iPhone 14 Pro Max landscape (926px), Phablets
- **CSS:** `@media (min-width: 576px) { ... }`
- **Variable:** `--bp-mobile-lg: 576px`

---

### 📱 **TABLET GROUP**

#### **Tablet Portrait (md)**
- **Breakpoint:** `≥ 768px`
- **Devices:** iPad Mini portrait (768px), iPad (768px)
- **CSS:** `@media (min-width: 768px) { ... }`
- **Variable:** `--bp-tablet-sm: 768px`

#### **Tablet Landscape (lg)**
- **Breakpoint:** `≥ 992px`
- **Devices:** iPad landscape (1024px), Laptop nhỏ
- **CSS:** `@media (min-width: 992px) { ... }`
- **Variable:** `--bp-tablet-lg: 992px`

---

### 💻 **DESKTOP GROUP**

#### **Desktop (xl)**
- **Breakpoint:** `≥ 1200px`
- **Devices:** MacBook Pro (1440px), Desktop HD
- **CSS:** `@media (min-width: 1200px) { ... }`
- **Variable:** `--bp-desktop-sm: 1200px`

#### **Large Desktop (xxl)**
- **Breakpoint:** `≥ 1400px`
- **Devices:** Desktop Full HD (1920px), 2K, 4K
- **CSS:** `@media (min-width: 1400px) { ... }`
- **Variable:** `--bp-desktop-lg: 1400px`

---

## 📊 QUICK REFERENCE TABLE

| Breakpoint | Min Width | Device Group | Example Devices |
|------------|-----------|--------------|-----------------|
| **xs** (base) | `< 576px` | 📱 Small Mobile | iPhone SE, iPhone 8 |
| **sm** | `≥ 576px` | 📱 Large Mobile | iPhone Pro Max landscape |
| **md** | `≥ 768px` | 📱 Tablet Portrait | iPad Mini, iPad |
| **lg** | `≥ 992px` | 💻 Tablet Landscape | iPad landscape, Laptop |
| **xl** | `≥ 1200px` | 💻 Desktop | MacBook Pro, Desktop HD |
| **xxl** | `≥ 1400px` | 🖥️ Large Desktop | Full HD, 2K, 4K |

---

## 💡 USAGE EXAMPLES

### Mobile First Pattern:
```css
/* BASE - Small Mobile < 576px */
.element {
  padding: 16px;
  font-size: 14px;
}

/* Large Mobile ≥ 576px */
@media (min-width: 576px) {
  .element {
    padding: 20px;
  }
}

/* Tablet Portrait ≥ 768px */
@media (min-width: 768px) {
  .element {
    padding: 24px;
    font-size: 16px;
  }
}

/* Tablet Landscape ≥ 992px */
@media (min-width: 992px) {
  .element {
    padding: 32px;
  }
}

/* Desktop ≥ 1200px */
@media (min-width: 1200px) {
  .element {
    padding: 40px;
    font-size: 18px;
  }
}

/* Large Desktop ≥ 1400px */
@media (min-width: 1400px) {
  .element {
    padding: 48px;
  }
}
```

### Using CSS Variables:
```css
@media (min-width: var(--bp-tablet-sm)) {
  /* Tablet styles */
}

@media (min-width: var(--bp-desktop-sm)) {
  /* Desktop styles */
}
```

---

## 🔧 CSS VARIABLES

```css
:root {
  /* Mobile Group */
  --bp-mobile-sm: 0px;      /* Base - no media query needed */
  --bp-mobile-lg: 576px;    /* sm */

  /* Tablet Group */
  --bp-tablet-sm: 768px;    /* md */
  --bp-tablet-lg: 992px;    /* lg */

  /* Desktop Group */
  --bp-desktop-sm: 1200px;  /* xl */
  --bp-desktop-lg: 1400px;  /* xxl */
}
```

---

## ⚠️ IMPORTANT NOTES

1. **Mobile First:** Always start with base styles (< 576px), then add `@media (min-width: ...)` for larger screens
2. **Base = No Media Query:** Styles without media query = Small Mobile (< 576px)
3. **Bootstrap Compatible:** These breakpoints match Bootstrap 5 standard
4. **Consistent Naming:** Use `pv2-` prefix for all ProductsV2 classes

---

## 📝 CHANGELOG

- **2025-10-27:** Updated from old breakpoints (1024px, 1280px) to Bootstrap 5 standard (992px, 1200px, 1400px)
- **Previous:** 576px, 768px, 1024px, 1280px
- **Current:** 576px, 768px, 992px, 1200px, 1400px
