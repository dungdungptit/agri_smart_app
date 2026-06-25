---

description: "Task list for CMS API Integration, User ID Fix & Color Update"
---

# Tasks: CMS API Integration, User ID Fix & Color Update

**Input**: Design documents from `specs/001-api-integration-ui-fix/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/cms-api-client.md](contracts/cms-api-client.md)

**Tests**: No automated tests — manual validation via [quickstart.md](quickstart.md).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files or independent additions)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Setup

**Purpose**: Environment variable configuration required by all subsequent phases.

- [x] T001 Update `.env` — rename `APP_SECRET` to `EXPO_PUBLIC_APP_SECRET` and add `EXPO_PUBLIC_CMS_BASE_URL=https://cms.dienbien-smart-agri.app`

**Checkpoint**: Env vars accessible in Expo bundle. All phases can now proceed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the centralized CMS service module that all user stories depend on. No user story work can begin until T002–T007 are complete.

**⚠️ CRITICAL**: All user story phases (3–7) depend on this phase being complete.

- [x] T002 Create `src/services/cmsService.js` — add `generateUUID()` helper and module-level constants `SESSION_ID` and `GUEST_SESSION_UUID` (both UUID v4, in-memory only)
- [x] T003 Add `CMS_BASE_URL`, `CMS_HEADERS` (with `Authorization: Bearer` and `Content-Type`) and `getEffectiveUserId(user)` helper to `src/services/cmsService.js`
- [x] T004 Add `sendPing(user, currentPage)` function (POST `/api/ping`, fire-and-forget) to `src/services/cmsService.js`
- [x] T005 Add `trackPageview(user, pageName)` function (POST `/api/pageview`, fire-and-forget) to `src/services/cmsService.js`
- [x] T006 Add `trackConversation(user)` function (POST `/api/conversation` with `type: "agriculture"` and `started_at`, fire-and-forget) to `src/services/cmsService.js`
- [x] T007 Add `trackDiagnosis(user, cropType, result)` function (POST `/api/diagnosis` with `diagnosed_at`, fire-and-forget) to `src/services/cmsService.js`

**Checkpoint**: `cmsService.js` complete and exportable. User story implementation can now begin.

---

## Phase 3: User Story 1 — Chatbot User ID Fix (Priority: P1) 🎯 MVP

**Goal**: Replace the hardcoded `USER_ID` in `AIChatScreen.js` with the logged-in user's phone number or a session-scoped guest UUID; record each new conversation in CMS.

**Independent Test**: Log in with phone `0912345678`, send a message in the chatbot → inspect network requests: Dify API and CMS `/api/conversation` both show `user_id = "0912345678"`. Without login, both show a UUID v4 string. See [quickstart.md Scenario 1 & 2](quickstart.md).

### Implementation for User Story 1

- [x] T008 [US1] Add `import { useAuth } from '../../context/AuthContext'` and `import { getEffectiveUserId, trackConversation } from '../../services/cmsService'` to `src/screens/qna/AIChatScreen.js`
- [x] T009 [US1] Remove `const USER_ID = 'Trợ lý AI Nông nghiệp tỉnh Điện Biên_user'` and replace with `const { user } = useAuth()` in `src/screens/qna/AIChatScreen.js`; replace every occurrence of `USER_ID` in query params and request bodies with `getEffectiveUserId(user)`
- [x] T010 [US1] Add `trackConversation(user)` call in `src/screens/qna/AIChatScreen.js` — triggered once when user sends the first message of a new conversation (guard with a flag or check that `conversationId` is null/empty before calling)

**Checkpoint**: User Story 1 independently functional — chatbot uses correct user_id, CMS records new conversations.

---

## Phase 4: User Story 2 — Pest Diagnosis User ID Fix (Priority: P1)

**Goal**: Replace the hardcoded `USER_ID` in `PestScreen.js` with the logged-in phone number or guest UUID; record each completed diagnosis in CMS.

