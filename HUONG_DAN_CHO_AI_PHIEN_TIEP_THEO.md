# 🛸 TÀI LIỆU HƯỚNG DẪN DÀNH CHO AI Ở PHIÊN TIẾP THEO
## Dự án: Project Xeno: Reloaded — Fullstack Online Co-op Edition (React 18 + Node.js + Socket.io)

> **Mục đích tài liệu**: Cung cấp bức tranh toàn cảnh về kiến trúc hệ thống, các tính năng cốt lõi đã hoàn thành, quy tắc bất biến khi lập trình, và hướng dẫn vận hành / triển khai Cloud bản chơi Online Co-op 2 người chơi qua Internet.

---

## 📍 1. VỊ TRÍ MÃ NGUỒN & CÁC THƯ MỤC QUAN TRỌNG

| Thư mục / Tệp tin | Vai trò |
| :--- | :--- |
| `alien-shooter-fullstack/` | **Thư mục dự án chính** đang phát triển (Fullstack Client-Server). |
| `alien-shooter-fullstack/backend/` | **Node.js Express + Socket.io 4.7.5 Server** (Dedicated 30Hz Relay & Room Matchmaking & `switch_map`). |
| `alien-shooter-fullstack/frontend/` | **React 18 + Vite + Tailwind CSS + HTML5 Canvas Engine** (60-200 FPS). |
| `alien-shooter-vercel/` | **Mã nguồn bản gốc (Tham khảo)** chứa file `index.html` nguyên khối 25.000 dòng. Tra cứu khi cần tham khảo đồ họa, vũ khí, trùm. |
| `start_backend.bat` & `start_frontend.bat` | Script 1-click khởi chạy Server (Port 4000) và Client (Port 5173). Nằm ở cả thư mục gốc và `alien-shooter-fullstack/`. |

---

## 🛠️ 2. MÔI TRƯỜNG & LỆNH ĐIỀU HÀNH (WINDOWS POWERSHELL)

1. **Đường dẫn Node.js trên máy tính người dùng**:
   - Node.js được cài tại: `C:\Program Files\nodejs`.
   - Khi chạy lệnh trong PowerShell, **bắt buộc gán thêm PATH**:
     ```powershell
     $env:PATH = "C:\Program Files\nodejs;$env:PATH"
     ```
2. **Lệnh build kiểm tra lỗi Frontend**:
     ```powershell
     $env:PATH = "C:\Program Files\nodejs;$env:PATH"; & "C:\Program Files\nodejs\npm.cmd" --prefix "alien-shooter-fullstack\frontend" run build
     ```
3. **Lệnh khởi chạy Backend**:
     ```powershell
     $env:PATH = "C:\Program Files\nodejs;$env:PATH"; & "C:\Program Files\nodejs\node.exe" alien-shooter-fullstack\backend\server.js
     ```
4. **Lệnh khởi chạy Frontend**:
     ```powershell
     $env:PATH = "C:\Program Files\nodejs;$env:PATH"; & "C:\Program Files\nodejs\npm.cmd" --prefix "alien-shooter-fullstack\frontend" run dev -- --host
     ```

---

## 🧠 3. BẢN ĐỒ KIẾN TRÚC CLIENT - SERVER & CO-OP FLOW

```
[ HOST (Player 1) ] ──(sync_tick 30Hz)──> [ NODE.JS SERVER ] ──(remote_tick)──> [ CLIENT (Player 2) ]
  - Điều khiển Wave & Spawner               (server.js - Port 4000)               - Cập nhật quái theo Host (_syncEnemiesFromHost)
  - Quản lý HP Quái & Boss                                                        - Gửi hàng đợi sát thương (enemyHits, bossHits)
  - Quản lý sinh Item, Thùng nổ, Hòm gỗ                                           - Gửi đòn nổ thùng & hòm gỗ (barrelExplodes, crateHits)
  - Đóng gói items, explodedBarrels,                                              - Gửi item đã nhặt (pickedItems)
    brokenCrates vào packet                                                       - Nhận & đồng bộ hóa items, thùng nổ, hòm gỗ
```

