# 💎 04. QUY CHUẨN ASSET & HỆ THỐNG CLOUD DATABASE
## Dự án: Project Xeno: Reloaded (Fullstack Online Edition)

> **Mục đích tài liệu**: Định nghĩa chi tiết danh mục tài nguyên đồ họa & âm thanh của trò chơi, cơ chế nạp an toàn Graceful Fallback, và kiến trúc cơ sở dữ liệu đám mây Google Sheets kết hợp Vercel Serverless Proxy.

---

## 🎨 1. QUY CHUẨN ĐẶT TÊN & DANH MỤC ASSETS

Toàn bộ file hình ảnh PNG trong suốt được lưu trữ đồng bộ tại thư mục:  
👉 `alien-shooter-fullstack/frontend/assets/`

### A. Icon Vũ Khí (HUD Dock & Armory Shop) — PNG 256x256 / 512x256
| Slot | Tên Vũ Khí | Tên File Chính | Tên File Phụ (Alt) |
| :---: | :--- | :--- | :--- |
| **1** | Song Lục Tác Chiến MK23 | `01_gun.png` | `weapon_01.png` |
| **2** | Shotgun Chiến Thuật M1014 | `short_gun02.png` | `weapon_02.png` |
| **3** | Súng Máy Minigun M134 | `gatling_gun03.png` | `weapon_03.png` |
| **4** | Súng Phun Lửa M9A2 | `fire_gun04.png` | `weapon_04.png` |
| **5** | Súng Trường Băng M4-Cryo | `sung_bang05.png` | `weapon_05.png` |
| **6** | Đại Bác Cao Tần Gauss M82 | `phao-06.png` | `weapon_06.png` |
| **7** | Pháo Laze Tập Trung Hyperion X-7 | `laze_gun07.png` | `weapon_07.png` |

### B. Skin Nhân Vật Tương Ứng Từng Khẩu Súng (Cho P1 & Đồng Đội P2)
| Vũ Khí Đang Cầm | Tên File Chính | Mô Tả Trực Quan |
| :--- | :--- | :--- |
| Cầm Súng Lục (Slot 1) | `sung_luc.png` | Chiến binh cầm 2 tay 2 khẩu MK23 |
| Cầm Shotgun (Slot 2) | `short_gun.png` | Chiến binh báng súng tì vai |
| Cầm Minigun (Slot 3) | `gatling_gun.png` | Chiến binh vác súng máy 6 nòng hạng nặng |
| Cầm Phun Lửa (Slot 4) | `fire_gun.png` | Chiến binh đeo bình napalm sau lưng |
| Cầm Súng Băng (Slot 5) | `sung_bang.png` | Chiến binh cầm súng trường năng lượng hàn băng |
| Cầm Pháo Gauss (Slot 6) | `phao.png` | Chiến binh vác khẩu đại bác cao tần Gauss |
| Cầm Pháo Laze (Slot 7) | `laze_gun.png` | Chiến binh mang súng phóng chùm laze Hyperion |

### C. Đơn Vị Tác Chiến & Đồ Vật Môi Trường
| Đơn Vị / Vật Thể | Tên File | Mô Tả Kỹ Thuật |
| :--- | :--- | :--- |
| **Tháp Pháo Tự Động** | `phao_tu_dong.png` | Tỉ lệ chuẩn hóa: `pivotXRatio: 0.443`, `pivotYRatio: 0.50`, `baseDiameterRatio: 0.50` |
| **Drone UAV Hỗ Trợ** | `drone.png` | Drone 4 cánh quạt bay tuần tra quanh nhân vật |
| **Kén Ngủ Đông 1 & 2** | `ken_ngudong.png`<br>`ken_ngudong2.png` | Kén sinh học `433x577`, pre-bake hào quang phát quang VRAM |
| **Máy Gia Tốc Hạt** | `may_gia_toc.png` | Kích thước `560x167`, tự động xoay ngang/dọc, vẽ tia sét và hạt photon |
| **Máy Phát Điện** | `generator.png` | Trạm phát điện trung tâm, sạc 5s bằng phím `[E]` |
| **Thùng Gỗ Quân Sự** | `crate.png` | Bắn vỡ rơi ra tiền hoặc trang bị |
| **Thùng Nhiên Liệu Nổ** | `barrel_tnt.png`<br>`barrel_acid.png`<br>`barrel_cryo.png`<br>`barrel_oil.png` | 4 loại thùng nổ (Thuốc nổ, Axit, Băng giá, Dầu loang) |

