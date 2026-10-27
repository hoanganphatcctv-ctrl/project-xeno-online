# 🚀 05. HƯỚNG DẪN ĐÓNG GÓI, LÀM RỐI MÃ & DEPLOY PRODUCTION
## Dự án: Project Xeno: Reloaded (Fullstack Online Edition)

> **Mục đích tài liệu**: Cung cấp quy trình đóng gói tự động, công nghệ bảo vệ mã nguồn độc quyền (Terser Minification & Obfuscation), và hướng dẫn triển khai đám mây chi phí 0đ với Vercel và Render.com.

---

## 🛡️ 1. TRIẾT LÝ BẢO VỆ MÃ NGUỒN ("CODE MỘT NƠI — BẢO VỆ MỘT NẺO")

Hệ thống được thiết kế để vừa thuận tiện cho việc phát triển và gỡ lỗi, vừa bảo vệ tối đa bản quyền khi phát hành ra Internet:

| Thành Phần | Vị Trí File | Trạng Thái & Đặc Điểm | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| **Mã Nguồn Phát Triển (Gốc)** | `alien-shooter-fullstack/frontend/index.html` | Giữ nguyên 100% mã nguồn rõ ràng, thụt dòng chuẩn, đầy đủ chú thích tiếng Việt. | **Nơi duy nhất** dành cho Lập trình viên và Trợ lý AI để sửa lỗi và thêm tính năng. |
| **File Giao Diện Xuất Bản** | `alien-shooter-fullstack/dist/index.html` | Giảm dung lượng từ 1.4 MB xuống **~286 KB**. | Chỉ chứa khung HTML và Tailwind CSS, gọi nạp logic qua `<script src="game.min.js"></script>`. |
| **File Logic Game Đã Làm Rối** | `alien-shooter-fullstack/dist/game.min.js` | Nén chặt trên **1 dòng duy nhất (~535 KB)**. | Toàn bộ hơn 24.000 dòng code JS đã được xóa sạch comment, làm rối toàn bộ biến/hàm ngoài cùng (`toplevel: true`) thành các ký tự vô nghĩa (`a, b, c, e...`). Chống dịch ngược và bảo vệ bản quyền tuyệt đối. |

---

## ⚡ 2. HAI LỰA CHỌN TRIỂN KHAI (DEPLOY)

### 🌟 LỰA CHỌN 1: Triển Khai 1-Click Tự Động (Khuyên Dùng)

Sau khi chỉnh sửa xong mã nguồn tại `frontend/index.html`:
👉 **Click đúp vào file `deploy_nhanh.bat`** (ở thư mục `alien-shooter-fullstack/`) hoặc `DEPLOY_NHANH_BAN_ONLINE.bat` (ở thư mục gốc).

Script sẽ tự động hoàn tất 3 bước liên hoàn:
1. **Đóng gói & Làm rối mã**: Chạy `build_minified.ps1` (hoặc `node build.cjs`), trích xuất mã JavaScript, chạy Terser nén logic sang `game.min.js` và đồng bộ song song vào cả hai thư mục:
   * `alien-shooter-fullstack/dist/`
   * `alien-shooter-fullstack/frontend/dist/`
