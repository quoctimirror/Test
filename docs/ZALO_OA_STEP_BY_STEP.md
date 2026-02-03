# Zalo OA - Huong Dan Trien Khai Chi Tiet Tung Buoc

> Doc kem voi `ZALO_OA_INTEGRATION.md` (tai lieu ky thuat)

---

## PHASE 1: DANG KY & THIET LAP TAI KHOAN

Muc tieu: Co duoc App ID, Secret Key, OA ID, va OA Secret de bat dau lap trinh.

---

### Buoc 1.1: Tao Zalo Official Account

**Tai sao:** OA la "trang doanh nghiep" tren Zalo. Khach hang se follow OA nay de nhan tin, nhan thong bao.

**Thao tac:**

1. Mo trinh duyet, truy cap: **https://oa.zalo.me/home**
2. Dang nhap bang tai khoan Zalo ca nhan (so dien thoai)
3. Nhan **"Tao Official Account"**
4. Dien thong tin:
   - Ten OA: `Mirror Future Diamond`
   - Danh muc: `Trang suc` hoac `Thoi trang & Phu kien`
   - Mo ta: `Premium lab-grown diamond jewelry. Awakening Luxury through Your Senses.`
   - Anh dai dien: Upload logo Mirror Diamond (512x512px, PNG)
   - Anh bia: Upload banner (1920x640px)
5. Nhan **"Tao"**

**Ket qua:** Co 1 OA voi trang thai **"Chua xac minh"**. OA chua xac minh van gui/nhan tin duoc nhung bi gioi han.

---

### Buoc 1.2: Xac minh doanh nghiep cho OA

**Tai sao:** OA xac minh moi duoc:
- Hien thi tick xanh
- Gui ZNS (thong bao tu dong)
- Gioi han API cao hon
- Khach hang tin tuong hon

**Thao tac:**

1. Trong trang quan ly OA, vao **Cai dat > Xac minh OA**
2. Chon loai: **Doanh nghiep**
3. Upload giay to:
   - Giay phep kinh doanh (ban scan ro net)
   - CMND/CCCD nguoi dai dien phap luat
   - (Tuy chon) Giay uy quyen neu nguoi nop khong phai dai dien phap luat
4. Dien thong tin doanh nghiep:
   - Ten cong ty dung tren giay phep
   - Ma so thue
   - Dia chi tru so
   - So dien thoai lien he
5. Nhan **"Gui yeu cau xac minh"**
6. **Cho duyet: 1-3 ngay lam viec**

**Ket qua:** OA co tick xanh, mo khoa full tinh nang.

> **Luu y:** Trong thoi gian cho duyet, van co the lam tiep cac buoc tiep theo (tao App, code backend).

---

### Buoc 1.3: Tao Zalo App tren Developer Portal

**Tai sao:** App la "cau noi" giua code cua ban va Zalo API. Moi App co App ID va Secret Key rieng.

**Thao tac:**

1. Truy cap: **https://developers.zalo.me**
2. Dang nhap cung tai khoan Zalo da tao OA
3. Nhan **"Tao ung dung moi"** (hoac "Create Application")
4. Dien thong tin:
   - Ten ung dung: `Mirror Diamond CRM`
   - Mo ta: `Customer care integration for Mirror Future Diamond`
   - Domain: `mirrorfuturediamond.com`
   - Loai ung dung: Chon **"Official Account API"**
5. Nhan **"Tao"**

**Ket qua:** Duoc cap:

```
App ID:     xxxxxxxxxxxxxxxxxx    (chuoi so)
Secret Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  (chuoi hex)
```

6. **Ghi lai 2 gia tri nay** - can dung cho tat ca buoc sau.

---

### Buoc 1.4: Lien ket OA voi App

**Tai sao:** App can quyen truy cap OA de gui/nhan tin thay mat OA.

**Thao tac:**

1. Trong trang **developers.zalo.me**, vao App vua tao
2. Menu ben trai, chon **"Official Account"** hoac **"Ket noi OA"**
3. Nhan **"Lien ket Official Account"**
4. Chon OA `Mirror Future Diamond` tu danh sach
5. Cap quyen cho App:
   - [x] Gui tin nhan chu dong
   - [x] Gui tin nhan tra loi
   - [x] Quan ly nguoi quan tam
   - [x] Gui thong bao ZNS
   - [x] Quan ly bai viet
6. Nhan **"Xac nhan"**

**Ket qua:** App da ket noi voi OA, co them `OA ID`.

```
OA ID:      xxxxxxxxxxxxxxxxxxxx
OA Secret:  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

7. **Ghi lai OA ID va OA Secret** - can cho webhook verification.

---

### Buoc 1.5: Xac minh Domain

**Tai sao:** Zalo yeu cau xac minh domain de dam bao ban la chu website. Can cho webhook va callback URL.

**Thao tac:**

1. Trong **developers.zalo.me** > App > **"Cai dat"** > **"Verify Domain"**
2. Nhap domain: `mirrorfuturediamond.com`
3. Zalo cung cap 2 cach xac minh:

**Cach A: Upload file (de hon)**
- Tai file `verifyforza_xxxxx.html` tu Zalo
- Upload file nay vao thu muc `public/` cua project:
  ```
  /home/dangnam/mirror-diamond-website/public/verifyforza_xxxxx.html
  ```
- Deploy len production
- Nhan **"Xac minh"** tren Zalo Portal
- Zalo se truy cap `https://mirrorfuturediamond.com/verifyforza_xxxxx.html` de kiem tra

**Cach B: DNS TXT Record**
- Them TXT record vao DNS cua domain:
  ```
  Type:  TXT
  Name:  @
  Value: zalo-verification=xxxxxxxxxxxxxxxx
  ```
- Cho DNS propagate (5-30 phut)
- Nhan **"Xac minh"**

**Ket qua:** Domain hien thi tick xanh "Da xac minh" tren Zalo Portal.

---

### Buoc 1.6: Luu cac credentials vao Backend

**Tai sao:** Backend can cac gia tri nay de goi Zalo API.

**Thao tac:**

1. Tao/cap nhat file environment tren backend server (AWS AppRunner):

```properties
# Zalo OA Configuration
ZALO_APP_ID=1234567890123456
ZALO_APP_SECRET=abcdef1234567890abcdef1234567890
ZALO_OA_ID=9876543210987654
ZALO_OA_SECRET=fedcba0987654321fedcba0987654321
ZALO_REDIRECT_URI=https://nsa4fef6um.ap-southeast-1.awsapprunner.com/api/zalo/oauth/callback
```

2. Dam bao cac gia tri nay **KHONG** commit vao git. Them vao `.gitignore` hoac dung secret manager cua AWS.

**Ket qua:** Backend co du thong tin de bat dau ket noi voi Zalo.

---

### Tong ket Phase 1

Sau khi hoan thanh, ban co:

```
✅ Zalo OA "Mirror Future Diamond" (dang cho/da xac minh)
✅ Zalo App "Mirror Diamond CRM"
✅ App ID + Secret Key
✅ OA ID + OA Secret
✅ Domain da xac minh
✅ Credentials luu tren backend server
```

---

## PHASE 2: BACKEND - AUTHENTICATION & TOKEN MANAGEMENT

Muc tieu: Backend co the lay va tu dong lam moi Access Token de goi Zalo API.

---

### Buoc 2.1: Tao database tables cho Zalo

**Tai sao:** Can luu token, follower, tin nhan, lich su ZNS vao database.

**Thao tac:**

1. Tao migration file moi trong backend project (Spring Boot):

