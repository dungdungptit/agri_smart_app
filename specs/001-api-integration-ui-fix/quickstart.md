# Quickstart Validation Guide

**Feature**: CMS API Integration, User ID Fix & Color Update
**Spec**: [spec.md](spec.md) | **Contracts**: [contracts/cms-api-client.md](contracts/cms-api-client.md)

---

## Prerequisites

1. App running in development (Expo Go or dev build on Android/iOS).
2. Access to CMS Dashboard at `https://cms.dienbien-smart-agri.app` (or dev CMS at `http://localhost:3000`).
3. `.env` updated with `EXPO_PUBLIC_CMS_BASE_URL` and `EXPO_PUBLIC_APP_SECRET`.
4. Network proxy tool (e.g. React Native Debugger, Charles Proxy, or `npx expo start` logs) to inspect outgoing requests.

---

## Scenario 1: User ID Fix — Logged-in User (P1)

**Goal**: Confirm phone number is sent as `user_id` to Dify and CMS.

1. Log in with phone number `0912345678` via OTP flow.
2. Open "Trợ lý AI" tab.
3. Send any message (first message in new session).
4. **Check**: Outgoing request to Dify (`/v1/chat-messages`) has `"user": "0912345678"`.
5. **Check**: Outgoing CMS request to `/api/conversation` has `"user_id": "0912345678"`.
6. Navigate to "Sâu bệnh" tab → upload a plant image → tap "Chẩn đoán".
7. **Check**: Outgoing requests to Dify pest API have `"user": "0912345678"`.
8. **Check**: Outgoing CMS request to `/api/diagnosis` has `"user_id": "0912345678"`.

**Pass criteria**: All `user_id` / `user` fields match the logged-in phone number, never the old hardcoded string.

---

## Scenario 2: User ID Fix — Guest User (P1)

**Goal**: Confirm UUID is generated for guests and reused within the session.

1. Make sure the user is NOT logged in (fresh install or logged out).
2. Open the app → navigate to "Trợ lý AI".
3. Send a message.
4. **Check**: `user` field in Dify request is a UUID v4 (format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`).
5. **Check**: CMS `/api/conversation` `user_id` matches the same UUID.
6. Navigate to "Sâu bệnh" → run a diagnosis.
7. **Check**: CMS `/api/diagnosis` `user_id` matches the **same UUID** (not a new one).
8. Send another chat message in the same session.
9. **Check**: Same UUID used again (not regenerated per message).

**Pass criteria**: UUID is consistent throughout the session; changes only after app restart.

---

## Scenario 3: CMS Ping Heartbeat (P2)

**Goal**: Confirm ping fires every 30 seconds while app is in foreground.

1. Open app (logged in or guest).
2. Watch outgoing network requests.
3. **Check**: Within 5 seconds of app open, CMS `/api/ping` fires with `session_id` (UUID), `user_id`, `device`, `page`.
4. Wait 30 seconds.
5. **Check**: Another `/api/ping` fires with the same `session_id`.
6. Press the home button (background the app).
7. Wait 35 seconds.
8. **Check**: No new `/api/ping` fires during background period.
9. Return to app (foreground).
10. **Check**: `/api/ping` fires again within 5 seconds.

**Pass criteria**: Ping fires ≤5s on foreground, stops on background, resumes on return.

---

## Scenario 4: Pageview Tracking (P2)

**Goal**: Confirm pageview fires on tab navigation for exactly the 4 specified screens.

1. Open app — lands on Home tab.
2. **Check**: CMS `/api/pageview` fires with `page = "home"`.
3. Tap "Trợ lý AI" tab.
4. **Check**: CMS `/api/pageview` fires with `page = "chat"`.
5. Tap "Sâu bệnh" tab.
6. **Check**: CMS `/api/pageview` fires with `page = "pest"`.
7. Tap "Thêm" tab (Market/News).
8. **Check**: CMS `/api/pageview` fires with `page = "market"`.
9. Open a GAP article detail screen or the Login screen.
10. **Check**: NO additional `/api/pageview` fires.

**Pass criteria**: Exactly 4 pageview events for the 4 main tabs; no events for sub-screens or auth screens.

---

## Scenario 5: Color Update (P3)

**Goal**: Confirm primary color has changed throughout the app.

1. Open app — check tab bar: active tab icon/label color should be `#0066BC` (blue), not green.
2. Navigate to Login screen — check primary button background color.
3. Open "Trợ lý AI" — check send button / accent elements.
4. Open "Sâu bệnh" — check "Chẩn đoán" button and primary highlights.
5. Open Home — check header or primary action buttons.
6. **Check**: No green (#2E7D32, #4CAF50, #1B5E20, #43A047) visible in any primary UI role.
7. **Check**: "Kết quả tốt" / success states (healthy diagnosis results) may still show green — this is expected (`success` color unchanged).

**Pass criteria**: All brand primary elements show `#0066BC` blue; semantic success states remain green.

---

## Scenario 6: CMS Failure Resilience (P1)

**Goal**: Confirm CMS errors never surface to users.

1. Temporarily set `EXPO_PUBLIC_CMS_BASE_URL` to an invalid URL (e.g. `https://invalid.test`).
2. Open app, navigate, send a chat message, run a diagnosis.
3. **Check**: App functions normally — AI responses work, no error dialogs, no crashes.
4. **Check**: Console/logs show `[CMS] ...` warning (not an unhandled error).
5. Restore the correct URL.

**Pass criteria**: Zero user-visible errors from CMS failures.
