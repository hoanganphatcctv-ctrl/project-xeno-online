# ⚔️ 03. CƠ CHẾ GAMEPLAY, VŨ KHÍ, CÂN BẰNG & TIẾN TRÌNH
## Dự án: Project Xeno: Reloaded (Fullstack Online Edition)

> **Mục đích tài liệu**: Cung cấp toàn bộ thông số kỹ thuật của 7 loại vũ khí, cơ chế điều khiển (PC & Mobile), tương tác vật thể môi trường, quy tắc phân bổ Boss theo bản đồ, và hệ thống lưu trữ tiến trình gameplay (`carryOver`).

---

## 🔫 1. HỆ THỐNG 7 LOẠI VŨ KHÍ TÁC CHIẾN

Trò chơi trang bị 7 loại vũ khí với cơ chế hỏa lực và phong cách chiến thuật riêng biệt:

| Slot | Tên Vũ Khí | Tốc Bắn (`fireRate`) | Sát Thương Cơ Bản | Đặc Điểm Hỏa Lực & Hiệu Ứng |
| :---: | :--- | :---: | :---: | :--- |
| **1** | **Song Lục Tác Chiến MK23** | `145ms` | 24 | Đạn vô hạn (INF). Bắn luân phiên 2 tay, độ chính xác cao. |
| **2** | **Shotgun Chiến Thuật M1014** | `450ms` | $8 \times 18$ | Bắn chùm 8 mảnh đạn tỏa góc rộng, đẩy lùi quái mạnh ở cự ly gần. |
| **3** | **Minigun 6 Nòng M134** | `52ms` | 19 | Tốc độ xả đạn cực cao (19 phát/giây), độ giật lớn, rung màn hình liên thanh. |
| **4** | **Súng Phun Lửa M9A2** | `34ms` | 14 / tick | Phun luồng lửa napalm diện rộng, đốt cháy quái và để lại vệt lửa trên sàn. |
| **5** | **Súng Trường Băng M4-Cryo** | `170ms` | 38 | Đạn tinh thể băng làm chậm 60% tốc độ chạy của quái vật trong 3 giây. |
| **6** | **Đại Bác Cao Tần Gauss M82** | `310ms` | 145 | Đạn xuyên thấu nhiều mục tiêu trên một đường thẳng, sát thương cực lớn. |
| **7** | **Pháo Laze Tập Trung Hyperion X-7** | `50ms` | 22 / tick | Chùm laze 3 lớp hội tụ liên tục, tăng nhiệt lượng theo thời gian và xuyên phá mọi quái. |

---

## 🖱️ 2. CƠ CHẾ BẮN LIÊN TỤC KHI GIỮ CHUỘT (PC AUTOMATIC CONTINUOUS FIRE)

* **Vấn đề đã khắc phục triệt để**:
  * Trước đây, hàm cập nhật điều khiển cảm ứng `updateTouchOverlayVisibility()` chạy định kỳ mỗi 250ms tự động gán `mouse.down = false` khi ở môi trường PC, khiến các loại súng sấy liên tục bị ngắt quãng và súng nhấp chậm (Shotgun, Gauss) không thể bắn phát thứ hai nếu giữ chặt chuột trái.
* **Cơ chế hoạt động hiện tại**:
  * Tách biệt 100% giữa cờ chuột vật lý PC (`mouse.down`) và cờ cần ảo cảm ứng mobile (`window.touchAimActive`).
  * Chỉ giải phóng chuột khi đang ngắm bằng cần ảo cảm ứng (`touchAimActive === true`), **tuyệt đối không bao giờ ghi đè `mouse.down` của chuột vật lý PC**.
  * Bổ sung bộ bắt sự kiện chuột toàn cục `window.addEventListener("mousedown")` (Zero Click Latency) và tự động nhả chuột an toàn khi người chơi chuyển tab (`window.addEventListener("blur")`).

---

## 🛡️ 3. ĐƠN VỊ HỖ TRỢ CHIẾN ĐẤU & KỸ NĂNG

1. **Tháp Pháo Tự Động (`[T]`)**:
   * Triển khai tối đa **4 tháp pháo** trên sàn đấu.
   * Tự động quét và ngắm bắn mục tiêu trong phạm vi **520px**, xả đạn kép 5 phát/giây.
   * **Chuẩn hóa tỉ lệ Asset (`phao_tu_dong.png`)**: Sử dụng tỉ lệ hình học chuẩn hóa:
     $$\text{pivotXRatio} = 0.443, \quad \text{pivotYRatio} = 0.50, \quad \text{baseDiameterRatio} = 0.50$$
     nhân trực tiếp với kích thước thực tế của ảnh, đảm bảo tháp pháo hiển thị sắc nét và xoay quanh đúng tâm ở mọi độ phân giải.