```sql
-- V__zalo_oa_tables.sql

-- 1. Bang luu Zalo OAuth tokens
CREATE TABLE zalo_tokens (
    id BIGSERIAL PRIMARY KEY,
    oa_id VARCHAR(50) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Bang luu followers
CREATE TABLE zalo_followers (
    id BIGSERIAL PRIMARY KEY,
    zalo_user_id VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    mirror_user_id BIGINT,           -- lien ket voi users table
    tags TEXT,                        -- JSON array
    is_following BOOLEAN DEFAULT true,
    followed_at TIMESTAMP,
    unfollowed_at TIMESTAMP,
    last_message_at TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- 3. Bang luu tin nhan
CREATE TABLE zalo_messages (
    id BIGSERIAL PRIMARY KEY,
    zalo_message_id VARCHAR(100),
    zalo_user_id VARCHAR(100) NOT NULL,
    direction VARCHAR(10) NOT NULL,   -- 'INCOMING' | 'OUTGOING'
    message_type VARCHAR(20) NOT NULL, -- 'text','image','file','sticker','template'
    content TEXT,
    attachment_url TEXT,
    sent_by_staff_id BIGINT,         -- nhan vien gui
    is_auto_reply BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'SENT',
    seen_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Bang log ZNS
CREATE TABLE zalo_zns_logs (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    template_name VARCHAR(255),
    template_data JSONB,
    trigger_type VARCHAR(50),        -- 'ORDER','APPOINTMENT','POD_SCAN','MANUAL'
    trigger_entity_id VARCHAR(100),
    zns_message_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Bang tags
CREATE TABLE zalo_tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7),
    description TEXT,
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_zalo_tokens_active ON zalo_tokens(is_active, expires_at);
CREATE INDEX idx_zalo_followers_zalo_id ON zalo_followers(zalo_user_id);
CREATE INDEX idx_zalo_followers_phone ON zalo_followers(phone);
CREATE INDEX idx_zalo_messages_user ON zalo_messages(zalo_user_id, created_at DESC);
CREATE INDEX idx_zns_logs_phone ON zalo_zns_logs(phone, created_at DESC);
CREATE INDEX idx_zns_logs_status ON zalo_zns_logs(status);
```

2. Chay migration:
   - Neu dung Flyway: dat file vao `src/main/resources/db/migration/`
   - Neu dung Liquibase: them changeset tuong ung
   - Neu lam thu cong: chay SQL truc tiep tren PostgreSQL

**Ket qua:** Database co 5 bang moi san sang luu du lieu Zalo.

---

### Buoc 2.2: Tao Java entities va repositories

**Tai sao:** Spring Boot can Entity class de tuong tac voi database.

**Thao tac:**

Tao cac file Java trong backend project:

```
src/main/java/com/mirror/diamond/
├── zalo/
│   ├── entity/
│   │   ├── ZaloToken.java
│   │   ├── ZaloFollower.java
│   │   ├── ZaloMessage.java
│   │   ├── ZaloZnsLog.java
│   │   └── ZaloTag.java
│   ├── repository/
│   │   ├── ZaloTokenRepository.java
│   │   ├── ZaloFollowerRepository.java
│   │   ├── ZaloMessageRepository.java
│   │   ├── ZaloZnsLogRepository.java
│   │   └── ZaloTagRepository.java
│   ├── service/
│   │   ├── ZaloTokenManager.java       -- Quan ly token
│   │   ├── ZaloOAService.java          -- Gui/nhan tin nhan
│   │   ├── ZaloZNSService.java         -- Gui ZNS thong bao
│   │   └── ZaloFollowerService.java    -- Quan ly followers
│   ├── controller/
│   │   ├── ZaloWebhookController.java  -- Nhan events tu Zalo
│   │   ├── ZaloOAController.java       -- API cho frontend admin
│   │   └── ZaloOAuthController.java    -- OAuth flow
│   ├── dto/
│   │   ├── ZaloWebhookEvent.java
│   │   ├── ZaloMessageRequest.java
│   │   ├── ZaloZNSRequest.java
│   │   └── ZaloTokenResponse.java
│   └── config/
│       └── ZaloConfig.java             -- Doc env variables
```

**Vi du ZaloToken entity:**

```java
@Entity
@Table(name = "zalo_tokens")
public class ZaloToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "oa_id")
    private String oaId;

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters, setters, constructor...

    public boolean isExpiringSoon() {
        // Het han trong 10 phut toi
        return LocalDateTime.now().plusMinutes(10).isAfter(expiresAt);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
```

**Vi du ZaloTokenRepository:**

```java
@Repository
public interface ZaloTokenRepository extends JpaRepository<ZaloToken, Long> {

    @Query("SELECT t FROM ZaloToken t WHERE t.isActive = true ORDER BY t.createdAt DESC")
    Optional<ZaloToken> findLatestActive();

    @Modifying
    @Query("UPDATE ZaloToken t SET t.isActive = false WHERE t.id != :id")
    void deactivateAllExcept(@Param("id") Long id);
}
```

**Ket qua:** Backend co cac class Java de thao tac voi database.

---

### Buoc 2.3: Implement ZaloConfig

**Tai sao:** Doc env variables vao 1 cho de cac service khac dung.

**Thao tac:**

```java
@Configuration
@ConfigurationProperties(prefix = "zalo")
public class ZaloConfig {
    private String appId;
    private String appSecret;
    private String oaId;
    private String oaSecret;
    private String redirectUri;

    // Zalo API URLs (khong doi)
    public static final String OAUTH_URL = "https://oauth.zaloapp.com/v4/oa/permission";
    public static final String TOKEN_URL = "https://oauth.zaloapp.com/v4/oa/access_token";
    public static final String API_URL = "https://openapi.zalo.me/v3.0/oa";
    public static final String ZNS_URL = "https://business.openapi.zalo.me/message/template";

    // Getters & Setters...
}
```

Trong `application.properties`:

```properties
zalo.app-id=${ZALO_APP_ID}
zalo.app-secret=${ZALO_APP_SECRET}
zalo.oa-id=${ZALO_OA_ID}
zalo.oa-secret=${ZALO_OA_SECRET}
zalo.redirect-uri=${ZALO_REDIRECT_URI}
```

---

### Buoc 2.4: Implement OAuth Flow (lay token lan dau)

**Tai sao:** Lan dau ket noi, admin can bam nut de cap quyen cho App truy cap OA. Zalo se tra ve authorization code, backend doi code lay token.

**Flow chi tiet:**

```
Admin browser                    Backend                         Zalo
    │                              │                               │
    │  1. GET /api/zalo/authorize  │                               │
    │─────────────────────────────▶│                               │
    │                              │                               │
    │  2. Redirect URL             │                               │
    │◀─────────────────────────────│                               │
    │                              │                               │
    │  3. Mo URL Zalo OAuth        │                               │
    │─────────────────────────────────────────────────────────────▶│
    │                              │                               │
    │  4. Admin bam "Cho phep"     │                               │
    │◀─────────────────────────────────────────────────────────────│
    │     Redirect ve callback     │                               │
    │     voi ?code=xxxxx          │                               │
    │                              │                               │
    │  5. GET /api/zalo/oauth/callback?code=xxxxx                  │
    │─────────────────────────────▶│                               │
    │                              │  6. POST /v4/oa/access_token  │
    │                              │  (doi code lay token)         │
    │                              │──────────────────────────────▶│
    │                              │                               │
    │                              │  7. access_token +            │
    │                              │     refresh_token             │
    │                              │◀──────────────────────────────│
    │                              │                               │
    │                              │  8. Luu token vao DB          │
    │                              │                               │
    │  9. Redirect ve admin page   │                               │
    │◀─────────────────────────────│                               │
    │     "Ket noi thanh cong!"    │                               │
```

**Thao tac:**

Tao `ZaloOAuthController.java`:

```java
@RestController
@RequestMapping("/api/zalo")
public class ZaloOAuthController {

    @Autowired
    private ZaloConfig config;

    @Autowired
    private ZaloTokenManager tokenManager;

    /**
     * Buoc 1-2: Tao URL de admin authorize
     * Frontend goi API nay, roi mo URL trong trinh duyet
     */
    @GetMapping("/authorize-url")
    public ResponseEntity<Map<String, String>> getAuthorizeUrl() {
        String url = ZaloConfig.OAUTH_URL
            + "?app_id=" + config.getAppId()
            + "&redirect_uri=" + URLEncoder.encode(config.getRedirectUri(), StandardCharsets.UTF_8);

        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * Buoc 5-9: Zalo redirect ve day sau khi admin bam "Cho phep"
     * Doi authorization code lay access_token + refresh_token
     */
    @GetMapping("/oauth/callback")
    public ResponseEntity<Void> handleOAuthCallback(
            @RequestParam("code") String authorizationCode,
            @RequestParam(value = "oa_id", required = false) String oaId) {

        try {
            // Buoc 6-7: Doi code lay token
            ZaloTokenResponse tokenResponse = exchangeCodeForToken(authorizationCode);

            // Buoc 8: Luu vao DB
            tokenManager.saveToken(
                oaId != null ? oaId : config.getOaId(),
                tokenResponse.getAccessToken(),
                tokenResponse.getRefreshToken(),
                tokenResponse.getExpiresIn()
            );

            // Buoc 9: Redirect ve admin page
            return ResponseEntity.status(302)
                .header("Location",
                    "https://www.mirrorfuturediamond.com/dashboard/admin/zalo?status=connected")
                .build();

        } catch (Exception e) {
            log.error("Zalo OAuth callback failed", e);
            return ResponseEntity.status(302)
                .header("Location",
                    "https://www.mirrorfuturediamond.com/dashboard/admin/zalo?status=error&message="
                    + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8))
                .build();
        }
    }

    /**
     * Goi Zalo API doi code lay token
     */
    private ZaloTokenResponse exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("secret_key", config.getAppSecret());

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("app_id", config.getAppId());
        body.add("code", code);
        body.add("grant_type", "authorization_code");

        ResponseEntity<ZaloTokenResponse> response = restTemplate.postForEntity(
            ZaloConfig.TOKEN_URL,
            new HttpEntity<>(body, headers),
            ZaloTokenResponse.class
        );

        if (response.getBody() == null || response.getBody().getAccessToken() == null) {
            throw new RuntimeException("Failed to get token from Zalo");
        }

        return response.getBody();
    }

    /**
     * Kiem tra trang thai ket noi
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        boolean connected = tokenManager.hasValidToken();
        return ResponseEntity.ok(Map.of(
            "connected", connected,
            "oaId", connected ? config.getOaId() : "",
            "tokenExpiresAt", connected ? tokenManager.getExpiresAt().toString() : ""
        ));
    }
}
```

**Ket qua:** Admin co the ket noi OA bang cach bam 1 nut tren Dashboard.

---

### Buoc 2.5: Implement Token Auto-Refresh

**Tai sao:** Access Token het han sau 1 gio. Can tu dong refresh truoc khi het han de API khong bi gian doan.

**Thao tac:**

Tao `ZaloTokenManager.java`:

```java
@Service
public class ZaloTokenManager {

    @Autowired
    private ZaloTokenRepository tokenRepo;

    @Autowired
    private ZaloConfig config;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * SCHEDULER: Chay moi 50 phut
     * Access Token het han sau 60 phut
     * -> Refresh truoc 10 phut de dam bao luon co token hop le
     */
    @Scheduled(fixedRate = 50 * 60 * 1000)  // 50 phut
    public void autoRefreshToken() {
        log.info("[Zalo] Checking token expiration...");

        Optional<ZaloToken> currentOpt = tokenRepo.findLatestActive();
        if (currentOpt.isEmpty()) {
            log.warn("[Zalo] No active token found. Admin needs to authorize.");
            return;
        }

        ZaloToken current = currentOpt.get();

        if (current.isExpiringSoon()) {
            log.info("[Zalo] Token expiring soon. Refreshing...");
            try {
                refreshToken(current);
                log.info("[Zalo] Token refreshed successfully.");
            } catch (Exception e) {
                log.error("[Zalo] Token refresh FAILED: {}", e.getMessage());
                // TODO: Gui alert cho admin qua email/Slack/Ably
            }
        } else {
            log.info("[Zalo] Token still valid. Expires at: {}", current.getExpiresAt());
        }
    }

    /**
     * Goi Zalo API de refresh token
     * Luu y: Moi refresh_token chi dung duoc 1 lan
     *        Zalo tra ve access_token MOI + refresh_token MOI
     */
    private void refreshToken(ZaloToken current) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("secret_key", config.getAppSecret());

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("app_id", config.getAppId());
        body.add("refresh_token", current.getRefreshToken());
        body.add("grant_type", "refresh_token");

        ResponseEntity<ZaloTokenResponse> response = restTemplate.postForEntity(
            ZaloConfig.TOKEN_URL,
            new HttpEntity<>(body, headers),
            ZaloTokenResponse.class
        );

        ZaloTokenResponse tokenRes = response.getBody();
        if (tokenRes == null || tokenRes.getAccessToken() == null) {
            throw new RuntimeException("Empty response from Zalo token refresh");
        }

        // Deactivate token cu
        current.setIsActive(false);
        tokenRepo.save(current);

        // Luu token moi
        ZaloToken newToken = new ZaloToken();
        newToken.setOaId(current.getOaId());
        newToken.setAccessToken(tokenRes.getAccessToken());
        newToken.setRefreshToken(tokenRes.getRefreshToken());
        newToken.setExpiresAt(LocalDateTime.now().plusSeconds(
            Long.parseLong(tokenRes.getExpiresIn())
        ));
        newToken.setIsActive(true);
        tokenRepo.save(newToken);
    }

    /**
     * Lay access token hien tai de goi API
     * Cac service khac goi method nay
     */
    public String getAccessToken() {
        ZaloToken token = tokenRepo.findLatestActive()
            .orElseThrow(() -> new RuntimeException(
                "No Zalo token available. Go to Admin > Zalo > Settings to connect."
            ));

        if (token.isExpired()) {
            // Thu refresh ngay
            refreshToken(token);
            token = tokenRepo.findLatestActive()
                .orElseThrow(() -> new RuntimeException("Token refresh failed"));
        }

        return token.getAccessToken();
    }

    public boolean hasValidToken() {
        return tokenRepo.findLatestActive()
            .map(t -> !t.isExpired())
            .orElse(false);
    }

    public void saveToken(String oaId, String accessToken,
                          String refreshToken, String expiresIn) {
        // Deactivate tat ca token cu
        tokenRepo.findLatestActive().ifPresent(t -> {
            t.setIsActive(false);
            tokenRepo.save(t);
        });

        ZaloToken newToken = new ZaloToken();
        newToken.setOaId(oaId);
        newToken.setAccessToken(accessToken);
        newToken.setRefreshToken(refreshToken);
        newToken.setExpiresAt(LocalDateTime.now().plusSeconds(
            Long.parseLong(expiresIn)
        ));
        newToken.setIsActive(true);
        tokenRepo.save(newToken);
    }
}
```

Dam bao `@EnableScheduling` trong main Application class:

```java
@SpringBootApplication
@EnableScheduling  // <-- Them dong nay
public class MirrorDiamondApplication {
    public static void main(String[] args) {
        SpringApplication.run(MirrorDiamondApplication.class, args);
    }
}
```

**Ket qua:** Token tu dong refresh moi 50 phut, khong bao gio het han trong luc su dung.

---

### Buoc 2.6: Test OAuth flow

**Thao tac:**

1. Deploy backend len AWS AppRunner (hoac test local)
2. Goi API:
   ```
   GET http://localhost:8082/api/zalo/authorize-url
   ```
