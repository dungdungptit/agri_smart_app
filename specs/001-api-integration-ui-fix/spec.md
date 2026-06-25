# Feature Specification: CMS API Integration, User ID Fix & Color Update

**Feature Branch**: `001-api-integration-ui-fix`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "Ghép các CMS API (ping, pageview, conversation, diagnosis); sửa lỗi user_id ở chatbot và chẩn đoán sâu bệnh — nếu đăng nhập bằng SĐT thì dùng SĐT làm user_id, nếu là khách thì dùng UUID ngẫu nhiên; đổi màu xanh lá thành #0066BC."

---

## Clarifications

### Session 2026-06-25

- Q: Những màn hình nào cần gửi pageview lên CMS? → A: Chỉ 4 màn hình tab chính — Home, Chat (AI Q&A), Pest (Chẩn đoán), Market/News; auth screens và sub-screens không tracking.
- Q: Khi user khách đăng nhập SĐT trong phiên, user_id chuyển đổi thế nào? → A: Chuyển ngay sang SĐT từ lần gọi API tiếp theo; lịch sử UUID cũ không link sang.
- Q: UUID khách có persist qua các lần mở app không? → A: Không — fresh UUID mỗi lần mở app (in-memory only).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — CMS nhận biết đúng người dùng trong hội thoại AI (Priority: P1)

Khi một người dùng đã đăng nhập bằng số điện thoại mở màn hình chatbot AI nông nghiệp và đặt câu hỏi đầu tiên, hệ thống gửi `user_id` là số điện thoại của họ lên cả Dify API lẫn CMS Conversation API, giúp CMS thống kê chính xác cuộc hội thoại theo từng người dùng thực.

**Why this priority**: Đây là lỗi cốt lõi — hiện tại mọi cuộc hội thoại đều dùng cùng một USER_ID cố định, khiến toàn bộ dữ liệu thống kê của CMS bị sai.

**Independent Test**: Đăng nhập bằng SĐT `0912345678`, vào chat, gửi 1 tin nhắn → kiểm tra CMS xem `user_id = "0912345678"` trong bản ghi conversation.

**Acceptance Scenarios**:

1. **Given** user đã đăng nhập bằng SĐT `0912345678`, **When** user gửi tin nhắn đầu tiên trong chatbot, **Then** CMS nhận POST `/api/conversation` với `user_id = "0912345678"`.
2. **Given** user chưa đăng nhập (khách), **When** user gửi tin nhắn đầu tiên, **Then** CMS nhận POST `/api/conversation` với `user_id` là một UUID v4 hợp lệ, không phải chuỗi cố định.
3. **Given** user là khách, **When** user mở lại app (phiên mới), **Then** UUID được tái sử dụng trong phiên đó (không đổi mỗi tin nhắn).

---

### User Story 2 — CMS nhận biết đúng người dùng trong chẩn đoán sâu bệnh (Priority: P1)

Khi người dùng thực hiện chẩn đoán sâu bệnh (upload ảnh cây trồng), hệ thống gửi `user_id` đúng (SĐT hoặc UUID khách) lên Dify Pest API và CMS Diagnosis API.

**Why this priority**: Cùng lỗi với chatbot — ảnh hưởng trực tiếp đến độ chính xác của thống kê chẩn đoán.

**Independent Test**: Đăng nhập SĐT, chụp ảnh lá cây, nhấn chẩn đoán → CMS ghi nhận `user_id` = SĐT.

**Acceptance Scenarios**:

1. **Given** user đăng nhập SĐT, **When** user hoàn tất một lượt chẩn đoán, **Then** CMS nhận POST `/api/diagnosis` với `user_id` = SĐT, `crop_type` (nếu có), và `result` = tên sâu bệnh từ kết quả AI.
2. **Given** user là khách, **When** user hoàn tất chẩn đoán, **Then** CMS nhận POST `/api/diagnosis` với `user_id` = UUID khách nhất quán trong phiên.
3. **Given** API CMS lỗi (timeout/5xx), **When** chẩn đoán hoàn thành, **Then** lỗi CMS không ảnh hưởng đến kết quả hiển thị cho user — app vẫn hoạt động bình thường.

---

### User Story 3 — App gửi heartbeat ping để CMS theo dõi online realtime (Priority: P2)

Trong suốt thời gian user mở app, app gửi tín hiệu "đang online" lên CMS mỗi 30 giây, kèm thông tin phiên và màn hình hiện tại.

**Why this priority**: CMS cần dữ liệu online realtime; tính năng này hoạt động ngầm, không ảnh hưởng UX nhưng cần chạy đúng.

**Independent Test**: Mở app, chờ 90 giây, kiểm tra dashboard CMS xem số user "đang online" tăng và tự giảm khi đóng app.

**Acceptance Scenarios**:

1. **Given** app đang mở, **When** mỗi 30 giây trôi qua, **Then** CMS nhận POST `/api/ping` với `session_id` cố định trong phiên, `user_id` đúng, `device` (`android`/`ios`/`web`), và `page` = màn hình hiện tại.
2. **Given** app đóng hoặc vào background, **When** 90 giây không có ping, **Then** CMS tự coi phiên là "offline" (không cần app gửi sự kiện đóng riêng).
3. **Given** network mất kết nối, **When** ping thất bại, **Then** app tiếp tục thử ở chu kỳ 30 giây tiếp theo, không crash.

---

### User Story 4 — CMS ghi nhận lượt truy cập màn hình (Priority: P2)

Mỗi khi user mở app hoặc chuyển màn hình, app gửi pageview lên CMS để xây dựng biểu đồ hoạt động theo giờ/ngày/tuần.

**Why this priority**: Dữ liệu pageview phục vụ báo cáo quản trị; không ảnh hưởng trực tiếp đến chức năng app.

**Independent Test**: Vào lần lượt Home → Chat → Pest → Market, kiểm tra CMS ghi nhận 4 pageview với đúng tên màn hình; mở màn hình Login hoặc GAP detail — CMS không nhận thêm pageview.

**Acceptance Scenarios**:

1. **Given** user mở app và landing vào Home, **When** app hiển thị tab Home, **Then** CMS nhận POST `/api/pageview` với `page = "home"`, `user_id`, `device`.
2. **Given** user đang ở Home, **When** user chuyển sang tab Chat/Pest/Market, **Then** CMS nhận một pageview với tên tab tương ứng.
3. **Given** user mở một sub-screen (GAP detail, article, Login), **When** màn hình hiển thị, **Then** CMS không nhận thêm pageview từ sự kiện này.
4. **Given** CMS API lỗi, **When** pageview request thất bại, **Then** app không hiển thị lỗi cho user.

---

### User Story 5 — Giao diện app dùng màu chủ đạo #0066BC thay cho xanh lá (Priority: P3)

Toàn bộ giao diện app được cập nhật màu chủ đạo từ xanh lá (`#2E7D32`, `#4CAF50`, `#1B5E20`, `#43A047`) sang xanh dương `#0066BC` và các sắc độ tương ứng, đảm bảo nhất quán thương hiệu.

**Why this priority**: Thay đổi thương hiệu/màu sắc; ảnh hưởng toàn bộ UI nhưng không thay đổi chức năng.

**Independent Test**: Mở từng màn hình chính (Home, Chat, Pest, Login, Market), xác nhận không còn màu xanh lá nào trong các thành phần chính (nút, header, icon active, highlight).

**Acceptance Scenarios**:

1. **Given** theme được cập nhật, **When** user mở bất kỳ màn hình nào, **Then** các nút hành động chính, tab active, và header hiển thị màu `#0066BC` thay vì màu xanh lá cũ.
2. **Given** màu `success` và `primary` cùng trỏ về xanh lá cũ, **When** theme được cập nhật, **Then** `primary` = `#0066BC`, `primaryLight` và `primaryDark` được điều chỉnh hài hòa, `success` giữ nguyên xanh lá (vì success là màu ngữ nghĩa riêng).
3. **Given** nhiều file dùng `colors.primary` / `colors.primaryLight`, **When** theme thay đổi tập trung tại `src/theme/index.js`, **Then** toàn bộ UI phản ánh màu mới mà không cần sửa từng file riêng lẻ.

---

### Edge Cases

