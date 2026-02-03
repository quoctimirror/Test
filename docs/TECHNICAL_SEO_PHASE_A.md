# Technical SEO - Phase A Implementation Guide

## Overview
Technical SEO cho mirrorfuturediamond.com: SEO-friendly routes, dynamic meta tags, structured data, sitemap, robots.txt, va pre-rendering.

---

## 1. Doi UUID Routes sang SEO-friendly

### Viec can lam
- Mo file `src/constants/routes.js`
- Thay doi tat ca UUID paths thanh SEO-friendly paths
- Tim va fix tat ca hardcoded UUID trong project (dung grep/search)

### Bang chuyen doi

| Route Key | Cu (UUID) | Moi (SEO-friendly) |
|---|---|---|
| WELCOME | `/5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b` | `/welcome` |
| HOME_PAGE | `/8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d` | `/home` |
| AUTH | `/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d` | `/auth` |
| AUTH_LOGIN | `/a1b2c3d4-.../login` | `/auth/login` |
| AUTH_REGISTER | `/a1b2c3d4-.../register` | `/auth/register` |
| FORGOT_PASSWORD | `/a1b2c3d4-.../forgot-password` | `/auth/forgot-password` |
| PRODUCTS | `/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e` | `/products` |
| COLLECTIONS | `/d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a` | `/collections` |
| COLLECTION_DETAIL | `/d4e5f6a7-.../:collectionId` | `/collection/:collectionId` |
| SERVICES | `/e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b` | `/services` |
| SERVICES_DETAIL | `/e5f6a7b8-.../detail` | `/services/:serviceId` |
| SUPPORT | `/f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c` | `/support` |
| SUPPORT_DETAIL | `/f6a7b8c9-.../detail` | `/support/:supportId` |
| CONTACT | `/a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d` | `/contact` |
| ABOUT | `/b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e` | `/about` |
| LOCATIONS | `/c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f` | `/locations` |
| NEWS | `/d0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a` | `/news` |
| NEWS_DETAIL | `/d0e1f2a3-.../:slug` | `/news/:slug` |
| ALL_GEMS | `/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f` | `/all-gems` |
| PRODUCT_DETAIL | `/f4g5h6i7-.../:productId` | `/product/:productId` |
| USER_PROFILE | `/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b` | `/profile` |
| PRODUCTS_V2 | `/7b8e9f0a-3c4d-5e6f-7a8b-9c0d1e2f3a4b` | `/products-v2` |
| PRODUCTS_LEFT | `/4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a` | `/products-left` |
| UNIVERSE_FINAL | `/1f2e3d4c-5b6a-7c8d-9e0f-1a2b3c4d5e6f` | `/universe` |
| NEWS_V2 | `/5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d` | `/news-v2` |

### Files can fix hardcoded UUID
- `src/services/podApi.js` - dong redirect login
- `src/components/admin-dashboard/PackagePrintingKit.jsx` - QR code URL
- `public/ty_card/thank-you-card-editor.html` - QR code URL

### Ket qua
- Tat ca 77+ files import tu `src/constants/routes.js` se tu dong dung route moi
- URLs tren browser sach, de doc, SEO-friendly
- Google bot co the hieu noi dung trang tu URL

---

## 2. Dynamic Meta Tags (react-helmet-async)

### Viec can lam

#### 2.1 Cai dat package
```bash
npm install react-helmet-async --legacy-peer-deps
```

#### 2.2 Wrap App voi HelmetProvider
File: `src/App.jsx`
```jsx
import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* ... */}
      </BrowserRouter>
    </HelmetProvider>
  );
}
```

#### 2.3 Tao SEO component
File: `src/components/seo/SEO.jsx`

Props:
- `title` - Tieu de trang (se ghep voi "| MIRROR FUTURE DIAMOND")
- `description` - Mo ta trang
- `image` - Anh OG (default: favicon-512.png)
- `url` - Path cua trang (VD: "/products")
- `type` - Loai trang: "website" | "product" | "article"
- `noindex` - true = an khoi Google

Output tags:
- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- `<meta property="og:*">` (type, title, description, image, url, site_name)
- `<meta name="twitter:*">` (card, title, description, image)

#### 2.4 Tao StructuredData component
File: `src/components/seo/StructuredData.jsx`

Exports:
- `OrganizationSchema` - Thong tin cong ty (name, url, logo, address, contact)
- `LocalBusinessSchema` - Cua hang (JewelryStore type, gio mo cua, dia chi)
- `ProductSchema({ product })` - San pham (name, description, image, price, brand)
- `BreadcrumbSchema({ items })` - Breadcrumb navigation
- `WebSiteSchema` - Website voi SearchAction

#### 2.5 Them SEO vao cac trang

| Trang | Title | Structured Data |
|---|---|---|
| WelcomePage | "Premium Diamond Jewelry" | OrganizationSchema |
| HomePage | "Lab Grown Diamond Jewelry" | WebSiteSchema |
| ProductsPage | "Lab Grown Diamond Products" | - |
| ProductDetailPage | Dynamic (tu product.name) | ProductSchema + BreadcrumbSchema |
| CollectionPage | "Diamond Collections" | - |
| ServicesPage | "Diamond Services" | - |
| AboutPage | "About Us" | - |
| ContactPage | "Contact Us" | LocalBusinessSchema |
| AllNewsPage | "News & Stories" | - |
| LocationsPage | "Store Locations" | LocalBusinessSchema |
| SupportPage | "Customer Support" | - |
| AllGemsPage | "All Gems" | - |