3. Mo URL tra ve trong trinh duyet
4. Dang nhap Zalo, bam **"Cho phep"**
5. Zalo redirect ve callback URL
6. Kiem tra database: bang `zalo_tokens` phai co 1 record moi
7. Goi API kiem tra:
   ```
   GET http://localhost:8082/api/zalo/status
   ```
   Ket qua: `{ "connected": true, "oaId": "xxx", "tokenExpiresAt": "..." }`

**Ket qua:** OAuth flow hoat dong end-to-end.

---

### Tong ket Phase 2

```
✅ 5 bang database da tao
✅ Java entities + repositories
✅ ZaloConfig doc env variables
✅ OAuth flow: authorize URL -> callback -> luu token
✅ Token auto-refresh moi 50 phut
✅ Test thanh cong: co token trong DB
```

---

## PHASE 3: BACKEND - WEBHOOK (NHAN SU KIEN TU ZALO)

Muc tieu: Backend nhan duoc tin nhan khi khach gui tin cho OA, va tu dong phan hoi.

---

### Buoc 3.1: Implement Webhook Controller

**Tai sao:** Khi khach hang gui tin nhan cho OA, Zalo gui POST request den webhook URL cua ban. Backend can xu ly request nay.

**Thao tac:**

Tao `ZaloWebhookController.java`:

```java
@RestController
@RequestMapping("/api/zalo")
@Slf4j
public class ZaloWebhookController {

    @Autowired
    private ZaloConfig config;

    @Autowired
    private ZaloOAService oaService;

    @Autowired
    private ZaloFollowerService followerService;

    /**
     * Zalo gui POST request moi khi co su kien
     *
     * QUAN TRONG:
     * - Phai tra 200 OK trong vong 2 GIAY
     * - Neu khong, Zalo retry: 30s -> 5m -> 15m -> 30m -> 1h
     * - Xu ly logic nang phai lam ASYNC
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-ZEvent-Signature", required = false) String signature,
            @RequestHeader(value = "X-ZEvent-Ts", required = false) String timestamp) {

        // TRA 200 NGAY LAP TUC
        ResponseEntity<Map<String, String>> ok =
            ResponseEntity.ok(Map.of("status", "received"));

        // Verify signature (bao mat)
        if (signature != null && !verifySignature(rawBody, signature, timestamp)) {
            log.warn("[Zalo Webhook] Invalid signature! Possible spoofing.");
            return ok; // Van tra 200 de tranh Zalo retry, nhung KHONG xu ly
        }

        // Xu ly ASYNC - khong block response
        CompletableFuture.runAsync(() -> {
            try {
                processWebhookEvent(rawBody);
            } catch (Exception e) {
                log.error("[Zalo Webhook] Error processing event: {}", e.getMessage(), e);
            }
        });

        return ok;
    }

    /**
     * Verify webhook signature
     * Formula: SHA256(app_id + body + timestamp + oa_secret)
     */
    private boolean verifySignature(String body, String signature, String timestamp) {
        try {
            String data = config.getAppId() + body + timestamp + config.getOaSecret();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            String computed = "mac=" + bytesToHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("[Zalo Webhook] Signature verification error", e);
            return false;
        }
    }

    /**
     * Xu ly tung loai event
     */
    private void processWebhookEvent(String rawBody) {
        JsonObject event = JsonParser.parseString(rawBody).getAsJsonObject();
        String eventName = event.get("event_name").getAsString();

        log.info("[Zalo Webhook] Event: {}", eventName);

        switch (eventName) {
            case "user_send_text":
                handleUserSendText(event);
                break;
            case "user_send_image":
                handleUserSendImage(event);
                break;
            case "follow":
                handleFollow(event);
                break;
            case "unfollow":
                handleUnfollow(event);
                break;
            case "user_seen_message":
                handleUserSeen(event);
                break;
            default:
                log.info("[Zalo Webhook] Unhandled event: {}", eventName);
        }
    }

    private void handleUserSendText(JsonObject event) {
        String userId = event.getAsJsonObject("sender").get("id").getAsString();
        String text = event.getAsJsonObject("message").get("text").getAsString();
        String msgId = event.getAsJsonObject("message").get("msg_id").getAsString();

        // 1. Luu tin nhan vao DB
        oaService.saveIncomingMessage(userId, msgId, "text", text);

        // 2. Cap nhat follower stats
        followerService.updateLastMessage(userId);

        // 3. Auto-reply logic
        oaService.processAutoReply(userId, text, msgId);

        // 4. Notify staff qua real-time (Ably)
        oaService.notifyStaffNewMessage(userId, text);
    }

    private void handleFollow(JsonObject event) {
        String userId = event.getAsJsonObject("follower").get("id").getAsString();

        // 1. Luu follower
        followerService.handleNewFollower(userId);

        // 2. Gui tin chao mung
        oaService.sendWelcomeMessage(userId);
    }

    private void handleUnfollow(JsonObject event) {
        String userId = event.getAsJsonObject("follower").get("id").getAsString();
        followerService.handleUnfollow(userId);
    }

    // ... tuong tu cho cac event khac
}
```

**Ket qua:** Backend co endpoint nhan webhook tu Zalo.

---

### Buoc 3.2: Dang ky Webhook URL tren Zalo Portal

**Thao tac:**

1. Vao **developers.zalo.me** > App > **"Webhook"**
2. Nhap Webhook URL:
   ```
   https://nsa4fef6um.ap-southeast-1.awsapprunner.com/api/zalo/webhook
   ```
   > Hoac neu da co custom domain:
   > `https://api.mirrorfuturediamond.com/api/zalo/webhook`

3. Bat cac event can nhan:

   | Event | Bat/Tat | Mo ta |
   |-------|---------|-------|
   | `user_send_text` | ✅ ON | Khach gui text |
   | `user_send_image` | ✅ ON | Khach gui hinh |
   | `user_send_file` | ✅ ON | Khach gui file |
   | `user_send_sticker` | ✅ ON | Khach gui sticker |
   | `user_send_audio` | ✅ ON | Khach gui voice |
   | `follow` | ✅ ON | Khach follow OA |
   | `unfollow` | ✅ ON | Khach unfollow |
   | `user_received_message` | ✅ ON | Khach nhan tin |
   | `user_seen_message` | ✅ ON | Khach da doc |
   | `oa_send_text` | ✅ ON | OA gui text |
   | `oa_send_image` | ✅ ON | OA gui hinh |

4. Nhan **"Luu"**
5. Zalo se gui test request den webhook URL de verify

**Ket qua:** Zalo bat dau gui events den backend.

---

### Buoc 3.3: Implement Auto-Reply Logic

**Tai sao:** Tu dong tra loi cac cau hoi thuong gap, giam tai cho nhan vien.

**Thao tac:**

Trong `ZaloOAService.java`, them method:

```java
public void processAutoReply(String userId, String text, String msgId) {
    String lowerText = text.toLowerCase().trim();

    // Ngoai gio lam viec (truoc 8h hoac sau 21h)
    int hour = LocalTime.now().getHour();
    if (hour < 8 || hour >= 21) {
        sendTextMessage(userId,
            "Cam on ban da lien he Mirror Future Diamond! 💎\n\n" +
            "Hien tai ngoai gio lam viec.\n" +
            "Chung toi se phan hoi ban vao gio hanh chinh (8:00 - 21:00).\n\n" +
            "Neu can gap, vui long goi: 1900-xxx-xxx"
        );
        return;
    }

    // Keyword matching
    if (containsAny(lowerText, "gia", "bao nhieu", "price", "cost")) {
        sendTextMessage(userId,
            "Ban co the tham khao san pham va gia tai:\n" +
            "👉 https://www.mirrorfuturediamond.com/products\n\n" +
            "Hoac cho phut, nhan vien se tu van chi tiet cho ban ngay!"
        );
    } else if (containsAny(lowerText, "lich hen", "dat hen", "appointment", "book")) {
        sendTextMessage(userId,
            "Ban co the dat lich hen tu van tai:\n" +
            "👉 https://www.mirrorfuturediamond.com/book-an-appointment\n\n" +
            "Hoac cho tin nhan, chung toi se sap xep lich cho ban!"
        );
    } else if (containsAny(lowerText, "dia chi", "cua hang", "o dau", "location")) {
        sendTextMessage(userId,
            "He thong cua hang Mirror Future Diamond:\n" +
            "👉 https://www.mirrorfuturediamond.com/locations\n\n" +
            "Chao don ban ghe tham!"
        );
    }
    // Neu khong match keyword nao -> khong reply tu dong
    // Nhan vien se tra loi thu cong qua Admin Dashboard
}

private boolean containsAny(String text, String... keywords) {
    for (String kw : keywords) {
        if (text.contains(kw)) return true;
    }
    return false;
}
```

**Ket qua:** OA tu dong tra loi cac cau hoi ve gia, lich hen, dia chi + ngoai gio lam viec.

---

### Buoc 3.4: Implement gui tin nhan (OA -> User)

**Thao tac:**

Trong `ZaloOAService.java`:

```java
@Service
public class ZaloOAService {

    @Autowired
    private ZaloTokenManager tokenManager;

    @Autowired
    private ZaloMessageRepository messageRepo;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Gui tin nhan text cho user
     * Loai: "cs" (customer service) - yeu cau user da nhan tin truoc trong 24h
     */
    public String sendTextMessage(String userId, String text) {
        String token = tokenManager.getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("access_token", token);

        Map<String, Object> body = Map.of(
            "recipient", Map.of("user_id", userId),
            "message", Map.of("text", text)
        );

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                ZaloConfig.API_URL + "/message/cs",
                new HttpEntity<>(body, headers),
                Map.class
            );

            // Luu tin nhan ra DB
            String msgId = extractMsgId(response.getBody());
            saveOutgoingMessage(userId, msgId, "text", text, null, false);

            return msgId;
        } catch (Exception e) {
            log.error("[Zalo] Failed to send message to {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to send Zalo message", e);
        }
    }

    /**
     * Gui danh sach san pham (dang list template)
     */
    public void sendProductList(String userId, List<Product> products) {
        List<Map<String, Object>> elements = products.stream()
            .limit(5) // Zalo gioi han 5 items
            .map(p -> Map.<String, Object>of(
                "title", p.getName(),
                "subtitle", formatPrice(p.getPrice()) + " " + p.getCurrency(),
                "image_url", p.getImageUrl() != null ? p.getImageUrl() : "",
                "default_action", Map.of(
                    "type", "oa.open.url",
                    "url", "https://www.mirrorfuturediamond.com/product/" + p.getId()
                )
            ))
            .toList();

        Map<String, Object> body = Map.of(
            "recipient", Map.of("user_id", userId),
            "message", Map.of(
                "attachment", Map.of(
                    "type", "template",
                    "payload", Map.of(
                        "template_type", "list",
                        "elements", elements
                    )
                )
            )
        );

        sendMessage(body);
    }

    // Luu tin nhan vao DB
    public void saveIncomingMessage(String userId, String msgId,
                                     String type, String content) {
        ZaloMessage msg = new ZaloMessage();
        msg.setZaloMessageId(msgId);
        msg.setZaloUserId(userId);
        msg.setDirection("INCOMING");
        msg.setMessageType(type);
        msg.setContent(content);
        messageRepo.save(msg);
    }

    private void saveOutgoingMessage(String userId, String msgId,
                                      String type, String content,
                                      Long staffId, boolean isAutoReply) {
        ZaloMessage msg = new ZaloMessage();
        msg.setZaloMessageId(msgId);
        msg.setZaloUserId(userId);
        msg.setDirection("OUTGOING");
        msg.setMessageType(type);
        msg.setContent(content);
        msg.setSentByStaffId(staffId);
        msg.setIsAutoReply(isAutoReply);
        messageRepo.save(msg);
    }
}
```

**Ket qua:** Backend co the gui text, hinh, danh sach san pham cho user qua Zalo.

---

### Buoc 3.5: Test Webhook + Messaging

**Thao tac:**

1. Deploy backend voi cac code moi
2. Dung dien thoai, mo Zalo, tim OA "Mirror Future Diamond"
3. Bam **"Quan tam"** (follow)
4. Kiem tra:
   - Backend log: `[Zalo Webhook] Event: follow`
   - DB `zalo_followers`: co record moi
   - Dien thoai nhan duoc tin chao mung tu OA
5. Gui tin nhan: "Gia nhan kim cuong bao nhieu?"
6. Kiem tra:
   - Backend log: `[Zalo Webhook] Event: user_send_text`
   - DB `zalo_messages`: co record INCOMING
   - Dien thoai nhan duoc auto-reply voi link san pham
   - DB `zalo_messages`: co record OUTGOING (auto-reply)

**Ket qua:** Toan bo flow Webhook -> Auto-Reply hoat dong.

---

### Tong ket Phase 3

```
✅ Webhook controller voi signature verification
✅ Dang ky webhook URL tren Zalo Portal
✅ Xu ly events: text, image, follow, unfollow, seen
✅ Auto-reply: ngoai gio lam viec + keyword matching
✅ Gui tin nhan: text, product list
✅ Luu lich su tin nhan vao DB
✅ Test end-to-end voi dien thoai that
```

---

## PHASE 4: BACKEND - ZNS (THONG BAO TU DONG)

Muc tieu: He thong tu dong gui ZNS khi co don hang moi, lich hen moi, thay doi trang thai.

---

### Buoc 4.1: Dang ky ZNS templates voi Zalo

**Tai sao:** ZNS bat buoc dung template da duoc Zalo duyet. Khong duoc gui tin tuy y.

**Thao tac:**

1. Vao **developers.zalo.me** > **ZNS** > **"Tao template moi"**

2. **Template 1: Xac nhan don hang**
   ```
   Ten: Xac nhan don hang
   Loai: Giao dich
   Noi dung:

   Xac nhan don hang #{order_code}

   Kinh gui {customer_name},

   Don hang cua ban da duoc tiep nhan:
   - San pham: {product_name}
   - Tong tien: {total_amount}

   Theo doi don hang tai: mirrorfuturediamond.com

   Cam on ban da tin tuong Mirror Future Diamond!
   ```

3. **Template 2: Nhac lich hen**
   ```
   Ten: Nhac lich hen
   Loai: Giao dich
   Noi dung:

   Xin chao {customer_name},

   Ban co lich hen tai Mirror Future Diamond:
   - Ngay: {appointment_date}
   - Gio: {appointment_time}
   - Dia diem: {venue_name}
   - Dia chi: {venue_address}

   Neu can thay doi, lien he: {hotline}

   Hen gap ban!
   ```

4. **Template 3: Cap nhat don hang**
   ```
   Ten: Cap nhat trang thai don hang
   Loai: Giao dich
   Noi dung:

   Cap nhat don hang #{order_code}

   Trang thai: {status}
   {status_message}

   Xem chi tiet: mirrorfuturediamond.com

   Mirror Future Diamond
   ```

5. Nhan **"Gui duyet"** cho moi template
6. **Cho Zalo duyet: 1-3 ngay lam viec**
7. Sau khi duyet, ghi lai `template_id` cua moi template

**Ket qua:** Co 3+ ZNS templates da duyet, san sang gui.

---

### Buoc 4.2: Implement ZaloZNSService

**Thao tac:**

Tao `ZaloZNSService.java`:

```java
@Service
@Slf4j
public class ZaloZNSService {

    @Autowired
    private ZaloTokenManager tokenManager;

    @Autowired
    private ZaloZnsLogRepository znsLogRepo;

    private final RestTemplate restTemplate = new RestTemplate();

    // Template IDs (lay tu Zalo Portal sau khi duyet)
    // Nen luu vao application.properties hoac database
    @Value("${zalo.zns.template.order-confirmation:}")
    private String templateOrderConfirm;

    @Value("${zalo.zns.template.appointment-reminder:}")
    private String templateAppointmentReminder;

    @Value("${zalo.zns.template.order-status:}")
    private String templateOrderStatus;

    /**
     * Gui xac nhan don hang
     * GOI O DAU: OrderService.createOrder() - sau khi tao don thanh cong
     */
    public void sendOrderConfirmation(String customerPhone, String orderCode,
                                       String customerName, String productName,
                                       String totalAmount) {
        Map<String, String> data = Map.of(
            "order_code", orderCode,
            "customer_name", customerName,
            "product_name", productName,
            "total_amount", totalAmount
        );

        sendZNS(customerPhone, templateOrderConfirm,
                "Xac nhan don hang", data,
                "ORDER", orderCode);
    }

    /**
     * Gui nhac lich hen
     * GOI O DAU: Scheduler chay moi ngay luc 8:00 AM
     *            Kiem tra appointments ngay mai -> gui nhac
     */
    public void sendAppointmentReminder(String customerPhone, String customerName,
                                         String date, String time,
                                         String venueName, String venueAddress) {
        Map<String, String> data = Map.of(
            "customer_name", customerName,
            "appointment_date", date,
            "appointment_time", time,
            "venue_name", venueName,
            "venue_address", venueAddress,
            "hotline", "1900-xxx-xxx"
        );

        sendZNS(customerPhone, templateAppointmentReminder,
                "Nhac lich hen", data,
                "APPOINTMENT", null);
    }

    /**
     * Gui cap nhat trang thai don hang
     * GOI O DAU: OrderService.updateStatus() - khi doi trang thai
     */
    public void sendOrderStatusUpdate(String customerPhone, String orderCode,
                                       String status, String statusMessage) {
        Map<String, String> data = Map.of(
            "order_code", orderCode,
            "status", status,
            "status_message", statusMessage
        );

        sendZNS(customerPhone, templateOrderStatus,
                "Cap nhat don hang", data,
                "ORDER", orderCode);
    }

    /**
     * Core method: Gui ZNS
     */
    private void sendZNS(String phone, String templateId, String templateName,
                          Map<String, String> templateData,
                          String triggerType, String triggerEntityId) {

        // Chuan hoa so dien thoai: 0901234567 -> 84901234567
        String normalizedPhone = normalizePhone(phone);

        // Tao log record
        ZaloZnsLog znsLog = new ZaloZnsLog();
        znsLog.setPhone(normalizedPhone);
        znsLog.setTemplateId(templateId);
        znsLog.setTemplateName(templateName);
        znsLog.setTemplateData(templateData);   // JSONB
        znsLog.setTriggerType(triggerType);
        znsLog.setTriggerEntityId(triggerEntityId);
        znsLog.setStatus("SENDING");
        znsLogRepo.save(znsLog);

        try {
            String token = tokenManager.getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("access_token", token);

            Map<String, Object> body = Map.of(
                "phone", normalizedPhone,
                "template_id", templateId,
                "template_data", templateData
            );

            ResponseEntity<Map> response = restTemplate.postForEntity(
                ZaloConfig.ZNS_URL,
                new HttpEntity<>(body, headers),
                Map.class
            );

            // Cap nhat log
            Map responseBody = response.getBody();
            if (responseBody != null && Integer.valueOf(0).equals(responseBody.get("error"))) {
                znsLog.setStatus("SENT");
                znsLog.setZnsMessageId(
                    ((Map) responseBody.get("data")).get("msg_id").toString()
                );
                znsLog.setSentAt(LocalDateTime.now());
                log.info("[ZNS] Sent successfully to {} - template: {}", phone, templateName);
            } else {
                znsLog.setStatus("FAILED");
                znsLog.setErrorMessage(responseBody != null ?
                    responseBody.get("message").toString() : "Unknown error");
                log.error("[ZNS] Failed to send to {}: {}", phone, znsLog.getErrorMessage());
            }

        } catch (Exception e) {
            znsLog.setStatus("FAILED");
            znsLog.setErrorMessage(e.getMessage());
            log.error("[ZNS] Exception sending to {}: {}", phone, e.getMessage());
        }

        znsLogRepo.save(znsLog);
    }

    /**
     * Chuan hoa so dien thoai VN
     * 0901234567   -> 84901234567
     * +84901234567 -> 84901234567
     * 84901234567  -> 84901234567 (giu nguyen)
     */
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        phone = phone.replaceAll("[^0-9]", "");  // Bo ky tu dac biet
        if (phone.startsWith("0")) {
            return "84" + phone.substring(1);
        }
        if (!phone.startsWith("84")) {
            return "84" + phone;
        }
        return phone;
    }
}
```

**Ket qua:** Co service gui ZNS voi logging day du.

---

### Buoc 4.3: Tich hop ZNS vao cac Service hien tai

**Tai sao:** ZNS can duoc trigger tu dong khi co su kien (tao don, doi trang thai, tao lich hen).

**Thao tac:**

Sua cac Service hien tai trong backend, them goi ZNS:

**1. OrderService - Khi tao don hang:**

```java
// File: OrderService.java (backend hien tai)

@Autowired
private ZaloZNSService zaloZNSService;

public Order createOrder(OrderCreateRequest request) {
    // ... logic tao don hang hien tai ...
    Order order = orderRepository.save(newOrder);

    // === THEM DONG NAY: Gui ZNS xac nhan ===
    try {
        if (request.getCustomerPhone() != null) {
            zaloZNSService.sendOrderConfirmation(
                request.getCustomerPhone(),
                order.getOrderCode(),
                request.getCustomerName(),
                order.getProductSummary(),
                formatCurrency(order.getTotalAmount())
            );
        }
    } catch (Exception e) {
        // ZNS fail khong anh huong tao don
        log.warn("[ZNS] Failed to send order confirmation: {}", e.getMessage());
    }
    // =========================================

    return order;
}
```

**2. OrderService - Khi doi trang thai:**

```java
public Order updateOrderStatus(Long orderId, String newStatus, String message) {
    // ... logic doi trang thai hien tai ...
    Order order = orderRepository.save(updatedOrder);

    // === THEM: Gui ZNS cap nhat ===
    try {
        if (order.getCustomerPhone() != null) {
            zaloZNSService.sendOrderStatusUpdate(
                order.getCustomerPhone(),
                order.getOrderCode(),
                newStatus,
                message != null ? message : getDefaultStatusMessage(newStatus)
            );
        }
    } catch (Exception e) {
        log.warn("[ZNS] Failed to send status update: {}", e.getMessage());
    }
    // ================================

    return order;
}
```

**3. AppointmentService - Khi tao lich hen:**

```java
public Appointment createAppointment(AppointmentRequest request) {
    // ... logic tao lich hen hien tai ...
    Appointment appt = appointmentRepository.save(newAppointment);

    // === THEM: Gui ZNS xac nhan lich hen ===
    try {
        if (request.getPhone() != null) {
            zaloZNSService.sendAppointmentReminder(
                request.getPhone(),
                request.getCustomerName(),
                formatDate(appt.getDate()),
                formatTime(appt.getTime()),
                appt.getVenue().getName(),
                appt.getVenue().getAddress()
            );
        }
    } catch (Exception e) {
        log.warn("[ZNS] Failed to send appointment confirmation: {}", e.getMessage());
    }
    // =========================================

    return appt;
}
```

**Ket qua:** ZNS tu dong gui moi khi co don hang moi hoac lich hen moi.

