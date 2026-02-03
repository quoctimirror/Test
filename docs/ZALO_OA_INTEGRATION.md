# Zalo OA Integration - Tich hop Zalo Official Account

## Muc luc

1. [Tong quan](#1-tong-quan)
2. [Kien truc he thong](#2-kien-truc-he-thong)
3. [Setup Zalo OA & Developer App](#3-setup-zalo-oa--developer-app)
4. [Authentication - Quan ly Token](#4-authentication---quan-ly-token)
5. [Webhook - Nhan su kien tu Zalo](#5-webhook---nhan-su-kien-tu-zalo)
6. [OA Messaging API - Chat voi khach hang](#6-oa-messaging-api---chat-voi-khach-hang)
7. [ZNS - Thong bao tu dong](#7-zns---thong-bao-tu-dong)
8. [Frontend - Admin Dashboard UI](#8-frontend---admin-dashboard-ui)
9. [API Endpoints (Backend)](#9-api-endpoints-backend)
10. [Database Schema](#10-database-schema)
11. [Mapping voi he thong hien tai](#11-mapping-voi-he-thong-hien-tai)
12. [Chat Widget tren Website](#12-chat-widget-tren-website)
13. [Bao mat](#13-bao-mat)
14. [Gioi han & Chi phi](#14-gioi-han--chi-phi)
15. [Checklist trien khai](#15-checklist-trien-khai)

---

## 1. Tong quan

### Muc tieu

Tich hop Zalo Official Account (OA) vao he thong Mirror Future Diamond de:

- **Chat support**: Tu van san pham, ho tro khach hang qua Zalo
- **Thong bao tu dong (ZNS)**: Xac nhan don hang, nhac lich hen, cap nhat trang thai
- **Quan ly khach hang**: Theo doi follower, gan tag, phan loai khach
- **POD notification**: Thong bao partner ve scan, commission

### He sinh thai Zalo OA

```
┌─────────────────────────────────────────────────────────┐
│                    ZALO OA ECOSYSTEM                    │
├─────────────────┬──────────────────┬────────────────────┤
│  OA Messaging   │    Webhook       │    ZNS             │
│  (Chat 2 chieu) │  (Real-time      │  (Thong bao        │
│                 │   events)        │   template)         │
├─────────────────┼──────────────────┼────────────────────┤
│ - Text message  │ - user_send_text │ - Xac nhan don     │
│ - Image/File    │ - follow         │ - Nhac lich hen     │
│ - List template │ - user_seen_msg  │ - OTP              │
│ - Reply         │ - oa_send_text   │ - Cap nhat status  │
│ - Broadcast     │ - unfollow       │ - Khuyen mai       │
└─────────────────┴──────────────────┴────────────────────┘
```

---

## 2. Kien truc he thong

### Flow tong quan

```
┌──────────────┐                    ┌─────────────────────────────┐
│              │   REST API         │                             │
│  React App   │──────────────────▶│   Spring Boot Backend       │
│  (Frontend)  │                    │   (AWS AppRunner)           │
│              │◀──────────────────│                             │
│  - Admin UI  │   JSON Response    │   ┌───────────────────┐    │
│  - Chat UI   │                    │   │ ZaloOAService      │    │
│  - Widget    │                    │   │ - sendMessage()    │    │
│              │                    │   │ - sendZNS()        │    │
└──────────────┘                    │   │ - getFollowers()   │    │
                                    │   │ - manageTokens()   │    │
                                    │   └───────┬───────────┘    │
                                    │           │                 │
                                    │   ┌───────▼───────────┐    │
                                    │   │ ZaloWebhook       │    │
                                    │   │ Controller        │◀───┼──── Zalo Server
                                    │   │ POST /webhook/zalo│    │     (events)
                                    │   └───────────────────┘    │
                                    │           │                 │
                                    │   ┌───────▼───────────┐    │
                                    │   │ ZaloTokenManager   │───┼──── Zalo OAuth
                                    │   │ - refresh()        │    │     Server
                                    │   │ - store()          │    │
                                    │   └───────────────────┘    │
                                    │           │                 │
                                    │   ┌───────▼───────────┐    │
                                    │   │ PostgreSQL DB      │    │
                                    │   │ - zalo_tokens      │    │
                                    │   │ - zalo_conversations│   │
                                    │   │ - zalo_followers    │   │
                                    │   │ - zns_logs         │    │
                                    │   └───────────────────┘    │
                                    └─────────────────────────────┘
```

### Nguyen tac

1. **Frontend KHONG goi Zalo API truc tiep** - moi request di qua backend
2. **Token luu o backend** - khong expose Zalo credentials ra frontend
3. **Webhook xu ly async** - tra 200 ngay, xu ly logic sau (trong 2 giay)
4. **ZNS trigger tu business events** - khong can user action

---

## 3. Setup Zalo OA & Developer App

### Buoc 1: Tao Zalo Official Account

1. Truy cap [oa.zalo.me](https://oa.zalo.me/home)
2. Dang ky OA voi thong tin doanh nghiep
3. Upload giay phep kinh doanh de xac minh
4. Cho duyet (1-3 ngay lam viec)

**Thong tin can thiet:**
- Ten OA: `Mirror Future Diamond`
- Loai: Doanh nghiep
- Nganh: Trang suc / Luxury

### Buoc 2: Tao Zalo App

1. Truy cap [developers.zalo.me](https://developers.zalo.me)
2. Tao ung dung moi → lay `App ID` va `Secret Key`
3. Lien ket OA voi App
4. Cau hinh Callback URL: `https://api.mirrorfuturediamond.com/api/zalo/oauth/callback`

### Buoc 3: Xac minh Domain

1. Trong Zalo Developer Portal → Verify Domain
2. Them domain: `mirrorfuturediamond.com`
3. Upload file xac minh hoac them DNS TXT record
4. **Bat buoc HTTPS**

### Buoc 4: Dang ky Webhook

1. Trong Zalo Developer Portal → Webhook Settings
2. URL: `https://nsa4fef6um.ap-southeast-1.awsapprunner.com/api/zalo/webhook`
3. Bat cac events:

```
user_send_text        ✅  Khach gui tin nhan text
user_send_image       ✅  Khach gui hinh anh
user_send_file        ✅  Khach gui file
user_send_sticker     ✅  Khach gui sticker
user_send_audio       ✅  Khach gui voice
follow                ✅  Khach follow OA
unfollow              ✅  Khach unfollow OA
user_received_message ✅  Khach nhan duoc tin
user_seen_message     ✅  Khach da doc tin
oa_send_text          ✅  OA gui tin text
oa_send_image         ✅  OA gui hinh
oa_send_file          ✅  OA gui file
```

### Environment Variables (Backend)

```properties
# application.properties hoac .env
ZALO_APP_ID=your_app_id
ZALO_APP_SECRET=your_secret_key
ZALO_OA_SECRET=your_oa_secret_key
ZALO_OA_ID=your_oa_id
ZALO_WEBHOOK_SECRET=your_webhook_verify_token
ZALO_REDIRECT_URI=https://api.mirrorfuturediamond.com/api/zalo/oauth/callback
```

---

## 4. Authentication - Quan ly Token

### OAuth 2.0 Flow

```
┌────────┐     ┌─────────────────┐     ┌──────────────┐
│ Admin  │────▶│ Backend Server  │────▶│ Zalo OAuth   │
│ Browser│     │                 │     │ Server       │
│        │◀────│ /zalo/authorize │◀────│              │
│        │     │                 │     │ oauth.zalo   │
│ Click  │     │ Luu token vao   │     │ app.com/v4   │
│ "Ket   │     │ DB              │     │              │
│  noi"  │     │                 │     │              │
└────────┘     └─────────────────┘     └──────────────┘
```

### Token Lifecycle

```
Access Token  ──▶ Het han sau 1 gio
                   │
                   ▼
Refresh Token ──▶ Dung de lay Access Token moi
                   │ (chi dung 1 lan)
                   │
                   ▼
                  Het han sau 3 thang khong su dung
                   │
                   ▼
                  Can admin re-authorize thu cong
```

### API Endpoints (Zalo OAuth)

**1. Tao Authorization URL**

```
GET https://oauth.zaloapp.com/v4/oa/permission
  ?app_id={APP_ID}
  &redirect_uri={REDIRECT_URI}
```

**2. Exchange Code → Token**

```
POST https://oauth.zaloapp.com/v4/oa/access_token

Headers:
  Content-Type: application/x-www-form-urlencoded
  secret_key: {APP_SECRET}

Body:
  app_id={APP_ID}
  &code={AUTH_CODE}
  &grant_type=authorization_code
```

**Response:**
```json
{
  "access_token": "xxx",
  "refresh_token": "yyy",
  "expires_in": "3600"
}
```

**3. Refresh Token**

```
POST https://oauth.zaloapp.com/v4/oa/access_token

Headers:
  Content-Type: application/x-www-form-urlencoded
  secret_key: {APP_SECRET}

Body:
  app_id={APP_ID}
  &refresh_token={REFRESH_TOKEN}
  &grant_type=refresh_token
```

### Backend: Token Manager (Java pseudo-code)

```java
@Service
public class ZaloTokenManager {

    @Autowired
    private ZaloTokenRepository tokenRepo;

    @Scheduled(fixedRate = 50 * 60 * 1000) // Moi 50 phut
    public void autoRefreshToken() {
        ZaloToken current = tokenRepo.findLatest();
        if (current == null) return;

        // Refresh 10 phut truoc khi het han
        if (current.isExpiringSoon()) {
            try {
                ZaloTokenResponse newToken = callRefreshTokenAPI(
                    current.getRefreshToken()
                );
                tokenRepo.save(new ZaloToken(
                    newToken.getAccessToken(),
                    newToken.getRefreshToken(),
                    newToken.getExpiresIn()
                ));
            } catch (Exception e) {
                log.error("Zalo token refresh failed", e);
                // Alert admin qua email/slack
            }
        }
    }

    public String getAccessToken() {
        ZaloToken token = tokenRepo.findLatest();
        if (token == null || token.isExpired()) {
            throw new ZaloAuthException("No valid token. Admin needs to re-authorize.");
        }
        return token.getAccessToken();
    }
}
```

---

## 5. Webhook - Nhan su kien tu Zalo

### Webhook Controller

```java
@RestController
@RequestMapping("/api/zalo")
public class ZaloWebhookController {

    @Autowired
    private ZaloMessageService messageService;

    @Value("${ZALO_APP_ID}")
    private String appId;

    @Value("${ZALO_OA_SECRET}")
    private String oaSecret;

    /**
     * Zalo gui POST request khi co su kien
     * QUAN TRONG: Phai tra 200 trong 2 giay
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader("X-ZEvent-Signature") String signature,
            @RequestHeader("X-ZEvent-Ts") String timestamp) {

        // 1. Tra 200 ngay lap tuc
        // 2. Xu ly async
        if (verifySignature(rawBody, signature, timestamp)) {
            CompletableFuture.runAsync(() -> {
                processEvent(rawBody);
            });
        }

        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    private boolean verifySignature(String body, String signature, String timestamp) {
        String data = appId + body + timestamp + oaSecret;
        String hash = "mac=" + sha256(data);
        return hash.equals(signature);
    }

    private void processEvent(String rawBody) {
        ZaloEvent event = parseEvent(rawBody);

        switch (event.getEventName()) {
            case "user_send_text":
                messageService.handleIncomingMessage(event);
                break;
            case "user_send_image":
                messageService.handleIncomingImage(event);
                break;
            case "follow":
                messageService.handleNewFollower(event);
                break;
            case "unfollow":
                messageService.handleUnfollow(event);
                break;
            case "user_seen_message":
                messageService.handleSeenMessage(event);
                break;
            default:
                log.info("Unhandled event: {}", event.getEventName());
        }
    }
}
```

### Webhook Payload Format

**user_send_text:**
```json
{
  "app_id": "your_app_id",
  "oa_id": "your_oa_id",
  "user_id_by_app": "user_zalo_id",
  "event_name": "user_send_text",
  "timestamp": "1700000000000",
  "message": {
    "msg_id": "msg_123",
    "text": "Toi muon hoi ve nhan kim cuong"
  },
  "sender": {
    "id": "user_zalo_id"
  }
}
```

**follow:**
```json
{
  "app_id": "your_app_id",
  "oa_id": "your_oa_id",
  "event_name": "follow",
  "timestamp": "1700000000000",
  "follower": {
    "id": "user_zalo_id"
  }
}
```

### Auto-reply Logic

```java
@Service
public class ZaloMessageService {

    public void handleIncomingMessage(ZaloEvent event) {
        String text = event.getMessage().getText().toLowerCase();
        String userId = event.getSender().getId();

        // Luu vao DB
        saveConversation(userId, text, "INCOMING");

        // Auto-reply ngoai gio lam viec (truoc 8h hoac sau 21h)
        if (isOutsideBusinessHours()) {
            sendAutoReply(userId,
                "Cam on ban da lien he Mirror Future Diamond! " +
                "Hien tai ngoai gio lam viec, chung toi se phan hoi " +
                "ban trong gio hanh chinh (8:00 - 21:00). " +
                "Neu can gap, vui long goi hotline: 1900-xxx-xxx"
            );
            return;
        }

        // Keyword-based auto-reply
        if (text.contains("gia") || text.contains("bao nhieu")) {
            sendAutoReply(userId,
                "Ban co the xem bang gia tai: " +
                "https://www.mirrorfuturediamond.com/products\n" +
                "Hoac nhan vien se tu van chi tiet cho ban ngay!"
            );
        } else if (text.contains("lich hen") || text.contains("dat hen")) {
            sendAutoReply(userId,
                "Ban co the dat lich hen tai day: " +
                "https://www.mirrorfuturediamond.com/book-an-appointment\n" +
                "Hoac cho tin nhan, chung toi se ho tro!"
            );
        }

        // Notify staff qua Admin Dashboard (WebSocket/Ably)
        notifyStaff(userId, text);
    }

    public void handleNewFollower(ZaloEvent event) {
        String userId = event.getFollower().getId();

        // Luu follower vao DB
        saveFollower(userId);

        // Gui tin chao mung
        sendWelcomeMessage(userId);
    }
}
```

---

## 6. OA Messaging API - Chat voi khach hang

### Base URL

```
https://openapi.zalo.me/v3.0/oa/message/{messageType}
```

`messageType` gom 3 loai:
- `cs` - Customer Service (tra loi trong 24h sau khi khach nhan tin)
- `transaction` - Thong bao giao dich (order, payment)
- `promotion` - Khuyen mai (can khach dong y nhan)

### Gui tin nhan text

```
POST https://openapi.zalo.me/v3.0/oa/message/cs

Headers:
  Content-Type: application/json
  access_token: {ACCESS_TOKEN}

Body:
{
  "recipient": {
    "user_id": "zalo_user_id"
  },
  "message": {
    "text": "Chao ban! Mirror Diamond xin ho tro."
  }
}
```

### Gui tin nhan co hinh anh

```json
{
  "recipient": {
    "user_id": "zalo_user_id"
  },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "media",
        "elements": [{
          "media_type": "image",
          "url": "https://www.mirrorfuturediamond.com/product-image.jpg"
        }]
      }
    }
  }
}
```

### Gui tin nhan dang list (san pham)

```json
{
  "recipient": {
    "user_id": "zalo_user_id"
  },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "list",
        "elements": [
          {
            "title": "Nhan Kim Cuong Lumex 91",
            "subtitle": "18K White Gold - 1.2 carat",
            "image_url": "https://...",
            "default_action": {
              "type": "oa.open.url",
              "url": "https://www.mirrorfuturediamond.com/product/lumex-91"
            }
          },
          {
            "title": "Bong tai Eternal Light",
            "subtitle": "18K Rose Gold - 0.8 carat",
            "image_url": "https://...",
            "default_action": {
              "type": "oa.open.url",
              "url": "https://www.mirrorfuturediamond.com/product/eternal-light"
            }
          }
        ]
      }
    }
  }
}
```

### Reply tin nhan cua khach

```
POST https://openapi.zalo.me/v3.0/oa/message/cs

Body:
{
  "recipient": {
    "message_id": "msg_id_tu_webhook"
  },
  "message": {
    "text": "Cam on ban! De minh tu van them nhe."
  }
}
```

### Quy tac gui tin

| Loai tin | Dieu kien | Gioi han |
|----------|-----------|----------|
| `cs` | Khach nhan tin truoc, tra loi trong 24h | Khong gioi han |
| `transaction` | Khach follow OA | 1 tin/giao dich |
| `promotion` | Khach dong y nhan promo | Gioi han theo OA tier |

---

## 7. ZNS - Thong bao tu dong

### ZNS la gi?

Zalo Notification Service gui thong bao theo **template da duoc Zalo duyet** toi **so dien thoai** cua khach (khong can khach follow OA).

### Template can dang ky

#### Template 1: Xac nhan don hang

```
Ten: mirror_order_confirmation
Loai: Transaction

Noi dung:
──────────────────────────────
Xac nhan don hang #{order_code}

Khach hang: {customer_name}
San pham: {product_name}
So luong: {quantity}
Tong tien: {total_amount}

Tinh trang: Da tiep nhan
Theo doi don hang tai:
mirrorfuturediamond.com

Cam on ban da tin tuong Mirror Future Diamond!
──────────────────────────────
```

#### Template 2: Nhac lich hen

```
Ten: mirror_appointment_reminder
Loai: Transaction

Noi dung:
──────────────────────────────
Nhac lich hen - Mirror Future Diamond

Xin chao {customer_name},

Ban co lich hen vao:
Ngay: {appointment_date}
Gio: {appointment_time}
Dia diem: {venue_name}
Dia chi: {venue_address}

Neu can thay doi, vui long lien he:
{hotline_number}

Hen gap ban!
──────────────────────────────
```

#### Template 3: Cap nhat trang thai don hang

```
Ten: mirror_order_status
Loai: Transaction

Noi dung:
──────────────────────────────
Cap nhat don hang #{order_code}

Trang thai moi: {status}
{status_message}

Theo doi chi tiet tai:
mirrorfuturediamond.com

Mirror Future Diamond
──────────────────────────────
```

#### Template 4: Thong bao POD Partner

```
Ten: mirror_pod_partner_notify
Loai: Transaction

Noi dung:
──────────────────────────────
Thong bao tu Mirror Diamond POD

Xin chao {partner_name},

Co {scan_count} luot scan moi tai POD "{pod_name}"
trong ngay {date}.

Tong luot scan thang nay: {monthly_total}
Hoa hong du kien: {commission_estimate}

Xem chi tiet tai Partner Portal.

Mirror Future Diamond
──────────────────────────────
```

### Gui ZNS qua API

```
POST https://business.openapi.zalo.me/message/template

Headers:
  Content-Type: application/json
  access_token: {ACCESS_TOKEN}

Body:
{
  "phone": "84901234567",
  "template_id": "your_template_id",
  "template_data": {
    "order_code": "MFD-2025-001",
    "customer_name": "Nguyen Van A",
    "product_name": "Nhan Kim Cuong Lumex 91",
    "quantity": "1",
    "total_amount": "45,000,000 VND"
  }
}
```

**Response:**
```json
{
  "error": 0,
  "message": "Success",
  "data": {
    "msg_id": "zns_msg_123"
  }
}
```

### ZNS Trigger Points (mapping voi he thong hien tai)

```
ordersAPI.create()           ──▶  ZNS: mirror_order_confirmation
ordersAPI.updateStatus()     ──▶  ZNS: mirror_order_status
appointmentsAPI.create()     ──▶  ZNS: mirror_appointment_reminder
appointmentsAPI.confirm()    ──▶  ZNS: mirror_appointment_reminder (confirm)
authAPI.register()           ──▶  ZNS: welcome (optional)
commissionApi.approve()      ──▶  ZNS: mirror_pod_partner_notify
```

### Backend: ZNS Service

```java
@Service
public class ZaloZNSService {

    @Autowired
    private ZaloTokenManager tokenManager;

    private static final String ZNS_URL =
        "https://business.openapi.zalo.me/message/template";

    /**
     * Gui ZNS xac nhan don hang
     * Goi khi OrderService.createOrder() thanh cong
     */
    public ZNSResult sendOrderConfirmation(Order order, String customerPhone) {
        Map<String, String> templateData = Map.of(
            "order_code", order.getOrderCode(),
            "customer_name", order.getCustomerName(),
            "product_name", order.getProductSummary(),
            "quantity", String.valueOf(order.getTotalItems()),
            "total_amount", formatCurrency(order.getTotalAmount())
        );

        return sendZNS(customerPhone, TEMPLATE_ORDER_CONFIRM, templateData);
    }

    /**
     * Gui ZNS nhac lich hen
     * Goi boi Scheduler 24h truoc lich hen
     */
    public ZNSResult sendAppointmentReminder(Appointment appt) {
        Map<String, String> templateData = Map.of(
            "customer_name", appt.getCustomerName(),
            "appointment_date", formatDate(appt.getDate()),
            "appointment_time", formatTime(appt.getTime()),
            "venue_name", appt.getVenue().getName(),
            "venue_address", appt.getVenue().getAddress(),
            "hotline_number", "1900-xxx-xxx"
        );

        return sendZNS(appt.getPhone(), TEMPLATE_APPT_REMINDER, templateData);
    }

    private ZNSResult sendZNS(String phone, String templateId,
                               Map<String, String> data) {
        String token = tokenManager.getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("access_token", token);

        Map<String, Object> body = Map.of(
            "phone", normalizePhone(phone),  // 84xxxxxxxxx format
            "template_id", templateId,
            "template_data", data
        );

        // Log truoc khi gui
        znsLogRepo.save(new ZNSLog(phone, templateId, data, "SENDING"));

        try {
            ResponseEntity<ZNSResponse> response = restTemplate.postForEntity(
                ZNS_URL, new HttpEntity<>(body, headers), ZNSResponse.class
            );

            // Log ket qua
            znsLogRepo.updateStatus(phone, templateId, "SENT",
                response.getBody().getMsgId());

            return ZNSResult.success(response.getBody().getMsgId());
        } catch (Exception e) {
            znsLogRepo.updateStatus(phone, templateId, "FAILED", e.getMessage());
            return ZNSResult.failure(e.getMessage());
        }
    }

    /**
     * Chuan hoa so dien thoai sang format 84xxxxxxxxx
     */
    private String normalizePhone(String phone) {
        phone = phone.replaceAll("[^0-9]", "");
        if (phone.startsWith("0")) {
            return "84" + phone.substring(1);
        }
        if (phone.startsWith("84")) {
            return phone;
        }
        return "84" + phone;
    }
}
```

---

## 8. Frontend - Admin Dashboard UI

### Them routes moi

File: `src/constants/routes.js`

```javascript
// Zalo OA Management routes
ZALO_DASHBOARD: "/dashboard/admin/zalo",
ZALO_CONVERSATIONS: "/dashboard/admin/zalo/conversations",
ZALO_CONVERSATION_DETAIL: "/dashboard/admin/zalo/conversations/:conversationId",
ZALO_FOLLOWERS: "/dashboard/admin/zalo/followers",
ZALO_ZNS_TEMPLATES: "/dashboard/admin/zalo/zns-templates",
ZALO_ZNS_LOGS: "/dashboard/admin/zalo/zns-logs",
ZALO_BROADCAST: "/dashboard/admin/zalo/broadcast",
ZALO_SETTINGS: "/dashboard/admin/zalo/settings",
```

### Them API service moi

File: `src/services/zaloApi.js`

```javascript
import api from "./api";

// ===== ZALO OA API =====
// Moi request di qua backend, KHONG goi Zalo API truc tiep

export const zaloAPI = {
  // === Connection & Status ===
  getStatus: () => api.get("/api/zalo/status"),
  getAuthorizeUrl: () => api.get("/api/zalo/authorize-url"),
  disconnect: () => api.post("/api/zalo/disconnect"),

  // === Conversations ===
  getConversations: (params = {}) =>
    api.get("/api/zalo/conversations", { params }),
  getConversationDetail: (conversationId) =>
    api.get(`/api/zalo/conversations/${conversationId}`),
  getMessages: (userId, params = {}) =>
    api.get(`/api/zalo/conversations/${userId}/messages`, { params }),

  // === Send Messages ===
  sendTextMessage: (userId, text) =>
    api.post("/api/zalo/messages/text", { userId, text }),
  sendImageMessage: (userId, imageUrl) =>
    api.post("/api/zalo/messages/image", { userId, imageUrl }),
  sendProductList: (userId, productIds) =>
    api.post("/api/zalo/messages/product-list", { userId, productIds }),
  replyMessage: (messageId, text) =>
    api.post("/api/zalo/messages/reply", { messageId, text }),

  // === Followers ===
  getFollowers: (params = {}) =>
    api.get("/api/zalo/followers", { params }),
  getFollowerProfile: (userId) =>
    api.get(`/api/zalo/followers/${userId}`),
  tagFollower: (userId, tagName) =>
    api.post(`/api/zalo/followers/${userId}/tag`, { tagName }),
  removeFollowerTag: (userId, tagName) =>
    api.delete(`/api/zalo/followers/${userId}/tag`, {
      data: { tagName }
    }),

  // === Tags ===
  getTags: () => api.get("/api/zalo/tags"),
  createTag: (name) => api.post("/api/zalo/tags", { name }),
  deleteTag: (tagName) => api.delete(`/api/zalo/tags/${tagName}`),

  // === ZNS ===
  getZNSTemplates: () => api.get("/api/zalo/zns/templates"),
  getZNSTemplateDetail: (templateId) =>
    api.get(`/api/zalo/zns/templates/${templateId}`),
  sendZNS: (phone, templateId, templateData) =>
    api.post("/api/zalo/zns/send", { phone, templateId, templateData }),
  getZNSLogs: (params = {}) =>
    api.get("/api/zalo/zns/logs", { params }),

  // === Broadcast ===
  sendBroadcast: (data) =>
    api.post("/api/zalo/broadcast", data),

  // === Analytics ===
  getAnalytics: (params = {}) =>
    api.get("/api/zalo/analytics", { params }),
};

export default zaloAPI;
```

### Component Structure

```
src/components/zalo-oa/
├── ZaloOADashboard.jsx          # Tong quan: followers, messages, ZNS stats
├── ZaloOADashboard.css
├── ZaloConversationList.jsx     # Danh sach cuoc tro chuyen
├── ZaloConversationDetail.jsx   # Chi tiet chat voi 1 khach hang
├── ZaloMessageComposer.jsx      # Soan & gui tin nhan
├── ZaloFollowerList.jsx         # Danh sach nguoi theo doi
├── ZaloFollowerProfile.jsx      # Thong tin chi tiet follower
├── ZaloTagManager.jsx           # Quan ly tags
├── ZaloZNSTemplates.jsx         # Danh sach ZNS templates
├── ZaloZNSLogs.jsx              # Lich su gui ZNS
├── ZaloBroadcast.jsx            # Gui tin hang loat
└── ZaloSettings.jsx             # Cau hinh ket noi OA
```

### UI Mockup - Conversation Detail

```
┌─────────────────────────────────────────────────────────┐
│  ◀ Back    Nguyen Van A    ● Online    [Profile] [Tag]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│        Toi muon hoi ve nhan kim cuong        14:30  ◀── │
│                                                         │
│  ──▶  Chao ban! Ban quan tam den dong          14:31    │
│       san pham nao a?                                   │
│                                                         │
│        Lumex 91 gia bao nhieu vay?           14:32  ◀── │
│                                                         │
│  ──▶  ┌──────────────────────────┐             14:33    │
│       │ 💎 Nhan Lumex 91         │                      │
│       │ 18K White Gold           │                      │
│       │ Gia: 45,000,000 VND     │                      │
│       │ [Xem chi tiet]          │                      │
│       └──────────────────────────┘                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [📎 File] [🖼 Image] [📦 Product]                       │
│ ┌─────────────────────────────────────┐  [Gui ▶]       │
│ │ Nhap tin nhan...                    │                 │
│ └─────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

## 9. API Endpoints (Backend)

### Zalo Connection

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| GET | `/api/zalo/status` | Trang thai ket noi OA |
| GET | `/api/zalo/authorize-url` | Tao URL de admin authorize |
| GET | `/api/zalo/oauth/callback` | Callback sau khi authorize |
| POST | `/api/zalo/disconnect` | Ngat ket noi OA |

### Conversations & Messages

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| GET | `/api/zalo/conversations` | Danh sach cuoc tro chuyen |
| GET | `/api/zalo/conversations/:userId` | Chi tiet conversation |
| GET | `/api/zalo/conversations/:userId/messages` | Lich su tin nhan |
| POST | `/api/zalo/messages/text` | Gui tin nhan text |
| POST | `/api/zalo/messages/image` | Gui tin nhan hinh |
| POST | `/api/zalo/messages/product-list` | Gui danh sach san pham |
| POST | `/api/zalo/messages/reply` | Reply tin nhan cu |

### Followers

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| GET | `/api/zalo/followers` | Danh sach followers |
| GET | `/api/zalo/followers/:userId` | Profile follower |
| POST | `/api/zalo/followers/:userId/tag` | Gan tag |
| DELETE | `/api/zalo/followers/:userId/tag` | Xoa tag |

### Tags

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| GET | `/api/zalo/tags` | Danh sach tags |
| POST | `/api/zalo/tags` | Tao tag moi |
| DELETE | `/api/zalo/tags/:tagName` | Xoa tag |

### ZNS

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| GET | `/api/zalo/zns/templates` | Danh sach ZNS templates |
| GET | `/api/zalo/zns/templates/:id` | Chi tiet template |
| POST | `/api/zalo/zns/send` | Gui ZNS notification |
| GET | `/api/zalo/zns/logs` | Lich su gui ZNS |

### Webhook (internal - Zalo goi)

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| POST | `/api/zalo/webhook` | Nhan events tu Zalo |

### Broadcast

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| POST | `/api/zalo/broadcast` | Gui tin hang loat |

### Analytics

| Method | Endpoint | Mo ta |
|--------|----------|-------|
| GET | `/api/zalo/analytics` | Thong ke followers, messages, ZNS |

---

## 10. Database Schema

```sql
-- Bang luu token Zalo OA
CREATE TABLE zalo_tokens (
    id BIGSERIAL PRIMARY KEY,
    oa_id VARCHAR(50) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_zalo_tokens_active ON zalo_tokens(is_active, expires_at);

-- Bang luu thong tin follower
CREATE TABLE zalo_followers (
    id BIGSERIAL PRIMARY KEY,
    zalo_user_id VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    -- Lien ket voi user Mirror (neu co)
    mirror_user_id BIGINT REFERENCES users(id),
    tags TEXT, -- JSON array: ["VIP", "Interested_Ring"]
    followed_at TIMESTAMP,
    unfollowed_at TIMESTAMP,
    is_following BOOLEAN NOT NULL DEFAULT true,
    first_message_at TIMESTAMP,
    last_message_at TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX idx_zalo_followers_user_id ON zalo_followers(zalo_user_id);
CREATE INDEX idx_zalo_followers_phone ON zalo_followers(phone);
CREATE INDEX idx_zalo_followers_mirror_user ON zalo_followers(mirror_user_id);

-- Bang luu tin nhan
CREATE TABLE zalo_messages (
    id BIGSERIAL PRIMARY KEY,
    zalo_message_id VARCHAR(100),
    zalo_user_id VARCHAR(100) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- 'INCOMING' | 'OUTGOING'
    message_type VARCHAR(20) NOT NULL, -- 'text' | 'image' | 'file' | 'sticker' | 'template'
    content TEXT,
    attachment_url TEXT,
    -- Metadata
    sent_by_staff_id BIGINT REFERENCES users(id), -- Nhan vien gui (neu OUTGOING)
    is_auto_reply BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'SENT', -- 'SENT' | 'DELIVERED' | 'SEEN' | 'FAILED'
    seen_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_zalo_messages_user ON zalo_messages(zalo_user_id, created_at DESC);
CREATE INDEX idx_zalo_messages_direction ON zalo_messages(direction, created_at DESC);

-- Bang luu lich su gui ZNS
CREATE TABLE zalo_zns_logs (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    template_name VARCHAR(255),
    template_data JSONB, -- Du lieu truyen vao template
    -- Lien ket voi entity trigger
    trigger_type VARCHAR(50), -- 'ORDER' | 'APPOINTMENT' | 'POD_SCAN' | 'MANUAL'
    trigger_entity_id VARCHAR(100), -- ID cua order/appointment/...
    -- Ket qua
    zns_message_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'REJECTED'
    error_message TEXT,
    error_code INTEGER,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_zns_logs_phone ON zalo_zns_logs(phone, created_at DESC);
CREATE INDEX idx_zns_logs_status ON zalo_zns_logs(status);
CREATE INDEX idx_zns_logs_trigger ON zalo_zns_logs(trigger_type, trigger_entity_id);

-- Bang tags
CREATE TABLE zalo_tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7), -- hex color
    description TEXT,
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 11. Mapping voi he thong hien tai

### Trigger ZNS tu cac API hien co

```
src/services/api.js                        Backend trigger
─────────────────────────────────────────────────────────

ordersAPI.create(orderData)
  └──▶ OrderService.createOrder()
       └──▶ zaloZNSService.sendOrderConfirmation(order, phone)

ordersAPI.updateStatus(id, payload)
  └──▶ OrderService.updateStatus()
       └──▶ zaloZNSService.sendOrderStatusUpdate(order, phone)

ordersAPI.ship(id, data)
  └──▶ OrderService.shipOrder()
       └──▶ zaloZNSService.sendShippingNotification(order, phone)

appointmentsAPI.create(data)
  └──▶ AppointmentService.create()
       └──▶ zaloZNSService.sendAppointmentConfirmation(appt)

appointmentsAPI.confirm(id)
  └──▶ AppointmentService.confirm()
       └──▶ zaloZNSService.sendAppointmentReminder(appt)

[Scheduler - daily 8:00 AM]
  └──▶ Check appointments tomorrow
       └──▶ zaloZNSService.sendAppointmentReminder(appt)

commissionApi.approve(id)
  └──▶ CommissionService.approve()
       └──▶ zaloZNSService.sendPartnerNotification(partner, commission)
```

### Lien ket Zalo user voi Mirror user

```
Truong hop 1: Khach follow OA + dang ky tai khoan
  ──▶ Match qua so dien thoai
  ──▶ Luu mirror_user_id vao zalo_followers

Truong hop 2: Khach follow OA nhung chua dang ky
  ──▶ Luu zalo_user_id
  ──▶ Khi khach dang ky sau, match lai qua phone

Truong hop 3: Khach co tai khoan nhung chua follow OA
  ──▶ ZNS van gui duoc (qua so dien thoai)
  ──▶ Khi khach follow, lien ket lai
```

---

## 12. Chat Widget tren Website

### Cach 1: Zalo Chat Widget (don gian nhat)

Them vao `index.html`:

```html
<!-- Zalo Chat Widget -->
<div class="zalo-chat-widget"
  data-oaid="YOUR_OA_ID"
  data-welcome-message="Chao ban! Mirror Future Diamond co the giup gi cho ban?"
  data-autopopup="0"
  data-width="350"
  data-height="420">
</div>
<script src="https://sp.zalo.me/plugins/sdk.js"></script>
```

### Cach 2: Custom Chat Button (kiem soat UI)

Them component React:

```jsx
// src/components/common/ZaloChatButton.jsx
export default function ZaloChatButton() {
  const ZALO_OA_LINK = "https://zalo.me/your_oa_id";

  return (
    <a
      href={ZALO_OA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="zalo-float-button"
      aria-label="Chat voi Mirror Diamond qua Zalo"
    >
      <img src="/zalo-icon.svg" alt="Zalo" width={48} height={48} />
    </a>
  );
}
```

### Vi tri hien thi

- Trang HomePage, ProductsPage, ProductDetailPage, ContactPage, ServicesPage
- KHONG hien thi o: Admin Dashboard, Event pages, Inventory, POD Admin

---

## 13. Bao mat

### Webhook Signature Verification

**BAT BUOC** verify moi webhook request tu Zalo:

```
signature = SHA256(app_id + raw_body + timestamp + oa_secret_key)
```

So sanh voi header `X-ZEvent-Signature`.

### Token Storage

- Access Token & Refresh Token luu trong **database**, KHONG luu trong frontend
- Ma hoa token trong DB bang AES-256 (optional nhung khuyen nghi)
- Chi backend moi truy cap truc tiep Zalo API

### Rate Limiting

- Zalo OA API: **10 requests/giay**
- Backend can implement rate limiter de khong vuot qua
- Queue messages neu can gui hang loat

### Data Privacy

- Phone number cua khach chi luu o backend
- Frontend chi hien thi masked phone: `0901***567`
- ZNS logs luu du lieu template nhung KHONG luu noi dung nhay cam

---

## 14. Gioi han & Chi phi

### API Limits

| API | Gioi han |
|-----|---------|
| OA Messaging | 10 requests/giay |
| ZNS | Tuy theo goi dich vu |
| Webhook response | 2 giay (timeout) |
| Access Token | Het han 1 gio |
| Refresh Token | Het han 3 thang khong dung |

### Chi phi ZNS

| Loai template | Gia/tin (VND) | Ghi chu |
|---------------|--------------|---------|
| OTP | ~200-300 | Ma xac thuc |
| Transaction | ~300-400 | Don hang, lich hen |
| Promotion | ~400-500 | Khuyen mai (can consent) |

- Chi tinh phi khi **gui thanh cong**
- Tiet kiem ~40% so voi SMS
- 100% gui trong 1 giay, 90% khach nhan trong 5 giay

### So sanh voi SMS

| | Zalo ZNS | SMS |
|--|----------|-----|
| Gia | 200-500 VND | 500-800 VND |
| Toc do | 1-5 giay | 5-30 giay |
| Rich content | Co (hinh, button) | Khong |
| Fallback | Can SMS backup | - |
| Yeu cau | Khach co Zalo | Co dien thoai |

---

## 15. Checklist trien khai

### Phase 1: Setup & Connection (Tuan 1)

- [ ] Tao Zalo OA tai oa.zalo.me
- [ ] Xac minh doanh nghiep
- [ ] Tao Zalo App tai developers.zalo.me
- [ ] Lay App ID, Secret Key, OA Secret
- [ ] Xac minh domain mirrorfuturediamond.com
- [ ] Them env variables vao backend

### Phase 2: Token & Webhook (Tuan 2)

- [ ] Implement ZaloTokenManager (backend)
- [ ] Implement OAuth callback endpoint
- [ ] Implement auto-refresh scheduler
- [ ] Implement webhook endpoint
- [ ] Implement signature verification
- [ ] Dang ky webhook URL tren Zalo Portal
- [ ] Test nhan events: follow, unfollow, user_send_text

### Phase 3: Messaging (Tuan 3)

- [ ] Implement gui tin nhan text
- [ ] Implement gui tin nhan hinh
- [ ] Implement gui product list
- [ ] Implement reply message
- [ ] Implement auto-reply (ngoai gio, keyword)
- [ ] Implement welcome message khi follow
- [ ] Tao database tables
- [ ] Luu lich su tin nhan

### Phase 4: ZNS (Tuan 4)

- [ ] Dang ky ZNS templates voi Zalo (cho duyet)
- [ ] Implement ZaloZNSService
- [ ] Tich hop vao OrderService (xac nhan don)
- [ ] Tich hop vao AppointmentService (nhac lich)
- [ ] Setup scheduler nhac lich hen 24h truoc
- [ ] Implement ZNS logging
- [ ] Test gui ZNS

### Phase 5: Frontend Admin UI (Tuan 5)

- [ ] Tao zaloApi.js service
- [ ] Them routes vao routes.js
- [ ] Tao ZaloOADashboard component
- [ ] Tao ZaloConversationList component
- [ ] Tao ZaloConversationDetail component
- [ ] Tao ZaloFollowerList component
- [ ] Tao ZaloZNSLogs component
- [ ] Tao ZaloSettings component

### Phase 6: Widget & Polish (Tuan 6)

- [ ] Them Zalo chat widget len website
- [ ] Tich hop real-time notification (Ably) cho staff
- [ ] Lien ket zalo_user <-> mirror_user qua phone
- [ ] Implement broadcast feature
- [ ] Test end-to-end toan bo flow
- [ ] Monitor & fix bugs

---

## Tai lieu tham khao

- Zalo Developer Portal: https://developers.zalo.me/docs
- Zalo OA API: https://developers.zalo.me/docs/api/official-account-api-230
- Zalo ZNS API: https://developers.zalo.me/docs/zalo-notification-service
- Zalo Webhook Events: https://developers.zalo.me/docs/api/official-account-api/webhook
- NPM zalo-api: https://www.npmjs.com/package/zalo-api
- Zalo Node SDK: https://github.com/tungnguyentien/zalo-node-sdk