#### Cach su dung trong trang
```jsx
import SEO from "@components/seo/SEO";
import { ProductSchema } from "@components/seo/StructuredData";

const MyPage = () => {
  return (
    <div>
      <SEO
        title="Tieu de trang"
        description="Mo ta ngan gon ve trang"
        url="/duong-dan-trang"
      />
      {/* Noi dung trang */}
    </div>
  );
};
```

### Ket qua
- Moi trang co title, description, OG tags rieng
- Share len Facebook/Twitter hien dung thong tin
- Google hieu noi dung tung trang
- Product detail page co Product schema (rich results tren Google)

---

## 3. robots.txt & sitemap.xml

### Viec can lam

#### 3.1 robots.txt
File: `public/robots.txt`
```
User-agent: *
Allow: /
Disallow: /auth
Disallow: /dashboard
Disallow: /inventory
Disallow: /pod-admin
Disallow: /pod-partner
Disallow: /profile
Disallow: /db-explorer

Sitemap: https://www.mirrorfuturediamond.com/sitemap.xml
```

#### 3.2 sitemap.xml
File: `public/sitemap.xml`

Bao gom cac trang public:
- `/` (priority: 1.0, weekly)
- `/home` (priority: 0.9, weekly)
- `/welcome` (priority: 0.8, monthly)
- `/products` (priority: 0.9, weekly)
- `/collections` (priority: 0.9, weekly)
- `/all-gems` (priority: 0.8, weekly)
- `/services` (priority: 0.8, monthly)
- `/support` (priority: 0.7, monthly)
- `/contact` (priority: 0.8, monthly)
- `/about` (priority: 0.7, monthly)
- `/news` (priority: 0.8, weekly)
- `/locations` (priority: 0.7, monthly)
- `/immersive-showroom` (priority: 0.8, monthly)
- `/book-an-appointment` (priority: 0.8, monthly)
- `/find-your-piece` (priority: 0.7, monthly)

### Ket qua
- Google bot biet trang nao can index, trang nao khong
- Sitemap giup Google crawl nhanh hon
- Kiem tra: truy cap `/robots.txt` va `/sitemap.xml` tren browser

---

## 4. Pre-rendering (Post-build Script)

### Viec can lam

#### 4.1 Cai dat Puppeteer
```bash
npm install puppeteer --save-dev --legacy-peer-deps
```

#### 4.2 Tao script pre-render
File: `scripts/prerender.mjs`

Script se:
1. Start local server tu thu muc `dist/`
2. Dung Puppeteer mo tung route
3. Cho React render xong (bao gom meta tags tu react-helmet-async)
4. Luu HTML da render vao `dist/[route]/index.html`

#### 4.3 Them script vao package.json
```json
{
  "scripts": {
    "build": "vite build",
    "build:prerender": "vite build && node scripts/prerender.mjs"
  }
}
```

#### 4.4 Chay pre-render
```bash
npm run build:prerender
```

### Luu y
- `vite-plugin-prerender` KHONG tuong thich voi Vite 7 (loi ESM require)
- Dung Puppeteer script rieng thay the
- Chi pre-render trang static, trang dynamic (product detail) can SSR (Phase B)

### Ket qua
- Cac trang static co HTML day du khi Google crawl
- Meta tags, structured data co san trong HTML source
- Khong can doi JavaScript load de thay noi dung

---

## 5. Kiem tra (Verification)

### Build
```bash
npm run build          # Build binh thuong
npm run build:prerender  # Build + pre-render
```

### Kiem tra meta tags
1. Mo trang trong browser
2. View Page Source (Ctrl+U)
3. Kiem tra co `<title>`, `<meta name="description">`, `<meta property="og:*">`

### Kiem tra structured data
- https://search.google.com/test/rich-results
- Dan URL hoac paste HTML source

### Kiem tra OG tags
- https://www.opengraph.xyz/
- Dan URL de xem preview khi share

### Kiem tra robots.txt & sitemap
- Truy cap: `https://www.mirrorfuturediamond.com/robots.txt`
- Truy cap: `https://www.mirrorfuturediamond.com/sitemap.xml`

---

## 6. Cau truc files

```
src/
  components/
    seo/
      SEO.jsx              # Reusable SEO meta tags component
      StructuredData.jsx   # JSON-LD structured data schemas
  constants/
    routes.js              # SEO-friendly route definitions
  pages/
    HomePage.jsx           # + SEO + WebSiteSchema
    WelcomePage.jsx        # + SEO + OrganizationSchema
    ProductsPage.jsx       # + SEO
    ProductDetailPage.jsx  # + SEO + ProductSchema + BreadcrumbSchema
    CollectionPage.jsx     # + SEO
    ServicesPage.jsx       # + SEO
    AboutPage.jsx          # + SEO
    ContactPage.jsx        # + SEO + LocalBusinessSchema
    AllNewsPage.jsx        # + SEO
    LocationsPage.jsx      # + SEO + LocalBusinessSchema
    SupportPage.jsx        # + SEO
    AllGemsPage.jsx        # + SEO
  App.jsx                  # + HelmetProvider wrapper

public/
  robots.txt               # Enabled, Disallow private routes
  sitemap.xml              # 15 public pages

scripts/
  prerender.mjs            # Puppeteer pre-rendering script

index.html                 # Updated Organization schema
package.json               # + react-helmet-async, puppeteer, build:prerender script
```

---

## 7. Phase B (Tuong lai)

- Dynamic sitemap tu backend (product detail pages)
- SSR cho product detail pages (Next.js hoac Remix)
- Canonical URLs cho paginated pages
- hreflang tags neu co nhieu ngon ngu
- Image sitemap cho product images
- News sitemap cho bai viet
