# Zalo OA Backend Implementation Plan

> Plan chi tiet de implement Zalo OA vao `mirror-products-service`
> Backend: Spring Boot 3.5.3, Java 17, PostgreSQL, Liquibase, AWS AppRunner
> Package goc: `com.mirror.product`

---

## MUC LUC

1. [Tong quan cong viec](#1-tong-quan-cong-viec)
2. [Phase 1: Dang ky & Credentials](#phase-1-dang-ky--credentials-khong-code)
3. [Phase 2: Database & Entities](#phase-2-database--entities)
4. [Phase 3: Config & Token Management](#phase-3-config--token-management)
5. [Phase 4: Webhook System](#phase-4-webhook-system)
6. [Phase 5: ZNS Notifications](#phase-5-zns---thong-bao-tu-dong)
7. [Phase 6: Admin API](#phase-6-admin-api-cho-frontend)
8. [Phase 7: SecurityConfig & CORS](#phase-7-securityconfig--cors)
9. [Phase 8: Frontend Integration](#phase-8-frontend-tham-khao)
10. [Danh sach file can tao/sua](#danh-sach-toan-bo-file)
11. [Checklist trien khai](#checklist-trien-khai)

---

## 1. TONG QUAN CONG VIEC

### He thong hien tai (mirror-products-service)

```
Package:        com.mirror.product
Build:          Maven (pom.xml)
DB Migration:   Liquibase (db/changelog/db.changelog-master.xml)
                Hien co 117 migration files (001 -> 117)
Scheduling:     @EnableScheduling da bat (ProductApplication.java)
Security:       SecurityConfig.java (JWT + Role-based)
Entry point:    ProductApplication.java
```

### Can lam gi

```
Backend (mirror-products-service):
  - 1 Liquibase migration file (5 bang moi)
  - 5 Entity classes
  - 5 Repository interfaces
  - 1 Config class
  - 4 Service classes
  - 3 Controller classes
  - 5 DTO classes
  - 1 Scheduler class
  - Sua: SecurityConfig, application.properties, .env, OrderService, AppointmentService

Frontend (mirror-diamond-website):
  - 1 API service file
  - 6 React components
  - Sua: routes.js, AppRoutes.jsx, index.html
```

### Dependencies giua cac Phase

```
Phase 1 (Dang ky)
   |
   v
Phase 2 (Database) --> Phase 3 (Token) --> Phase 4 (Webhook) --> Phase 6 (Admin API)
                                      |
                                      +--> Phase 5 (ZNS) --------+
                                                                   |
Phase 7 (Security) <-- can lam song song voi Phase 4-6            |
                                                                   v
                                                          Phase 8 (Frontend)
```

---

## PHASE 1: DANG KY & CREDENTIALS (KHONG CODE)

### 1.1 Tao Zalo Official Account

1. Truy cap https://oa.zalo.me/home
2. Dang nhap bang tai khoan Zalo ca nhan
3. Tao OA:
   - Ten: `Mirror Future Diamond`
   - Danh muc: Trang suc / Thoi trang & Phu kien
   - Mo ta: `Premium lab-grown diamond jewelry`
   - Anh dai dien: Logo 512x512px PNG
   - Anh bia: Banner 1920x640px

### 1.2 Xac minh doanh nghiep

1. Cai dat > Xac minh OA > Doanh nghiep
2. Upload: Giay phep kinh doanh + CMND/CCCD nguoi dai dien
3. Dien ma so thue, dia chi
4. Gui yeu cau -> Cho 1-3 ngay lam viec

> OA xac minh moi gui duoc ZNS + API gioi han cao hon

### 1.3 Tao Zalo App

1. Truy cap https://developers.zalo.me
2. Tao ung dung moi:
   - Ten: `Mirror Diamond CRM`
   - Loai: Official Account API
   - Domain: `mirrorfuturediamond.com`
3. Ghi lai: **App ID** + **Secret Key**

### 1.4 Lien ket OA voi App

1. Trong App > Official Account > Lien ket
2. Chon OA `Mirror Future Diamond`
3. Cap quyen: gui tin nhan, quan ly follower, ZNS
4. Ghi lai: **OA ID** + **OA Secret**

### 1.5 Xac minh Domain

**Cach A (de hon):** Upload file `verifyforza_xxxxx.html` vao `public/` cua website, deploy
**Cach B:** Them DNS TXT record: `zalo-verification=xxxxxxxx`

### 1.6 Dang ky Webhook URL

1. Trong App > Webhook
2. URL: `https://nsa4fef6um.ap-southeast-1.awsapprunner.com/api/zalo/webhook`
   (hoac `https://api.mirrorfuturediamond.com/api/zalo/webhook` neu co custom domain)
3. Bat events: user_send_text, user_send_image, follow, unfollow, user_seen_message, ...

### 1.7 Dang ky ZNS Templates (lam som vi cho duyet 1-3 ngay)

Vao developers.zalo.me > ZNS > Tao template:

**Template 1: Xac nhan don hang**
```
Ten: Xac nhan don hang
Loai: Giao dich
Params: order_code, customer_name, product_name, total_amount
```

**Template 2: Nhac lich hen**
```
Ten: Nhac lich hen
Loai: Giao dich
Params: customer_name, appointment_date, appointment_time, venue_name, venue_address, hotline
```

**Template 3: Cap nhat trang thai don hang**
```
Ten: Cap nhat don hang
Loai: Giao dich
Params: order_code, status, status_message
```

Gui duyet -> Ghi lai `template_id` khi duoc approve.

### Ket qua Phase 1

```
[ ] Zalo OA da tao (dang cho/da xac minh)
[ ] Zalo App da tao
[ ] Co App ID + Secret Key
[ ] Co OA ID + OA Secret
[ ] Domain da xac minh
[ ] Webhook URL da dang ky
[ ] 3 ZNS templates da gui duyet
```

---

## PHASE 2: DATABASE & ENTITIES

### 2.1 Tao Liquibase Migration

**File:** `src/main/resources/db/changelog/118-create-zalo-oa-tables.xml`

> So tiep theo hien tai la 118 (hien co den 117)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.9.xsd">

    <changeSet id="118-create-zalo-tokens" author="nam">
        <createTable tableName="zalo_tokens">
            <column name="id" type="BIGSERIAL" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="oa_id" type="VARCHAR(50)">
                <constraints nullable="false"/>
            </column>
            <column name="access_token" type="TEXT">
                <constraints nullable="false"/>
            </column>
            <column name="refresh_token" type="TEXT">
                <constraints nullable="false"/>
            </column>
            <column name="expires_at" type="TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="is_active" type="BOOLEAN" defaultValueBoolean="true">
                <constraints nullable="false"/>
            </column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="NOW()">
                <constraints nullable="false"/>
            </column>
        </createTable>
        <createIndex tableName="zalo_tokens" indexName="idx_zalo_tokens_active">
            <column name="is_active"/>
            <column name="expires_at"/>
        </createIndex>
    </changeSet>

    <changeSet id="118-create-zalo-followers" author="nam">
        <createTable tableName="zalo_followers">
            <column name="id" type="BIGSERIAL" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="zalo_user_id" type="VARCHAR(100)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="display_name" type="VARCHAR(255)"/>
            <column name="avatar_url" type="TEXT"/>
            <column name="phone" type="VARCHAR(20)"/>
            <column name="mirror_user_id" type="VARCHAR(50)"/>
            <column name="tags" type="TEXT"/>
            <column name="is_following" type="BOOLEAN" defaultValueBoolean="true">
                <constraints nullable="false"/>
            </column>
            <column name="followed_at" type="TIMESTAMP"/>
            <column name="unfollowed_at" type="TIMESTAMP"/>
            <column name="first_message_at" type="TIMESTAMP"/>
            <column name="last_message_at" type="TIMESTAMP"/>
            <column name="total_messages" type="INTEGER" defaultValueNumeric="0"/>
            <column name="notes" type="TEXT"/>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="NOW()">
                <constraints nullable="false"/>
            </column>
            <column name="updated_at" type="TIMESTAMP"/>
        </createTable>
        <createIndex tableName="zalo_followers" indexName="idx_zalo_followers_zalo_id">
            <column name="zalo_user_id"/>
        </createIndex>
        <createIndex tableName="zalo_followers" indexName="idx_zalo_followers_phone">
            <column name="phone"/>
        </createIndex>
        <createIndex tableName="zalo_followers" indexName="idx_zalo_followers_mirror_user">
            <column name="mirror_user_id"/>
        </createIndex>
    </changeSet>

    <changeSet id="118-create-zalo-messages" author="nam">
        <createTable tableName="zalo_messages">
            <column name="id" type="BIGSERIAL" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="zalo_message_id" type="VARCHAR(100)"/>
            <column name="zalo_user_id" type="VARCHAR(100)">
                <constraints nullable="false"/>
            </column>
            <column name="direction" type="VARCHAR(10)">
                <constraints nullable="false"/>
            </column>
            <column name="message_type" type="VARCHAR(20)">
                <constraints nullable="false"/>
            </column>
            <column name="content" type="TEXT"/>
            <column name="attachment_url" type="TEXT"/>
            <column name="sent_by_staff_id" type="VARCHAR(50)"/>
            <column name="is_auto_reply" type="BOOLEAN" defaultValueBoolean="false"/>
            <column name="status" type="VARCHAR(20)" defaultValue="SENT"/>
            <column name="seen_at" type="TIMESTAMP"/>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="NOW()">
                <constraints nullable="false"/>
            </column>
        </createTable>
        <createIndex tableName="zalo_messages" indexName="idx_zalo_messages_user_date">
            <column name="zalo_user_id"/>
            <column name="created_at" descending="true"/>
        </createIndex>
        <createIndex tableName="zalo_messages" indexName="idx_zalo_messages_direction">
            <column name="direction"/>
            <column name="created_at" descending="true"/>
        </createIndex>
    </changeSet>

    <changeSet id="118-create-zalo-zns-logs" author="nam">
        <createTable tableName="zalo_zns_logs">
            <column name="id" type="BIGSERIAL" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="phone" type="VARCHAR(20)">
                <constraints nullable="false"/>
            </column>
            <column name="template_id" type="VARCHAR(100)">
                <constraints nullable="false"/>
            </column>
            <column name="template_name" type="VARCHAR(255)"/>
            <column name="template_data" type="JSONB"/>
            <column name="trigger_type" type="VARCHAR(50)"/>
            <column name="trigger_entity_id" type="VARCHAR(100)"/>
            <column name="zns_message_id" type="VARCHAR(100)"/>
            <column name="status" type="VARCHAR(20)" defaultValue="PENDING">
                <constraints nullable="false"/>
            </column>
            <column name="error_message" type="TEXT"/>
            <column name="error_code" type="INTEGER"/>
            <column name="sent_at" type="TIMESTAMP"/>
            <column name="delivered_at" type="TIMESTAMP"/>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="NOW()">
                <constraints nullable="false"/>
            </column>
        </createTable>
        <createIndex tableName="zalo_zns_logs" indexName="idx_zns_logs_phone">
            <column name="phone"/>
            <column name="created_at" descending="true"/>
        </createIndex>
        <createIndex tableName="zalo_zns_logs" indexName="idx_zns_logs_status">
            <column name="status"/>
        </createIndex>
        <createIndex tableName="zalo_zns_logs" indexName="idx_zns_logs_trigger">
            <column name="trigger_type"/>
            <column name="trigger_entity_id"/>
        </createIndex>
    </changeSet>

    <changeSet id="118-create-zalo-tags" author="nam">
        <createTable tableName="zalo_tags">
            <column name="id" type="BIGSERIAL" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="name" type="VARCHAR(100)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="color" type="VARCHAR(7)"/>
            <column name="description" type="TEXT"/>
            <column name="follower_count" type="INTEGER" defaultValueNumeric="0"/>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="NOW()">
                <constraints nullable="false"/>
            </column>
        </createTable>
    </changeSet>

</databaseChangeLog>
```

**Them vao** `db.changelog-master.xml`:
```xml
<include file="db/changelog/118-create-zalo-oa-tables.xml"/>
```

### 2.2 Tao Entity Classes

> Package: `com.mirror.product.entity.zalo`
> Su dung `@Getter @Setter` (KHONG dung `@Data` de tranh StackOverflow voi JPA)

**File 1:** `src/main/java/com/mirror/product/entity/zalo/ZaloToken.java`

```java
package com.mirror.product.entity.zalo;

@Entity
@Table(name = "zalo_tokens")
@Getter @Setter
@NoArgsConstructor
public class ZaloToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "oa_id", nullable = false, length = 50)
    private String oaId;

    @Column(name = "access_token", columnDefinition = "TEXT", nullable = false)
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT", nullable = false)
    private String refreshToken;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isExpiringSoon() {
        return LocalDateTime.now().plusMinutes(10).isAfter(expiresAt);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
```

**File 2:** `src/main/java/com/mirror/product/entity/zalo/ZaloFollower.java`

```java
package com.mirror.product.entity.zalo;

@Entity
@Table(name = "zalo_followers")
@Getter @Setter
@NoArgsConstructor
public class ZaloFollower {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zalo_user_id", nullable = false, unique = true, length = 100)
    private String zaloUserId;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "mirror_user_id", length = 50)
    private String mirrorUserId;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // JSON array: ["VIP", "Interested_Ring"]

    @Column(name = "is_following", nullable = false)
    private Boolean isFollowing = true;

    @Column(name = "followed_at")
    private LocalDateTime followedAt;

    @Column(name = "unfollowed_at")
    private LocalDateTime unfollowedAt;

    @Column(name = "first_message_at")
    private LocalDateTime firstMessageAt;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "total_messages")
    private Integer totalMessages = 0;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

**File 3:** `src/main/java/com/mirror/product/entity/zalo/ZaloMessage.java`

```java
package com.mirror.product.entity.zalo;

@Entity
@Table(name = "zalo_messages")
@Getter @Setter
@NoArgsConstructor
public class ZaloMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zalo_message_id", length = 100)
    private String zaloMessageId;

    @Column(name = "zalo_user_id", nullable = false, length = 100)
    private String zaloUserId;

    @Column(name = "direction", nullable = false, length = 10)
    private String direction; // INCOMING | OUTGOING

    @Column(name = "message_type", nullable = false, length = 20)
    private String messageType; // text | image | file | sticker | template

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;

    @Column(name = "sent_by_staff_id", length = 50)
    private String sentByStaffId;

    @Column(name = "is_auto_reply")
    private Boolean isAutoReply = false;

    @Column(name = "status", length = 20)
    private String status = "SENT"; // SENT | DELIVERED | SEEN | FAILED

    @Column(name = "seen_at")
    private LocalDateTime seenAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

**File 4:** `src/main/java/com/mirror/product/entity/zalo/ZaloZnsLog.java`

```java
package com.mirror.product.entity.zalo;

@Entity
@Table(name = "zalo_zns_logs")
@Getter @Setter
@NoArgsConstructor
public class ZaloZnsLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "template_id", nullable = false, length = 100)
    private String templateId;

    @Column(name = "template_name")
    private String templateName;

    @Column(name = "template_data", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> templateData;

    @Column(name = "trigger_type", length = 50)
    private String triggerType; // ORDER | APPOINTMENT | POD_SCAN | MANUAL

    @Column(name = "trigger_entity_id", length = 100)
    private String triggerEntityId;

    @Column(name = "zns_message_id", length = 100)
    private String znsMessageId;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING"; // PENDING | SENDING | SENT | DELIVERED | FAILED | REJECTED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "error_code")
    private Integer errorCode;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

**File 5:** `src/main/java/com/mirror/product/entity/zalo/ZaloTag.java`

```java
package com.mirror.product.entity.zalo;

@Entity
@Table(name = "zalo_tags")
@Getter @Setter
@NoArgsConstructor
public class ZaloTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "color", length = 7)
    private String color;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "follower_count")
    private Integer followerCount = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### 2.3 Tao Repository Interfaces

> Package: `com.mirror.product.repository.zalo`

**ZaloTokenRepository.java**
```java
@Repository
public interface ZaloTokenRepository extends JpaRepository<ZaloToken, Long> {
    @Query("SELECT t FROM ZaloToken t WHERE t.isActive = true ORDER BY t.createdAt DESC LIMIT 1")
    Optional<ZaloToken> findLatestActive();

    @Modifying
    @Query("UPDATE ZaloToken t SET t.isActive = false WHERE t.id != :id")
    void deactivateAllExcept(@Param("id") Long id);
}
```

**ZaloFollowerRepository.java**
```java
@Repository
public interface ZaloFollowerRepository extends JpaRepository<ZaloFollower, Long> {
    Optional<ZaloFollower> findByZaloUserId(String zaloUserId);
    Optional<ZaloFollower> findByPhone(String phone);
    long countByIsFollowing(boolean isFollowing);
    Page<ZaloFollower> findByIsFollowingTrue(Pageable pageable);

    @Query("SELECT f FROM ZaloFollower f WHERE f.isFollowing = true " +
           "AND (:search IS NULL OR LOWER(f.displayName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ZaloFollower> findWithFilters(@Param("search") String search, Pageable pageable);
}
```

**ZaloMessageRepository.java**
```java
@Repository
public interface ZaloMessageRepository extends JpaRepository<ZaloMessage, Long> {
    Page<ZaloMessage> findByZaloUserIdOrderByCreatedAtDesc(String zaloUserId, Pageable pageable);

    @Query("SELECT m.zaloUserId as zaloUserId, MAX(m.createdAt) as lastMessageAt, " +
           "COUNT(m) as messageCount " +
           "FROM ZaloMessage m GROUP BY m.zaloUserId ORDER BY MAX(m.createdAt) DESC")
    Page<Object[]> getConversationSummaries(Pageable pageable);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
```

**ZaloZnsLogRepository.java**
```java
@Repository
public interface ZaloZnsLogRepository extends JpaRepository<ZaloZnsLog, Long> {
    Page<ZaloZnsLog> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<ZaloZnsLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);

    @Query("SELECT z FROM ZaloZnsLog z WHERE " +
           "(:status IS NULL OR z.status = :status) AND " +
           "(:triggerType IS NULL OR z.triggerType = :triggerType) " +
           "ORDER BY z.createdAt DESC")
    Page<ZaloZnsLog> findWithFilters(@Param("status") String status,
                                      @Param("triggerType") String triggerType,
                                      Pageable pageable);
}
```

**ZaloTagRepository.java**
```java
@Repository
public interface ZaloTagRepository extends JpaRepository<ZaloTag, Long> {
    Optional<ZaloTag> findByName(String name);
    void deleteByName(String name);
}
```

### Ket qua Phase 2

```
[ ] Migration file 118-create-zalo-oa-tables.xml da tao
[ ] Them vao db.changelog-master.xml
[ ] 5 Entity classes da tao (dung @Getter/@Setter, KHONG dung @Data)
[ ] 5 Repository interfaces da tao
[ ] Chay migration thanh cong (5 bang moi trong DB)
```

---

## PHASE 3: CONFIG & TOKEN MANAGEMENT

### 3.1 Them environment variables

**File:** `.env` (KHONG commit vao git)

```properties
# Zalo OA
ZALO_APP_ID=your_app_id_here
ZALO_APP_SECRET=your_secret_key_here
ZALO_OA_ID=your_oa_id_here
ZALO_OA_SECRET=your_oa_secret_here
ZALO_REDIRECT_URI=https://nsa4fef6um.ap-southeast-1.awsapprunner.com/api/zalo/oauth/callback

# ZNS Template IDs (dien sau khi Zalo duyet)
ZALO_ZNS_TEMPLATE_ORDER_CONFIRM=
ZALO_ZNS_TEMPLATE_APPOINTMENT_REMINDER=
ZALO_ZNS_TEMPLATE_ORDER_STATUS=
```

### 3.2 Them vao application.properties

**File:** `src/main/resources/application.properties`

Them vao cuoi file:

```properties
# ===== ZALO OA =====
zalo.app-id=${ZALO_APP_ID:}
zalo.app-secret=${ZALO_APP_SECRET:}
zalo.oa-id=${ZALO_OA_ID:}
zalo.oa-secret=${ZALO_OA_SECRET:}
zalo.redirect-uri=${ZALO_REDIRECT_URI:}
zalo.enabled=${ZALO_ENABLED:false}

# ZNS Template IDs
zalo.zns.template.order-confirmation=${ZALO_ZNS_TEMPLATE_ORDER_CONFIRM:}
zalo.zns.template.appointment-reminder=${ZALO_ZNS_TEMPLATE_APPOINTMENT_REMINDER:}
zalo.zns.template.order-status=${ZALO_ZNS_TEMPLATE_ORDER_STATUS:}
```

### 3.3 Tao ZaloProperties

**File:** `src/main/java/com/mirror/product/config/zalo/ZaloProperties.java`

```java
package com.mirror.product.config.zalo;

@Configuration
@ConfigurationProperties(prefix = "zalo")
@Getter @Setter
public class ZaloProperties {
    private String appId;
    private String appSecret;
    private String oaId;
    private String oaSecret;
    private String redirectUri;
    private boolean enabled = false;

    // ZNS template IDs
    private Zns zns = new Zns();

    @Getter @Setter
    public static class Zns {
        private Template template = new Template();

        @Getter @Setter
        public static class Template {
            private String orderConfirmation;
            private String appointmentReminder;
            private String orderStatus;
        }
    }

    // Zalo API URLs (constants)
    public static final String OAUTH_URL = "https://oauth.zaloapp.com/v4/oa/permission";
    public static final String TOKEN_URL = "https://oauth.zaloapp.com/v4/oa/access_token";
    public static final String API_URL = "https://openapi.zalo.me/v3.0/oa";
    public static final String ZNS_URL = "https://business.openapi.zalo.me/message/template";
}
```

**Them vao ProductApplication.java:**

```java
@EnableConfigurationProperties({
    NotificationProperties.class,
    TurnstileProperties.class,
    NotificationServiceProperties.class,
    ZaloProperties.class           // <-- THEM DONG NAY
})
```

### 3.4 Tao ZaloTokenManager

**File:** `src/main/java/com/mirror/product/service/zalo/ZaloTokenManager.java`

Chuc nang:
- `getAccessToken()` - lay token hien tai, tro refresh neu can
- `saveToken()` - luu token moi sau OAuth
- `hasValidToken()` - kiem tra trang thai
- `@Scheduled(fixedRate = 50min)` auto-refresh

Logic chi tiet:
```
autoRefreshToken() chay moi 50 phut:
  1. Tim token active moi nhat trong DB
  2. Neu khong co -> log warning, return
  3. Neu isExpiringSoon() (het han trong 10 phut) -> goi refresh API
  4. Refresh API tra ve access_token MOI + refresh_token MOI
  5. Deactivate token cu, luu token moi
  6. Neu refresh that bai -> log error (TODO: alert admin)

getAccessToken():
  1. Tim token active
  2. Neu khong co -> throw RuntimeException
  3. Neu expired -> thu refresh ngay
  4. Return access_token

Zalo refresh token API:
  POST https://oauth.zaloapp.com/v4/oa/access_token
  Headers: secret_key = appSecret
  Body: app_id, refresh_token, grant_type=refresh_token
```

> Luu y: Moi refresh_token chi dung 1 lan. Zalo tra ve ca access_token va refresh_token moi.

### 3.5 Tao ZaloOAuthController

**File:** `src/main/java/com/mirror/product/controller/zalo/ZaloOAuthController.java`

Endpoints:
```
GET  /api/zalo/authorize-url     -> Tra ve URL de admin authorize
GET  /api/zalo/oauth/callback    -> Zalo redirect ve day voi ?code=xxx
GET  /api/zalo/status            -> Trang thai ket noi (connected/disconnected)
POST /api/zalo/disconnect        -> Ngat ket noi (deactivate token)
```

OAuth flow:
```
1. Admin bam "Ket noi Zalo" tren frontend
2. Frontend goi GET /api/zalo/authorize-url
3. Backend tra ve URL: https://oauth.zaloapp.com/v4/oa/permission?app_id=xxx&redirect_uri=xxx
4. Frontend mo URL trong trinh duyet
5. Admin dang nhap Zalo, bam "Cho phep"
6. Zalo redirect ve: /api/zalo/oauth/callback?code=xxxxx
7. Backend doi code lay token:
   POST https://oauth.zaloapp.com/v4/oa/access_token
   Headers: secret_key = appSecret
   Body: app_id, code, grant_type=authorization_code
8. Luu token vao DB
9. Redirect ve frontend: /dashboard/admin/zalo?status=connected
```

### Ket qua Phase 3

```
[ ] .env co Zalo credentials
[ ] application.properties co zalo.* config
[ ] ZaloProperties class da tao
[ ] Them ZaloProperties vao @EnableConfigurationProperties
[ ] ZaloTokenManager da tao voi auto-refresh
[ ] ZaloOAuthController da tao
[ ] Test: goi /api/zalo/authorize-url -> mo URL -> callback -> token luu DB
[ ] Test: /api/zalo/status tra ve connected: true
```

---

## PHASE 4: WEBHOOK SYSTEM

### 4.1 Tao ZaloWebhookController

**File:** `src/main/java/com/mirror/product/controller/zalo/ZaloWebhookController.java`

```
POST /api/zalo/webhook    -> Nhan events tu Zalo (permitAll, khong can JWT)
```

Logic:
```
1. Nhan POST request tu Zalo server
2. TRA 200 OK NGAY LAP TUC (Zalo yeu cau respond < 2 giay)
3. Verify signature:
   computed = SHA256(app_id + raw_body + timestamp + oa_secret)
   So sanh voi header X-ZEvent-Signature
   Neu sai -> log warning, KHONG xu ly (van tra 200 de tranh retry)
4. Xu ly ASYNC (CompletableFuture.runAsync):
   Parse event_name:
   - "user_send_text"    -> luu message, auto-reply, notify staff
   - "user_send_image"   -> luu message voi attachment
   - "follow"            -> tao ZaloFollower, gui welcome message
   - "unfollow"          -> cap nhat isFollowing = false
   - "user_seen_message" -> cap nhat status = SEEN
```

### 4.2 Tao ZaloOAService

**File:** `src/main/java/com/mirror/product/service/zalo/ZaloOAService.java`

Chuc nang:
```
sendTextMessage(userId, text)
  -> POST https://openapi.zalo.me/v3.0/oa/message/cs
  -> Header: access_token
  -> Body: { recipient: { user_id }, message: { text } }
  -> Luu vao zalo_messages (direction=OUTGOING)

sendProductList(userId, products)
  -> Gui template list voi max 5 items
  -> Moi item co: title, subtitle (gia), image_url, link

saveIncomingMessage(userId, msgId, type, content)
  -> Luu vao zalo_messages (direction=INCOMING)

processAutoReply(userId, text, msgId)
  -> Ngoai gio (truoc 8h hoac sau 21h): gui tin ngoai gio
  -> Keyword "gia/bao nhieu/price": gui link san pham
  -> Keyword "lich hen/dat hen/appointment": gui link dat hen
  -> Keyword "dia chi/cua hang/location": gui link cua hang
  -> Khong match: khong reply (nhan vien tra loi thu cong)

sendWelcomeMessage(userId)
  -> Gui tin chao mung khi user follow OA
```

### 4.3 Tao ZaloFollowerService

**File:** `src/main/java/com/mirror/product/service/zalo/ZaloFollowerService.java`

Chuc nang:
```
handleNewFollower(zaloUserId)
  -> Tao ZaloFollower record (isFollowing=true, followedAt=now)
  -> Thu match voi user Mirror qua phone (neu co)

handleUnfollow(zaloUserId)
  -> Cap nhat isFollowing=false, unfollowedAt=now

updateLastMessage(zaloUserId)
  -> Cap nhat lastMessageAt=now, totalMessages++

addTag(zaloUserId, tagName)
  -> Doc tags JSON array hien tai
  -> Them tag moi
  -> Luu lai

removeTag(zaloUserId, tagName)
  -> Doc tags JSON array
  -> Xoa tag
  -> Luu lai
```

### Ket qua Phase 4

```
[ ] ZaloWebhookController da tao voi signature verification
[ ] ZaloOAService da tao (gui tin nhan, auto-reply, welcome)
[ ] ZaloFollowerService da tao (follow, unfollow, tags)
[ ] Webhook URL da dang ky tren Zalo Portal
[ ] Test: follow OA -> nhan welcome message
[ ] Test: gui tin "gia" -> nhan auto-reply voi link san pham
[ ] Test: gui tin ngoai gio -> nhan tin ngoai gio lam viec
[ ] Kiem tra DB: zalo_followers va zalo_messages co data
```

---

## PHASE 5: ZNS - THONG BAO TU DONG

### 5.1 Tao ZaloZNSService

**File:** `src/main/java/com/mirror/product/service/zalo/ZaloZNSService.java`

Chuc nang:
```
sendOrderConfirmation(customerPhone, orderCode, customerName, productName, totalAmount)
  -> Gui ZNS template xac nhan don hang
  -> triggerType = "ORDER"

sendOrderStatusUpdate(customerPhone, orderCode, status, statusMessage)
  -> Gui ZNS template cap nhat trang thai
  -> triggerType = "ORDER"

sendAppointmentReminder(customerPhone, customerName, date, time, venueName, venueAddress)
  -> Gui ZNS template nhac lich hen
  -> triggerType = "APPOINTMENT"

sendManual(phone, templateId, templateData)
  -> Gui ZNS thu cong tu Admin Dashboard
  -> triggerType = "MANUAL"

[PRIVATE] sendZNS(phone, templateId, templateName, templateData, triggerType, triggerEntityId)
  -> Chuan hoa phone: 0901234567 -> 84901234567
  -> Tao ZaloZnsLog record (status=SENDING)
  -> POST https://business.openapi.zalo.me/message/template
     Header: access_token
     Body: { phone, template_id, template_data }
  -> Cap nhat ZaloZnsLog:
     Thanh cong: status=SENT, znsMessageId, sentAt
     That bai: status=FAILED, errorMessage

[PRIVATE] normalizePhone(phone)
  -> Bo ky tu dac biet
  -> "0xxx" -> "84xxx"
  -> "+84xxx" -> "84xxx"
  -> "84xxx" -> giu nguyen
```

### 5.2 Tich hop vao OrderService

**File can sua:** `src/main/java/com/mirror/product/service/OrderService.java`

```java
// Them inject
@Autowired(required = false)
private ZaloZNSService zaloZNSService;

// Trong createOrder() - sau khi save thanh cong:
try {
    if (zaloZNSService != null && request.getCustomerPhone() != null) {
        zaloZNSService.sendOrderConfirmation(
            request.getCustomerPhone(),
            order.getOrderCode(),
            request.getCustomerName(),
            order.getProductSummary(),
            formatCurrency(order.getTotalAmount())
        );
    }
} catch (Exception e) {
    log.warn("[ZNS] Failed to send order confirmation: {}", e.getMessage());
    // ZNS fail KHONG anh huong tao don
}

// Trong updateOrderStatus() - sau khi save:
try {
    if (zaloZNSService != null && order.getCustomerPhone() != null) {
        zaloZNSService.sendOrderStatusUpdate(
            order.getCustomerPhone(),
            order.getOrderCode(),
            newStatus,
            statusMessage
        );
    }
} catch (Exception e) {
    log.warn("[ZNS] Failed to send status update: {}", e.getMessage());
}
```

> Dung `@Autowired(required = false)` de ZNS la optional - backend van chay binh thuong neu chua config Zalo.

### 5.3 Tich hop vao AppointmentService

**File can sua:** `src/main/java/com/mirror/product/service/AppointmentService.java`

Tuong tu OrderService - them goi ZNS sau khi tao appointment.

### 5.4 Tao AppointmentReminderScheduler

**File:** `src/main/java/com/mirror/product/scheduler/ZaloAppointmentReminderScheduler.java`

```
@Scheduled(cron = "0 0 8 * * *")  // 8:00 AM moi ngay
sendDailyReminders():
  1. Tim appointments ngay mai (status = CONFIRMED)
  2. Voi moi appointment co phone:
     -> Goi zaloZNSService.sendAppointmentReminder(...)
  3. Rate limiting: sleep 100ms giua moi request (Zalo limit 10 req/s)
```

### Ket qua Phase 5

```
[ ] ZaloZNSService da tao voi logging day du
[ ] OrderService.createOrder() goi sendOrderConfirmation
[ ] OrderService.updateStatus() goi sendOrderStatusUpdate
[ ] AppointmentService tich hop sendAppointmentReminder
[ ] ZaloAppointmentReminderScheduler chay 8:00 AM moi ngay
[ ] Test: tao don hang -> phone nhan ZNS
[ ] Test: doi trang thai don -> phone nhan ZNS
[ ] Kiem tra DB: zalo_zns_logs co records voi status SENT
```

---

## PHASE 6: ADMIN API CHO FRONTEND

### 6.1 Tao ZaloAdminController

**File:** `src/main/java/com/mirror/product/controller/zalo/ZaloAdminController.java`

```
@RestController
@RequestMapping("/api/v1/admin/zalo")

Endpoints:

CONVERSATIONS:
  GET  /conversations                    -> Danh sach cuoc tro chuyen (paginated)
  GET  /conversations/{userId}/messages  -> Lich su tin nhan voi 1 user (paginated)

SEND MESSAGES:
  POST /messages/text                    -> Gui tin nhan text { userId, text }
  POST /messages/product-list            -> Gui list san pham { userId, productIds }

FOLLOWERS:
  GET  /followers                        -> Danh sach followers (paginated, search, filter)
  GET  /followers/{userId}               -> Profile 1 follower
  POST /followers/{userId}/tag           -> Gan tag { tagName }
  DELETE /followers/{userId}/tag         -> Xoa tag { tagName }

TAGS:
  GET  /tags                             -> Danh sach tags
  POST /tags                             -> Tao tag { name, color, description }
  DELETE /tags/{tagName}                 -> Xoa tag

ZNS:
  GET  /zns/logs                         -> Lich su ZNS (paginated, filter by status/triggerType)
  POST /zns/send                         -> Gui ZNS thu cong { phone, templateId, templateData }

ANALYTICS:
  GET  /analytics                        -> Thong ke (totalFollowers, totalMessages, ZNS stats)
```

### 6.2 Tao DTOs

**Package:** `com.mirror.product.dto.zalo`

```
ZaloMessageRequest.java      { userId, text }
ZaloProductListRequest.java  { userId, productIds }
ZaloZNSRequest.java          { phone, templateId, templateData }
ZaloTagRequest.java          { name, color, description }
ZaloTokenResponse.java       { accessToken, refreshToken, expiresIn }
```

### Ket qua Phase 6

```
[ ] ZaloAdminController da tao voi tat ca endpoints
[ ] DTOs da tao voi validation annotations
[ ] Test: GET /api/v1/admin/zalo/conversations tra ve data
[ ] Test: POST /api/v1/admin/zalo/messages/text gui duoc tin nhan
[ ] Test: GET /api/v1/admin/zalo/followers tra ve danh sach
[ ] Test: GET /api/v1/admin/zalo/zns/logs tra ve lich su
```

---

## PHASE 7: SECURITYCONFIG & CORS

### 7.1 Cap nhat SecurityConfig.java

**File can sua:** `src/main/java/com/mirror/product/config/SecurityConfig.java`

Them vao phan requestMatchers:

```java
// Zalo webhook - Zalo server goi vao, khong can JWT
.requestMatchers("/api/zalo/webhook").permitAll()

// Zalo OAuth callback - redirect tu Zalo
.requestMatchers("/api/zalo/oauth/callback").permitAll()

// Zalo connection status - co the public
.requestMatchers(HttpMethod.GET, "/api/zalo/status").permitAll()

// Zalo admin endpoints - chi ADMIN va SUPER_ADMIN
.requestMatchers("/api/v1/admin/zalo/**").hasAnyRole("ADMIN", "SUPER_ADMIN", "IT_ADMIN")

// Zalo authorize URL - chi admin
.requestMatchers("/api/zalo/authorize-url").hasAnyRole("ADMIN", "SUPER_ADMIN")
```

### 7.2 Cap nhat CorsConfig (neu can)

Neu frontend o domain khac, dam bao domain do co trong CORS config.
Hien tai CorsConfig da cho phep cac Vercel domains.

### Ket qua Phase 7

```
[ ] /api/zalo/webhook la permitAll (Zalo server goi)
[ ] /api/zalo/oauth/callback la permitAll (redirect)
[ ] /api/v1/admin/zalo/** yeu cau ADMIN role
[ ] Test: goi webhook khong can token -> 200 OK
[ ] Test: goi admin API khong co token -> 401
[ ] Test: goi admin API voi CUSTOMER role -> 403
[ ] Test: goi admin API voi ADMIN role -> 200
```

---

## PHASE 8: FRONTEND (THAM KHAO)

> Phase nay cho frontend developer, chi liet ke de reference.

### 8.1 Tao zaloApi.js

**File:** `src/services/zaloApi.js`

API service goi cac endpoints backend:
- getStatus, getAuthorizeUrl, disconnect
- getConversations, getMessages, sendTextMessage, sendProductList
- getFollowers, tagFollower, removeTag
- getTags, createTag, deleteTag
- getZNSLogs, sendZNS
- getAnalytics

### 8.2 Them routes

**File sua:** `src/constants/routes.js`

```
ZALO_DASHBOARD, ZALO_CONVERSATIONS, ZALO_FOLLOWERS, ZALO_ZNS_LOGS, ZALO_SETTINGS
```

### 8.3 Tao React components

```
src/components/zalo-oa/
  ZaloSettings.jsx              - Ket noi/ngat ket noi OA
  ZaloOADashboard.jsx           - Tong quan stats
  ZaloConversationList.jsx      - Danh sach chat
  ZaloConversationDetail.jsx    - Chat window
  ZaloFollowerList.jsx          - Danh sach followers
  ZaloZNSLogs.jsx               - Lich su ZNS
```

### 8.4 Them Zalo Chat Widget

**File sua:** `index.html`

```html
<div class="zalo-chat-widget"
  data-oaid="YOUR_OA_ID"
  data-welcome-message="Chao ban! Mirror Future Diamond xin ho tro."
  data-autopopup="0"
  data-width="350"
  data-height="420">
</div>
<script src="https://sp.zalo.me/plugins/sdk.js"></script>
```

---

## DANH SACH TOAN BO FILE

### Backend - TAO MOI (24 files)

```
src/main/resources/db/changelog/
  118-create-zalo-oa-tables.xml

src/main/java/com/mirror/product/config/zalo/
  ZaloProperties.java

src/main/java/com/mirror/product/entity/zalo/
  ZaloToken.java
  ZaloFollower.java
  ZaloMessage.java
  ZaloZnsLog.java
  ZaloTag.java

src/main/java/com/mirror/product/repository/zalo/
  ZaloTokenRepository.java
  ZaloFollowerRepository.java
  ZaloMessageRepository.java
  ZaloZnsLogRepository.java
  ZaloTagRepository.java

src/main/java/com/mirror/product/service/zalo/
  ZaloTokenManager.java
  ZaloOAService.java
  ZaloZNSService.java
  ZaloFollowerService.java

src/main/java/com/mirror/product/controller/zalo/
  ZaloWebhookController.java
  ZaloOAuthController.java
  ZaloAdminController.java

src/main/java/com/mirror/product/dto/zalo/
  ZaloMessageRequest.java
  ZaloProductListRequest.java
  ZaloZNSRequest.java
  ZaloTagRequest.java
  ZaloTokenResponse.java

src/main/java/com/mirror/product/scheduler/
  ZaloAppointmentReminderScheduler.java
```

### Backend - SUA (5 files)

```
src/main/resources/db/changelog/db.changelog-master.xml
  -> Them: <include file="db/changelog/118-create-zalo-oa-tables.xml"/>

src/main/resources/application.properties
  -> Them: zalo.* properties

src/main/java/com/mirror/product/ProductApplication.java
  -> Them: ZaloProperties.class vao @EnableConfigurationProperties

src/main/java/com/mirror/product/config/SecurityConfig.java
  -> Them: requestMatchers cho /api/zalo/** va /api/v1/admin/zalo/**

src/main/java/com/mirror/product/service/OrderService.java
  -> Them: inject ZaloZNSService, goi sendOrderConfirmation va sendOrderStatusUpdate

src/main/java/com/mirror/product/service/AppointmentService.java
  -> Them: inject ZaloZNSService, goi sendAppointmentReminder

.env
  -> Them: ZALO_* variables
```

### Frontend - TAO MOI (7 files)

```
src/services/zaloApi.js
src/components/zalo-oa/ZaloSettings.jsx
src/components/zalo-oa/ZaloOADashboard.jsx
src/components/zalo-oa/ZaloConversationList.jsx
src/components/zalo-oa/ZaloConversationDetail.jsx
src/components/zalo-oa/ZaloFollowerList.jsx
src/components/zalo-oa/ZaloZNSLogs.jsx
```

### Frontend - SUA (3 files)

```
src/constants/routes.js
src/routes/AppRoutes.jsx
index.html
```

---

## CHECKLIST TRIEN KHAI

### Phase 1: Dang ky (khong code)
- [ ] Tao Zalo OA tai oa.zalo.me
- [ ] Xac minh doanh nghiep
- [ ] Tao Zalo App tai developers.zalo.me
- [ ] Lay App ID + Secret Key
- [ ] Lien ket OA voi App, lay OA ID + OA Secret
- [ ] Xac minh domain
- [ ] Dang ky 3 ZNS templates (lam som, cho duyet 1-3 ngay)

### Phase 2: Database
- [ ] Tao 118-create-zalo-oa-tables.xml
- [ ] Them vao db.changelog-master.xml
- [ ] Tao 5 entity classes
- [ ] Tao 5 repository interfaces
- [ ] Chay migration thanh cong

### Phase 3: Config & Token
- [ ] Them variables vao .env
- [ ] Them zalo.* vao application.properties
- [ ] Tao ZaloProperties
- [ ] Them vao @EnableConfigurationProperties
- [ ] Tao ZaloTokenManager voi auto-refresh
- [ ] Tao ZaloOAuthController
- [ ] Test OAuth flow end-to-end

### Phase 4: Webhook
- [ ] Tao ZaloWebhookController voi signature verification
- [ ] Tao ZaloOAService (gui tin nhan, auto-reply)
- [ ] Tao ZaloFollowerService
- [ ] Dang ky webhook URL tren Zalo Portal
- [ ] Test: follow -> welcome message
- [ ] Test: gui tin -> auto-reply
- [ ] Test: kiem tra DB co data

### Phase 5: ZNS
- [ ] Tao ZaloZNSService
- [ ] Tich hop vao OrderService (createOrder, updateStatus)
- [ ] Tich hop vao AppointmentService
- [ ] Tao ZaloAppointmentReminderScheduler (8:00 AM)
- [ ] Test: tao don -> nhan ZNS
- [ ] Test: doi trang thai -> nhan ZNS
- [ ] Kiem tra zalo_zns_logs

### Phase 6: Admin API
- [ ] Tao ZaloAdminController
- [ ] Tao DTOs
- [ ] Test tat ca endpoints

### Phase 7: Security
- [ ] Cap nhat SecurityConfig
- [ ] Test: webhook permitAll
- [ ] Test: admin API yeu cau role
- [ ] Test: unauthorized bi tu choi

### Phase 8: Frontend
- [ ] Tao zaloApi.js
- [ ] Them routes
- [ ] Tao 6 React components
- [ ] Them chat widget vao index.html
- [ ] Test end-to-end

---

## LUU Y QUAN TRONG

### Bao mat
- **KHONG commit** Zalo credentials vao git
- Webhook phai verify signature (SHA256)
- Token luu trong DB, KHONG expose ra frontend
- ZNS logs **KHONG** luu noi dung nhay cam
- Phone number hien thi masked tren frontend: `0901***567`

### Rate Limiting
- Zalo API gioi han **10 requests/giay**
- Scheduler gui ZNS nen sleep 100ms giua moi request
- Broadcast feature can queue mechanism

### Token Lifecycle
- Access Token: **1 gio**
- Refresh Token: **3 thang** khong su dung thi het han
- Refresh token chi dung **1 lan** (Zalo tra ve token moi)
- Neu refresh token het han -> admin phai re-authorize thu cong

### ZNS Chi phi
- Transaction template: ~300-400 VND/tin
- Chi tinh phi khi gui thanh cong
- Tiet kiem ~40% so voi SMS

### Webhook
- **PHAI respond < 2 giay** (Zalo timeout)
- Xu ly nang phai dung `@Async` hoac `CompletableFuture`
- Neu khong respond, Zalo retry: 30s -> 5m -> 15m -> 30m -> 1h

### Multi-instance
- Token auto-refresh nen co distributed lock (ShedLock) neu chay nhieu instance
- Hien tai AppRunner chi chay 1 instance nen chua can
