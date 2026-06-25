# Contract: CMS API Client (App → CMS)

**Direction**: AgriApp (client) → CMS Dashboard (server)
**Base URL**: `process.env.EXPO_PUBLIC_CMS_BASE_URL` (e.g. `https://cms.dienbien-smart-agri.app`)
**Auth header**: `Authorization: Bearer ${process.env.EXPO_PUBLIC_APP_SECRET}`

All requests are **fire-and-forget** — the app does not act on the response.

---

## POST /api/ping

**When**: Every 30 seconds while app is in foreground (AppState = 'active').

**Request body**:
```json
{
  "session_id": "uuid-v4-string",
  "user_id": "0912345678 or uuid-v4-guest",
  "device": "android | ios | web",
  "page": "home | chat | pest | market | weather | more"
}
```

**Expected response**: `200 { "success": true }`

---

## POST /api/pageview

**When**: On focus of each tracked tab screen (Home, Chat, Pest, Market).

**Request body**:
```json
{
  "user_id": "0912345678 or uuid-v4-guest",
  "page": "home | chat | pest | market",
  "device": "android | ios | web"
}
```

**Expected response**: `201 { "success": true }`

---

## POST /api/conversation

**When**: Once per chatbot conversation — triggered when user sends their **first message** in a new Dify conversation session.

**Request body**:
```json
{
  "user_id": "0912345678 or uuid-v4-guest",
  "message_count": 0,
  "type": "agriculture",
  "started_at": "2026-06-25T10:30:00.000Z"
}
```

**Expected response**: `201 { "success": true, "id": "record-id" }`

---

## POST /api/diagnosis

**When**: Once per completed pest diagnosis — triggered after AI response is received and displayed.

**Request body**:
```json
{
  "user_id": "0912345678 or uuid-v4-guest",
  "crop_type": "Lúa",
  "result": "Đạo ôn lá",
  "diagnosed_at": "2026-06-25T11:00:00.000Z"
}
```

**Expected response**: `201 { "success": true, "id": "record-id" }`

---

## Error Handling Contract

The app **must not** surface CMS errors to users. All CMS fetch calls follow:
```js
fetch(url, options).catch(err => console.warn('[CMS]', err));
```

No retry logic. No user-facing error messages. CMS events are best-effort analytics.

---

## cmsService.js Public API

```js
// src/services/cmsService.js

sendPing(userId, currentPage)        // called by App.js every 30s
trackPageview(userId, pageName)      // called by each tracked tab screen on focus
trackConversation(userId)            // called by AIChatScreen on first message
trackDiagnosis(userId, cropType, result) // called by PestScreen after diagnosis

getEffectiveUserId(user)             // returns user.phoneNumber || GUEST_UUID
SESSION_ID                           // exported UUID for this app session
```
