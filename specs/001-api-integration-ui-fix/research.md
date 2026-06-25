# Research: CMS API Integration, User ID Fix & Color Update

**Phase 0 — Decision Log**

---

## Decision 1: UUID Generation (No External Package)

**Decision**: Implement UUID v4 inline using `Math.random()` — a 36-char RFC 4122 compliant string.

**Rationale**: The project has no `uuid`, `nanoid`, or `expo-crypto` dependency. Adding a package for a single utility is unnecessary. The inline pattern is standard, tested, and adequate for non-cryptographic session tracking.

**Implementation**:
```js
const generateUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
```

**Alternatives considered**:
- `expo-crypto` (`randomUUID`) — available in Expo 52 but not installed; adding a dep just for this is over-engineering.
- `uuid` npm package — same reasoning; not justified for one utility.

---

## Decision 2: APP_SECRET Accessibility in Expo Client Bundle

**Decision**: Rename `APP_SECRET` to `EXPO_PUBLIC_APP_SECRET` in `.env` so it is bundled and accessible client-side via `process.env.EXPO_PUBLIC_APP_SECRET`.

**Rationale**: In Expo SDK 52, only environment variables prefixed with `EXPO_PUBLIC_` are included in the JavaScript bundle. The current `APP_SECRET` variable is inaccessible at runtime. Since the app has no backend proxy and the API_GUIDE confirms the secret is already shared (client-side exposure accepted by design), renaming is the correct approach.

**Security note**: This exposes the secret in the bundle. Acceptable per current architecture decision (documented in spec Assumptions). A future backend proxy would eliminate this risk.

**Alternatives considered**:
- Hardcode the secret — fragile, cannot rotate without code changes.
- Add a backend proxy — correct long-term, out of scope for this feature.

---

## Decision 3: CMS Service Architecture

**Decision**: Create a standalone `src/services/cmsService.js` module with fire-and-forget wrappers for all 4 CMS endpoints. All functions are async but callers do NOT await them.

**Rationale**:
- Centralizes CMS logic in one place (easy to update base URL, headers, retry).
- Fire-and-forget via `.catch(console.warn)` ensures CMS errors never surface to users.
- No Redux/Zustand in the project — a plain service module fits the existing pattern (see `authService.js`, `weatherService.js`).

**Pattern**:
```js
export const trackConversation = (userId) => {
  fetch(`${CMS_BASE_URL}/api/conversation`, { ... })
    .catch(console.warn); // fire-and-forget
};
```

**Alternatives considered**:
- Inline fetch in each screen — duplicates headers/URL logic; harder to maintain.
- Queue with retry — over-engineering for a logging/analytics use case; CMS events are best-effort.

---

## Decision 4: User Identity Access Pattern

**Decision**: Expose a `getUserId()` helper from `AuthContext` (or derive it directly from `useAuth()` in each screen) that returns `user.phoneNumber` if logged in, or the session UUID if guest. The session UUID is stored in a module-level singleton inside `cmsService.js`.

**Rationale**:
- `AuthContext` already provides `user` and `isLoggedIn` — screens already call `useAuth()`.
- Storing the guest UUID as a module-level constant in `cmsService.js` ensures it's generated once per app process (satisfies FR-009: in-memory, not persisted).
- No new context/provider needed.

**Module-level singleton**:
```js
// cmsService.js — generated once when module is first imported
const GUEST_SESSION_UUID = generateUUID();

export const getEffectiveUserId = (user) =>
  user?.phoneNumber || GUEST_SESSION_UUID;
```

**Alternatives considered**:
- New `SessionContext` — adds boilerplate for a simple string; overkill.
- AsyncStorage for guest UUID — spec explicitly rejected persistence (FR-009, clarified 2026-06-25).

---

## Decision 5: Ping Heartbeat Implementation

**Decision**: Implement ping in `App.js` using React Native's `AppState` API combined with `setInterval`. The interval is started when app goes foreground and cleared on background/inactive.

**Rationale**:
- `AppState` is the standard React Native API for foreground/background detection — no new deps needed.
- Interval in `App.js` (root) runs for the full app lifetime without needing to re-wire per screen.
- `session_id` = new UUID per app launch → module-level constant in `cmsService.js`.

**Pattern**:
```js
// App.js — inside AuthProvider or App component
useEffect(() => {
  let interval;
  const handleAppState = (state) => {
    if (state === 'active') {
      sendPing(); // immediate ping on foreground
      interval = setInterval(sendPing, 30000);
    } else {
      clearInterval(interval);
    }
  };
  const sub = AppState.addEventListener('change', handleAppState);
  sendPing(); // initial ping
  interval = setInterval(sendPing, 30000);
  return () => { clearInterval(interval); sub.remove(); };
}, []);
```

**Alternatives considered**:
- Per-screen ping — doesn't survive screen transitions; would require complex coordination.
- Background task (`expo-background-fetch`) — over-engineering; spec says foreground only.

---

## Decision 6: Pageview Wiring Strategy

**Decision**: Use React Navigation's `navigation.addListener('focus', ...)` in each of the 4 tracked tab screens (Home, AIChat, Pest, More/Market), rather than a global navigation state listener.

**Rationale**:
- Already the standard RN pattern for tab-focus side effects.
- Scoped to exactly the 4 screens specified — no accidental pageview from sub-screens.
- Screens already use `useNavigation` and `useFocusEffect` in some places.

**Alternatives considered**:
- `NavigationContainer` `onStateChange` global listener — fires for all navigations including sub-screens; requires filtering logic; fragile.
- Middleware/HOC — adds abstraction not present in codebase pattern.

---

## Decision 7: Color Update Scope

**Decision**: Update only `src/theme/index.js`. Do not touch individual screen files.

**Rationale**:
- All screens use `colors.primary`, `colors.primaryLight`, etc. via the theme token — changing the token propagates everywhere automatically.
- New values: `primary: '#0066BC'`, `primaryLight: '#3385CC'`, `primaryDark: '#004A8F'`, `primaryGradientStart: '#1A7AD4'`, `primaryGradientEnd: '#0066BC'`.
- `success: '#4CAF50'` kept unchanged (semantic green for healthy crops).

**Alternatives considered**:
- Search-and-replace hex literals — risky; some screens may hardcode values not from theme. A follow-up audit can catch these.