---

### Buoc 4.4: Tao Scheduler nhac lich hen 24h truoc

**Tai sao:** Gui nhac lich hen cho khach 1 ngay truoc. Cai nay chay dinh ky, khong can user action.

**Thao tac:**

Tao `AppointmentReminderScheduler.java`:

```java
@Component
@Slf4j
public class AppointmentReminderScheduler {

    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private ZaloZNSService zaloZNSService;

    /**
     * Chay moi ngay luc 8:00 AM
     * Tim tat ca lich hen cua NGAY MAI
     * Gui ZNS nhac cho khach
     */
    @Scheduled(cron = "0 0 8 * * *")  // 8:00 AM moi ngay
    public void sendDailyReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        log.info("[Reminder] Checking appointments for {}", tomorrow);

        List<Appointment> appointments = appointmentRepo
            .findByDateAndStatus(tomorrow, "CONFIRMED");

        log.info("[Reminder] Found {} appointments to remind", appointments.size());

        for (Appointment appt : appointments) {
            try {
                if (appt.getPhone() != null && !appt.getPhone().isBlank()) {
                    zaloZNSService.sendAppointmentReminder(
                        appt.getPhone(),
                        appt.getCustomerName(),
                        formatDate(appt.getDate()),
                        formatTime(appt.getTime()),
                        appt.getVenue().getName(),
                        appt.getVenue().getAddress()
                    );
                    log.info("[Reminder] Sent to {} for appointment at {}",
                        appt.getPhone(), appt.getTime());
                }
            } catch (Exception e) {
                log.error("[Reminder] Failed for appointment {}: {}",
                    appt.getId(), e.getMessage());
            }

            // Rate limiting: cho 100ms giua moi request (10 req/s limit)
            Thread.sleep(100);
        }

        log.info("[Reminder] Done. Processed {} appointments.", appointments.size());
    }
}
```

**Ket qua:** Moi sang 8h, he thong tu dong nhac khach ve lich hen ngay mai.

---

### Buoc 4.5: Test ZNS

**Thao tac:**

1. Dang ky so dien thoai test tren Zalo Developer Portal
   (Zalo chi cho gui ZNS den so test trong moi truong development)
2. Goi API tao don hang voi so dien thoai test
3. Kiem tra:
   - Dien thoai nhan duoc ZNS thong bao
   - DB `zalo_zns_logs`: co record voi status = `SENT`
4. Doi trang thai don hang, kiem tra lai
5. Tao lich hen cho ngay mai, trigger scheduler thu cong de test

**Ket qua:** ZNS hoat dong dung cho tat ca cac truong hop.

---

### Tong ket Phase 4

```
✅ 3+ ZNS templates da dang ky va duoc Zalo duyet
✅ ZaloZNSService voi logging day du
✅ Tich hop vao OrderService (tao don, doi trang thai)
✅ Tich hop vao AppointmentService (tao lich hen)
✅ Scheduler nhac lich hen 24h truoc (8:00 AM moi ngay)
✅ Test gui ZNS thanh cong
```

---

## PHASE 5: BACKEND - API CHO FRONTEND ADMIN

Muc tieu: Tao REST API de frontend Admin Dashboard co the xem conversations, gui tin nhan, xem followers, xem ZNS logs.

---

### Buoc 5.1: Implement ZaloOAController (API cho Admin)

**Thao tac:**

Tao `ZaloOAController.java`:

```java
@RestController
@RequestMapping("/api/zalo")
public class ZaloOAController {

    @Autowired private ZaloOAService oaService;
    @Autowired private ZaloFollowerService followerService;
    @Autowired private ZaloZNSService znsService;
    @Autowired private ZaloMessageRepository messageRepo;
    @Autowired private ZaloFollowerRepository followerRepo;
    @Autowired private ZaloZnsLogRepository znsLogRepo;

    // ============ CONVERSATIONS ============

    /**
     * Danh sach cuoc tro chuyen (nhom theo user, sap xep theo tin moi nhat)
     * GET /api/zalo/conversations?page=0&size=20&search=keyword
     */
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {

        // Query: nhom messages theo zalo_user_id,
        //        lay tin cuoi cung, sap xep DESC
        Page<ConversationSummary> conversations =
            messageRepo.getConversationSummaries(search, PageRequest.of(page, size));

        return ResponseEntity.ok(conversations);
    }

    /**
     * Lich su tin nhan voi 1 user
     * GET /api/zalo/conversations/{userId}/messages?page=0&size=50
     */
    @GetMapping("/conversations/{userId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<ZaloMessage> messages = messageRepo
            .findByZaloUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));

        return ResponseEntity.ok(messages);
    }

    // ============ SEND MESSAGES ============

    /**
     * Gui tin nhan text
     * POST /api/zalo/messages/text
     * Body: { "userId": "xxx", "text": "Hello" }
     */
    @PostMapping("/messages/text")
    public ResponseEntity<?> sendTextMessage(@RequestBody Map<String, String> body) {
        String msgId = oaService.sendTextMessage(
            body.get("userId"),
            body.get("text")
        );
        return ResponseEntity.ok(Map.of("messageId", msgId));
    }

    /**
     * Gui danh sach san pham
     * POST /api/zalo/messages/product-list
     * Body: { "userId": "xxx", "productIds": [1, 2, 3] }
     */
    @PostMapping("/messages/product-list")
    public ResponseEntity<?> sendProductList(@RequestBody Map<String, Object> body) {
        String userId = (String) body.get("userId");
        List<Long> productIds = ((List<Integer>) body.get("productIds"))
            .stream().map(Long::valueOf).toList();

        oaService.sendProductList(userId, productIds);
        return ResponseEntity.ok(Map.of("status", "sent"));
    }

    // ============ FOLLOWERS ============

    /**
     * Danh sach followers
     * GET /api/zalo/followers?page=0&size=20&search=name&tag=VIP
     */
    @GetMapping("/followers")
    public ResponseEntity<?> getFollowers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag) {

        Page<ZaloFollower> followers = followerRepo
            .findWithFilters(search, tag, PageRequest.of(page, size));

        return ResponseEntity.ok(followers);
    }

    /**
     * Profile 1 follower
     * GET /api/zalo/followers/{userId}
     */
    @GetMapping("/followers/{userId}")
    public ResponseEntity<?> getFollowerProfile(@PathVariable String userId) {
        ZaloFollower follower = followerRepo.findByZaloUserId(userId)
            .orElseThrow(() -> new RuntimeException("Follower not found"));
        return ResponseEntity.ok(follower);
    }

    /**
     * Gan tag cho follower
     * POST /api/zalo/followers/{userId}/tag
     * Body: { "tagName": "VIP" }
     */
    @PostMapping("/followers/{userId}/tag")
    public ResponseEntity<?> tagFollower(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {
        followerService.addTag(userId, body.get("tagName"));
        return ResponseEntity.ok(Map.of("status", "tagged"));
    }

    // ============ ZNS ============

    /**
     * Lich su gui ZNS
     * GET /api/zalo/zns/logs?page=0&size=20&status=SENT&triggerType=ORDER
     */
    @GetMapping("/zns/logs")
    public ResponseEntity<?> getZNSLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String triggerType) {

        Page<ZaloZnsLog> logs = znsLogRepo
            .findWithFilters(status, triggerType, PageRequest.of(page, size));

        return ResponseEntity.ok(logs);
    }

    /**
     * Gui ZNS thu cong (tu Admin Dashboard)
     * POST /api/zalo/zns/send
     * Body: { "phone": "0901234567", "templateId": "xxx", "templateData": {...} }
     */
    @PostMapping("/zns/send")
    public ResponseEntity<?> sendZNSManual(@RequestBody ZaloZNSRequest request) {
        // Trigger type = MANUAL khi gui tu Admin
        znsService.sendManual(
            request.getPhone(),
            request.getTemplateId(),
            request.getTemplateData()
        );
        return ResponseEntity.ok(Map.of("status", "sent"));
    }

    // ============ ANALYTICS ============

    /**
     * Thong ke tong quan
     * GET /api/zalo/analytics?from=2025-01-01&to=2025-01-31
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        Map<String, Object> analytics = Map.of(
            "totalFollowers", followerRepo.countByIsFollowing(true),
            "totalMessages", messageRepo.countByDateRange(from, to),
            "totalZNSSent", znsLogRepo.countByStatusAndDateRange("SENT", from, to),
            "totalZNSFailed", znsLogRepo.countByStatusAndDateRange("FAILED", from, to),
            "messagesPerDay", messageRepo.getMessagesPerDay(from, to),
            "topKeywords", messageRepo.getTopKeywords(from, to)
        );

        return ResponseEntity.ok(analytics);
    }
}
```