### Chi tiết các file cốt lõi trong `frontend/src/game/`:
- **[`engine.js`](file:///c:/Users/Administrator/Downloads/Alien_Shooter_Final_modfull%20asset_online%20mode%20test/alien-shooter-fullstack/frontend/src/game/engine.js)**:
  + Vòng lặp vật lý chuẩn 60Hz: Sử dụng thuật toán `loopAccumulator` và `FIXED_PHYSICS_STEP = 1000 / 60` (16.666ms) để **triệt tiêu lỗi game chạy bị tua nhanh trên màn hình 120Hz/144Hz/240Hz**.
  + Decal vĩnh viễn: `this.surfaceCanvas` (`WORLD_W x WORLD_H`) lưu giữ vết máu (`bakeBloodSplatter`), hố cháy nổ (`bakeScorchCrater`) và xác quái vỡ giáp (`bakeAlienCorpse`).
  + Hệ thống ánh sáng chiến thuật: `this.lightCanvas` chạy ở tỷ lệ 0.5, phủ mặt nạ bóng tối `rgba(4, 8, 18, 0.84)`, khoét nón đèn pin 580px (`destination-out`) theo nòng súng của cả P1 và P2, hào quang máy phát điện, bể sinh học hạt nhân và tia laser.
  + **Đồng bộ hóa Co-op toàn diện**:
    * Host đóng gói `enemies`, `bosses`, `wave`, `items`, `explodedBarrels`, `brokenCrates`.
    * Client nhận và hiển thị đồng bộ mượt mà; Client gửi `enemyHits`, `bossHits`, `barrelExplodes`, `crateHits`, `pickedItems`.
  + **HUD Radar Pointer & Downed Revive Distress Signal** (`renderTeammatePointer`):
    * Khi đồng đội ra ngoài tầm màn hình: hiển thị mũi tên Radar công nghệ cao kèm khoảng cách `ĐỒNG ĐỘI: xxx px` ở mép màn hình.
    * Khi đồng đội bị gục ngã (`isDown === true`): Mũi tên chuyển sang chế độ báo động đỏ thẫm nhấp nháy, sóng âm Sonar tỏa rộng, biểu tượng chữ thập y tế `➕` và cảnh báo `⚠️ CỨU ĐỒNG ĐỘI: xxx px`.
  + **Hệ thống chuyển Map liên tục (Campaign Persistence)**:
    * `getPersistentState()` & `restorePersistentState()`: Bảo tồn nguyên vẹn Quỹ tiền (`credits`), HP/Armor tối đa, tốc độ di chuyển, Drone chiến đấu, Kính nhìn đêm NVG, cùng kho vũ khí đã mở khóa và cấp độ nâng cấp sát thương / tốc bắn khi tiến từ Map 1 lên Map 10.
- **[`world.js`](file:///c:/Users/Administrator/Downloads/Alien_Shooter_Final_modfull%20asset_online%20mode%20test/alien-shooter-fullstack/frontend/src/game/world.js)**:
  + Hỗ trợ đầy đủ **10 Bản Đồ** (`MAP_CONFIGS` từ Map 1 đến Map 10) với màu sàn, ánh sáng chủ đạo, tên phân khu đặc thù và tên Lõi Năng Lượng / Máy phát điện tương ứng từng màn.
  + Quản lý thùng nhiên liệu TNT/Bio-Acid và thùng gỗ Supply Crates có định danh `id` để đồng bộ mạng.
  + Cửa trượt tự động (Auto-Doors) và cơ chế chống kẹt tường góc hẹp (`resolveSliding`).
- **[`items.js`](file:///c:/Users/Administrator/Downloads/Alien_Shooter_Final_modfull%20asset_online%20mode%20test/alien-shooter-fullstack/frontend/src/game/items.js)**:
  + Mảng cố định `MAX_ITEMS = 70` có `id` định danh.
  + Hỗ trợ `syncFromHost()` và `collectActiveItems()`.
  + Quy tắc bất biến: **Ví tiền riêng biệt** (Người nào nhặt người đó nhận tiền vào ví `player.credits`).
- **[`bosses.js`](file:///c:/Users/Administrator/Downloads/Alien_Shooter_Final_modfull%20asset_online%20mode%20test/alien-shooter-fullstack/frontend/src/game/bosses.js)**:
  + Đầy đủ 10 Binh đoàn Trùm tối thượng (Map 1 -> Map 10), Telegraphs bát giác cảnh báo chiêu thức và giáp Cuồng Nộ Enraged Shield.

---

## ⚠️ 4. QUY TẮC BẤT BIẾN KHI CHỈNH SỬA & CODE MỚI

1. **Bảo tồn tính đồng bộ giữa Host và Client**:
   - Host là bên duy nhất nắm quyền kiểm soát Spawner (`spawnEnemy`, `currentWave`) và AI quái.
   - Client hiển thị quái và item theo dữ liệu gửi từ Host.
   - Khi Client gây sát thương hoặc nhặt item, tiếp tục đẩy vào các mảng pending để Host xử lý trừ máu/loại bỏ item gốc.
2. **Giữ vững thuật toán Fixed 60Hz Physics Step**:
   - Mọi logic vật lý bắt buộc phải nằm bên trong `update(dt)` được điều phối bởi `this.loopAccumulator`.
3. **Hiệu năng Canvas 2D Decal & Lighting**:
   - Vết máu, hố cháy nổ và xác quái vẽ trực tiếp vào `this.surfaceCtx` (kỹ thuật bake decal).
   - `this.lightCanvas` duy trì tỷ lệ `LIGHT_SCALE = 0.5`.
4. **Luật Co-op**:
   - Người chơi gục ngã (Downed) được đồng đội cứu bằng cách đứng trong phạm vi 75px giữ 5 giây. Không giới hạn số lần cứu.
   - Chỉ khi cả 2 người chơi cùng gục ngã thì mới Game Over.

---

## ✅ 5. CÁC TÍNH NĂNG ĐÃ HOÀN THIỆN XUẤT SẮC

### ✔️ Hạng mục 1: Đồng bộ hóa Vật phẩm & Thùng nổ qua Mạng Co-op (100% DONE)
- Thùng nhiên liệu TNT, Thùng Bio-Acid và Thùng gỗ Supply Crates được cấp `id`.
- Khi bất kỳ người chơi nào bắn nổ hoặc phá hủy, gói tin `explodedBarrels` / `brokenCrates` được chuyển tiếp đồng bộ giữa Host và Client, cùng tạo hố cháy xém `bakeScorchCrater` và hiệu ứng vỡ gỗ.
- Vật phẩm rơi trên sàn (`itemManager`) được Host quản lý và gửi danh sách `packet.items` định kỳ 30Hz; khi một người chơi nhặt, gói tin `pickedItems` báo về Host để xóa item trên cả 2 máy, áp dụng hiệu ứng và tiền chuẩn xác.

### ✔️ Hạng mục 2: Mở rộng Chiến dịch Co-op (Chuyển tiếp từ Map 1 lên Map 10) (100% DONE)
- Backend `server.js` hỗ trợ sự kiện `switch_map` và broadcast `map_switched` cho cả phòng.
- `GameCanvas.jsx` lắng nghe `map_switched` và tự động nạp Map tiếp theo.
- Toàn bộ quỹ tiền (`credits`), cấp độ nâng cấp vũ khí, súng đã mua, Drone, Max HP, Max Armor đều được lưu giữ nguyên vẹn qua hàm `getPersistentState()` và nạp lại qua `restorePersistentState()`.
- `VictoryModal.jsx` tự động phân biệt quyền: Host điều khiển đếm ngược / nút chuyển tiếp; Client hiển thị trạng thái chờ Host chuyển Map.

### ✔️ Hạng mục 3: La Bàn Chỉ Hướng Đồng Đội & Cảnh Báo Gục Ngã (HUD Co-op Direction Pointer) (100% DONE)
- Hàm `renderTeammatePointer` vẽ trực tiếp trên Screen Space sau lớp Lighting.
- Khi Teammate ra ngoài màn hình: Mũi tên Cyan/Teal chỉ hướng kèm cự ly `ĐỒNG ĐỘI: xxx px`.
- Khi Teammate bị gục ngã: Mũi tên đỏ thẫm nhấp nháy, sóng âm Sonar tỏa rộng kèm biểu tượng `➕` và thông điệp khẩn cấp `⚠️ CỨU ĐỒNG ĐỘI: xxx px`.

### 🌐 Hạng mục 4: Triển khai Chơi Online qua Internet (Cloud Deployment Guide)
- Xem chi tiết tại [HUONG_DAN_DEPLOY_CLOUD.md](file:///c:/Users/Administrator/Downloads/Alien_Shooter_Final_modfull%20asset_online%20mode%20test/alien-shooter-fullstack/HUONG_DAN_DEPLOY_CLOUD.md).
- **Backend**: Đẩy lên Render.com (Web Service Node.js, Singapore region, WebSockets ON).
- **Frontend**: Đẩy lên Vercel.com (Vite preset, thêm biến môi trường `VITE_BACKEND_URL`).

### 🛡️ Hạng mục 5: Hoàn thiện Tính năng Bổ trợ & Tác chiến Chiến thuật (100% DONE)
- **Lướt Phản Lực Jetpack Dash [SPACE]**: Kích hoạt lướt nhanh theo hướng WASD/chuột, bất tử trong 11 frame lướt, vệt bóng ma (afterimage trail), ngọn lửa phản lực phụt dài 34px và đồng bộ hoạt ảnh sang Teammate.
- **Tháp Pháo Tự Động [KeyT] (Auto-Turret Deployment)**: Triển khai tối đa 4 pháo, vòng tròn Hologram xoay quanh chân 3 giây, thuật toán tìm mục tiêu tự động trong tầm 520px và xả đạn kép song song 5 phát/giây, đồng bộ mạng Co-op.
- **Radar Minimap 5x5 Sci-Fi**: Widget góc trên bên phải hiển thị bản đồ ma trận thời gian thực: phân khu phòng, cửa tự động (xanh/đỏ), máy phát điện, bình hóa chất, quái vật (chấm đỏ), trùm (kim cương đỏ nhấp nháy), đồng đội và nón tầm nhìn của người chơi.
- **Bảng Chọn 10 Bản Đồ Chiến Trường (Lobby Map Drawer)**: Xem trước hình ảnh thực tế từng map (`map_01.png` - `map_10.png`), tên phân khu, thông số trùm và số lượng đợt quái; cho phép chọn màn trực tiếp trước khi xuất trận Solo hoặc Co-op.
- **Đo Ping & Cảnh Báo Đồng Đội (TopHUD)**: Tự động đo thời gian khứ hồi (Round-trip time) với máy chủ và hiển thị cảnh báo đỏ khi đồng đội ngã.

### 🎨 Hạng mục 6: Khôi phục Sảnh Chờ Chuẩn Delta Force & Nâng Cấp Đồ Họa HD In-Game (100% DONE)
- **Sảnh Chờ Chỉ Huy Mecha (Lobby.jsx + index.css)**:
  + Nền Hero Wallpaper không gian (`Project Xeno_ Reloaded Spaceport-3.png` / `spaceport.png` / `lobby_bg.png`).
  + Màn hình Hologram 3D Perspective (Chỉ số mối đe dọa Threat Index, Quét sinh học Xenomorph Bio-Scan, Telemetry quỹ đạo).
  + Khung Avatar Mecha vát góc 45° (`.mecha-avatar-frame`), huy hiệu cấp bậc LV.8, tên chỉ huy và ngân quỹ $120.
  + Thanh điều hướng chuẩn Sci-Fi trên cùng (BẢN ĐỒ, KHO SÚNG, CẨM NANG, CÀI ĐẶT).
  + Banner Season Pass bên phải kèm 10 chấm tròn chuyển map tức thì (`lobbyDot1` -> `lobbyDot10`).
  + Các công tắc tùy biến chiến thuật: Trạng thái máy phát điện, Màu máu (Đỏ/Xanh lá), Âm thanh (Bật/Tắt).
  + 10 Tab bản đồ nằm ngang phía dưới (`MAP 1: ALPHA` -> `MAP 10: GENESIS`) với thanh đèn Neon kích hoạt.
  + Nút tác chiến Online Co-Op (Team 2) 30Hz và nút khổng lồ Neon Xanh `VÀO TRẬN` (`.tactical-start-btn`).
  + Tích hợp đầy đủ các Modal xem trước: Kho súng (7 loại súng HD), Cẩm nang vật thể và Cài đặt hệ thống.
- **Nâng Cấp Đồ Họa In-Game (world.js + engine.js)**:
  + **Sàn kim loại đặc thù từng Map (`drawMapSpecificFloorPattern`)**: Map 1 có sàn thép đinh tán rãnh kim cương + vạch cảnh báo an toàn vàng-đen; Map 2 có boong titan lục giác vi mạch cyan; Map 3 có tinh thể tuyết và vết nứt địa nhiệt; Map 4 có đá hắc diện thạch nứt dung nham nóng đỏ; Map 5 có màng sinh khối tổ quỷ.
  + **Vật thể tương tác HD**: Kén ngủ đông (`ken_ngudong.png`, `ken_ngudong2.png`), Bể hạt nhân xanh lá bubbling, Siêu máy tính với đèn LED nhấp nháy, Bàn console radar sweep.
  + **Sửa tỷ lệ & Căn chỉnh tâm Tháp Pháo (`phao_tu_dong.png`)**: Sử dụng chuẩn `baseDiameter = 750`, tâm xoay `pivotX = 457, pivotY = 458` để tháp pháo hiển thị kích thước chuẩn xác, không bị méo hay lệch tâm.
  + **Hiệu ứng Chiến đấu (Combat VFX)**: Ngọn lửa sàn bập bùng nhiều lớp (`firePatches`), sóng xung kích nổ (`shockwaveRings`), và lớp phủ Vignette Sci-Fi điện ảnh.

---

## 📋 6. CHECKLIST KIỂM TRA NHANH KHI BÀN GIAO

1. Node.js LTS v24.22.1 đã được thiết lập sẵn sàng tại `%LOCALAPPDATA%\Programs\nodejs` và ghi vào biến môi trường người dùng (User PATH).
2. Chạy `npm.cmd --prefix "alien-shooter-fullstack\frontend" run build` -> **0 lỗi biên dịch** (79 modules).
3. Backend Server `server.js` lắng nghe Port 4000 với đầy đủ Socket.io 30Hz Relay, `create_room`, `join_room`, `switch_map`, `ping_check`.
4. Cả 2 file `start_backend.bat` và `start_frontend.bat` đều tự động nhận diện Node.js ở cả `%LOCALAPPDATA%` và `Program Files`.