2. **Drone UAV Hỗ Trợ Chiến Đấu**:
   * Bay theo quỹ đạo tròn quanh người chơi với hiệu ứng cánh quạt mờ.
   * Tự động phát hiện mục tiêu và bắn tia laze phụ trợ tiêu diệt quái vật.
3. **Lướt Phản Lực Jetpack Dash (`[SPACE]`)**:
   * Lướt nhanh theo hướng di chuyển WASD hoặc hướng trỏ chuột.
   * **Bất tử hoàn toàn trong 11 frame** lướt, vệt bóng ma mờ dần và ngọn lửa phụt dài sau lưng. Thời gian hồi chiêu: **2.75 giây**.

---

## ⚡ 4. VẬT THỂ MÔI TRƯỜNG & TƯƠNG TÁC CHIẾN TRƯỜNG

1. **Máy Phát Điện Trạm Không Gian (`[E]` 5 giây)**:
   * **Vòng tròn nạp màu xanh lá dưới chân (Circular Load Ring)**:
     * Khi đứng trong phạm vi **95px** và giữ phím `[E]`, một vòng tròn màu xanh lá (`#22c55e`) quét tròn **360° theo chiều kim đồng hồ quanh chân (`r = 34px`)**.
     * Có điểm sáng dẫn hướng (`#86efac` lõi trắng) trượt theo đầu vòng nạp, hiệu ứng hào quang sàn dịu mắt và hiển thị số phần trăm nạp điện tử (`xx%`).
     * Bảng thông báo trên đầu máy phát điện được tinh gọn (cao 26px, viền xanh hiển thị `ĐANG KHỞI ĐỘNG: xx%`).
2. **Máy Gia Tốc Hạt (`assets/may_gia_toc.png` — `560x167`)**:
   * Tự động nhận diện hướng nằm ngang (`sp.orient === "h"`) hoặc dọc (`sp.orient === "v"` / `sp.h > sp.w`) của vật thể trên bản đồ để xoay $90^\circ$ tương ứng.
   * Hiệu ứng hào quang viền phát sáng nhẹ (đã pre-bake VRAM) kết hợp **2 tia sét điện từ phân nhánh** và **3 hạt Photon chớp nháy** chạy dọc bên trong đường ống kính.
3. **Kén Ngủ Đông Thí Nghiệm (`ken_ngudong.png`, `ken_ngudong2.png` — `433x577`)**:
   * Chứa mẫu thí nghiệm quái vật đột biến, pre-bake sẵn hào quang phát quang sinh học dịu nhẹ.
4. **Thùng Nhiên Liệu Phát Nổ (Explosive Barrels)**:
   * Thùng TNT (nổ diện rộng sát thương cao), Thùng Axit (tạo vũng axit ăn mòn quái), Thùng Đông Lạnh (sóng băng đóng cứng quái), và Thùng Dầu (bắt lửa cháy dữ dội).
5. **Thùng Gỗ Tiếp Tế (Supply Crates)**:
   * Bắn vỡ để nhận ngẫu nhiên tiền tín dụng, máu, giáp hoặc các vật phẩm đặc biệt.

---

## 👑 5. CÂN BẰNG SỐ LƯỢNG BOSS THEO MAP & XÓA BOSS TỐC BIẾN

1. **Quy Tắc Phân Bổ Số Lượng Boss**:
   * Tính từ Map 1, **cứ sau 2 map mới tăng 1 Boss, tối đa 4 Boss cho 10 map**:
     * **Map 1**: 1 Boss (*OMEGA BEHEMOTH*)
     * **Map 2**: 1 Boss (*VOID EMPEROR*)
     * **Map 3**: 2 Boss (*CRYO LEVIATHAN x2*)
     * **Map 4**: 2 Boss (*MAGMA ABOMINATION x2*)
     * **Map 5**: 3 Boss (*HIVE EMPRESS x3*)
     * **Map 6**: 3 Boss (*HƯ KHÔNG THẦN x3*)
     * **Map 7**: 4 Boss (*TITAN CƠ KHÍ x4*)
     * **Map 8**: 4 Boss (*THỦY QUÁI KRAKEN x4*)
     * **Map 9**: 4 Boss (*GIÁM NGỤC THỜI GIAN x4*)
     * **Map 10**: 4 Boss (*APEX PROGENITOR x4*)
2. **Xóa Sổ Vĩnh Viễn Cơ Chế Boss Tốc Biến (Anti-stuck Teleport Bug)**:
   * Đã loại bỏ hoàn toàn đoạn mã tự động dịch chuyển Boss sát cạnh người chơi khi cách xa > 1050px quá 4 giây (`boss.farTimer > 240`).
   * Boss giờ đây di chuyển tự nhiên theo thuật toán Flow Field và AI né vật cản, bảo toàn 100% tính công bằng cho chiến thuật thả diều (kiting) của người chơi.

---

## 📈 6. LOGIC TIẾN TRÌNH GAMEPLAY & BẢO LƯU THÔNG SỐ (`carryOver`)

