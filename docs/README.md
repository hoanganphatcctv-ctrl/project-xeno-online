# 🛸 PROJECT XENO: RELOADED — BỘ TÀI LIỆU TOÀN DIỆN HỆ THỐNG
## Phiên Bản: Fullstack Online Edition (Single Source of Truth)

> **DÀNH CHO TRỢ LÝ AI & NHÀ PHÁT TRIỂN Ở CÁC PHIÊN LÀM VIỆC**:  
> Thư mục `docs/` này là **trung tâm tài liệu chuẩn xác và duy nhất** của toàn bộ dự án. Tất cả thông tin kiến trúc, cơ chế mạng Co-Op, quy tắc hiệu năng, logic gameplay, quy chuẩn asset và quy trình deploy đã được hợp nhất, kiểm tra thực tế và phân loại khoa học theo từng chuyên đề, loại bỏ hoàn toàn trùng lặp.

---

## 🌐 1. THÔNG TIN HỆ THỐNG TRỰC TUYẾN (LIVE PRODUCTION)

* **Website Trực Tuyến (Frontend Vercel)**: [https://project-xeno-online.vercel.app](https://project-xeno-online.vercel.app)
* **Kho Lưu Trữ GitHub Chính Thức**: [https://github.com/hoanganphatcctv-ctrl/project-xeno-online](https://github.com/hoanganphatcctv-ctrl/project-xeno-online)
* **Máy Chủ Socket.io Dedicated (Backend Render Singapore)**: [https://project-xeno-online.onrender.com](https://project-xeno-online.onrender.com)
* **Thư mục Git & Mã nguồn duy nhất**: `alien-shooter-fullstack/`
* **File mã nguồn duy nhất được phép chỉnh sửa**: 👉 **`alien-shooter-fullstack/frontend/index.html`**

---

## 📚 2. BẢN ĐỒ TÀI LIỆU CHUYÊN ĐỀ (SITEMAP)

| Mã File | Tên Tài Liệu | Nội Dung Cốt Lõi |
| :---: | :--- | :--- |
| **01** | [`01_KIEN_TRUC_HE_THONG_VA_MANG_COOP.md`](./01_KIEN_TRUC_HE_THONG_VA_MANG_COOP.md) | Kiến trúc tổng thể, hạ tầng Hybrid Co-Op 60Hz/30Hz (P2P STUN/TURN & Dedicated Socket.io), nội suy LERP + Dead Reckoning, đồng bộ Host-Authoritative, Dynamic Server Discovery & Fallback, Co-Op Shared Credit (70%/50%), Revive 3.5s & Sóng đẩy lùi, PWA Shortcut Chrome Standalone. |
| **02** | [`02_QUY_TAC_VANG_HIEU_NANG_VA_DO_HOA.md`](./02_QUY_TAC_VANG_HIEU_NANG_VA_DO_HOA.md) | 8 Quy tắc vàng hiệu năng & VRAM: Bảo toàn sàn kính trong suốt `surfaceCanvas` (`alpha: true`), GPU `ImageBitmap` Pre-baking (triệt tiêu `shadowBlur`), Spatial Hash Grid $O(1)$ cho 400+ quái, AI clearance caching, Frame Pacer & Watchdog 400ms, WebGL Shader Fail-Safe, Chế độ Đồ họa EPIC Next-Gen Sci-Fi (3 mức cài đặt) & Khử triệt để lỗi ảo ảnh nòng súng/đạn. |
| **03** | [`03_LOGIC_GAMEPLAY_VU_KHI_VA_CAN_BANG.md`](./03_LOGIC_GAMEPLAY_VU_KHI_VA_CAN_BANG.md) | Bảng chỉ số 7 loại vũ khí cân bằng mới, cân bằng súng Phun Lửa M9A2 (minMap 4, giá $1,950, DoT 4.0), Hộp Tiếp Tế Đạn Dược (`ammo_pack` 16%), Pacing 10 Maps tinh gọn (12 waves Map 10 & 4 Boss tối thượng duy nhất), vòng tròn máy phát 360° dưới chân, máy gia tốc 560x167, logic `carryOver`, Victory Modal 950ms. |
| **04** | [`04_QUY_CHUAN_ASSET_VA_CLOUD_DATABASE.md`](./04_QUY_CHUAN_ASSET_VA_CLOUD_DATABASE.md) | Danh mục quy chuẩn đặt tên toàn bộ ảnh PNG trong suốt & âm thanh, cơ chế nạp an toàn Graceful Fallback, hệ thống Google Sheets NoSQL Database (5 Tabs), Xác thực Google OAuth 2.0 (Google Identity Services 1-Click), Vercel Serverless Proxy `/api/sync`, phòng thủ XSS và giới hạn LocalStorage. |
| **05** | [`05_HUONG_DAN_DONG_GOI_BUILD_VA_DEPLOY.md`](./05_HUONG_DAN_DONG_GOI_BUILD_VA_DEPLOY.md) | Quy trình đóng gói nén & làm rối mã Terser (`build_minified.ps1`), kịch bản 1-click `deploy_nhanh.bat`, cấu hình Vercel/Render, kỹ thuật UptimeRobot giữ máy chủ thức 24/7, và quy tắc Git Author. |

---

## ⚡ 3. BẢNG TRA CỨU NHANH ID PHẦN TỬ & HÀM CỐT LÕI

| Thành phần / Tính năng | ID Phần tử / Tên Hàm | Vị trí / Cơ chế hoạt động chính |
| :--- | :--- | :--- |
| **Màn hình Tải Ban Đầu (Preloader)** | `#gamePreloaderScreen` | Nạp trước toàn bộ `CUSTOM_ASSETS` (vũ khí, skin, kén ngủ đông, máy gia tốc, âm thanh) kèm thanh `%` và hiệu ứng Hologram. |
| **Sảnh Chờ Chỉ Huy (Lobby)** | `#mainSettingsModal` | Nền Wallpaper, làm mờ `#wallpaperDimSlider`, Avatar `#customAvatarPreview`, 10 tab chọn Map `#lobbyTabsList`. |
| **Modal Chiến Thắng (Hexagon)** | `#victoryModal`<br>`triggerMapVictory()` | Sau khi Boss nổ tung **950ms**, hiển thị khung lục giác `MISSION COMPLETED`, nhắc phím `PRESS ANY KEY` và đếm ngược `3, 2, 1`. |
| **Modal Thua Trận (Game Over)** | `#gameOverModal`<br>`triggerPlayerDeath()` | Hiển thị ngay khi tử trận (`classList.remove("hidden")` và `style.display = "flex"`). Có nút Chơi lại và Về sảnh. |
| **Kho Vũ Khí & Nâng Cấp (`[B]`)** | `#armoryModal`<br>`toggleArmoryModal()` | Mở bảng mua 7 loại súng, nạp đạn, nâng HP/Giáp/Tốc độ/Sát thương, Drone UAV, Tháp pháo và Kính nhìn đêm NVG. |
| **Tiến trình Gameplay (`carryOver`)** | `initCampaign(keepSettingsOpen, carryOver)`<br>`resetPlayerProgressionToMapDefault(mapId)` | `carryOver === false` (Chơi lại/vào từ sảnh): Reset thông số về mặc định Map.<br>`carryOver === true` (Qua màn liên tục): Bảo lưu tiền, súng và nâng cấp. |
| **Vòng Tiến Trình Máy Phát Điện** | `drawMarinePlayer()`<br>`drawGenerator()` | Khi giữ `[E]` trong 95px: Vòng tròn màu xanh lá (`#22c55e`) quét 360° quanh chân (`r = 34px`) kèm điểm sáng dẫn đường và số `%`. |
| **Lưới Không Gian Vật Cản $O(1)$** | `rebuildObstacleSpatialGrid()`<br>`circleHitsStaticObstacle()`<br>`resolveWallSliding()` | 468 ô lưới (200px/ô). Giảm 98.7% số phép thử va chạm vật lý cho 400+ quái vật mỗi frame. |
| **Mạng Co-Op Hybrid & Fallback** | `const XENO_COOP`<br>`pushTeammateSnapshot()`<br>`tryNextServer()` | Mạng 60Hz/30Hz LERP + Dead Reckoning. Co-Op Shared Credit (70%/50%), Revive 3.5s + Sóng đẩy lùi 160px. |
| **Đồ Họa EPIC (Next-Gen Sci-Fi)** | `webglPostProcessor`<br>`this.graphicsTier = 2` | 3 cấp độ (2D Chuẩn, Cao, EPIC). Volumetric God Rays, Glossy Floor Specular, Muzzle Heat Haze, Sci-Fi HDR Diffuse Halo. |
| **Hộp Tiếp Tế Đạn Dược** | `spawnItemDrop()`<br>`activatePowerup("ammo")` | Tỉ lệ rơi 16% trên sàn đấu, nhặt nạp ngay +35% đạn súng chính và +20% đạn dự trữ. |
| **Đăng Nhập Google (1-Click)** | `XenoAuth.loginGoogle()`<br>`initGoogleAuth()` | Google Identity Services (GIS). Xác thực TokenInfo chính chủ, tự động tạo tài khoản hoặc liên kết tài khoản cũ, cập nhật Avatar. |

---

## 🎮 4. BẢNG MÃ CHEAT PHỤC VỤ KIỂM THỬ NHANH

Gõ trực tiếp các mã sau trên bàn phím khi đang trong trận đấu:

| Mã Cheat | Tác Dụng Kiểm Thử |
| :--- | :--- |
| `cheatmap` | **Mở khóa toàn bộ 10 Bản đồ** ngay lập tức. |
| `cheatf` | **Bật / Tắt chế độ sáng toàn bản đồ** (Fullbright). |
| `cheatm` | **Cộng thêm +$50,000** vào ví tín dụng nhân vật. |
| `cheath` | **Tăng Máu và Giáp Nano lên 500 / 500**, hồi phục toàn bộ thể lực. |
| `cheatw` | **Mở khóa toàn bộ 7 loại súng** và nạp đầy 100% cơ số đạn. |
| `cheati` | **Thả 7 vật phẩm hỗ trợ đặc biệt** xung quanh nhân vật. |

---

## 🛠️ 5. QUY TRÌNH 5 BƯỚC CHUẨN KHI LÀM VIỆC DÀNH CHO AI

1. **Bước 1**: Đọc tài liệu tương ứng trong thư mục `docs/` trước khi sửa code để nắm rõ logic nghiệp vụ.
2. **Bước 2**: Chỉ chỉnh sửa duy nhất file: 👉 **`alien-shooter-fullstack/frontend/index.html`** (hoặc `google-sheets-backend/Code.gs` nếu sửa backend database).
3. **Bước 3**: Tuân thủ tuyệt đối **7 Quy tắc vàng hiệu năng** trong file `02_QUY_TAC_VANG_HIEU_NANG_VA_DO_HOA.md`.
4. **Bước 4**: Chạy script đóng gói:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\alien-shooter-fullstack\build_minified.ps1
   ```
5. **Bước 5**: Kiểm tra kết quả build, đảm bảo `game.min.js` được tạo thành công trong cả `alien-shooter-fullstack/dist/` và `alien-shooter-fullstack/frontend/dist/`.

