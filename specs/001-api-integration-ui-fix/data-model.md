# Data Model: CMS API Integration, User ID Fix & Color Update

---

## Entities

### 1. AppSession

Represents one lifecycle of the app (from launch to kill/background-timeout). Generated fresh each time the app process starts.

| Field | Type | Source | Description |
|---|---|---|---|
| `sessionId` | `string` (UUID v4) | Generated at module load | Identifies this app process; sent as `session_id` in ping |
| `userId` | `string` | Derived (see User Identity) | Phone number if logged in, guest UUID if not |
| `device` | `'android' \| 'ios' \| 'web'` | `Platform.OS` | Device type sent to CMS |
| `currentPage` | `string` | Navigation focus events | Current tab name; updated as user navigates |

**Lifecycle**: Created when `cmsService.js` module is first imported. Destroyed when app process is killed (no persistence).

---

### 2. UserIdentity

Determines the `user_id` value sent to all APIs (Dify + CMS).

| State | Value | How Obtained |
|---|---|---|
| Logged in | `user.phoneNumber` (e.g. `"0912345678"`) | `AuthContext.user.phoneNumber` |
| Guest | UUID v4 (e.g. `"a1b2c3d4-..."`) | Module-level constant in `cmsService.js`, generated once |
| Transition (guest → login) | Switches to phone number immediately on next API call | `getEffectiveUserId(user)` re-evaluated each call |

**Rule**: `getEffectiveUserId(user) = user?.phoneNumber || GUEST_SESSION_UUID`

---

### 3. CMS Events (outbound only — no local storage)

These are fire-and-forget payloads sent to CMS. Not stored locally.

#### PingEvent
```
session_id   : string   — AppSession.sessionId
user_id      : string?  — UserIdentity (optional per API)
device       : string?  — AppSession.device
page         : string?  — AppSession.currentPage
```
Sent every 30 seconds while app is in foreground.

#### PageviewEvent
```
user_id      : string?  — UserIdentity
page         : string?  — One of: "home" | "chat" | "pest" | "market"
device       : string?  — AppSession.device
```
Sent once on focus of each of the 4 tracked tab screens.

#### ConversationEvent
```
user_id      : string?  — UserIdentity
message_count: number?  — 0 (sent at conversation start, before messages)
type         : string?  — "agriculture"
started_at   : string?  — ISO 8601 timestamp at moment of first message
```
Sent once per chatbot conversation (on user's first message in a new session).

#### DiagnosisEvent
```
user_id      : string?  — UserIdentity
crop_type    : string?  — From selected crop (if UI provides it)
result       : string?  — Summary from AI diagnosis response
diagnosed_at : string?  — ISO 8601 timestamp at moment of completion
```
Sent once per completed pest diagnosis.

---

## State Transitions

### Ping Interval Lifecycle
```
App launches → ping starts (30s interval)
     ↓
AppState: 'active' (foreground) → interval running
     ↓
AppState: 'background'/'inactive' → interval cleared
     ↓
AppState: 'active' again → interval restarted + immediate ping
```

### Conversation Tracking
```
User opens AIChatScreen
     ↓
User types and sends first message in a NEW conversation
     ↓ (first message only; subsequent messages in same conversation = no CMS call)
POST /api/conversation (fire-and-forget)
     ↓
Conversation continues normally via Dify API
```

### Diagnosis Tracking
```
User opens PestScreen → selects image
     ↓
User taps "Chẩn đoán" → Dify API call starts
     ↓
Dify responds with diagnosis result
     ↓
POST /api/diagnosis with result summary (fire-and-forget)
     ↓
Result displayed to user
```

---

## Validation Rules

- `session_id` and `GUEST_SESSION_UUID`: must be valid UUID v4 format (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`)
- `user_id` when phone: 10-digit string (validated at login; trusted downstream)
- `page` values for pageview: constrained to `["home", "chat", "pest", "market"]`
- All CMS fields are optional per API spec — empty/undefined values are safe to omit
- Timestamps: ISO 8601 via `new Date().toISOString()`