### D. Vật Phẩm Rơi Trong Trận (Drops) & UI
* **Vật phẩm**: `hp.png` (Máu), `tang_mau_giap.png` (Giáp), `tang_toc_chay.png` (Tốc chạy), `tang_dame.png` (Đạn nhiệt hạch), `kinh_dem.png` (Kính nhìn đêm NVG), `item_cash.png` (Tiền), `item_freeze.png` (Đóng băng), `item_nuke.png` (Bom hạt nhân), `ammo` (Hộp tiếp tế đạn dược vàng hổ phách).
* **Giao diện**: `load_game.png` (Ảnh nạp trận), `spaceport.png` (Hình nền sảnh chờ), `lobby_bg.png` (Nền căn cứ).
* **Bản đồ**: `alien-shooter-fullstack/frontend/map/map_01.png` đến `map_10.png`.
* **Âm thanh**: `alien-shooter-fullstack/frontend/audio/` (`nhac_nen.ogg`, `ingame.mp3`, thư mục `Wav/`).

### E. Cơ Chế Dự Phòng An Toàn (Safe Graceful Fallback)
Toàn bộ mã nguồn nạp asset được lập trình theo tiêu chuẩn **Zero-Crash**:
* Nếu file ảnh **tồn tại**: Game hiển thị hình ảnh HD sắc nét.
* Nếu file ảnh **thiếu hoặc bị lỗi mạng**: Game tự động chuyển sang đồ họa Vector Canvas thuần túy, **không gây vỡ giao diện, không báo lỗi console và không làm dừng game**.

---

## ☁️ 2. HỆ THỐNG CLOUD DATABASE (GOOGLE SHEETS + APPS SCRIPT)

Trò chơi sử dụng Google Sheets làm cơ sở dữ liệu đám mây NoSQL miễn phí, ổn định cao và không giới hạn lượt truy cập thông qua Google Apps Script (`google-sheets-backend/Code.gs`).

### 5 Tab Dữ Liệu Trong Database:
1. **`Admin_Config`**: Cấu hình toàn hệ thống:
   * `admin_email`: Email nhận yêu cầu khôi phục mật khẩu.
   * `starting_credits`: Quỹ tiền tân thủ mặc định ($120).
   * `Link server online`: Đường dẫn máy chủ Socket.io chính thức.
   * `Link server online backup` & `backup2`: Máy chủ dự phòng 1 và 2 cho cơ chế tự động Fallback.
   * `google_client_id`: OAuth 2.0 Client ID xác thực đăng nhập nhanh bằng tài khoản Google.
2. **`Users`**: Danh sách tài khoản:
   * Mật khẩu được mã hóa an toàn bằng thuật toán **SHA-256 kèm chuỗi Salt ngẫu nhiên**.
   * Quản lý `session_token`, thời điểm đăng nhập cuối và trạng thái reset mật khẩu.
3. **`Progress`**: Tiến trình chiến dịch:
   * Lưu trữ `user_id`, `max_unlocked_map` (1-10), số dư `credits`, cấp độ nâng cấp máu/giáp/tốc độ/sát thương/drone, và danh sách vũ khí đã mở khóa.
4. **`Leaderboard`**: Bảng vinh danh Top 20 toàn cầu:
   * Xếp hạng theo Map cao nhất, số quái đã diệt, thời gian sinh tồn và tổng số chiến thắng.
5. **`Settings`**: Tùy chỉnh cá nhân:
   * Lưu ảnh đại diện `avatar_url`, hình nền sảnh `lobby_bg_url`, độ mờ nền `lobby_dim`, và giới hạn FPS.

---

## 🛡️ 3. LỚP BẢO MẬT & VERCEL SERVERLESS PROXY