**Independent Test**: Log in, run a pest diagnosis → CMS `/api/diagnosis` shows `user_id = phone`, `result` = AI diagnosis summary. As guest, `user_id` matches the same UUID used in chatbot for this session. See [quickstart.md Scenario 1 & 2](quickstart.md).

**Note**: US1 and US2 target different files (`AIChatScreen.js` vs `PestScreen.js`) — can be implemented in parallel with Phase 3.

### Implementation for User Story 2

- [x] T011 [P] [US2] Add `import { useAuth } from '../../context/AuthContext'` and `import { getEffectiveUserId, trackDiagnosis } from '../../services/cmsService'` to `src/screens/pest/PestScreen.js`
- [x] T012 [P] [US2] Remove `const USER_ID = 'Trợ lý AI Nông nghiệp tỉnh Điện Biên_user'` and replace with `const { user } = useAuth()` in `src/screens/pest/PestScreen.js`; replace every occurrence of `USER_ID` in query params and request bodies with `getEffectiveUserId(user)`
- [x] T013 [P] [US2] Add `trackDiagnosis(user, cropType, diagnosisResultSummary)` call in `src/screens/pest/PestScreen.js` — triggered after the AI response is received and displayed; extract `crop_type` from selected crop and `result` from the AI response text

**Checkpoint**: User Story 2 independently functional — pest diagnosis uses correct user_id, CMS records each diagnosis.

---

## Phase 5: User Story 3 — Ping Heartbeat (Priority: P2)

**Goal**: App sends a heartbeat ping to CMS every 30 seconds while in the foreground, stops on background.

**Independent Test**: Open app, monitor network — ping fires every 30s. Background app, wait 35s — no ping. Return to foreground — ping resumes within 5s. See [quickstart.md Scenario 3](quickstart.md).

### Implementation for User Story 3

- [x] T014 [US3] Add `import { AppState } from 'react-native'` and `import { sendPing } from './src/services/cmsService'` (or relative path) in `App.js`; add `import { useAuth } from './src/context/AuthContext'` if not already present
- [x] T015 [US3] Add `useEffect` in `App.js` — on mount: call `sendPing(user, 'home')` immediately and start `setInterval(sendPing, 30000)`; add `AppState.addEventListener('change', ...)` to clear interval on `background`/`inactive` and restart on `active`; clean up both interval and listener on unmount

**Checkpoint**: User Story 3 independently functional — CMS receives pings while app is in foreground.

---

## Phase 6: User Story 4 — Pageview Tracking (Priority: P2)

**Goal**: CMS receives a pageview event each time the user navigates to one of the 4 main tab screens (Home, Chat, Pest, Market/More).

**Independent Test**: Navigate Home → Chat → Pest → More/Market — 4 pageview events appear in network log with correct `page` names. Open a GAP article detail — no additional pageview fires. See [quickstart.md Scenario 4](quickstart.md).

**Note**: These 4 tasks target different screen files — can be implemented in parallel.

### Implementation for User Story 4

- [x] T016 [P] [US4] Add `import { useAuth } from '../../context/AuthContext'` and `import { trackPageview } from '../../services/cmsService'`; add `useFocusEffect(useCallback(() => { trackPageview(user, 'home'); }, [user]))` in `src/screens/home/HomeScreen.js`
- [x] T017 [P] [US4] Add `useFocusEffect(useCallback(() => { trackPageview(user, 'chat'); }, [user]))` in `src/screens/qna/AIChatScreen.js` (cmsService already imported from Phase 3)
- [x] T018 [P] [US4] Add `useFocusEffect(useCallback(() => { trackPageview(user, 'pest'); }, [user]))` in `src/screens/pest/PestScreen.js` (cmsService already imported from Phase 4)
- [x] T019 [P] [US4] Add `import { useAuth } from '../../context/AuthContext'` and `import { trackPageview } from '../../services/cmsService'`; add `useFocusEffect(useCallback(() => { trackPageview(user, 'market'); }, [user]))` in `src/navigation/AppNavigator.js` (MoreScreen inline component)

**Checkpoint**: User Story 4 independently functional — CMS receives exactly 4 pageview types from main tab navigation.