- Điều gì xảy ra nếu user đăng xuất giữa phiên? → UUID khách mới cho phiên tiếp theo; không gửi SĐT cũ khi đã đăng xuất.
- Điều gì xảy ra nếu CMS trả 401 (sai APP_SECRET)? → Log lỗi phía dev, không hiển thị cho user, không block chức năng AI.
- Điều gì xảy ra nếu `session_id` trùng giữa hai thiết bị? → Mỗi phiên mở app tạo UUID mới, khả năng trùng cực thấp, chấp nhận được.
- Điều gì xảy ra với màu `success` (#4CAF50) khi đổi theme? → Giữ nguyên vì là màu ngữ nghĩa (xanh lá = thành công/ổn định cây trồng).

---

## Requirements *(mandatory)*

### Functional Requirements

**CMS API Integration**

- **FR-001**: App MUST gửi POST `/api/ping` lên CMS mỗi 30 giây khi app đang active (foreground), kèm `session_id`, `user_id`, `device`, `page`.
- **FR-002**: App MUST gửi POST `/api/pageview` lên CMS mỗi khi user mở app hoặc chuyển sang một trong 4 màn hình tab chính: `home`, `chat` (AI Q&A), `pest` (Chẩn đoán sâu bệnh), `market` (Thị trường/Tin tức). Các màn hình auth (Login, OTP, Onboarding, Splash) và sub-screens (detail pages) không gửi pageview.
- **FR-003**: App MUST gửi POST `/api/conversation` lên CMS một lần khi user gửi tin nhắn đầu tiên trong một cuộc hội thoại chatbot mới.
- **FR-004**: App MUST gửi POST `/api/diagnosis` lên CMS một lần sau mỗi lượt chẩn đoán sâu bệnh hoàn tất, kèm `crop_type` và `result` nếu có.
- **FR-005**: Mọi request CMS MUST có header `Authorization: Bearer <APP_SECRET>` và `Content-Type: application/json`.
- **FR-006**: Lỗi từ CMS API (4xx/5xx/timeout) MUST NOT ảnh hưởng đến luồng chính của app (fire-and-forget pattern).

**User ID Fix**

- **FR-007**: Khi user đã đăng nhập bằng SĐT, `user_id` gửi lên Dify API và CMS MUST là số điện thoại đã đăng nhập (chuỗi thuần túy, ví dụ `"0912345678"`).
- **FR-007a**: Khi user đăng nhập trong phiên (trước đó là khách với UUID), `user_id` MUST chuyển ngay sang SĐT từ lần gọi API tiếp theo; lịch sử hội thoại UUID cũ không được link/merge sang tài khoản SĐT.
- **FR-008**: Khi user chưa đăng nhập (khách), `user_id` MUST là một UUID v4 được sinh ngẫu nhiên một lần khi khởi động app và giữ nguyên trong toàn bộ phiên.
- **FR-009**: UUID khách MUST được lưu tạm trong bộ nhớ phiên (in-memory only); mỗi lần mở app mới sinh một UUID mới — không persist vào AsyncStorage hay bộ nhớ bền vững.
- **FR-010**: `user_id` MUST được dùng nhất quán trong cả `AIChatScreen.js` và `PestScreen.js`.

**Color Update**

- **FR-011**: Màu `primary` trong `src/theme/index.js` MUST được đổi thành `#0066BC`.
- **FR-012**: `primaryLight` và `primaryDark` MUST được điều chỉnh là các sắc độ sáng/tối của `#0066BC` (gợi ý: `#3385CC` cho light, `#004A8F` cho dark).
- **FR-013**: `primaryGradientStart` và `primaryGradientEnd` MUST được cập nhật về tông xanh dương tương ứng.
- **FR-014**: Màu `success: '#4CAF50'` MUST giữ nguyên (màu ngữ nghĩa, không phải màu thương hiệu).

### Key Entities

- **Session**: Mỗi lần mở app = 1 phiên; có `session_id` (UUID), `user_id` (SĐT hoặc UUID khách), `device`, `current_page`.
- **CMS Event**: Sự kiện gửi lên CMS (ping/pageview/conversation/diagnosis) — chỉ ghi nhận sự kiện, không lưu nội dung.
- **User Identity**: SĐT (đã đăng nhập) hoặc UUID v4 (khách) — nguồn dữ liệu duy nhất cho `user_id` trên toàn app.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: CMS Dashboard hiển thị đúng số người dùng online realtime trong vòng 60 giây kể từ khi user mở app.
- **SC-002**: 100% cuộc hội thoại chatbot và lượt chẩn đoán sâu bệnh được ghi nhận vào CMS với `user_id` đúng (SĐT hoặc UUID khách), không còn giá trị cố định cũ.
- **SC-003**: Lỗi CMS API không gây ra bất kỳ lỗi hiển thị nào cho người dùng (0 error dialog từ CMS).
- **SC-004**: Toàn bộ UI chính (nút, tab, header, highlight) hiển thị màu `#0066BC` — không còn thành phần nào dùng `#2E7D32`, `#4CAF50`, `#1B5E20`, `#43A047` cho vai trò màu thương hiệu chính.
- **SC-005**: Chức năng chatbot và chẩn đoán sâu bệnh không bị gián đoạn sau khi tích hợp CMS API (tỷ lệ lỗi AI API giữ nguyên).

---

## Assumptions

- APP_SECRET (`QGFF4PlGpXlBz9SXQ1M0gwM96ZQ5h0NE`) đã có trong `.env` và được đọc qua `process.env.APP_SECRET` hoặc biến tương đương.
- CMS Base URL production là `https://cms.dienbien-smart-agri.app` — cần thêm vào `.env` (`EXPO_PUBLIC_CMS_BASE_URL`).
- Thông tin SĐT người dùng đăng nhập đã có trong state/context xác thực hiện tại của app.
- App được build cho Android và iOS; `device` được xác định qua `Platform.OS`.
- `session_id` là UUID mới mỗi lần app khởi động (không cần persist giữa các lần mở).
- Màu `success` (#4CAF50) giữ nguyên vì mang nghĩa "xanh lá = cây trồng khỏe mạnh" trong ngữ cảnh nông nghiệp.
- Ping chỉ gửi khi app ở foreground (không gửi khi background/killed).
- CMS API được gọi trực tiếp từ client (không qua backend proxy) — `EXPO_PUBLIC_` prefix cần thiết; APP_SECRET được expose ở client là chấp nhận được theo thiết kế hiện tại.