```mermaid
flowchart LR
    BROWSER["Client Trình Duyệt Web"] -->|POST /api/sync| PROXY["Vercel Serverless Function (api/sync.js)"]
    PROXY -->|URL Bí Mật Nội Bộ| APPS_SCRIPT["Google Apps Script (Code.gs)"]
    APPS_SCRIPT <--> GS_SHEET["Google Sheets 5 Tabs"]
```

1. **Vercel Serverless Proxy (`api/sync.js`)**:
   * Toàn bộ các yêu cầu từ Client được chuyển qua endpoint `/api/sync`.
   * **URL Google Apps Script được giấu kín hoàn toàn** trong biến môi trường máy chủ Vercel (`XENO_CLOUD_API_URL`), ngăn chặn kẻ xấu lấy được link trực tiếp để spam hoặc tấn công DoS database.
2. **Triệt Tiêu Lỗ Hổng Stored XSS**:
   * Mọi dữ liệu do người dùng nhập (`displayName`, tên người chơi trên Bảng xếp hạng, thông báo hệ thống) đều bắt buộc đi qua hàm làm sạch:
     ```javascript
     function escapeHtml(str) {
         if (!str) return "";
         return String(str)
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
     }
     ```
3. **Giới Hạn Bộ Nhớ LocalStorage Tránh Lỗi Quota**:
   * Ảnh nền sảnh chờ tải lên được tự động nén xuống tối đa $1280 \times 720\text{ px}$ (chất lượng JPEG 0.75).
   * Ảnh đại diện Avatar được nén xuống $256 \times 256\text{ px}$ (chất lượng JPEG 0.82), bọc trong khối `try/catch` có toast thông báo thân thiện nếu bộ nhớ trình duyệt bị đầy.
4. **Kiểm Tra Hợp Lệ Gói Tin Mạng (Input Clamping)**:
   * Gói tin `ENEMY_HIT` trên Host giới hạn sát thương tối đa không quá 2,500 damage/viên đạn, lực đẩy `kx/ky` trong đoạn $[-40, +40]$.
   * Gói tin `input` giới hạn chỉ số máu và giáp tối đa 5,000, ngăn chặn việc chỉnh sửa bộ nhớ (Memory Hack) trên Client để bất tử hoặc one-hit Boss trong chế độ Co-Op.
5. **Subresource Integrity (SRI) Trên CDN**:
   * Thư viện PeerJS 1.5.4 và Socket.io 4.7.5 được bảo vệ bằng mã băm `sha384-...` và thuộc tính `crossorigin="anonymous"`.
   * **Lưu ý đặc biệt**: Tuyệt đối **không** gắn `crossorigin="anonymous"` vào `https://cdn.tailwindcss.com` vì CDN này redirect 302 không trả header CORS, sẽ làm trình duyệt chặn nạp CSS và làm vỡ toàn bộ giao diện.

---

## 🔐 4. HỆ THỐNG XÁC THỰC GOOGLE OAUTH 2.0 (GOOGLE IDENTITY SERVICES)

Trò chơi hỗ trợ đăng nhập 1-chạm thông qua **Google Identity Services (GIS SDK)** kết hợp mô hình Kiến Trúc Dự Phòng Kép (Dual-Layer Verification):

```mermaid
flowchart TD
    CLIENT["Người Chơi (Web / Mobile / PWA)"] -->|1. Bấm Đăng Nhập Google| GIS["Google Identity Services (GIS SDK)"]
    GIS -->|2. Trả về ID Token (JWT)| CLIENT
    CLIENT -->|3. POST action: LOGIN_GOOGLE| PROXY["Vercel Serverless Function (api/sync.js)"]
    
    subgraph DUAL_LAYER["KIẾN TRÚC XÁC THỰC DỰ PHÒNG KÉP"]
        PROXY -->|Lớp 1: Node.js fetch ~80ms| GOOGLE_API["Google TokenInfo API (oauth2.googleapis.com)"]
        GOOGLE_API -->|Gắn google_user verified: true| PROXY
        PROXY -->|Chuyển tiếp payload an toàn| APPS_SCRIPT["Google Apps Script (Code.gs)"]
        APPS_SCRIPT -.->|Lớp 2 (Dự phòng gọi trực tiếp): UrlFetchApp| GOOGLE_API
    end
    
    APPS_SCRIPT -->|4. Tra cứu / Lưu trữ| DB[("Google Sheets (Users, Progress, Settings)")]
    DB -->|5. Trả về Session, Credits & Map| CLIENT
```