---

## Phase 7: User Story 5 — Primary Color Update (Priority: P3)

**Goal**: Replace the agricultural green color palette with `#0066BC` blue throughout the app by updating the theme token file.

**Independent Test**: Open each main screen — tab active indicator, primary buttons, and header accents show `#0066BC` blue. Success/healthy-state indicators remain green (`#4CAF50`). See [quickstart.md Scenario 5](quickstart.md).

### Implementation for User Story 5

- [x] T020 [US5] Update `src/theme/index.js` — set `primary: '#0066BC'`, `primaryLight: '#3385CC'`, `primaryDark: '#004A8F'`, `primaryGradientStart: '#1A7AD4'`, `primaryGradientEnd: '#0066BC'`; leave `success: '#4CAF50'` unchanged

**Checkpoint**: User Story 5 independently functional — entire app UI reflects new blue color scheme via token propagation.

---

## Phase 8: Polish & Validation

**Purpose**: End-to-end validation and hardening across all user stories.

- [ ] T021 Run all 6 validation scenarios from [quickstart.md](quickstart.md) — confirm pass criteria for each (user_id fix, guest UUID, ping, pageview, color, CMS resilience)
- [ ] T022 [P] Temporarily set `EXPO_PUBLIC_CMS_BASE_URL` to an invalid URL; verify no user-visible errors appear in the app (quickstart.md Scenario 6); restore correct URL

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user story phases**
- **User Stories (Phases 3–7)**: All depend on Phase 2 completion
  - Phase 3 (US1) and Phase 4 (US2) can run in parallel (different files)
  - Phase 5 (US3), Phase 6 (US4), and Phase 7 (US5) are independent of each other
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
| --- | --- | --- |
| US1 (P1) — Chatbot ID fix | Phase 2 complete | US2, US5 |
| US2 (P1) — Pest ID fix | Phase 2 complete | US1, US5 |
| US3 (P2) — Ping | Phase 2 complete | US4, US5 |
| US4 (P2) — Pageview | Phase 2 + US1/US2 imports | US3, US5 |
| US5 (P3) — Color | Phase 1 only | All others |

### Within Each Phase

- Tasks on the same file are sequential (T008 → T009 → T010)
- Tasks marked `[P]` targeting different files can run in parallel

---

## Parallel Execution Examples

### Phase 3 + Phase 4 in Parallel (both P1)

```text
Developer A: T008 → T009 → T010  (AIChatScreen.js)
Developer B: T011 → T012 → T013  (PestScreen.js)
```

### Phase 6 Pageview (all different files)

```text
Parallel: T016 (HomeScreen.js)
Parallel: T017 (AIChatScreen.js — already has cmsService import)
Parallel: T018 (PestScreen.js — already has cmsService import)
Parallel: T019 (MoreScreen.js)
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 — Critical P1 Fixes)

1. Complete Phase 1: Update `.env`
2. Complete Phase 2: Build `cmsService.js` foundation
3. Complete Phase 3: Fix chatbot user_id + CMS conversation tracking
4. Complete Phase 4: Fix pest user_id + CMS diagnosis tracking
5. **STOP and VALIDATE**: Run quickstart.md Scenarios 1 & 2
6. Deploy — CMS now has accurate user attribution data

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 + 4 → User ID bug fixed (critical) ✅
3. Phase 5 → Ping/online tracking active ✅
4. Phase 6 → Pageview analytics active ✅
5. Phase 7 → Brand color updated ✅
6. Phase 8 → Full validation pass ✅

---

## Notes

- `[P]` tasks target different files with no shared write conflicts
- `[Story]` label maps each task to its spec user story for traceability
- All CMS calls are fire-and-forget — never `await` them at the call site
- `getEffectiveUserId(user)` must be evaluated at call time (not cached), since user state can change during a session
- Color change (T020) is entirely safe to implement at any point — does not touch CMS or user_id logic
- Verify quickstart.md Scenario 6 (CMS failure resilience) before marking Phase 8 complete