Hệ thống phân biệt rõ ràng 3 trạng thái chơi game:

1. **Tài Khoản Cloud Đã Đăng Nhập (`XenoAuth.user`)**:
   * Đồng bộ tiến trình cao nhất từ Google Sheet qua `applyDataToGame()`.
   * Tiền tệ và cấp nâng cấp được bảo lưu an toàn:
     $$\text{player.credits} = \max(\text{player.credits}, \text{mapCfg.startCredits})$$
   * Không bao giờ bị ép tụt tiền về mức sàn $80 của tân thủ.
2. **Chế Độ Khách (Guest / Chưa Đăng Nhập) Hoặc Bấm Chơi Lại (`carryOver === false`)**:
   * Hàm `resetPlayerProgressionToMapDefault(mapId)` sẽ đặt lại toàn bộ tiền, súng đã mở khóa và cấp độ nâng cấp về đúng cấu hình thiết kế gốc của Map đó trong `MAP_CONFIGS[mapId]`.
3. **Chiến Thắng & Chuyển Màn Tiếp Theo (`transitionToNextMap` với `carryOver === true`)**:
   * Giữ nguyên 100% toàn bộ số tiền đang tích lũy, các loại súng đã mua và cấp nâng cấp để mang sang chiến trường tiếp theo.

---

## 🏆 7. MODAL CHIẾN THẮNG & RADAR MINI MAP

1. **Modal Chiến Thắng (`#victoryModal` — `MISSION COMPLETED`)**:
   * Khi Boss cuối bị tiêu diệt, game **chờ đúng 950ms** để người chơi xem trọn vẹn vụ nổ tung hoành tráng của Boss và hiệu ứng rung chấn màn hình.
   * Sau 950ms, hiển thị banner lục giác xanh lá **`MISSION COMPLETED`**, dòng chữ **`PRESS ANY KEY TO CONTINUE`** và **vòng tròn SVG màu xanh lá đếm ngược `3, 2, 1`**.
   * Bấm phím bất kỳ (hoặc click chuột, hoặc chờ hết 3 giây) sẽ tự động mở màn hình nạp sang Map kế tiếp.
2. **Mini Map Định Hướng Tinh Gọn (`renderRadarMinimap`)**:
   * Vị trí của người chơi ("Bạn") được hiển thị bằng **hình tam giác mũi tên màu xanh lá viền trắng** xoay nhọn theo hướng di chuyển tương đối (`player.moveAngle`).
   * Đã lược bỏ toàn bộ các chấm xanh thừa thãi, chỉ vẽ đúng 5 đối tượng có trong chú thích: **Bạn**, **Quái/Boss**, **Á Trùm**, **⚡ Nhà Máy Điện**, **Cổng Dịch**.
3. **Điều Khiển Cảm Ứng Mobile Touch & Tùy Biến Bố Cục Phím PUBG Mobile Style**:
   * **Xóa bỏ các nút đè lên Mini Map**: Đã loại bỏ hoàn toàn nút `[🔄 ĐỔI SÚNG]` và `[🛒 KHO [B]]` ở góc trên bên phải (Kho vũ khí đã có sẵn trong 4 nút chức năng ngay dưới Mini Map).
   * **Nút Tháp Pháo [T] Đặt Gọn Cạnh Nút [E]**: Chuyển nút Tháp Pháo `[T]` xuống cụm phím hành động góc dưới bên phải, nằm ngay sát cạnh nút `[E] BẬT` với kích thước tròn chuẩn hóa, giải phóng 100% không gian cho Radar Mini Map.
   * **Đổi súng tức thì khi đang di chuyển**: Thanh vũ khí mép dưới màn hình (`#weaponDockContainer`) được nâng lên `z-index: 35` cao hơn lớp cảm ứng và tích hợp sự kiện `touchstart` (`e.stopPropagation()`). Người chơi có thể vừa dùng ngón cái trái di chuyển vừa dùng ngón tay khác chạm thẳng vào các ô súng ở mép dưới để đổi vũ khí tức thì mà không bị khựng bước chạy.
   * **Tùy biến vị trí phím cảm ứng (PUBG Mobile Style)**:
     * Trong Cài đặt Điều khiển (Tab 04), bổ sung nút **`🎮 CHỈNH VỊ TRÍ PHÍM (LAYOUT EDITOR)`**.
     * Cho phép chạm và kéo thả tự do 5 phím điều khiển (Cần Di chuyển, Cần Ngắm & Bắn, Nút Dash, Nút [E], Tháp pháo [T]) đến bất kỳ tọa độ nào trên màn hình theo thói quen tay cầm của từng người chơi.
     * Tự động lưu tọa độ tỉ lệ phần trăm màn hình vào `localStorage` (`xeno_touch_layout`), có nút `↺ MẶC ĐỊNH` để khôi phục nhanh.