1. **Kiến Trúc Xác Thực Dự Phòng Kép (Dual-Layer Verification)**:
   * **Lớp 1 — Vercel Serverless Proxy (`api/sync.js`)**:
     * Khi nhận yêu cầu `LOGIN_GOOGLE`, máy chủ Vercel (môi trường Node.js) tự động gọi Google TokenInfo API (`https://oauth2.googleapis.com/tokeninfo?id_token=...`) để giải mã email, tên, và ảnh đại diện.
     * Đính kèm đối tượng `google_user: { email, name, picture, sub, verified: true }` vào gói tin chuyển tiếp sang Google Apps Script.
     * **Lợi ích**: Giảm thiểu thời gian chờ xuống còn ~80ms và bảo vệ hạn ngạch mạng (Quota) của Google Sheet.
   * **Lớp 2 — Google Apps Script Backend (`Code.gs`)**:
     * Nếu nhận được `google_user` đã xác thực từ Vercel, script xử lý ghi dữ liệu ngay lập tức mà **không cần gọi thêm lệnh mạng**.
     * Nếu người chơi gọi trực tiếp (chế độ offline/local direct), Apps Script sử dụng hàm `UrlFetchApp.fetch()` độc lập để tự xác thực dự phòng.
2. **Quy Trình Cấp Quyền Kết Nối Internet (`script.external_request`)**:
   * Khi thêm `UrlFetchApp` vào Apps Script, Google yêu cầu chủ sở hữu dự án cấp quyền kết nối mạng Internet đúng **1 lần duy nhất**.
   * Trong `Code.gs` đã trang bị sẵn hàm công cụ:
     ```javascript
     function CAP_QUYEN_XAC_THUC_INTERNET() {
       const resp = UrlFetchApp.fetch("https://www.google.com");
       Logger.log("Đã cấp quyền kết nối Internet thành công! Mã phản hồi: " + resp.getResponseCode());
     }
     ```
   * Chỉ cần chọn hàm trên và bấm **▶ Chạy (Run)** trong trình soạn thảo Apps Script, chọn **Xem lại quyền ➔ Nâng cao ➔ Đi tới Project_Xeno_Database ➔ Cho phép** để mở quyền vĩnh viễn cho Web App.
3. **Cơ Chế Liên Kết & Tạo Tài Khoản Tự Động (Smart Linking)**:
   * **Tài khoản đã tồn tại**: Nhận diện theo Gmail trong tab `Users`, đăng nhập tức thì, cấp `session_token` mới, đồng bộ 100% tiền tệ (`player.credits`), Map mở khóa và vũ khí đã nâng cấp. Nếu tài khoản chưa có ảnh đại diện riêng, tự động cập nhật Avatar từ Google vào tab `Settings`.
   * **Người chơi mới**: Tự động sinh `userId` dạng `XN-XXXXXXXX`, username duy nhất không trùng lặp, cấp vốn khởi đầu \$120, mở khóa Map 1 và lưu ảnh đại diện Google.
4. **Cấu Hình Google Cloud Console**:
   * **Client ID**: `1044781625624-q7oeqqv1u0pe53426atqkhhr5k6e0jm3.apps.googleusercontent.com` (được lưu tại hàng 12 tab `Admin_Config` và có thể đổi trực tiếp trên Sheet mà không cần build lại code).
   * **Trạng thái xuất bản (Publishing Status)**: Thiết lập **`In production`** và loại đối tượng **`External`** để mở quyền đăng nhập công khai cho toàn bộ người dùng sở hữu tài khoản Google trên thế giới mà không bị giới hạn danh sách Test users.
5. **Cơ Chế Dự Phòng An Toàn (Graceful Fallback)**:
   * Khi mở file trực tiếp từ ổ cứng (`file:///...`), hệ thống tự động phát hiện qua `window.location.protocol === "file:"` và ẩn nút Google để tuân thủ quy định bảo mật OAuth của Google, giữ nguyên 100% chức năng Đăng ký / Đăng nhập Username & Password truyền thống.

