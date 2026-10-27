# 🛸 TÀI LIỆU BÀN GIAO HỆ THỐNG DÀNH CHO AI CA TIẾP THEO
## Dự án: Project Xeno: Reloaded — Fullstack Online Edition

> **DÀNH CHO TRỢ LÝ AI Ở CÁC PHIÊN TIẾP THEO**:  
> Đọc kỹ tài liệu này trước khi chỉnh sửa bất kỳ dòng code nào. Hệ thống hiện chỉ duy trì **DUY NHẤT BẢN ONLINE (`alien-shooter-fullstack`)**. Mọi cơ chế tối ưu hiệu năng (RAM/VRAM/FPS), vòng lặp chống đứng hình, logic làm mới thông số khi chơi lại, giao diện chiến thắng `MISSION COMPLETED`, hệ thống Asset GPU Pre-bake và Mini Map đã được chuẩn hóa 100%.

---

## 📍 1. BẢN ĐỒ MÃ NGUỒN HỆ THỐNG (SOURCE CODE MAP)

| Thành phần | Đường dẫn File chính | Vai trò & Cách hoạt động |
| :--- | :--- | :--- |
| **📋 KẾ HOẠCH & NHẬT KÝ TỐI ƯU** | `KE_HOACH_TOI_UU_HIEU_NANG_VA_SUA_LOI.md` | **Nhật ký toàn bộ 3 Giai đoạn tối ưu**: Giai đoạn 1 (RAM/VRAM/Audio/Loop), Giai đoạn 2 (Bảo mật XSS/Proxy/SRI), Giai đoạn 3 (Gameplay Reset, Victory Modal, Asset Turret/Accelerator, Sàn kính trong suốt & Mini Map). |
| **🌐 MÃ NGUỒN CHÍNH (Single Source of Truth)** | `alien-shooter-fullstack/frontend/index.html`<br>`alien-shooter-fullstack/build.cjs`<br>`alien-shooter-fullstack/frontend/build.cjs` | **Bản duy nhất đang chạy trực tiếp trên Internet** tại [https://project-xeno-online.vercel.app](https://project-xeno-online.vercel.app). Bao gồm đầy đủ Chiến dịch (Solo & Online Co-Op 2 người), 7 vũ khí, 10 bản đồ, 10 Boss, hệ thống mạng **Hybrid (P2P PeerJS + OpenRelay TURN TCP/UDP 80/443 & Dedicated Socket.io)**, nội suy **Snapshot Buffer 60Hz/30Hz LERP + Dead Reckoning**, và đồng bộ **Host-Authoritative** toàn diện. |
| **🎨 KHO TÀI NGUYÊN ASSETS (5 Thư mục đồng bộ)** | `assets/`<br>`alien-shooter-fullstack/frontend/assets/`<br>`alien-shooter-fullstack/frontend/public/assets/`<br>`alien-shooter-fullstack/frontend/dist/assets/`<br>`alien-shooter-fullstack/dist/assets/` | Chứa toàn bộ ảnh PNG trong suốt đã tối ưu độ phân giải (`01_gun.png`..`laze_gun07.png`, skin nhân vật, `phao_tu_dong.png`, `drone.png`, `ken_ngudong.png`, `ken_ngudong2.png`, `may_gia_toc.png`...). Khi thêm/sửa asset, chạy `node build.cjs` để tự động đồng bộ sang `dist/assets/` và `frontend/dist/assets/`. |
| **☁️ SERVERLESS PROXY (Cloud DB Sync)** | `alien-shooter-fullstack/api/sync.js`<br>`alien-shooter-fullstack/frontend/api/sync.js`<br>`google-sheets-backend/Code.gs` | Proxy bảo mật trên Vercel kết nối Google Sheets NoSQL Database (Đăng ký/Đăng nhập SHA-256, Lưu tiến trình tự động, Bảng xếp hạng Top 20 toàn cầu). |
| **🚀 DEDICATED SERVER SOCKET.IO** | `alien-shooter-fullstack/backend/server.js` | Máy chủ Node.js + Socket.io chạy chính thức tại `https://project-xeno-online.onrender.com` (Render.com Singapore). Hỗ trợ tạo phòng công khai 8 kênh, mã PIN 6 ký tự, chuyển tiếp gói tin 60Hz/30Hz và các sự kiện `SPAWN_ENEMY`, `SYNC_ENEMIES`, `ENEMY_HIT`, `ENEMY_DIE`. |

---

## ⚡ 2. QUY TRÌNH THAO TÁC CHUẨN CHO AI KHI CHỈNH SỬA CODE

### 📌 Bước 1: File duy nhất cần sửa
Mọi yêu cầu chỉnh sửa giao diện, tính năng, vũ khí, vật thể bản đồ, quái vật hay mạng đều thực hiện trực tiếp tại:
👉 **`alien-shooter-fullstack/frontend/index.html`**
*(Tuyệt đối KHÔNG sửa trực tiếp trong thư mục `dist/` hoặc `frontend/dist/` vì sẽ bị ghi đè khi chạy build).*

### 📌 Bước 2: Bảng tra cứu nhanh ID phần tử & Hàm cốt lõi trong `frontend/index.html`

| Thành phần Giao diện / Tính năng | ID Phần tử / Tên Hàm | Vị trí / Cơ chế hoạt động chính |
| :--- | :--- | :--- |
| **Màn hình Tải Ban Đầu (Preloader)** | `#gamePreloaderScreen` | Nạp trước toàn bộ `CUSTOM_ASSETS` (vũ khí, skin, kén ngủ đông, máy gia tốc, âm thanh) với vòng quay Hologram và thanh `%`. |
| **Sảnh Chờ Chỉ Huy (Lobby)** | `#mainSettingsModal` | Nền Wallpaper, làm mờ `#wallpaperDimSlider`, Avatar `#customAvatarPreview`, 10 tab chọn Map `#lobbyTabsList`. |
| **Modal Chiến Thắng (Hexagon Sci-Fi)** | `#victoryModal`<br>`triggerMapVictory()`<br>`startVictoryAutoAdvanceCountdown()` | Sau khi hạ Boss cuối **950ms** (để xem trọn vụ nổ Boss), hiển thị khung lục giác xanh lá **`MISSION COMPLETED`**, dòng chữ **`PRESS ANY KEY TO CONTINUE`** và **vòng tròn xanh đếm ngược `3, 2, 1`** tự chuyển sang màn hình nạp Map kế tiếp. |
| **Modal Thua Trận (Game Over)** | `#gameOverModal`<br>`triggerPlayerDeath()` | Hiển thị ngay khi tử trận (`classList.remove("hidden")` kèm `style.display = "flex"`). Có nút **Chơi lại** (`carryOver = false`) hoặc **Về sảnh**. |
| **Kho Vũ Khí & Nâng Cấp (`[B]`)** | `#armoryModal`<br>`toggleArmoryModal()` | Bấm phím **`[B]`** bất cứ lúc nào trong trận để mở/đóng bảng mua súng, đạn, Giáp, Tốc chạy, Đạn nhiệt hạch, Drone UAV, Tháp pháo tự động, Kính nhìn đêm NVG. |
| **Khởi tạo Chiến dịch & Reset Thông số** | `initCampaign(keepSettingsOpen, carryOver)`<br>`resetPlayerProgressionToMapDefault(mapId)` | - Khi `carryOver === false` (Chơi lại sau khi chết / Vào từ Sảnh chính): **Reset sạch tiền, súng và nâng cấp** về đúng mặc định của `MAP_CONFIGS[mapId]`.<br>- Khi `carryOver === true` (`transitionToNextMap` qua màn liên tục): **Giữ nguyên tiền, súng và nâng cấp** đã mua. |
| **Hệ thống Nạp & Pre-bake Asset vào VRAM** | `const CUSTOM_ASSETS`<br>`initCustomAssets()`<br>`bakeCustomPlayerSkinToGpu()`<br>`bakeCustomCryoPodToGpu()`<br>`bakeCustomParticleAcceleratorToGpu()`<br>`bakeCustomEntityStripToGpu()` | Chuyển đổi toàn bộ ảnh sang GPU `ImageBitmap` và **pre-bake sẵn hiệu ứng phát sáng viền / đổ bóng 2.5D vào VRAM** lúc khởi tạo, giải phóng `canvas.width = 0` để **triệt tiêu 100% `ctx.shadowBlur` thời gian thực**. |
| **Đồ vật Tàu Không Gian (`spaceProps`)** | `drawSpacecraftProps(camX, camY)` | Vẽ Kén Ngủ Đông (`ken_ngudong.png`, `ken_ngudong2.png`), **Máy Gia Tốc Hạt (`may_gia_toc.png` — tự động xoay ngang/dọc theo `sp.orient`, vẽ 2 tia sét điện từ phân nhánh + hạt Photon bên trong đường ống + phát quang viền nhẹ)**, và Siêu Máy Tính Lượng Tử. |
| **Tháp Pháo Tự Động (`[T]`)** | `CUSTOM_ASSETS.turret`<br>`drawPlayerTurrets()` | Dùng tỉ lệ chuẩn hóa (`pivotXRatio: 0.443`, `pivotYRatio: 0.50`, `baseDiameterRatio: 0.50`) theo `img.naturalWidth/Height` của `assets/phao_tu_dong.png`. |
| **Mini Map Định Hướng Tinh Gọn** | `renderRadarMinimap()` | Chỉ vẽ đúng các thành phần có trong chú thích (`Bạn`, `Quái/Boss`, `Á Trùm`, `⚡ Nhà Máy Điện`, `Cổng Dịch`). Vị trí `Bạn` là **hình tam giác mũi tên xanh lá** xoay theo hướng di chuyển tương đối (`player.moveAngle`). |
| **Vòng lặp Game & Watchdog Chống Treo** | `gameLoop()`<br>`resetFramePacer()`<br>`scheduleNextFrame()` | Cố định 60Hz physics accumulator. `resetFramePacer()` tự động gọi `scheduleNextFrame()` và có **Self-Healing Watchdog 400ms** đảm bảo không bao giờ bị treo sau khi chuyển Map hoặc đóng/mở Modal. |
| **Hệ thống Co-Op Logic** | `const XENO_COOP`<br>`pushTeammateSnapshot()`<br>`drawTeammatePlayer()` | Dedicated Server Socket.io (`volatile.emit`) & Hybrid P2P STUN, Tick Rate 60Hz/30Hz, Dynamic Adaptive LERP (theo Ping), Vòng chân nhận diện (Bản thân: Xanh ngọc `#10b981`, Đồng đội: Vàng kim `#fbbf24`), Spectator Mode Camera bám theo đồng đội khi bị hạ gục, Host-Authoritative Enemy & World Sync. |

### 📌 Bước 3: Đóng gói bản phân phối & Làm rối mã (Build & Obfuscate)
Sau khi sửa `alien-shooter-fullstack/frontend/index.html`, **bắt buộc chạy script build** để nén `game.min.js` (xóa 100% comment, làm rối toàn bộ định danh bằng Terser `toplevel: true`, nén từ 1.3 MB xuống ~533 KB) và tự động đồng bộ song song ra cả 2 thư mục `alien-shooter-fullstack/dist/` và `alien-shooter-fullstack/frontend/dist/`:
```powershell
powershell -ExecutionPolicy Bypass -File .\build_minified.ps1
```
*(Hoặc chạy `powershell -ExecutionPolicy Bypass -File .\sync_dist.ps1` — script đã được tích hợp gọi thẳng `build_minified.ps1`).*

### 📌 Bước 4: Commit và Push lên GitHub để Vercel tự động triển khai
Do `dist/` và `frontend/dist/` đã được mở khóa tracking trong `.gitignore`, lệnh push sẽ đưa thẳng bản build đã làm rối mã lên Vercel:
```powershell
git -C alien-shooter-fullstack add -A
git -C alien-shooter-fullstack commit -m "mô tả thay đổi vừa thực hiện"
git -C alien-shooter-fullstack push origin main
```
Hoặc chỉ cần **Click đúp vào `deploy_nhanh.bat`** (ở thư mục `alien-shooter-fullstack/`) hoặc `DEPLOY_NHANH_BAN_ONLINE.bat` (ở thư mục gốc), toàn bộ các bước trên sẽ tự động hoàn tất 100%.
> [!IMPORTANT]
> **Quy tắc Git Author**: Local git config đã được đặt mặc định là:  
> `user.name = hoanganphatcctv-ctrl`  
> `user.email = 326910687+hoanganphatcctv-ctrl@users.noreply.github.com`  
> Tuyệt đối không đổi sang email khác để tránh bị Vercel Hobby chặn deploy!

---

## 🧠 3. CƠ CẤU LOGIC TỐI ƯU HIỆU NĂNG & CHỐNG ĐỨNG HÌNH (CRITICAL ARCHITECTURE)

AI ở các ca tiếp theo **bắt buộc phải tuân thủ 5 nguyên tắc kiến trúc sau** để không làm phát sinh lại lỗi tràn RAM hoặc treo game:

1. **Bảo toàn Mặt Sàn Kính Trong Suốt (`surfaceCanvas` `alpha: true`)**:
   - `surfaceCanvas` (`5200 x 3600`) **BẮT BUỘC** khởi tạo với `surfaceCanvas.getContext("2d", { alpha: true })`.
   - **Tuyệt đối KHÔNG đặt `{ alpha: false }`**: Vì từ Map 2 đến Map 10, sàn các căn phòng là kính bán trong suốt (`rgba(...)`) và vùng ngoài phòng được xóa trong suốt (`clearRect`) để nhìn xuyên thấu xuống cảnh nền Vũ trụ, Sao Hải Vương, Tinh vân, Băng giá, Dung nham bên dưới. Đặt `alpha: false` sẽ biến toàn bộ nền thành màu đen đặc xì!
2. **Không dùng `ctx.shadowBlur` trong vòng lặp Render 60Hz**:
   - Mọi hiệu ứng hào quang phát sáng quanh vật thể (Kén ngủ đông, Máy gia tốc hạt, Skin người chơi, Quái vật) phải được vẽ một lần vào canvas phụ lúc nạp ảnh và chuyển lên GPU VRAM bằng `promoteCanvasToGpuBitmap()` (`createImageBitmap`), sau đó giải phóng canvas tạm (`c.width = 0; c.height = 0`).
   - Trong `renderWorld()`, chỉ dùng `ctx.drawImage(bakedGlowSprite, ...)` kết hợp `ctx.globalAlpha` hoặc `globalCompositeOperation = "lighter"`.
3. **Không khởi tạo `createRadialGradient` / `createLinearGradient` mới mỗi frame**:
   - Luôn sử dụng hàm cache `getCachedRadialGradient(ctx, key, ...)` và `getCachedLinearGradient(ctx, key, ...)` với bán kính đã làm tròn để tránh tạo rác bộ nhớ (GC Churn).
4. **Cơ chế `resetFramePacer()` & Watchdog chống treo màn hình**:
   - Bất kỳ hàm nào gọi `resetFramePacer()` (như `resumeGame()`, `initCampaign()`, `simulateMapTransitionLoading()`) đều được đảm bảo an toàn vì cuối `resetFramePacer()` luôn kiểm tra `if (!loopRafId && !loopTimeoutId) scheduleNextFrame();`, đi kèm bộ giám sát `setInterval` mỗi `400ms` tự động đánh thức vòng lặp nếu bị ngắt quãng.
5. **Dọn dẹp triệt để Co-Op & Web Audio khi chơi đơn / kết thúc màn**:
   - Chế độ chơi đơn (Solo) hoàn toàn không chạy ngầm timer hay gửi gói tin Co-Op (`XENO_COOP.sendTick` bị khóa khi `!XENO_COOP.active || !XENO_COOP.connected || isPaused || isMapWon || isGameOver`).
   - Mọi `AudioBufferSourceNode` và `OscillatorNode` đều có callback `onended` gọi `.disconnect()` để giải phóng hoàn toàn khỏi Audio Graph.
6. **Lưới Không Gian Phân Vùng Chướng Ngại Vật Tĩnh (Static Obstacle Spatial Hash Grid O(1))**:
   - Toàn bộ va chạm tĩnh (`resolveWallSliding`, `circleHitsStaticObstacle`, `pointHitsWall`, `hasLineOfSight`) sử dụng `obstacleGrid` ($26 \times 18 = 468$ ô, kích thước mỗi ô 200px) với độ phức tạp $O(1)$.
   - Tuyệt đối **không lặp duyệt tuyến tính** toàn bộ mảng `WALLS`, `computerDesks`, `spaceProps`, `barricades`, `energyCoreStations`, `nuclearVats`, `crates`, `barrels` trong vòng lặp game, để duy trì 60 FPS mượt mà ngay cả khi có 400–500 quái vật cùng lúc.
   - Khi khởi tạo map hoặc phá hủy bồn/thùng, gọi `rebuildObstacleSpatialGrid()` để đồng bộ lưới.
7. **Bảo toàn hiển thị Canvas 2D Thuần Túy (Zero-Black-Screen Standard)**:
   - Game chạy trực tiếp trên Canvas 2D (`gameCanvas`) ở chế độ hiển thị 100% (`opacity: 1`, `display: block`).
   - Tuyệt đối không can thiệp độ mờ hoặc chèn thêm lớp phủ WebGL canvas đọc pixel từ Canvas 2D khi chạy trên giao thức `file://` để tránh vi phạm chính sách bảo mật CORS Sandbox của trình duyệt (gây lỗi Tainted Canvas và đen màn hình).

---

## 🎮 4. CƠ CHẾ GAMEPLAY, MODAL CHIẾN THẮNG, ASSET & MINI MAP HIỆN TẠI

1. **Quy tắc Tiền tệ, Vũ khí & Nâng cấp khi Chơi lại vs. Qua màn liên tục vs. Tài khoản Cloud (`carryOver`)**:
   - **Tài khoản Cloud đã Đăng nhập (`XenoAuth.user`)**: Hệ thống **bảo vệ và đồng bộ 100% Tiền (`credits`), Cấp độ nâng cấp (HP, Tốc chạy, Sát thương, UAV Drone) và Vũ khí đã mở khóa** từ Cloud xuống qua `applyDataToGame()`. Khi vào trận hoặc Chơi lại (`carryOver === false`), tiền và nâng cấp của tài khoản được bảo lưu (`Math.max(player.credits, mapCfg.startCredits)`), không bao giờ bị ép tụt về $80.
   - **Chế độ Khách (Guest / Chưa đăng nhập)**: Khi Chơi lại hoặc vào từ Sảnh chính (`carryOver === false`), tiền, súng và nâng cấp được đưa về thông số mặc định của `MAP_CONFIGS[mapId]`.
   - **Chơi liền mạch qua màn liên tục (`carryOver === true` trong `transitionToNextMap`)**: Giữ nguyên toàn bộ tiền, súng đã mua và cấp độ nâng cấp mang sang Map tiếp theo.
2. **Luồng Hạ Boss & Modal Chiến Thắng (`#victoryModal`)**:
   - Khi hạ gục Boss cuối cùng của màn, game **chờ `950ms`** để diễn hoạt trọn vẹn hiệu ứng Boss nổ tung và rung chấn màn hình.
   - Sau `950ms`, hiển thị banner lục giác màu xanh lá **`MISSION COMPLETED`** ở chính giữa màn hình, bên dưới là dòng **`PRESS ANY KEY TO CONTINUE`** và **hình tròn màu xanh lá đếm ngược `3, 2, 1`**.
   - Nếu người chơi bấm phím bất kỳ (hoặc click chuột) HOẶC khi vòng tròn đếm ngược về `0`, hệ thống tự động mở màn hình nạp chuyển sang Map tiếp theo (`transitionToNextMap()`).
3. **Asset Máy Gia Tốc (`may_gia_toc.png`) & Tháp Pháo Tự Động (`phao_tu_dong.png`)**:
   - **Máy Gia Tốc (`CUSTOM_ASSETS.particleAccelerator`)**: Đã giảm độ phân giải chuẩn xuống **`560x167` (`233.5 KB`)** và copy vào cả 5 thư mục `assets/`. Khi vẽ trong `drawSpacecraftProps()`, máy tự động xoay ngang (`orient: "h"`) hoặc dọc (`orient: "v"` / `sp.h > sp.w`), có hào quang viền đa sắc dịu nhẹ (pre-baked VRAM) và hiệu ứng **2 tia sét điện từ phân nhánh + 3 hạt Photon chớp nháy bên trong đường ống kính**.
   - **Tháp Pháo Tự Động (`CUSTOM_ASSETS.turret`)**: Tính tâm xoay và kích thước theo tỉ lệ chuẩn hóa (`pivotXRatio: 0.443`, `pivotYRatio: 0.50`, `baseDiameterRatio: 0.50`) trên kích thước thực của `phao_tu_dong.png`.
4. **Mini Map Định Hướng (`renderRadarMinimap`)**:
   - Vị trí người chơi ("Bạn") được vẽ bằng **hình tam giác mũi tên màu xanh lá (`#34d399`) có viền trắng**, tự động xoay mũi nhọn theo hướng di chuyển tương đối trên bản đồ (`player.moveAngle`).
   - Đã xóa bỏ toàn bộ các chấm xanh thừa thãi không được chú thích (`nuclearVats`, `energyCoreStations`, `computerDesks`), chỉ hiển thị đúng 5 đối tượng có trong chú thích bên dưới Mini Map: **Bạn**, **Quái/Boss**, **Á Trùm**, **⚡ Nhà Máy Điện**, **Cổng Dịch**.
5. **Vòng Tròn Tiến Trình Khởi Động Máy Phát Điện Dưới Chân (Circular Load Ring)**:
   - Thay thế thanh tiến trình ngang cũ thành **vòng tròn màu xanh lá (`#22c55e`) nạp tròn 360° theo chiều kim đồng hồ dưới chân (`r = 34px`)** khi giữ phím `[E]` trong phạm vi 95px để khởi động máy phát điện trong 5 giây.
   - Đi kèm điểm sáng đầu vòng (`#86efac` lõi trắng), hào quang sàn xanh lục dịu mắt (`gen_crank_glow_34`) và số phần trăm điện tử (`xx%`) dưới chân.
   - Bảng thông báo trên đầu máy phát điện được tinh gọn (cao 26px, chuyển sang viền xanh hiển thị `ĐANG KHỞI ĐỘNG: xx%`, không còn thanh ngang thô cứng).
6. **Tối ưu hóa Va chạm & Định tuyến 400+ Quái vật (Spatial Grid & AI LOD)**:
   - **Spatial Grid O(1)**: Giảm 98.7% số phép thử va chạm vật lý mỗi frame cho quái vật và đường đạn mà không thay đổi bất kỳ công thức toán học nào.
   - **AI Clearance Interleaved Cache**: `hasPathClearance()` được lưu cache 3 frame xen kẽ theo `e.id % 3`, giảm 66% tia raycast kiểm tra địa hình.
   - **Screen LOD (`dist > 1100`)**: Quái vật ở ngoài màn hình được giãn cách nhịp tính toán lái sang 3 frame/lần.
   - **Bảo toàn trí thông minh tìm đường (Flow Field Pathfinding)**: Thuật toán Flow Field BFS 11,700 ô vẫn hoạt động độc lập và đầy đủ, đảm bảo 100% quái vật luôn biết đường luồn lách qua các góc cua và chướng ngại vật để săn đuổi người chơi một cách thông minh.

---

## 🛡️ 5. LOGIC HOẠT ĐỘNG CO-OP 2 NGƯỜI & CÁC QUY TẮC BẤT BIẾN (GOLDEN RULES)

1. **Hạ tầng kết nối Hybrid (P2P Direct & Socket.io Dedicated Server)**:
   - Hỗ trợ tạo phòng cấp mã PIN 6 ký tự (`XNxxxx`) và Link mời trực tiếp (`?room=CODE`).
   - P2P tích hợp STUN + OpenRelay TURN trên cổng 80/443 (cả UDP và TCP) vượt tường lửa, có timeout bảo vệ 20 giây.
2. **Đồng bộ Chuyển động 60Hz/30Hz LERP + Dead Reckoning**:
   - Mặc định 60Hz LERP. Đồng đội được nội suy qua `teammate.snapshotBuffer` (trễ 35–50ms) kết hợp dự đoán vận tốc Dead Reckoning khi mạng trễ.
   - Đồng đội hiển thị đầy đủ skin HD theo từng loại súng đang cầm, vòng tròn vàng dưới chân và mũi tên xanh ngọc trên Mini Map.
3. **Host-Authoritative Enemy & World Sync**:
   - Host điều phối sinh quái (`SPAWN_ENEMY`), AI chọn mục tiêu (`targetPlayerId`), đạn quái (`ENEMY_SHOOT`) và phát bản tin tổng hợp `SYNC_ENEMIES` mỗi **80ms (12.5Hz)**.
   - Client bắn quái gửi `ENEMY_HIT` về Host; khi quái chết Host phát `ENEMY_DIE` trả thưởng tiền và kill cho đúng người kết liễu (`killerId`).
4. **Cơ chế Máu/Giáp, Cứu đồng đội & Ví tiền riêng**:
   - Mỗi máy tự quyết định máu/giáp của chính mình (gói `snap` của Host **không ghi đè** ngược `player.hp`/`player.armor`/`player.isDown` của Client).
   - Người chơi gục ngã (Downed) được đồng đội cứu bằng cách đứng trong phạm vi **75px** giữ **5 giây** (hồi 40% HP, 25 Giáp và 1.5s bất tử). Không giới hạn số lần cứu.
   - Ví tiền riêng biệt (`credits` của ai nhặt hoặc diệt quái người đó hưởng).