2. **Tự động Commit Git**: Ghi nhận toàn bộ các file thay đổi với thông điệp tự động.
3. **Tự động Push lên GitHub**: Đẩy mã lên nhánh `main`. Nền tảng Vercel sẽ tự động phát hiện và cập nhật website trực tiếp sau 15–30 giây tại:  
   👉 **[https://project-xeno-online.vercel.app](https://project-xeno-online.vercel.app)**

> [!IMPORTANT]
> **Quy Tắc Bắt Buộc Về Git Author**:
> Cấu hình Git tại máy cục bộ đã được thiết lập mặc định theo tài khoản sở hữu:
> * `user.name = hoanganphatcctv-ctrl`
> * `user.email = 326910687+hoanganphatcctv-ctrl@users.noreply.github.com`
> 
> Tuyệt đối không thay đổi thông tin này để tránh việc gói Vercel Hobby từ chối quyền triển khai tự động!

---

### 📦 LỰA CHỌN 2: Kéo Thả Thủ Công Thư Mục `dist/` Lên Vercel

Nếu muốn triển khai trực tiếp thông qua giao diện Web của Vercel:
1. Chạy lệnh đóng gói:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\alien-shooter-fullstack\build_minified.ps1
   ```
2. Mở Dashboard dự án trên [Vercel.com](https://vercel.com).
3. Vào mục **Deployments**, kéo thả toàn bộ thư mục:  
   👉 **`alien-shooter-fullstack/dist`**
4. Vercel sẽ tự động nhận diện `index.html`, `game.min.js` cùng toàn bộ thư mục `assets/`, `audio/`, `map/`, `api/` và phát hành ngay lập tức.

---

## 🌐 3. HƯỚNG DẪN TRIỂN KHAI BACKEND LÊN RENDER.COM

Máy chủ Node.js Socket.io đảm bảo kết nối mạng cho chế độ Dedicated Server:

1. Đăng ký tài khoản miễn phí tại [Render.com](https://render.com).
2. Tạo mới một **Web Service** kết nối với Repository GitHub của bạn.
3. Điền cấu hình:
   * **Name**: `project-xeno-online`
   * **Region**: `Singapore (Southeast Asia)` (đạt ping thấp nhất ~25–40ms cho Việt Nam).
   * **Branch**: `main`
   * **Root Directory**: `alien-shooter-fullstack/backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
   * **Instance Type**: `Free`
4. Bấm **Create Web Service**. Khi khởi chạy thành công, Render cấp URL:  
   👉 `https://project-xeno-online.onrender.com`
5. Kiểm tra trên trình duyệt: Truy cập URL trên, nếu nhận được phản hồi:
   ```json
   { "status": "online", "name": "Project Xeno Co-Op Game Server", "activeRooms": 0 }
   ```
   thì máy chủ đã sẵn sàng 100%.

---

## 💡 4. GIẢI PHÁP CHỐNG "NGỦ ĐÔNG" MÁY CHỦ RENDER MIỄN PHÍ

Gói miễn phí của Render sẽ tạm dừng dịch vụ nếu sau 15 phút không có lượt truy cập (khiến lần mở phòng tiếp theo mất ~30 giây để khởi động lại).

**Cách khắc phục miễn phí 100% bằng UptimeRobot**:
1. Đăng ký tài khoản miễn phí tại [UptimeRobot.com](https://uptimerobot.com).
2. Bấm **Add New Monitor**:
   * **Monitor Type**: `HTTP(s)`
   * **Friendly Name**: `Xeno Backend Keepalive`
   * **URL (or IP)**: `https://project-xeno-online.onrender.com/health`
   * **Monitoring Interval**: `5 minutes`
3. Bấm **Create Monitor**.
4. UptimeRobot sẽ tự động gửi tín hiệu kiểm tra nhẹ nhàng tới endpoint `/health` mỗi 5 phút, giữ cho máy chủ WebSocket luôn luôn thức 24/7 với thời gian kết nối 0 giây!

---

## 🔍 5. KIỂM TRA BẢO MẬT SAU KHI DEPLOY

1. Truy cập vào trang web trên trình duyệt Chrome.
2. Nhấn phím tắt **`Ctrl + U`** (Xem nguồn trang - *View Page Source*):
   * Bạn sẽ thấy trang HTML chỉ có ~286 KB và kết thúc bằng dòng:
     ```html
     <script src="game.min.js"></script>
     ```
   * Không còn bất kỳ dòng code logic game hay chú thích tiếng Việt nào bị lộ ra ngoài.
3. Nhấn phím **`F12`** $\rightarrow$ chọn tab **Sources** $\rightarrow$ mở file `game.min.js`:
   * Mã nguồn đặc quánh trên 1 dòng duy nhất, các tên biến đều bị đổi thành ký tự viết tắt vô nghĩa, hoàn toàn chống dịch ngược và bảo vệ bản quyền tuyệt đối.

