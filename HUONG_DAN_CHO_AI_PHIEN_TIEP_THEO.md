# 🛸 TÀI LIỆU HƯỚNG DẪN DÀNH CHO AI Ở PHIÊN TIẾP THEO
## Dự án: Project Xeno: Reloaded — Fullstack Online Edition

> **DÀNH CHO TRỢ LÝ AI Ở CÁC PHIÊN TIẾP THEO**:  
> Đọc kỹ tài liệu này trước khi chỉnh sửa bất kỳ dòng code nào. Hệ thống hiện chỉ duy trì **DUY NHẤT BẢN ONLINE (`alien-shooter-fullstack`)** (đã xóa bỏ hoàn toàn các thư mục/file bản chơi đơn rời rạc trước đây).

---

## 📍 1. BẢN ĐỒ MÃ NGUỒN HỆ THỐNG (SOURCE CODE MAP)

| Thành phần | Đường dẫn File chính | Vai trò & Cách hoạt động |
| :--- | :--- | :--- |
| **🌐 MÃ NGUỒN CHÍNH (Vercel Live / GitHub)** | `alien-shooter-fullstack/frontend/index.html`<br>`alien-shooter-fullstack/build.cjs`<br>`alien-shooter-fullstack/frontend/build.cjs` | **Bản duy nhất đang chạy trực tiếp trên Internet** tại [https://project-xeno-online.vercel.app](https://project-xeno-online.vercel.app). Bao gồm đầy đủ Chiến dịch (Solo & Online Co-Op 2 người), 7 vũ khí, 10 bản đồ, 10 Boss, hệ thống mạng **Hybrid (P2P PeerJS + OpenRelay TURN TCP/UDP 80/443 & Dedicated Socket.io)**, nội suy **Snapshot Buffer 60Hz/30Hz LERP + Dead Reckoning**, và đồng bộ **Host-Authoritative** toàn diện. |
| **☁️ SERVERLESS PROXY (Cloud DB Sync)** | `alien-shooter-fullstack/api/sync.js`<br>`alien-shooter-fullstack/frontend/api/sync.js`<br>`google-sheets-backend/Code.gs` | Proxy bảo mật trên Vercel kết nối Google Sheets NoSQL Database (Đăng ký/Đăng nhập SHA-256, Lưu tiến trình tự động, Bảng xếp hạng Top 20 toàn cầu). |
| **🚀 DEDICATED SERVER SOCKET.IO** | `alien-shooter-fullstack/backend/server.js` | Máy chủ Node.js + Socket.io (Port 4000 / Render.com) hỗ trợ tạo phòng mã PIN 6 ký tự, chuyển tiếp gói tin 60Hz/30Hz và các sự kiện `SPAWN_ENEMY`, `SYNC_ENEMIES`, `ENEMY_HIT`, `ENEMY_DIE`. |

---

## ⚡ 2. CẨM NANG HÀNH ĐỘNG CHO AI KHI NGƯỜNG DÙNG BẢO SỬA BẤT KỲ ĐIỀU GÌ

### 📌 Bước 1: File duy nhất cần sửa
Mọi yêu cầu chỉnh sửa giao diện, tính năng, vũ khí, quái vật hay mạng đều thực hiện trực tiếp tại:
👉 **`alien-shooter-fullstack/frontend/index.html`**
*(Tuyệt đối KHÔNG sửa trực tiếp trong thư mục `dist/` hoặc `frontend/dist/` vì sẽ bị ghi đè khi chạy build).*

### 📌 Bước 2: Tra cứu nhanh ID phần tử & Hàm cốt lõi trong `frontend/index.html`

| Thành phần Giao diện / Tính năng | ID Phần tử / Tên Hàm | Vị trí / Từ khóa tìm kiếm |
| :--- | :--- | :--- |
| **Màn hình Tải Ban Đầu (Preloader)** | `#gamePreloaderScreen` | `load_game.png`, vòng quay Hologram, thanh nạp `%` |
| **Sảnh Chờ Chỉ Huy (Lobby)** | `#mainSettingsModal` | Nền Wallpaper, làm mờ `#wallpaperDimSlider`, Avatar `#customAvatarPreview` |
| **10 Tab Chọn Bản Đồ dưới đáy** | `#lobbyTabsList` / `#lobbyMapDiffDrawer` | `MAP 1: ALPHA` đến `MAP 10: GENESIS`, ảnh `map/map_01.png` - `map_10.png` |
| **Modal Co-Op (Lập Đội Cùng Chiến)** | `#coopModal` | **Tiêu đề**: `LẬP ĐỘI CÙNG CHIẾN`<br>**Phụ đề**: `Cùng nhau chiến đấu bảo vệ nền văn minh cuối cùng.`<br>Chọn Hạ tầng (`P2P Direct` / `Dedicated Server`), Tick Rate (`60Hz` / `30Hz`), Room Code 6 ký tự, Link mời trực tiếp |
| **HUD Mạng Co-Op In-Game** | `#coopTopHUD` | Hiển thị `CO-OP ONLINE // 60Hz`, `HOST (P1) / CLIENT (P2) • 60Hz LERP`, `PING: xx.xms`, cảnh báo cứu đồng đội |
| **Menu Cài Đặt Hệ Thống (4 Tab)** | `#systemSettingsModal` | Tab Giao diện, Đồ họa & FPS (khóa FPS 60/120/Uncapped), Âm thanh (Master/BGM/SFX), Điều khiển, Hỗ trợ |
| **Khung Mã QR Donate** | `#sysDonatePlaceholder` | Chỉ hiển thị icon QR + nhãn `CHƯA CÓ LINK QR` |
| **Kho Vũ Khí & Nâng Cấp** | `#armoryModal` | 7 dòng súng, mua đạn, mở khóa Drone, Kính nhìn đêm NVG, Pháo tự động |
| **Vòng lặp Game In-Game** | `function gameLoop()` | Cố định 60Hz physics accumulator, Render decal máu sàn `surfaceCanvas`, Đèn pin nón 580px `lightCanvas` |
| **Hệ thống Co-Op Logic** | `const XENO_COOP` | Hybrid P2P (STUN + OpenRelay TURN 80/443 TCP/UDP) & Socket.io, Tick Rate 60Hz/30Hz, Ping RTT |
| **Nội suy & Vẽ Đồng đội** | `pushTeammateSnapshot()`<br>`drawTeammatePlayer()` | Snapshot Buffer 25 gói (LERP 35-50ms + Dead Reckoning `vx, vy`), Vòng vàng định danh dưới chân, Skin nhân vật HD 7 súng, tia Laze Hyperion 3 lớp |
| **Đồng bộ Quái & Vật thể (Host-Authoritative)** | `spawnEnemyFromHost()`<br>`syncEnemiesFromHostPacket()`<br>`handleClientEnemyDie()`<br>`handleHostPropHit()`<br>`handleRemoteWorldInteract()` | Đồng bộ `SPAWN_ENEMY`, gom nhóm `SYNC_ENEMIES` mỗi 80ms (12.5Hz) kèm `openDoors`, `deadCrates`, `deadBarrels`, `deadVats`, `mapGenerator`; sự kiện `ENEMY_HIT`, `ENEMY_DIE`, `ENEMY_SHOOT`, `PROP_HIT`, `PROP_STATE`, `PROP_DESTROY`, `WORLD_INTERACT` |

### 📌 Bước 3: Đóng gói bản phân phối (Build)
Sau khi sửa `alien-shooter-fullstack/frontend/index.html`, **bắt buộc chạy script build** để đồng bộ song song ra cả 2 thư mục `alien-shooter-fullstack/dist/` và `alien-shooter-fullstack/frontend/dist/`:
```powershell
powershell -Command "cd alien-shooter-fullstack; node build.cjs; cd frontend; node build.cjs"
```

### 📌 Bước 4: Commit và Push lên GitHub để Vercel tự động triển khai
Kho Git nằm tại `alien-shooter-fullstack/`. Chạy lệnh (hoặc gọi `deploy_nhanh.bat`):
```powershell
git -C alien-shooter-fullstack add -A
git -C alien-shooter-fullstack commit -m "mô tả thay đổi vừa thực hiện"
git -C alien-shooter-fullstack push origin main
```
> [!IMPORTANT]
> **Quy tắc Git Author**: Local git config đã được đặt mặc định là:  
> `user.name = hoanganphatcctv-ctrl`  
> `user.email = 326910687+hoanganphatcctv-ctrl@users.noreply.github.com`  
> Tuyệt đối không đổi sang email khác để tránh bị Vercel Hobby chặn deploy!

### 📌 Bước 5: Xác minh kết quả trên Vercel Live
Kiểm tra trực tiếp tại: 👉 **[https://project-xeno-online.vercel.app](https://project-xeno-online.vercel.app)**

---

## 🛡️ 3. LOGIC HOẠT ĐỘNG CO-OP HIỆN TẠI & CÁC QUY TẮC BẤT BIẾN (GOLDEN RULES)

1. **Hạ tầng kết nối Hybrid (P2P Direct & Socket.io Dedicated Server)**:
   - Hỗ trợ tạo phòng cấp mã PIN 6 ký tự (`XNxxxx`) và Link mời trực tiếp (`?room=CODE`).
   - P2P tích hợp STUN + OpenRelay TURN trên cổng 80/443 (cả UDP và TCP) vượt tường lửa, có timeout bảo vệ 20 giây và giữ mã phòng khi đóng/mở modal.
2. **Đồng bộ Chuyển động 60Hz/30Hz LERP + Dead Reckoning**:
   - Mặc định 60Hz LERP. Đồng đội được nội suy qua `teammate.snapshotBuffer` (trễ 35–50ms) kết hợp dự đoán vận tốc Dead Reckoning khi mạng trễ.
   - Đồng đội hiển thị đầy đủ skin HD theo từng loại súng đang cầm và vòng tròn vàng dưới chân.
3. **Host-Authoritative Enemy & World Sync**:
   - Host điều phối sinh quái (`SPAWN_ENEMY`), AI chọn mục tiêu (`targetPlayerId`), đạn quái (`ENEMY_SHOOT`) và phát bản tin tổng hợp `SYNC_ENEMIES` mỗi **80ms (12.5Hz)** (gồm tọa độ/vận tốc/góc quay/máu quái & Boss, danh sách cửa đang mở `openDoors`, các thùng/bình đã nổ `deadCrates`/`deadBarrels`/`deadVats`, và trạng thái máy phát điện `genOn`).
   - Client bắn quái gửi `ENEMY_HIT` về Host; khi quái chết Host phát `ENEMY_DIE` trả thưởng tiền và kill cho đúng người kết liễu (`killerId`).
   - Vật thể phá hủy và tương tác (`crate`, `barrel`, `vat`, `generator`, `desk`, `supercomputer`) đồng bộ 2 chiều qua `PROP_HIT`, `PROP_STATE`, `PROP_DESTROY`, `WORLD_INTERACT`.
4. **Cơ chế Máu/Giáp, Cứu đồng đội & Ví tiền riêng**:
   - Mỗi máy tự quyết định máu/giáp của chính mình (gói `snap` của Host **không ghi đè** ngược `player.hp`/`player.armor`/`player.isDown` của Client, tránh lỗi bất tử).
   - Người chơi gục ngã (Downed) được đồng đội cứu bằng cách đứng trong phạm vi **75px** giữ **5 giây** (cứu dậy với 40% HP, 25 Giáp và 1.5s bất tử). Không giới hạn số lần cứu. Chỉ khi cả 2 cùng gục ngã mới Game Over.
   - Ví tiền riêng biệt (`credits` của ai nhặt hoặc diệt quái người đó hưởng).
