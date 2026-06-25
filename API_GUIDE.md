# Hướng dẫn tích hợp API — CMS Trợ lý Nông nghiệp Điện Biên

Tài liệu dành cho **đội phát triển app client** để ghi nhận số liệu hoạt động lên hệ thống CMS/Dashboard.

App client gọi các API dưới đây để CMS thống kê:
- Người dùng đang online (real-time)
- Lượt truy cập (theo ngày/tuần/tháng)
- Số cuộc hội thoại hỏi đáp AI
- Số lượt chẩn đoán sâu bệnh

> Các API này **không lưu nội dung** hội thoại/chẩn đoán, chỉ ghi nhận **sự kiện** để đếm số liệu.

---

## 1. Thông tin chung

| Mục | Giá trị |
|-----|---------|
| Base URL (dev) | `http://localhost:3000` |
| Base URL (prod) | `https://cms.dienbien-smart-agri.app` |
| Định dạng | JSON (`Content-Type: application/json`) |
| Phương thức | `POST` |
| Xác thực | Header `Authorization: Bearer <APP_SECRET>` |

### Xác thực

Mọi request **bắt buộc** có header:

```
Authorization: Bearer <APP_SECRET>
Content-Type: application/json
```

`APP_SECRET` là chuỗi bí mật được cấu hình ở phía CMS (biến môi trường `APP_SECRET`). Liên hệ quản trị CMS để nhận giá trị này. **Không** đưa secret vào mã nguồn công khai / client-side công khai; nên gọi từ **backend app** (server-to-server).

### CORS

- Gọi **server-to-server** (từ backend app, không có header `Origin`): chỉ cần `APP_SECRET`.
- Gọi từ **trình duyệt/webview** (có header `Origin`): domain phải nằm trong danh sách `ALLOWED_APP_ORIGINS` của CMS. Liên hệ quản trị để thêm domain.

### Định dạng phản hồi

Thành công:
```json
{ "success": true }
```
Một số endpoint trả thêm `id` của bản ghi vừa tạo.

Lỗi:
```json
{ "error": "mã_lỗi", "message": "Mô tả lỗi" }
```

| HTTP | error | Ý nghĩa |
|------|-------|---------|
| 400 | `bad_request` | Thiếu tham số bắt buộc |
| 401 | `Unauthorized` | Sai/thiếu `APP_SECRET` |
| 403 | `Forbidden` | `Origin` không được phép |
| 500 | `server_error` | Lỗi phía server |

---

## 2. Các endpoint

### 2.1. `POST /api/ping` — Heartbeat (user đang online)

Báo cho CMS biết một phiên người dùng **đang hoạt động**. App gọi **định kỳ mỗi 30 giây** trong lúc user mở app. CMS coi một phiên là "online" nếu có ping trong vòng **90 giây** gần nhất (sau đó tự hết hạn).

**Body**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `session_id` | string | ✅ | ID phiên duy nhất (mỗi lần mở app sinh 1 giá trị, ví dụ UUID) |
| `user_id` | string | ❌ | ID người dùng (nếu đã đăng nhập). Bỏ trống = `anonymous` |
| `device` | string | ❌ | `android` \| `ios` \| `web` |
| `page` | string | ❌ | Màn hình hiện tại (ví dụ `chat`, `home`) |

**Ví dụ**

```bash
curl -X POST https://<domain-cms>/api/ping \
  -H "Authorization: Bearer <APP_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"a1b2-c3d4","user_id":"6963...aa42","device":"android","page":"chat"}'
```

```js
// Gọi lặp lại mỗi 30s khi app đang mở
setInterval(() => {
  fetch(`${BASE_URL}/api/ping`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${APP_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: SESSION_ID, user_id: USER_ID, device: 'android', page: currentPage }),
  })
}, 30000)
```

**Phản hồi:** `200` → `{ "success": true }`

---

### 2.2. `POST /api/pageview` — Ghi nhận lượt truy cập

Gọi mỗi khi user **mở app / chuyển sang một màn hình** cần tính lượt truy cập. Dữ liệu này dựng biểu đồ "Lượt truy cập" theo ngày/tuần/tháng và "Hoạt động theo giờ".

**Body**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `user_id` | string | ❌ | ID người dùng (nếu có) |
| `page` | string | ❌ | Tên trang/màn hình |
| `device` | string | ❌ | `android` \| `ios` \| `web` |

**Ví dụ**

```bash
curl -X POST https://<domain-cms>/api/pageview \
  -H "Authorization: Bearer <APP_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"6963...aa42","page":"home","device":"ios"}'
```

**Phản hồi:** `201` → `{ "success": true }`

---

### 2.3. `POST /api/conversation` — Ghi nhận cuộc hội thoại AI

Gọi mỗi khi user **bắt đầu một cuộc hỏi đáp** với AI về nông nghiệp. Mỗi lần gọi = +1 vào "Số cuộc hội thoại AI".

**Body**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `user_id` | string | ❌ | ID người dùng |
| `message_count` | number | ❌ | Số tin nhắn trong cuộc hội thoại (mặc định 0) |
| `type` | string | ❌ | Loại hội thoại (mặc định `agriculture`) |
| `started_at` | ISO date | ❌ | Thời điểm bắt đầu (mặc định = thời điểm gọi) |

**Ví dụ**

```bash
curl -X POST https://<domain-cms>/api/conversation \
  -H "Authorization: Bearer <APP_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"6963...aa42","message_count":6}'
```

**Phản hồi:** `201` → `{ "success": true, "id": "<id bản ghi>" }`

> Gợi ý: gọi **1 lần cho mỗi cuộc hội thoại** (khi user gửi câu hỏi đầu tiên), không gọi cho từng tin nhắn — để con số phản ánh đúng "số cuộc hội thoại".

---

### 2.4. `POST /api/diagnosis` — Ghi nhận lượt chẩn đoán sâu bệnh

Gọi mỗi khi user **thực hiện một lượt chẩn đoán sâu bệnh** bằng AI (ví dụ upload ảnh cây trồng). Mỗi lần gọi = +1 vào "Số lượt chẩn đoán sâu bệnh".

**Body**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `user_id` | string | ❌ | ID người dùng |
| `crop_type` | string | ❌ | Loại cây trồng (ví dụ `Lúa`, `Ngô`, `Cà phê`) |
| `result` | string | ❌ | Kết quả tóm tắt (ví dụ tên sâu bệnh) |
| `diagnosed_at` | ISO date | ❌ | Thời điểm chẩn đoán (mặc định = thời điểm gọi) |

**Ví dụ**

```bash
curl -X POST https://<domain-cms>/api/diagnosis \
  -H "Authorization: Bearer <APP_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"6963...aa42","crop_type":"Lúa","result":"Đạo ôn lá"}'
```

**Phản hồi:** `201` → `{ "success": true, "id": "<id bản ghi>" }`

---

## 3. Tóm tắt: gọi API nào, khi nào

| Sự kiện trong app | Endpoint | Tần suất |
|-------------------|----------|----------|
| App đang mở (user active) | `POST /api/ping` | Mỗi 30 giây |
| Mở app / vào màn hình mới | `POST /api/pageview` | Mỗi lần xảy ra |
| User hỏi đáp AI | `POST /api/conversation` | 1 lần / cuộc hội thoại |
| User chẩn đoán sâu bệnh | `POST /api/diagnosis` | 1 lần / lượt chẩn đoán |

> **Người dùng đăng ký** được CMS đọc trực tiếp từ collection `users` — app **không cần** gọi API riêng, chỉ cần tạo user như hiện tại.

