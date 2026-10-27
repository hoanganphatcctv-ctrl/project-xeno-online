# 🚀 HƯỚNG DẪN 3 BƯỚC THIẾT LẬP GOOGLE SHEET & GOOGLE APPS SCRIPT CHO GAME

Toàn bộ mã nguồn đã có sẵn tại file: [`google-sheets-backend/Code.gs`](file:///c:/Users/Lenovo/Desktop/Alien_Shooter/google-sheets-backend/Code.gs). Bạn chỉ cần thực hiện 3 bước sau (mất khoảng 1 - 2 phút):

---

### BƯỚC 1: TẠO GOOGLE SHEET & MỞ APPS SCRIPT
1. Mở trình duyệt, truy cập: [https://sheets.new](https://sheets.new) để tạo 1 bảng tính Google Trang tính mới.
2. Đặt tên bảng tính ở góc trên bên trái: `Project_Xeno_Database`.
3. Trên thanh menu, bấm vào **Tiện ích mở rộng** (Extensions) -> chọn **Apps Script**.

---

### BƯỚC 2: DÁN CODE & CHẠY 1-CLICK TỰ TẠO 5 TAB
1. Tại cửa sổ Apps Script vừa mở, bạn xóa sạch mọi dòng code trong file `Code.gs` mặc định.
2. Mở file [`google-sheets-backend/Code.gs`](file:///c:/Users/Lenovo/Desktop/Alien_Shooter/google-sheets-backend/Code.gs) trên máy tính của bạn, copy toàn bộ và dán vào Apps Script.
3. Nhìn lên thanh công cụ phía trên, ở mục chọn hàm (cạnh nút Gỡ lỗi/Debug), chọn hàm: **`SETUP_INITIAL_SHEETS`**.
4. Bấm nút **Chạy (Run)** (icon tam giác ▶️).
   - *Lưu ý*: Google sẽ hiện bảng yêu cầu cấp quyền truy cập. Bạn bấm: **Xem xét quyền** (Review permissions) -> Chọn tài khoản Google của bạn -> Bấm **Nâng cao** (Advanced) ở góc dưới -> Bấm **Đi tới Project_Xeno (Không an toàn)** -> Bấm **Cho phép** (Allow).
5. Quay lại trang Google Sheet, bạn sẽ thấy 5 Tab đã được tự động tạo với màu sắc Sci-Fi cực đẹp:
   - `Admin_Config`: **Hãy thay ô B2 thành địa chỉ Gmail của bạn** để nhận mail khi ai đó quên mật khẩu!
   - `Users`: Chứa danh sách tài khoản, Gmail, mật khẩu băm SHA-256.
   - `Progress`: Lưu tiền tệ, map, nâng cấp vũ khí.
   - `Leaderboard`: Bảng xếp hạng Top 20.
   - `Settings`: Cài đặt cá nhân.

---

### BƯỚC 3: TRIỂN KHAI THÀNH WEB APP (DEPLOY)
1. Ở góc trên bên phải trang Apps Script, bấm nút màu xanh **Triển khai** (Deploy) -> chọn **Tùy chọn triển khai mới** (New deployment).
2. Bấm vào icon bánh răng ⚙️ bên cạnh "Chọn loại" -> Chọn **Ứng dụng web** (Web app).
3. Thiết lập chính xác 3 mục sau:
   - **Mô tả (Description)**: `Project Xeno API v1`
   - **Thực thi dưới dạng (Execute as)**: **Tôi** (`Me - email của bạn`)
   - **Ai có quyền truy cập (Who has access)**: **Bất kỳ ai** (`Anyone`) *(Rất quan trọng để game trên Vercel gọi được)*.
4. Bấm **Triển khai** (Deploy).
5. Google sẽ cung cấp cho bạn một đường link gọi là **URL ứng dụng web** (Web app URL), dạng:
   `https://script.google.com/macros/s/AKfycbx.../exec`
6. Bạn copy đường link này và gửi lại đây cho tôi, tôi sẽ kết nối thẳng vào game là xong 100%!

