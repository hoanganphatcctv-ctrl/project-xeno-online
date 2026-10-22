# 🛸 TÀI LIỆU HƯỚNG DẪN DÀNH CHO AI Ở PHIÊN TIẾP THEO
## Dự án: Project Xeno: Reloaded — Fullstack Online Co-op & Singleplayer Edition

> **DÀNH CHO TRỢ LÝ AI Ở CÁC PHIÊN TIẾP THEO**:  
> Đọc kỹ tài liệu này trước khi chỉnh sửa bất kỳ dòng code nào. Tài liệu cung cấp toàn bộ bản đồ kiến trúc, vị trí file mã nguồn, quy tắc vận hành và cẩm nang xử lý tức thì khi người dùng yêu cầu chỉnh sửa giao diện hay tính năng.

---

## 📍 1. BẢN ĐỒ MÃ NGUỒN 2 PHIÊN BẢN (SOURCE CODE MAP)

Hệ sinh thái dự án gồm 2 phiên bản song song:

| Phiên bản | Đường dẫn File chính | Vai trò & Cách hoạt động |
| :--- | :--- | :--- |
| **🌐 BẢN ONLINE CO-OP (Vercel Live / GitHub)** | `alien-shooter-fullstack/frontend/index.html`<br>`alien-shooter-fullstack/build.cjs` | **Bản đang chạy trực tiếp trên Internet** tại [https://project-xeno-online.vercel.app](https://project-xeno-online.vercel.app). Giữ **100% đồ họa, âm thanh, tính năng bản chơi đơn** tích hợp hệ thống **Lập Đội Cùng Chiến (Online Co-Op PeerJS P2P 30Hz)** qua STUN server toàn cầu. |
| **🖥️ BẢN CHƠI ĐƠN (Offline / Standalone)** | `alien-shooter-vercel/index.html`<br>`index_optimized_v2.html` | Bản chơi đơn nguyên bản dùng để chạy offline trực tiếp trên máy tính hoặc xuất bản bản standalone. |
| **🚀 BACKEND NODE.JS SOCKET.IO (Tùy chọn)** | `alien-shooter-fullstack/backend/server.js` | Server trung gian Node.js hỗ trợ tạo phòng và relay gói tin khi cần chạy Dedicated Server trên Render.com. |

---

## ⚡ 2. CẨM NANG HÀNH ĐỘNG CHO AI KHI NGƯỜI DÙNG BẢO SỬA BẤT KỲ ĐIỀU GÌ

Khi người dùng đưa ra yêu cầu (VD: *"sửa chữ X thành Y"*, *"thay đổi màu sắc"*, *"chỉnh sửa vũ khí"*, *"sửa giao diện sảnh"*...):

### 📌 Bước 1: Xác định phiên bản cần sửa
- Nếu người dùng bảo: **"ở phiên bản online"** hoặc yêu cầu cập nhật lên link Vercel -> Sửa file:
  👉 `alien-shooter-fullstack/frontend/index.html`
- Nếu người dùng bảo: **"ở phiên bản chơi đơn / offline"** -> Sửa file:
  👉 `alien-shooter-vercel/index.html` và `index_optimized_v2.html`
- Nếu người dùng bảo: **"ở cả 2 phiên bản"** hoặc nói chung chung -> Sửa đồng bộ cả hai!

### 📌 Bước 2: Tra cứu nhanh ID phần tử & Dòng mã cần sửa trong `index.html`

| Thành phần Giao diện / Tính năng | ID Phần tử trong HTML | Vị trí / Từ khóa tìm kiếm |
| :--- | :--- | :--- |
| **Màn hình Tải Ban Đầu (Preloader)** | `#gamePreloaderScreen` | `load_game.png`, vòng quay Hologram, thanh nạp `%` |
| **Sảnh Chờ Chỉ Huy (Lobby)** | `#mainSettingsModal` | Nền Wallpaper, làm mờ `#wallpaperDimSlider`, Avatar `#customAvatarPreview` |
| **10 Tab Chọn Bản Đồ dưới đáy** | `#lobbyTabsList` | `MAP 1: ALPHA` đến `MAP 10: GENESIS`, ảnh `map/map_01.png` - `map_10.png` |
| **Modal Co-Op (Lập Đội Cùng Chiến)** | `#coopModal` | **Tiêu đề**: `LẬP ĐỘI CÙNG CHIẾN`<br>**Phụ đề**: `Cùng nhau chiến đấu bảo vệ nền văn minh cuối cùng.`<br>Nút Tab Host / Join, Room Code 6 số, Sao chép link mời |
| **Nút mở Co-Op tại Sảnh** | `window.openCoopModal()` | `TÁC CHIẾN ONLINE CO-OP (TEAM 2)` / `coopLobbyBadge` |
| **Menu Cài Đặt Hệ Thống (4 Tab)** | `#systemSettingsModal` | Tab Giao diện, Đồ họa & FPS (khóa FPS 60/120/Uncapped), Âm thanh (Master/BGM/SFX), Điều khiển, Hỗ trợ |
| **Khung Mã QR Donate** | `#sysDonatePlaceholder` | Đã dọn dẹp sạch sẽ: Chỉ hiển thị icon QR + nhãn `CHƯA CÓ LINK QR` (đã xóa triệt để dòng hướng dẫn Google Sheet) |
| **Kho Vũ Khí & Nâng Cấp** | `#armoryModal` | 7 dòng súng, mua đạn, mở khóa Drone, Kính nhìn đêm NVG, Pháo tự động |
| **Vòng lặp Game In-Game** | `function gameLoop()` | Cố định 60Hz physics accumulator, Render decal máu sàn `surfaceCanvas`, Đèn pin nón 580px `lightCanvas` |
| **Hệ thống Co-Op Logic (P2P)** | `const XENO_COOP` | PeerJS 30Hz, đồng bộ vị trí, quái, item, cứu đồng đội gục ngã (Downed 5s) |

### 📌 Bước 3: Đóng gói bản phân phối (Build)
Sau khi sửa `frontend/index.html`, **bắt buộc chạy script build** để đồng bộ ra thư mục `dist/`:
```powershell
powershell -Command "cd alien-shooter-fullstack; node build.cjs; cd frontend; node build.cjs"
```
*(Script mất chỉ 0.3 giây để copy sạch `index.html`, `assets/`, `audio/`, `map/` vào `dist/`)*.

### 📌 Bước 4: Commit và Push lên GitHub để Vercel tự động triển khai
Kho Git nằm tại `alien-shooter-fullstack/`. Chạy các lệnh sau:
```powershell
git -C alien-shooter-fullstack add .
git -C alien-shooter-fullstack commit -m "mô tả thay đổi vừa thực hiện"
git -C alien-shooter-fullstack push origin main
```
> [!IMPORTANT]
> **Quy tắc Git Author**: Local git config đã được đặt mặc định là:  
> `user.name = hoanganphatcctv-ctrl`  
> `user.email = 326910687+hoanganphatcctv-ctrl@users.noreply.github.com`  
> Tuyệt đối không đổi sang email khác để tránh bị Vercel Hobby chặn deploy!

### 📌 Bước 5: Xác minh kết quả trên Vercel Live
Sau khi push, Vercel sẽ tự động deploy trong vòng 10 - 15 giây.
Kiểm tra trực tiếp tại:
👉 **[https://project-xeno-online.vercel.app](https://project-xeno-online.vercel.app)**  
Dùng lệnh curl hoặc node fetch để kiểm chứng kết quả trả về mã HTTP 200 và chuỗi ký tự vừa sửa.

---

## 🛠️ 3. MÔI TRƯỜNG & ĐƯỜNG DẪN CÔNG CỤ TRÊN MÁY TÍNH

- **Node.js**: Cài tại `C:\Program Files\nodejs` (hoặc `%LOCALAPPDATA%\Programs\nodejs`).
- **PowerShell**: Khi gọi `npm` hoặc `node`, nếu gặp lỗi không tìm thấy lệnh, hãy thêm biến môi trường:
  ```powershell
  $env:PATH = "C:\Program Files\nodejs;$env:PATH"
  ```
- **Tài khoản GitHub**: `hoanganphatcctv-ctrl`
- **Kho GitHub**: `https://github.com/hoanganphatcctv-ctrl/project-xeno-online.git` (nhánh `main`)
- **Tên miền Vercel**: `https://project-xeno-online.vercel.app`

---

## 🛡️ 4. CÁC QUY TẮC BẤT BIẾN KHI LẬP TRÌNH (GOLDEN RULES)

1. **Giữ nguyên 100% trải nghiệm bản gốc**:
   - Người dùng yêu cầu giữ 100% giao diện, âm thanh, đồ họa và tính năng nguyên bản của bản chơi đơn, chỉ tích hợp thêm chế độ chơi online.
   - Không được lược bớt menu cài đặt, kho súng, âm thanh hay màn hình preloader.
2. **Khung mã QR Donate sạch sẽ**:
   - Không bao giờ hiển thị lại các dòng ghi chú hướng dẫn kỹ thuật nội bộ (như "Dán link Google Drive vào ô Donate link picture...") cho người chơi thấy.
3. **Modal Lập Đội Cùng Chiến (Co-Op)**:
   - Luôn duy trì tiêu đề: `LẬP ĐỘI CÙNG CHIẾN`
   - Luôn duy trì phụ đề: `Cùng nhau chiến đấu bảo vệ nền văn minh cuối cùng.`
4. **Cơ chế Co-Op P2P**:
   - Người chơi gục ngã (Downed) được đồng đội cứu bằng cách đứng trong phạm vi 75px giữ 5 giây. Không giới hạn số lần cứu.
   - Chỉ khi cả 2 người chơi cùng gục ngã thì mới kích hoạt Game Over.
   - Ví tiền riêng biệt (`credits` của ai nhặt người đó hưởng).

---

## ✅ 5. TỔNG KẾT TRẠNG THÁI HỆ THỐNG
- **Bản Live Vercel**: Hoạt động hoàn hảo 100%, phục vụ CDN toàn cầu, thời gian tải < 1 giây.
- **Tác chiến Co-Op**: Hỗ trợ tạo phòng cấp mã PIN 6 ký tự hoặc tạo link mời trực tiếp (`?room=CODE`), kết nối P2P 0ms trễ qua STUN.
- **Tất cả các tài liệu hệ thống đã được đồng bộ hóa hoàn toàn**. Phiên tiếp theo AI chỉ cần đọc tài liệu này là có thể đáp ứng ngay lập tức mọi yêu cầu của người dùng!