**Ket qua:** Frontend co full API de hien thi va tuong tac voi Zalo OA.

---

### Tong ket Phase 5

```
✅ GET  /api/zalo/conversations          - Danh sach cuoc tro chuyen
✅ GET  /api/zalo/conversations/:id/messages - Lich su chat
✅ POST /api/zalo/messages/text           - Gui tin nhan
✅ POST /api/zalo/messages/product-list   - Gui san pham
✅ GET  /api/zalo/followers               - Danh sach followers
✅ POST /api/zalo/followers/:id/tag       - Gan tag
✅ GET  /api/zalo/zns/logs                - Lich su ZNS
✅ POST /api/zalo/zns/send                - Gui ZNS thu cong
✅ GET  /api/zalo/analytics               - Thong ke
```

---

## PHASE 6: FRONTEND - ADMIN DASHBOARD UI

Muc tieu: Admin co the xem conversations, gui tin nhan, quan ly followers, xem ZNS logs tren Dashboard.

---

### Buoc 6.1: Tao zaloApi.js (Frontend service)

**Thao tac:**

Tao file `src/services/zaloApi.js` (xem noi dung trong `ZALO_OA_INTEGRATION.md` muc 8)

---

### Buoc 6.2: Them routes

**Thao tac:**

Cap nhat `src/constants/routes.js`:

```javascript
// Them vao object ROUTES:
ZALO_DASHBOARD: "/dashboard/admin/zalo",
ZALO_CONVERSATIONS: "/dashboard/admin/zalo/conversations",
ZALO_FOLLOWERS: "/dashboard/admin/zalo/followers",
ZALO_ZNS_LOGS: "/dashboard/admin/zalo/zns-logs",
ZALO_SETTINGS: "/dashboard/admin/zalo/settings",
```

Cap nhat `src/routes/AppRoutes.jsx`:
- Them lazy imports
- Them Route elements (wrap trong ProtectedRoute, allowedRoles nhu Admin Dashboard)

---

### Buoc 6.3: Tao React components

**Thu tu tao:**

1. **ZaloSettings.jsx** - Trang ket noi OA (nut "Ket noi Zalo OA", hien trang thai)
2. **ZaloOADashboard.jsx** - Tong quan (so follower, tin nhan hom nay, ZNS da gui)
3. **ZaloConversationList.jsx** - Danh sach chat (giong giao dien Messenger/Zalo)
4. **ZaloConversationDetail.jsx** - Chat window (gui/nhan tin voi 1 khach)
5. **ZaloFollowerList.jsx** - Danh sach nguoi theo doi (tim kiem, filter tag)
6. **ZaloZNSLogs.jsx** - Bang lich su ZNS (status, template, thoi gian)

**Moi component:**
- Goi API tu `zaloApi.js`
- Hien thi loading state
- Hien thi error state
- Pagination
- Search/filter

---

### Buoc 6.4: Them Zalo Chat Widget len website

**Thao tac:**

Them vao `index.html` truoc `</body>`:

```html
<!-- Zalo Chat Widget -->
<div class="zalo-chat-widget"
  data-oaid="YOUR_OA_ID"
  data-welcome-message="Chao ban! Mirror Future Diamond xin ho tro."
  data-autopopup="0"
  data-width="350"
  data-height="420">
</div>
<script src="https://sp.zalo.me/plugins/sdk.js"></script>
```

> Thay `YOUR_OA_ID` bang OA ID that.

**Ket qua:** Goc duoi phai website co icon Zalo, khach bam vao de chat.

---

### Tong ket Phase 6

```
✅ zaloApi.js frontend service
✅ Routes moi cho Zalo admin pages
✅ ZaloSettings - ket noi OA
✅ ZaloOADashboard - tong quan
✅ ZaloConversationList + Detail - chat
✅ ZaloFollowerList - quan ly followers
✅ ZaloZNSLogs - lich su thong bao
✅ Chat widget tren website
```

---

## TONG KET TOAN BO

### Thu tu uu tien thuc hien

```
Phase 1: Dang ky & Thiet lap         ──▶  Khong can code, chi thao tac tren web
Phase 2: Backend - Token Management   ──▶  Backend dev
Phase 3: Backend - Webhook            ──▶  Backend dev
Phase 4: Backend - ZNS                ──▶  Backend dev (cho template duyet song song)
Phase 5: Backend - Admin API          ──▶  Backend dev
Phase 6: Frontend - Admin UI          ──▶  Frontend dev (co the lam song song voi Phase 4-5)
```

### Dependencies giua cac Phase

```
Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 5 ──▶ Phase 6
                   │
                   └──▶ Phase 4 (ZNS can template duyet,
                                  bat dau dang ky som)
```

### File backend can tao/sua

```
MỚI (tao moi):
  zalo/config/ZaloConfig.java
  zalo/entity/ZaloToken.java
  zalo/entity/ZaloFollower.java
  zalo/entity/ZaloMessage.java
  zalo/entity/ZaloZnsLog.java
  zalo/entity/ZaloTag.java
  zalo/repository/ZaloTokenRepository.java
  zalo/repository/ZaloFollowerRepository.java
  zalo/repository/ZaloMessageRepository.java
  zalo/repository/ZaloZnsLogRepository.java
  zalo/repository/ZaloTagRepository.java
  zalo/service/ZaloTokenManager.java
  zalo/service/ZaloOAService.java
  zalo/service/ZaloZNSService.java
  zalo/service/ZaloFollowerService.java
  zalo/controller/ZaloWebhookController.java
  zalo/controller/ZaloOAController.java
  zalo/controller/ZaloOAuthController.java
  zalo/dto/ZaloWebhookEvent.java
  zalo/dto/ZaloMessageRequest.java
  zalo/dto/ZaloZNSRequest.java
  zalo/dto/ZaloTokenResponse.java
  zalo/scheduler/AppointmentReminderScheduler.java
  migration/V__zalo_oa_tables.sql

SỬA (them goi ZNS):
  OrderService.java          (them zaloZNSService.sendOrderConfirmation)
  AppointmentService.java    (them zaloZNSService.sendAppointmentReminder)
  application.properties     (them zalo.* configs)
  MirrorDiamondApplication.java (them @EnableScheduling)

MỚI (frontend):
  src/services/zaloApi.js
  src/components/zalo-oa/ZaloSettings.jsx
  src/components/zalo-oa/ZaloOADashboard.jsx
  src/components/zalo-oa/ZaloConversationList.jsx
  src/components/zalo-oa/ZaloConversationDetail.jsx
  src/components/zalo-oa/ZaloFollowerList.jsx
  src/components/zalo-oa/ZaloZNSLogs.jsx

SỬA (frontend):
  src/constants/routes.js     (them Zalo routes)
  src/routes/AppRoutes.jsx    (them Route elements)
  index.html                  (them chat widget script)
```
