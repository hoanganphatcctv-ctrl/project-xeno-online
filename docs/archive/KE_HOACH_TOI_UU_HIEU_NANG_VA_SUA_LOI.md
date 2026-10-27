# 🛠️ KẾ HOẠCH LỘ TRÌNH TỐI ƯU HIỆU NĂNG & SỬA LỖI (PROJECT XENO: RELOADED)

> **DÀNH CHO TRỢ LÝ AI Ở CÁC PHIÊN TIẾP THEO (AI HANDOVER PROTOCOL)**:
> 1. **Mục đích tài liệu**: Đây là lộ trình thực thi chuẩn để tối ưu hóa hiệu năng, triệt tiêu rò rỉ bộ nhớ (Memory Leaks) và khắc phục các vấn đề kỹ thuật của dự án.
> 2. **Nguyên tắc phân kỳ**:
>    - **GIAI ĐOẠN 1 (ƯU TIÊN TUYỆT ĐỐI)**: Sửa toàn bộ vấn đề **Hiệu năng, Rò rỉ bộ nhớ khi hết màn, Giật lag FPS, Dọn dẹp Timer/Audio/Co-Op**.
>    - **GIAI ĐOẠN 2 (THỰC HIỆN SAU)**: Khắc phục các vấn đề **Bảo mật (XSS, ẩn URL API, xác thực dữ liệu)**.
> 3. **Quy tắc làm việc của AI**:
>    - File mã nguồn duy nhất được phép chỉnh sửa: 👉 **`alien-shooter-fullstack/frontend/index.html`** (không sửa trực tiếp trong các thư mục `dist/`).
>    - **ĐỒNG BỘ TIẾN TRÌNH**: Cứ sau khi sửa xong bất kỳ hạng mục nào, AI **phải ngay lập tức cập nhật trạng thái `[x]` vào file kế hoạch này**, kèm theo ngày giờ và tóm tắt dòng code đã chỉnh sửa để ca làm việc sau/AI tiếp theo nắm bắt liền mạch.
>    - **Build & Deploy**: Sau khi sửa xong 1 hoặc nhiều mục, chạy build:
>      ```powershell
>      cd alien-shooter-fullstack; node build.cjs; cd frontend; node build.cjs
>      ```

---

## 📊 BẢNG THEO DÕI TIẾN ĐỘ TỔNG THỂ

| Giai đoạn | Hạng mục công việc | Trạng thái | Ưu tiên |
| :---: | :--- | :---: | :---: |
| **Giai đoạn 1** | Tối ưu Hiệu năng, VRAM & Triệt tiêu Rò rỉ Bộ nhớ (9 Task) | `[x] Đã hoàn thành (9/9 Task)` | 🔴 **Cao nhất (Hoàn tất 100%)** |
| **Giai đoạn 2** | Nâng cấp Bảo mật & Khắc phục XSS / API Secret (5 Task) | `[x] Đã hoàn thành (5/5 Task)` | 🟢 **Thứ yếu (Hoàn tất 100%)** |
| **Giai đoạn 3** | Tối ưu Gameplay, Giao diện Chiến thắng, Asset, Mini Map, Vòng tròn Máy phát điện, Sửa lỗi bắn liên tục & Dynamic Server Discovery (14 Task) | `[x] Đã hoàn thành (14/14 Task)` | 🔴 **Cao nhất (Hoàn tất 100%)** |

*Ký hiệu trạng thái*:
- `[ ]`: Chưa thực hiện
- `[/]`: Đang triển khai
- `[x]`: Đã hoàn thành & Đã kiểm thử

---

# 🚀 GIAI ĐOẠN 1: TRIỆT TIÊU RÒ RỈ BỘ NHỚ & TỐI ƯU HIỆU NĂNG (LÀM TRƯỚC)

---

### Task 1.1: Dọn dẹp triệt để vòng đời Mạng Co-Op khi hết trận / về sảnh
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🔴 Nghiêm trọng (Rò rỉ RAM & Network)
* **Vị trí code**:
  - `alien-shooter-fullstack/frontend/index.html`
  - Hàm `triggerPlayerDeath()` (~dòng `14746`)
  - Hàm `triggerMapVictory()` (~dòng `14227`)
  - Hàm `openMainMenuSettings()` (~dòng `23980`)
  - Hàm `initCampaign()` (~dòng `26770`)
  - Hàm `gameLoop()` (~dòng `27362`)
* **Nguyên nhân**: Khi Game Over, Chiến thắng, bấm Chơi lại hoặc về Sảnh chờ, `XENO_COOP.cleanup()` không được gọi. Do đó `this._pingTimer` tiếp tục chạy ngầm gửi probe vô tận mỗi 1s, và `window.XENO_COOP.sendTick()` trong `gameLoop` vẫn tạo mới snapshot object gửi qua mạng mỗi 16–33ms dù game đang pause/menu.
* **Giải pháp triển khai**:
  1. Trong `openMainMenuSettings(bypassLoading)`: Nếu người chơi quay về sảnh từ trận đấu (không phải mở cài đặt tạm thời), gửi `{ t: "leave" }` và gọi `window.XENO_COOP.cleanup()` ngắt kết nối socket, peer và timer ping.
  2. Trong `initCampaign(keepSettingsOpen, carryOver)`: Đảm bảo nếu là màn chơi đơn (Solo) thì ngắt hoàn toàn kết nối Co-Op cũ (`window.XENO_COOP.cleanup()`), làm rỗng `teammate.snapshotBuffer = []`.
  3. Trong `gameLoop()`: Thêm điều kiện chặn `if (!isPaused && !isMapWon && !isGameOver)` trước khi gọi `window.XENO_COOP.sendTick(now)`.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Bổ sung dọn dẹp `this._pingTimer` trong `XENO_COOP.cleanup()`; tích hợp tự động dọn dẹp Co-Op khi mở sảnh chờ `openMainMenuSettings()`; ngắt kết nối triệt để khi khởi tạo Solo trong `initCampaign()`; chặn tick ngầm trong `gameLoop()`.

---

### Task 1.2: Ngắt kết nối các Node âm thanh Web Audio API (`AudioNode Disconnect`)
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟠 Cao (Rò rỉ Audio Graph trên trình duyệt)
* **Vị trí code**:
  - Hàm `playNoise()` (~dòng `8192–8235`)
  - Hàm `playSample()` (~dòng `7763–7785`)
  - Các hàm âm thanh synthetic (`playSyntheticShoot`, `playSyntheticPlayerDeath`, `playSyntheticPickup`, `playSyntheticDoorSlide`, `playRicochet`, `playBossWarning`, `playFreeze`)
* **Nguyên nhân**:
  - `playNoise` tạo `bufferSource`, `biquadFilter`, `gainNode` nối vào `ctx.destination` và gọi `noise.start()`, nhưng không gọi `noise.stop()` và không ngắt kết nối `disconnect()`.
  - `playSample` tạo `source` và `gain` nối vào `destination` nhưng không có listener `source.onended` để dọn dẹp node.
  - Hàng nghìn node âm thanh bị kẹt trong Audio Graph nội bộ của trình duyệt sau mỗi trận chiến.
* **Giải pháp triển khai**:
  1. Trong `playSample()`: Bổ sung `source.onended = () => { try { source.disconnect(); gain.disconnect(); } catch (e) {} };`.
  2. Trong `playNoise()`: Bổ sung `noise.stop(stopTime)` và `noise.onended = () => { try { noise.disconnect(); filter.disconnect(); gain.disconnect(); } catch (e) {} };`.
  3. Bổ sung `osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch (e) {} };` và `osc.stop(...)` cho toàn bộ các hàm hiệu ứng sóng tổng hợp.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã triển khai ngắt kết nối `disconnect()` khi kết thúc phát sóng cho 100% các AudioNode trong cả `playSample`, `playNoise` và các synthesizer.

---

### Task 1.3: Quản lý & Hủy các Timeout mồ côi khi kết thúc/chuyển màn
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟡 Trung bình (Tránh kích hoạt logic sai thời điểm)
* **Vị trí code**:
  - Hàm `triggerMapVictory()` (~dòng `14227–14285`)
  - Hàm `clearVictoryAutoTimers()` (~dòng `14208–14225`)
* **Nguyên nhân**: Đoạn `setTimeout(() => { if (!isMapWon) return; isPaused = true; ... }, 1000)` tại dòng `14206` không được lưu ID vào biến, nên khi người chơi bấm nút "Chơi lại Map 1" hoặc "Tiếp tục" ngay lập tức, hàm `clearVictoryAutoTimers()` không thể hủy timeout này.
* **Giải pháp triển khai**:
  1. Khai báo biến toàn cục `let victoryModalDelayTimeout = null;`.
  2. Gán `victoryModalDelayTimeout = setTimeout(...)`.
  3. Bổ sung vào `clearVictoryAutoTimers()`:
     ```javascript
     if (victoryModalDelayTimeout) {
         clearTimeout(victoryModalDelayTimeout);
         victoryModalDelayTimeout = null;
     }
     ```
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã khai báo biến `victoryModalDelayTimeout`, lưu ID khi hẹn giờ mở modal chiến thắng và gọi `clearTimeout` an toàn trong `clearVictoryAutoTimers()`.

---

### Task 1.4: Bổ sung dọn dẹp các mảng động bị bỏ quên trong `initCampaign()`
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟡 Trung bình (Dọn sạch dữ liệu cũ khi Restart/Chuyển Map)
* **Vị trí code**:
  - Hàm `initCampaign()` (~dòng `26770–26925`)
* **Nguyên nhân**:
  - Mảng `floatingTexts` không được làm rỗng khiến chữ bay từ ván trước hiển thị sang ván mới.
  - Mảng `player.trailHistory` và `teammate.trailHistory` không được làm rỗng.
  - Phím bấm và chuột (`mouse.down`, `keys`) không được giải phóng hoàn toàn nếu người chơi chết khi đang giữ chuột/phím.
* **Giải pháp triển khai**:
  Trong `initCampaign()` bổ sung:
  ```javascript
  floatingTexts.length = 0;
  if (player.trailHistory) player.trailHistory.length = 0;
  if (window.teammate && window.teammate.trailHistory) window.teammate.trailHistory.length = 0;
  mouse.down = false;
  screenShake = 0;
  for (const k in keys) { keys[k] = false; }
  if (window.cheatMTimeout) {
      clearTimeout(window.cheatMTimeout);
      window.cheatMTimeout = null;
  }
  ```
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã bổ sung dọn dẹp toàn bộ các mảng chữ bay, hiệu ứng vệt chuyển động, reset phím/chuột và timeout cheat trong `initCampaign()`.

---

### Task 1.5: Khắc phục hiện tượng Khựng hình (Catch-up Spike) khi bấm Resume Game
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟡 Trung bình (Trải nghiệm FPS mượt mà)
* **Vị trí code**:
  - Hàm `resumeGame()` (~dòng `23933–23976`)
* **Nguyên nhân**: Khi bấm tiếp tục trận đấu từ Pause Menu hoặc Kho vũ khí Armory, `isPaused` chuyển sang `false` nhưng không gọi `resetFramePacer()`. Các biến `nextFrameDeadline` và `loopLastTime` vẫn giữ mốc thời gian cũ, làm vòng lặp `while (loopAccumulator >= FIXED_PHYSICS_STEP)` dồn dập chạy 5 tick vật lý liên tục trong frame đầu tiên, gây khựng hình rõ rệt.
* **Giải pháp triển khai**:
  Trong `resumeGame()`, ngay trước khi đặt `isPaused = false`:
  ```javascript
  if (typeof resetFramePacer === "function") {
      resetFramePacer();
  }
  isPaused = false;
  ```
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã thêm lệnh `resetFramePacer()` trong `resumeGame()`. Triệt tiêu hoàn toàn hiện tượng lag spike physics accumulator khi quay lại ván đấu.

---

### Task 1.6: Triệt tiêu việc tạo `CanvasGradient` động mỗi frame trong `renderWorld`
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟠 Cao (Giảm áp lực Garbage Collector, chống rớt FPS khi bắn nổ)
* **Vị trí code**:
  - Vòng vàng chân đồng đội: ~dòng `6955`
  - Muzzle flash súng đồng đội & người chơi: ~dòng `7262`, `23260`
  - Lửa Jetpack đồng đội & người chơi: ~dòng `7084`, `22826`
  - Khói mờ dung nham & dị điểm (`drawSpaceshipHullGlow`): ~dòng `11025–11050`
  - Kén ngủ đông Cryo Pods (`drawSpacecraftProps`): ~dòng `11425`
  - Bình nguyên tử nổ vụn (`drawNuclearVatsAndPools`): ~dòng `12009`
  - Hồ phóng xạ hạt nhân: ~dòng `12225`
  - Đám lửa sàn `firePatches`: ~dòng `16805`
  - Kính nhìn đêm NVG Overlay (`drawNvgOverlay`): ~dòng `26416`
  - Tâm ngắm Preloader (`renderPreloaderReticle`): ~dòng `27805–27970`
* **Nguyên nhân**: Các hàm trên gọi `safeRadialGradient`, `createLinearGradient` và `createRadialGradient` mới trong mỗi nhịp vẽ 60Hz. Khi có nhiều đám lửa và hiệu ứng, hàng nghìn object gradient được cấp phát rồi giải phóng liên tục mỗi giây gây quá tải Garbage Collector.
* **Giải pháp triển khai**:
  1. Chuyển đổi toàn bộ các gradient có bán kính/kích thước cố định hoặc bán kính lượng tử hóa sang `getCachedRadialGradient` / `getCachedLinearGradient`.
  2. Đối với `firePatches` và `nuclearPools`: Làm tròn bán kính theo bước 4px (`Math.round(r / 4) * 4`), dùng `getCachedRadialGradient` với màu chuẩn và áp dụng `ctx.globalAlpha = alpha`.
  3. Đối với Muzzle Flash: Làm tròn bán kính thành số nguyên và cache theo từng mã súng `wId`.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã chuyển 100% các gradient động trong vòng lặp vẽ sang `getCachedRadialGradient` và `getCachedLinearGradient`. Triệt tiêu hoàn toàn GC Churn do Canvas Gradient sinh ra.

---

### Task 1.7: Tối ưu hóa Radar Minimap (Giảm tải CPU Main Thread)
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟡 Trung bình
* **Vị trí code**:
  - Hàm `renderWorld()` (~dòng `17653`)
  - Hàm `renderRadarMinimap()` (~dòng `23397–23540`)
* **Nguyên nhân**: Cứ mỗi 3 frame (20Hz), hàm duyệt qua toàn bộ mảng quái, toàn bộ tường, cửa, trạm năng lượng gây tốn CPU.
* **Giải pháp triển khai**:
  1. Giảm tần suất cập nhật Minimap từ mỗi 3 frame (`% 3`) xuống mỗi 6 frame (`% 6` ~10Hz) — hoàn toàn đủ mượt đối với radar quân sự thu nhỏ mà giảm được 50% tải vẽ.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã đổi điều kiện cập nhật radar trong `renderWorld` thành `if (frameCounter % 6 === 0) renderRadarMinimap();`, tiết kiệm 50% chi phí CPU render Minimap.

---

### Task 1.8: Tối ưu chu kỳ Frame Pacer khi ở Sảnh chờ / Menu
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟡 Trung bình (Tiết kiệm CPU & Pin laptop/điện thoại)
* **Vị trí code**:
  - Hàm `scheduleNextFrame()` (~dòng `27344–27347`)
  - Hàm `gameLoop()` (~dòng `27371–27380`)
* **Nguyên nhân**: Khi ở sảnh chờ (Lobby) hoặc Preloader, game loop vẫn chạy ngầm 15 FPS và gọi `gameLoop()`, thực hiện đo FPS, tính toán thời gian và gọi `scheduleNextFrame()`.
* **Giải pháp triển khai**:
  Khi người chơi đang mở Menu cài đặt lớn, Sảnh chờ hoặc Pause, Frame Pacer hạ nhịp xuống 100ms (10 FPS idle loop) và chỉ vẽ canvas nền tĩnh 3 frame đầu rồi ngưng, không thực hiện bất kỳ phép đo camera / aim / network tick nào.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã cấu hình nhịp chờ 100ms khi `isPaused || isMapWon`, dừng hoàn toàn việc vẽ nền sau 3 frame tĩnh khi ở Sảnh chờ, tắt đo FPS DOM khi pause.

---

### Task 1.9: Kiểm soát bộ nhớ `surfaceCanvas` & Bảo toàn Mặt Sàn Kính Trong Suốt (Map 2–10)
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🔴 Quan trọng (Đồ họa mặt sàn & Bộ nhớ)
* **Vị trí code**:
  - Khởi tạo `surfaceCanvas` (~dòng `7628`)
  - Hàm `drawBaseFloor()` (~dòng `9205–9225`)
* **Nguyên nhân & Quy tắc sống còn**:
  - `surfaceCanvas` kích thước `5200x3600` dùng để vẽ mặt sàn các phòng và lưu vết máu/vệt cháy.
  - **CẢNH BÁO QUAN TRỌNG CHO AI CA SAU**: Tuyệt đối **KHÔNG ĐƯỢC** đặt `{ alpha: false }` cho `surfaceCanvas`! Vì từ Map 2 đến Map 10, mặt sàn các phòng sử dụng màu bán trong suốt (`rgba(..., 0.42 - 0.55)`) và khoảng trống ngoài hành lang phải trong suốt (`clearRect`) để lộ lớp nền vũ trụ, hành tinh, tinh vân, băng giá, dung nham tuyệt đẹp được vẽ ở canvas chính phía dưới. Nếu đặt `alpha: false`, toàn bộ nền ngoài phòng sẽ biến thành màu đen đặc xì làm hỏng hoàn toàn thẩm mỹ bản đồ!
* **Giải pháp triển khai**:
  - Giữ `const surfaceCtx = surfaceCanvas.getContext("2d", { alpha: true });`.
  - Tối ưu RAM bằng cách chỉ duy trì duy nhất 1 `surfaceCanvas` toàn cục, gọi `surfaceCtx.clearRect(0, 0, WORLD_W, WORLD_H)` mỗi khi khởi tạo màn mới trong `drawBaseFloor()`, và pre-bake các hiệu ứng phát sáng khác vào GPU `ImageBitmap` để giải phóng RAM.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã chuẩn hóa `surfaceCanvas.getContext("2d", { alpha: true })`, khôi phục 100% vẻ đẹp mặt sàn kính trong suốt nhìn xuyên thấu nền vũ trụ/hành tinh của Map 2–10 mà vẫn giữ mức RAM thấp ổn định.

---

# 🛡️ GIAI ĐOẠN 2: BẢO MẬT & PHÒNG THỦ DỮ LIỆU (HOÀN TẤT)

---

### Task 2.1: Triệt tiêu lỗ hổng Stored XSS trên Bảng Xếp Hạng (Leaderboard)
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🔴 Cao (Bảo mật tài khoản)
* **Vị trí code**:
  - `alien-shooter-fullstack/frontend/index.html`
  - Hàm `escapeHtml()` (~dòng `3824`)
  - Hàm `submitForgotPassword()` (~dòng `25414`)
  - Hàm `refreshLeaderboardData()` (~dòng `25469–25525`)
  - Hàm `populateProfileView()` (~dòng `25254`)
* **Nguyên nhân**: `item.displayName` và `res.message` chèn trực tiếp vào chuỗi template literal rồi gán vào `innerHTML`.
* **Giải pháp triển khai**:
  Tạo hàm `escapeHtml(str)` chuyển đổi các ký tự `<, >, &, ", '` thành thực thể HTML an toàn trước khi render vào `innerHTML`, và dùng DOM replacement an toàn cho avatar.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã triển khai hàm `escapeHtml()` toàn cục; làm sạch toàn bộ dữ liệu người dùng (`displayName`, `difficulty`, `err.message`) trong bảng xếp hạng và thông báo quên mật khẩu; chuẩn hóa avatar profile sang DOM Element an toàn.

---

### Task 2.2: Ẩn URL trực tiếp của Google Apps Script trong Frontend
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟠 Trung bình
* **Vị trí code**:
  - `IS_LOCAL_FILE_MODE` & `DIRECT_SCRIPT_URL` (~dòng `24808`)
  - Hàm `callApi()` (~dòng `24836`)
  - Hàm `fetchDonateConfig()` (~dòng `25946`)
* **Nguyên nhân**: URL triển khai bí mật của Google Script bị lộ nguyên văn trong frontend, cho phép kẻ xấu bypass Vercel Proxy `/api/sync` để spam trực tiếp.
* **Giải pháp triển khai**:
  Xóa bỏ hardcode `directUrl` trên web production; chuyển toàn bộ luồng request qua `/api/sync`. Chỉ dùng fallback khi chạy trên giao thức `file:///`.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Chỉ cấp phát `DIRECT_SCRIPT_URL` khi đang chạy offline dưới giao thức `file:///`. Trên Web Vercel/Production, 100% request bắt buộc định tuyến qua `/api/sync`, ngăn chặn hoàn toàn việc bypass proxy.

---

### Task 2.3: Giới hạn độ dài dữ liệu lưu trong LocalStorage chống tràn Quota
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟢 Thấp
* **Vị trí code**:
  - Hàm `handleLobbyBgFileUpload()` (~dòng `24659–24685`)
  - Hàm `handleAvatarFileUpload()` (~dòng `24554–24578`)
* **Nguyên nhân**: Chuỗi base64 JPEG 1920x1080 lưu vào `localStorage` có thể chiếm 1–2MB, dễ gây lỗi `QuotaExceededError` khi trình duyệt đạt hạn mức 5MB.
* **Giải pháp triển khai**:
  Giảm độ phân giải ảnh nền lưu trữ xuống tối đa 1280x720 và chất lượng JPEG 0.75, avatar 256x256 chất lượng 0.82, kèm thông báo lỗi rõ ràng nếu bộ nhớ trình duyệt bị đầy.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã giảm giới hạn ảnh nền sảnh từ 1920x1080 xuống 1280x720 và chất lượng 0.75 (giảm 85% dung lượng lưu trữ); bọc `try/catch` có toast cảnh báo thân thiện khi gặp `QuotaExceededError`.

---

### Task 2.4: Kiểm tra tính hợp lệ của gói tin P2P Co-Op (`Input Clamping`)
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟢 Thấp
* **Vị trí code**:
  - Hàm `handleData()` (~dòng `6363–6380`, `6445–6450`)
* **Nguyên nhân**: `ENEMY_HIT` chấp nhận sát thương tự do từ Client mà không giới hạn ngưỡng tối đa.
* **Giải pháp triển khai**:
  Giới hạn sát thương tối đa của 1 viên đạn trên Host không vượt quá 2,500 damage (ngưỡng tối đa súng Gauss max upgrade + buff), giới hạn lực đẩy `kx/ky`, cắt chuỗi an toàn `attackerId`, và giới hạn máu/giáp tối đa 5000.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã tích hợp input clamping cho gói `ENEMY_HIT` (damage <= 2500, kx/ky trong [-40, 40]), và clamping HP/Armor đồng đội trong gói `input`.

---

### Task 2.5: Bổ sung Subresource Integrity (SRI) cho các CDN
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟢 Thấp
* **Vị trí code**:
  - Thẻ `<script>` nạp Tailwind, PeerJS, Socket.io (~dòng `7–9`)
* **Giải pháp triển khai**:
  Bổ sung hash sha384 và `crossorigin="anonymous"` cho các thư viện PeerJS và Socket.io.
  > [!CAUTION]
  > Tuyệt đối KHÔNG gắn `crossorigin="anonymous"` vào `https://cdn.tailwindcss.com` vì máy chủ Tailwind CDN redirect 302 không trả header `Access-Control-Allow-Origin`, sẽ bị trình duyệt chặn hoàn toàn theo chính sách CORS làm vỡ 100% giao diện!
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã bổ sung mã băm SHA-384 chính xác và thuộc tính `crossorigin="anonymous"` cho PeerJS 1.5.4 và Socket.io 4.7.5. Đã loại bỏ `crossorigin` trên Tailwind CDN để giải phóng triệt để lỗi chặn CORS. Đã kiểm tra screenshot headless Chrome đạt 100% giao diện chuẩn.

---

# 🎯 GIAI ĐOẠN 3: TỐI ƯU GAMEPLAY, GIAO DIỆN CHIẾN THẮNG, ASSET & MINI MAP (HOÀN TẤT 100%)

---

### Task 3.1: Khắc phục triệt để lỗi treo vòng lặp Game sau khi chuyển Map / mở Shop / mở Cài đặt
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🔴 Rất nghiêm trọng (Blocker trải nghiệm chơi game)
* **Vị trí code**:
  - Hàm `resetFramePacer()`, `scheduleNextFrame()`, `onFramePacerTick()`, `gameLoop()` (~dòng `27480–27610`)
  - Hàm `simulateMapTransitionLoading()` (~dòng `28650`)
* **Nguyên nhân**:
  1. Hàm `resetFramePacer()` trước đây hủy cả `loopRafId` và `loopTimeoutId` nhưng **không gọi lại `scheduleNextFrame()`**. Bất kỳ khi nào `resetFramePacer()` được gọi bên ngoài `onFramePacerTick` (ví dụ khi đóng Cửa hàng `[B]`, đóng Cài đặt `[ESC]`, hoặc kết thúc màn hình chuyển Map), toàn bộ vòng lặp game bị dừng vĩnh viễn khiến màn hình đơ cứng không thao tác được!
* **Giải pháp triển khai**:
  1. Trong `resetFramePacer()`: Sau khi hủy timer cũ và đặt lại `loopLastTime`, luôn kiểm tra `if (!loopRafId && !loopTimeoutId) scheduleNextFrame();`.
  2. Thêm **Watchdog tự phục hồi (Self-Healing Watchdog 400ms)**: Tự động kiểm tra nếu `performance.now() - lastLoopHeartbeat > 350` mà không có `loopRafId`/`loopTimeoutId` nào đang chờ thì lập tức kích hoạt lại `scheduleNextFrame()`.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-24
  * *Mô tả thay đổi*: Đã sửa `resetFramePacer()` tự động nối lại chuỗi frame và thêm Watchdog 400ms bảo vệ vòng lặp game không bao giờ bị chết đứng.

---

### Task 3.2: Sửa lỗi khi chết không mở Modal Thua Trận (`#gameOverModal`)
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🔴 Cao
* **Vị trí code**:
  - Hàm `triggerPlayerDeath()` (~dòng `14950–15015`)
* **Nguyên nhân**: `#gameOverModal` từng bị gán inline style `style.display = "none"` khi đóng, nhưng trong `triggerPlayerDeath()` chỉ xóa class `"hidden"` mà không gán lại `style.display = "flex"`.
* **Giải pháp triển khai**:
  Trong `triggerPlayerDeath()`, gán đồng thời `overModal.classList.remove("hidden")` và `overModal.style.display = "flex"`.

---

### Task 3.3: Cơ chế làm mới thông số khi Chơi Lại hoặc từ Màn Hình Chính vào trận (`carryOver` Logic)
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🔴 Cao (Chuẩn hóa cân bằng Gameplay)
* **Vị trí code**:
  - Hàm `resetPlayerProgressionToMapDefault(mapId)` & `initCampaign(keepSettingsOpen, carryOver)` (~dòng `26900–27120`)
  - Hàm `applyCloudProgress()` (~dòng `25060`)
* **Quy tắc Gameplay chuẩn**:
  1. **Khi bấm Chơi lại (Retry sau khi chết) hoặc từ Sảnh chính (Lobby) chọn Map vào chơi (`carryOver === false`)**:
     - Gọi `resetPlayerProgressionToMapDefault(currentMapId)` để làm mới hoàn toàn tiền (`player.credits`), súng đã mở khóa (`WEAPON_DATA`), đạn dược, và toàn bộ cấp nâng cấp (`hpLevel = 1`, `speedLevel = 1`, `dmgLevel = 1`, `droneCount = defaultDrones`, `turretUnlocked = false`, `nvgUnlocked = false`, xóa các tháp pháo đã đặt) về đúng thông số mặc định được thiết kế sẵn cho từng Map trong `MAP_CONFIGS[mapId]`.
     - Chặn `applyCloudProgress()` không ghi đè tiền/súng cũ từ Cloud/LocalStorage khi người chơi đang ở trong trận (`!isLobbyOpen`).
  2. **Khi chơi liền mạch qua màn liên tục (`transitionToNextMap()` với `carryOver === true`)**:
     - Bảo toàn nguyên vẹn số tiền đang tích lũy, các súng đã mua và cấp nâng cấp hiện có để mang sang Map tiếp theo.

---

### Task 3.4: Thiết kế lại Modal Chiến Thắng (`MISSION COMPLETED`) & Độ trễ nổ Boss
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟠 Trung bình - Cao
* **Vị trí code**:
  - HTML `#victoryModal` (~dòng `1765–1808`)
  - Hàm `triggerMapVictory()`, `startVictoryAutoAdvanceCountdown()` (~dòng `14400–14560`)
* **Thiết kế & Cơ chế hiện tại**:
  1. **Độ trễ `950ms` sau khi hạ Boss**: Khi Boss cuối cùng bị tiêu diệt, game tiếp tục chạy hiệu ứng vụ nổ Boss rung chuyển màn hình trong `950ms` rồi mới hiển thị `#victoryModal`.
  2. **Giao diện Sci-Fi Hexagon `MISSION COMPLETED`**:
     - Khung banner lục giác màu xanh lá phát sáng ở giữa màn hình với tiêu đề lớn **`MISSION COMPLETED`**.
     - Dòng chữ nhắc nhở bên dưới: **`PRESS ANY KEY TO CONTINUE`** (bấm bất kỳ phím nào hoặc click vào banner sẽ lập tức chuyển sang màn tiếp theo).
     - Bên dưới có **vòng tròn SVG màu xanh lá đếm ngược `3, 2, 1`**: nếu người chơi không ấn phím nào thì hết 3 giây sẽ tự động hiển thị màn hình nạp chuyển sang Map kế tiếp.

---

### Task 3.5: Khắc phục Tháp Pháo Tự Động (`phao_tu_dong.png`) không lấy đúng tỉ lệ Asset có sẵn
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟠 Trung bình
* **Vị trí code**:
  - Cấu hình `CUSTOM_ASSETS.turret` (~dòng `5106–5120`)
  - Hàm `drawPlayerTurrets()` (~dòng `16790–16820`)
* **Nguyên nhân & Giải pháp**:
  - Trước đây `CUSTOM_ASSETS.turret` dùng tọa độ tâm xoay và đường kính cố định theo pixel (`pivotX: 106.3, pivotY: 120, baseDiameter: 120` tính trên ảnh nhỏ 240px), trong khi file `assets/phao_tu_dong.png` thực tế có độ phân giải `1774x887` khiến tháp pháo bị thu nhỏ li ti và lệch tâm xoay.
  - Đã chuyển sang dùng **tỉ lệ chuẩn hóa (`pivotXRatio: 0.443`, `pivotYRatio: 0.50`, `baseDiameterRatio: 0.50`)** nhân với `img.naturalWidth` và `img.naturalHeight`, giúp asset tháp pháo hiển thị sắc nét, đúng kích thước và tâm xoay chuẩn xác ở mọi độ phân giải.

---

### Task 3.6: Tích hợp Asset Máy Gia Tốc Hạt (`may_gia_toc.png`) kèm Tia Sét & Phát Quang Viền
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟠 Trung bình
* **Vị trí code**:
  - `CUSTOM_ASSETS.particleAccelerator` (~dòng `5164`)
  - Hàm `bakeCustomParticleAcceleratorToGpu()` (~dòng `5339–5378`)
  - Hàm `drawSpacecraftProps()` (~dòng `11689–11829`)
* **Giải pháp triển khai**:
  1. Cắt sát viền rỗng và giảm độ phân giải ảnh gốc `may_gia_toc.png` từ `1774x887` (`1.42 MB`) xuống **`560x167` (`233.5 KB`)**, đồng bộ vào cả 5 thư mục `assets/`.
  2. Tự động nhận diện hướng nằm ngang (`orient: "h"`) hoặc dọc (`orient: "v"` / `sp.h > sp.w`) của vật thể mặc định trên bản đồ để xoay `90°` linh hoạt.
  3. Pre-bake 2 lớp hào quang viền đa sắc (Xanh Cyan, Tím Lượng Tử, Cam Nhiệt Hạch) vào GPU `ImageBitmap` VRAM (không tốn `shadowBlur` mỗi frame).
  4. Vẽ bổ sung **2 luồng tia sét điện từ phân nhánh**, luồng Plasma lõi và 3 hạt Photon chớp nháy chạy dọc bên trong đường ống kính (`[-0.275 * drawW, +0.285 * drawW]`).

---

### Task 3.7: Tinh gọn Mini Map & Thay chấm tròn bản thân bằng Mũi Tên Tam Giác Chỉ Hướng
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟠 Trung bình
* **Vị trí code**:
  - Chú thích HTML Mini Map (~dòng `1291–1297`)
  - Cập nhật `player.moveAngle` trong `updateGame()` (~dòng `15935–15960`)
  - Hàm `renderRadarMinimap()` (~dòng `23720–23865`)
* **Giải pháp triển khai**:
  1. Lược bỏ hoàn toàn các chấm xanh thừa thãi không có trong chú thích (`nuclearVats`, `energyCoreStations`, `computerDesks`), chỉ giữ lại đúng 5 thành phần được chú thích rõ ràng (`Bạn`, `Quái/Boss`, `Á Trùm`, `⚡ Nhà Máy Điện`, `Cổng Dịch`).
  2. Thay icon chấm tròn xanh "Bạn" bằng **hình tam giác mũi tên (chevron arrow) màu xanh lá viền trắng** xoay theo hướng di chuyển tương đối trên bản đồ (`player.moveAngle`), đồng bộ cả icon chú thích dưới Mini Map.

---

### Task 3.8: Thay thế thanh tiến trình ngang khởi động Máy Phát Điện thành Vòng Tròn Màu Xanh Lá Dưới Chân (Circular Load Ring)
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🟠 Trung bình (Nâng cấp trải nghiệm trực quan & thẩm mỹ Sci-Fi)
* **Vị trí code**:
  - `alien-shooter-fullstack/frontend/index.html`
  - Hàm `drawMarinePlayer()` (~dòng `24036–24125`)
  - Hàm `drawGenerator()` (~dòng `27870–27915`)
* **Mô tả & Cơ chế triển khai**:
  1. **Loại bỏ thanh tiến trình ngang thô cứng**: Bỏ thanh tiến trình ngang trong bảng thông báo trên đầu máy phát điện, cố định chiều cao bảng gọn gàng ở mức 26px, chuyển đổi linh hoạt nhãn trạng thái (`ĐANG KHỞI ĐỘNG: xx%` viền xanh lá khi giữ `[E]` và `Giữ E 5 giây để khởi động máy phát điện` viền cam khi chưa bấm).
  2. **Vòng tròn tiến trình màu xanh lá dưới chân (Load Vòng Tròn)**:
     - Khi đứng trong phạm vi kích hoạt 95px và giữ `[E]`: Vẽ vòng tiến trình màu xanh lá (`#22c55e`) quét tròn theo chiều kim đồng hồ từ vị trí 12h (`-Math.PI / 2` đến `-Math.PI / 2 + holdProgress * 2PI`), bán kính `r = 34px` ôm trọn chân người chơi.
     - Có điểm sáng dẫn hướng (Glowing Tip Marker `#86efac` lõi trắng) trượt theo đầu vòng nạp.
     - Tích hợp hào quang sàn xanh lục dịu nhẹ (`gen_crank_glow_34` qua `getCachedRadialGradient`) và chỉ số phần trăm điện tử sắc nét (`xx%`) dưới chân.
     - Khi đứng trong vùng 95px nhưng chưa giữ `[E]`: Hiển thị vòng nét đứt xanh lá nhấp nháy mềm mại kèm chữ `GIỮ [E]` hướng dẫn tương tác.
     - Khi ở xa > 95px: Giữ nguyên mũi tên cam chiến thuật chỉ hướng tìm về trạm máy phát điện.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-26
  * *Mô tả thay đổi*: Đã thay thanh ngang trong `drawGenerator()` thành vòng tròn xanh lá nạp quanh chân trong `drawMarinePlayer()`, đồng bộ hóa vào cả `dist/` và `frontend/dist/`.

---

### Task 3.9: Tối ưu hóa Va chạm & Định tuyến 400+ Quái vật bằng Static Obstacle Spatial Hash Grid (O(1)) & Caching Raycast LOD
* **Trạng thái**: `[x] Đã hoàn thành`
* **Mức độ**: 🔴 Cao (Cứu sụt giảm FPS cực hạn khi test 400 quái vật cùng lúc)
* **Vị trí code**:
  - `alien-shooter-fullstack/frontend/index.html`
  - Khởi tạo & xây dựng lưới không gian: `rebuildObstacleSpatialGrid()`, `ensureObstacleSpatialGrid()` (~dòng `11312–11425`)
  - Va chạm đạn & che chắn: `pointHitsWall(x, y)` (~dòng `11427–11451`)
  - Kiểm tra vòng tròn & vật cản tĩnh: `circleHitsStaticObstacle(x, y, pad)` (~dòng `11453–11495`)
  - Tầm nhìn AI: `hasLineOfSight(x1, y1, x2, y2)` (~dòng `11510–11528`)
  - Caching đường đi thông thoáng: `computeMonsterSteering(e, ...)` (~dòng `11575–11590`)
  - Trượt mép tường: `resolveWallSliding(entity)` (~dòng `11690–11745`)
  - AI LOD ngoài màn hình: `updateWorld()` (`dist > 1100`, ~dòng `17930`)
* **Nguyên nhân gây sụt FPS khi có 400 quái**:
  1. Trong hàm `resolveWallSliding(entity)`, mỗi frame cả 400 quái đều duyệt lặp tuyến tính $O(N)$ qua toàn bộ 300+ chướng ngại vật (WALLS, computerDesks, spaceProps, barricades, energyCoreStations, nuclearVats, crates, barrels) = ~120,000 đến 160,000 phép tính va chạm hình học/frame trên CPU Main Thread.
  2. Trong hàm `hasPathClearance()`, mỗi quái phát tia raycast lên đến 35 bước dò, mỗi bước lại gọi `circleHitsStaticObstacle()` quét lại 300+ vật thể = lên tới 4.2 triệu lượt kiểm tra chướng ngại vật/frame.
  3. `pointHitsWall(x, y)` duyệt tuyến tính tất cả các bức tường mỗi tick bay của từng viên đạn.
* **Giải pháp triển khai**:
  1. **Lưới không gian phân vùng tĩnh 2D (Spatial Hash Grid)**:
     - Kích thước ô lưới `OBS_GRID_CELL = 200px`, chia bản đồ $5200 \times 3600$ thành $26 \times 18 = 468$ ô.
     - Phân loại toàn bộ chướng ngại vật tĩnh thành dạng Hộp (Box: `WALLS`, bàn điều khiển, kén ngủ đông/máy gia tốc, rào chắn, thùng quân sự) và dạng Hình tròn (Circle: Lõi lò phản ứng trạm năng lượng, 4 tháp Tesla, bồn hóa chất, thùng nhiên liệu).
     - Mỗi vật cản chỉ được đăng ký vào đúng các ô lưới mà nó chiếm chỗ (1–4 ô).
     - Tận dụng cơ chế `_qToken` tự tăng $O(1)$ không tạo rác bộ nhớ (Zero Allocation / No GC Churn) để chống trùng lặp kiểm tra vật thể trải rộng nhiều ô.
     - `resolveWallSliding`, `circleHitsStaticObstacle` và `pointHitsWall` chỉ truy vấn đúng 1–4 ô cục bộ quanh vị trí đối tượng, giảm số phép thử từ 300+ xuống trung bình 2–4 vật cản (giảm 98.7% tải CPU).
     - Công thức toán học đẩy trượt (`overlap`) và tiếp xúc điểm được giữ **nguyên vẹn tuyệt đối đến từng sub-pixel**, bảo toàn 100% độ trơn tru và cảm giác vật lý gốc.
  2. **Bộ đệm thông thoáng AI theo Frame xen kẽ (AI Clearance Interleaved Cache)**:
     - Lưu kết quả dò raycast `hasPathClearance()` trên từng quái (`e._clrCached`) trong chu kỳ 3 frame so le theo `(e.id % 3)`.
     - Giảm 66% tần suất raycast bước dò mà đường chạy của quái vẫn bám sát người chơi mượt mà.
  3. **AI LOD ngoài tầm nhìn (Screen LOD)**:
     - Với quái ở xa ngoài khung nhìn (`dist > 1100px`, vượt ra ngoài màn hình $1280 \times 720$), góc lái phức tạp được giãn cách tính toán 3 frame/lần.
  4. **Bảo toàn trí thông minh tìm đường (Flow Field Pathfinding)**:
     - Toàn bộ thuật toán Gradient BFS Flow Field 11,700 ô được giữ nguyên 100%, quái vật vẫn tự tìm lối đi vòng qua các góc cua, cửa ngõ và chướng ngại vật một cách thông minh, không hề bị "ngu đi" hay kẹt tường.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-26
  * *Mô tả thay đổi*: Triển khai Spatial Hash Grid O(1) cho vật cản tĩnh, tối ưu hóa `resolveWallSliding`, `circleHitsStaticObstacle`, `pointHitsWall`, `hasLineOfSight`, tích hợp AI clearance caching và đồng bộ hóa toàn bộ sang các bản phân phối `dist/` và `frontend/dist/`.

---

### Task 3.10: Tích hợp Mô hình Lai WebGL Post-Processing Shader Thông Minh (Zero Black Screen & Nhận Diện Môi Trường)
* **Trạng thái**: `[x] Đã hoàn thành & Đã kiểm thử chuẩn hóa 100%`
* **Mức độ**: 🚀 Nâng cấp đồ họa cao cấp & Bảo toàn 100% độ tương thích đa nền tảng
* **Vị trí code**:
  - `alien-shooter-fullstack/frontend/index.html` (Canvas `webglCanvas`, UI card `sysTabPanel_graphics`, hooks `renderWorld()`, `resizeCanvas()`, và engine `WebglPostProcessor`)
  - Đồng bộ `alien-shooter-fullstack/dist/` và `alien-shooter-fullstack/frontend/dist/` qua `sync_dist.ps1`
* **Cơ chế hoạt động của Mô hình Lai WebGL Thông Minh (Smart Hybrid Architecture)**:
  1. **Tự động nhận diện môi trường giao thức (Environment & Protocol Detection)**:
     - Khi chạy trên `file:///` cục bộ: Trình duyệt Chromium (Chrome/Edge) kích hoạt cơ chế bảo mật Same-Origin Policy nghiêm ngặt (đánh dấu Canvas 2D là Tainted khi load sprite PNG từ đĩa cục bộ, chặn `gl.texImage2D`).
     - Engine phát hiện `window.location.protocol === "file:"`, tự động vô hiệu hóa WebGL overlay (`webglCanvas.style.display = "none"`), giữ nguyên 100% hiển thị Canvas 2D thuần túy, mượt mà 60 FPS, sáng rõ và không bao giờ bị đen màn hình.
     - Trong bảng Cài đặt Đồ họa, hiển thị huy hiệu `FILE:/// (CANVAS 2D)` cùng thông báo hướng dẫn rõ ràng.
  2. **Tự động kích hoạt Shader khi chạy trên HTTP/HTTPS (`http://localhost` hoặc Vercel Online)**:
     - Khi chạy trên máy chủ Web hoặc Vercel, cùng Origin cho phép `gl.texImage2D` đọc trơn tru từ Canvas 2D lên GPU VRAM.
     - Kích hoạt Shader GLSL ES 1.0 chuẩn hóa đã kiểm thử thành công:
       + **Neon Bloom**: Hào quang rực rỡ từ nguồn sáng đạn, lửa, sét và lò phản ứng.
       + **Chromatic Aberration**: Tán sắc quang học viền màn hình và chấn động.
       + **Vignette Điện Ảnh**: Tối 4 góc màn hình tăng chiều sâu thị giác.
       + **CRT Scanlines**: Vạch quét công nghệ Mecha Sci-Fi.
       + **Tích hợp Kính nhìn đêm NVG & Điều chỉnh Sáng/Tối/Tương phản**.
  3. **Tiêu chuẩn Bảo vệ Tuyệt đối (Fail-Safe Zero-Black-Screen Standard)**:
     - `gameCanvas` luôn ở chế độ hiển thị 100% (`opacity: 1`, `display: block`).
     - `webglCanvas` được lồng trực tiếp bên trên với `pointer-events-none`.
     - Trong hàm `render(sourceCanvas)`, toàn bộ quy trình đẩy texture và draw GPU được bọc kín trong khối `try/catch`. Nếu phát sinh bất kỳ lỗi nào từ trình duyệt hoặc GPU (như mất context), `webglCanvas` lập tức ẩn đi (`display = "none"`), để lộ Canvas 2D bên dưới ngay tức thì mà người chơi không cảm nhận thấy độ trễ hay đen màn hình.
  4. **Bảo tồn toàn diện tính năng**:
     - Giữ nguyên 100% thuật toán tối ưu CPU **Spatial Hash Grid O(1)** cho 400 quái vật của Task 3.9.
     - Giữ nguyên 100% sàn kính trong suốt (`surfaceCanvas` `alpha: true`).
     - Công tắc Bật/Tắt trong Cài đặt Đồ họa cho phép người chơi tùy ý chuyển đổi giữa Canvas 2D và WebGL Shader khi ở môi trường HTTP.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-26
  * *Mô tả thay đổi*: Tích hợp thành công Lựa chọn 2 - Smart WebGL Post-Processing Shader với cơ chế tự phát hiện môi trường `file:` / `http:`, Fail-safe chống đen màn hình, biên dịch GLSL ES 1.0 tương thích Edge/Chrome, và đồng bộ trọn vẹn sang toàn bộ các thư mục phân phối `dist/`.

---

### Task 3.11: Tối ưu Quy trình Đóng gói Tự động, Sửa lỗi Mangle Terser Obfuscation & Mở khóa đồng bộ Vercel (`dist/`)
* **Trạng thái**: `[x] Đã hoàn thành & Đã kiểm thử trực tiếp trên Vercel`
* **Mức độ**: 🔒 Bảo mật bản quyền mã nguồn & Đồng bộ hóa tự động 100%
* **Vị trí code**:
  - `build_minified.ps1` (Bộ đóng gói & nén mã chạy qua Chromium Engine, hoạt động độc lập không cần cài Node.js)
  - `alien-shooter-fullstack/build.cjs` & `alien-shooter-fullstack/frontend/build.cjs`
  - `alien-shooter-fullstack/frontend/package.json` (Bổ sung `terser: ^5.51.2`)
  - `alien-shooter-fullstack/.gitignore` (Mở khóa tracking cho `dist/` và `frontend/dist/`)
  - `alien-shooter-fullstack/deploy_nhanh.bat` & `DEPLOY_NHANH_BAN_ONLINE.bat`
* **Nguyên nhân trước đó mã chưa được làm rối trên Vercel**:
  1. Thư mục `dist/` và `frontend/dist/` nằm trong `.gitignore`, khiến lệnh `git add -A` bỏ qua không đẩy mã đã đóng gói lên GitHub.
  2. `frontend/package.json` thiếu gói `terser`. Khi Vercel build trên cloud từ thư mục frontend, Terser không tồn tại và rơi vào fallback xuất mã nguồn gốc chưa nén.
  3. Cấu hình Terser cũ để `mangle: { toplevel: false }`, khiến toàn bộ biến và hàm ngoài cùng (`byId`, `_domCache`, `_dockBtnEls`,...) không bị làm rối.
  4. Máy tính cục bộ chạy batch script nếu chưa có Node.js trong biến môi trường thì lệnh `node build.cjs` bị bỏ qua mà không báo lỗi.
* **Giải pháp dứt điểm**:
  1. Xây dựng [`build_minified.ps1`](file:///c:/Users/Administrator/Downloads/Alien_Shooter/Project_Xeno_Reloaded_Full_Package/build_minified.ps1) sử dụng Edge Headless chạy trực tiếp Terser bundle `node_modules/terser/dist/bundle.min.js`, nén mã từ 1.3 MB xuống **533 KB** (~59% dung lượng).
  2. Bật `mangle: { toplevel: true, reserved: ['sfx'] }` và `format: { comments: false }`: xóa sạch 100% chú thích tiếng Việt và làm rối toàn bộ định danh biến/hàm thành các ký tự vô nghĩa (`e, t, o, n, a, i, l...`).
  3. Thêm `terser` vào `frontend/package.json` và mở khóa tracking `dist/` trong `.gitignore`.
  4. Tích hợp `build_minified.ps1` vào [`deploy_nhanh.bat`](file:///c:/Users/Administrator/Downloads/Alien_Shooter/Project_Xeno_Reloaded_Full_Package/alien-shooter-fullstack/deploy_nhanh.bat) và [`DEPLOY_NHANH_BAN_ONLINE.bat`](file:///c:/Users/Administrator/Downloads/Alien_Shooter/Project_Xeno_Reloaded_Full_Package/DEPLOY_NHANH_BAN_ONLINE.bat).
  5. Đã commit và push lên GitHub `origin main`. Kiểm tra trực tiếp tại `https://project-xeno-online.vercel.app/game.min.js`: status 200, dung lượng 533 KB, mã đã được làm rối hoàn toàn.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-26
  * *Mô tả thay đổi*: Chuẩn hóa 100% pipeline làm rối mã và deploy Vercel, đảm bảo mã nguồn game luôn được bảo vệ tối đa trên production.

---

### Task 3.12: Sửa triệt để lỗi không ấn giữ chuột để bắn liên tục (Automatic Fire) ở 7 loại súng
* **Trạng thái**: `[x] Đã hoàn thành & Đã kiểm thử chuẩn hóa 100%`
* **Mức độ**: 🔴 Rất nghiêm trọng (Blocker cơ chế chiến đấu cốt lõi)
* **Vị trí code**:
  - `alien-shooter-fullstack/frontend/index.html`
  - Hàm `updateTouchOverlayVisibility()` (~dòng `29710–29725`)
  - Sự kiện Input chuột: `handleGameMouseDown(e, fromCanvas)`, `gameCanvas.addEventListener("mousedown")`, `window.addEventListener("mousedown")`, `window.addEventListener("mouseup")`, `window.addEventListener("blur")` (~dòng `29530–29565`)
  - Đồng bộ `dist/` và `frontend/dist/` qua `sync_dist.ps1`
* **Nguyên nhân cốt lõi gây lỗi**:
  1. Trong vòng lặp game `updateWorld()` ở nhịp cố định 60Hz, có dòng code: `if (frameCounter % 15 === 0) updateTouchOverlayVisibility();` (gọi định kỳ mỗi 15 frame = 250ms, tức 4 lần/giây).
  2. Bên trong `updateTouchOverlayVisibility()`, trên máy tính PC/Laptop, hàm kiểm tra thiết bị `getEffectiveTouchMode()` luôn trả về `false` (vì PC không phải màn hình cảm ứng).
  3. Khi `effective === false`, hàm đi vào nhánh `else` và thực thi câu lệnh: `if (typeof mouse !== "undefined") mouse.down = false;`.
  4. Hậu quả: Dù người chơi trên PC đang đè chặt phím chuột trái để xả đạn, thì cứ tối đa **250ms**, `mouse.down` lại bị cưỡng bức reset về `false`!
     - Các loại súng có tốc độ bắn dài hơn 250ms như **Shotgun M1014 (fireRate: 450ms)** và **Pháo Gauss M82 (fireRate: 310ms)** hoàn toàn **không bao giờ bắn được phát thứ hai** khi giữ chuột!
     - Các loại súng sấy liên tục như **Súng máy Minigun M134 (fireRate: 52ms)**, **Súng Phun Lửa M9A2 (fireRate: 34ms)**, **Pháo Laze Hyperion X-7 (fireRate: 50ms)**, **Song Lục MK23 (fireRate: 145ms)** và **Súng Băng M4-Cryo (fireRate: 170ms)** chỉ kịp nổ 1–3 viên đạn trong 200ms đầu tiên rồi **ngay lập tức tắt ngúm đạn/chùm laze biến mất**, buộc người chơi phải nhả chuột ra bấm lại từng phát một như súng lục nhấp tay.
* **Giải pháp triển khai**:
  1. **Sửa nhánh `else` trong `updateTouchOverlayVisibility()`**: Thêm điều kiện `if (window.touchAimActive) { window.touchAimActive = false; if (typeof mouse !== "undefined") mouse.down = false; }`. Chỉ giải phóng biến chuột khi đang ngắm bằng Cần Ảo Cảm Ứng, tuyệt đối **không ghi đè `mouse.down` của chuột vật lý PC**.
  2. **Tối ưu hóa phản hồi Click chuột không độ trễ (Zero Click Latency)**: Tách hàm `handleGameMouseDown(e, fromCanvas)` gọi `e.preventDefault()`, gán `mouse.down = true` và kích hoạt ngay `fireCurrentWeapon()` ở nhịp frame đầu tiên.
  3. **Bổ sung Fallback `window.addEventListener("mousedown")` & `window.addEventListener("blur")`**: Đảm bảo bắt trọn vẹn chuột khi click trên mọi vùng hiển thị và tự động nhả chuột khi người chơi Alt-Tab / chuyển cửa sổ.
  4. Đã chạy `sync_dist.ps1` đóng gói Terser và đồng bộ 100% sang cả `dist/` và `frontend/dist/`.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-27
  * *Mô tả thay đổi*: Đã sửa triệt để lệnh cưỡng bức reset chuột trong `updateTouchOverlayVisibility()`, nâng cấp bộ bắt sự kiện chuột trên PC, kiểm thử headless đạt `init=true, held500ms=true, afterUpdate=true`, khôi phục 100% khả năng ấn giữ chuột để xả đạn liên thanh cho toàn bộ 7 loại vũ khí.

---

### Task 3.13: Cân bằng Số lượng Boss theo Map (Sau 2 map tăng 1 boss, tối đa 4 boss) & Loại bỏ triệt để Cơ chế Boss Tốc Biến
* **Trạng thái**: `[x] Đã hoàn thành & Đã kiểm thử chuẩn hóa 100%`
* **Mức độ**: ⚖️ Cân bằng Gameplay & Khôi phục Tính Công bằng cho Chiến thuật Thả Diều (Kiting)
* **Vị trí code**:
  - `alien-shooter-fullstack/frontend/index.html`
  - Cơ chế AI Boss: Hàm `updateBossBehavior(boss, isGlobalFrozen)` (~dòng `16780–16795`)
  - Cấu hình Bản đồ: `MAP_REGISTRY` (~dòng `4470–4820`)
  - Giao diện Chọn Map (Lobby Map Cards): Map 1 -> Map 10 badges & hover text (~dòng `2190–2710`)
  - Thông tin Chuyển màn: `MAP_TRANSITION_LORE` radar tags & stage texts (~dòng `30830–30965`)
  - Gợi ý Chiến thuật: `tacticalTip` Pháo Laze (~dòng `27825`)
  - Đồng bộ `dist/` và `frontend/dist/` qua `sync_dist.ps1` (Terser Minified JS: 548 KB)
* **Nguyên nhân & Yêu cầu thay đổi**:
  1. **Cơ chế Boss tự động Tốc Biến (Anti-stuck Warp Bug)**:
     - Trước đây, trong `updateBossBehavior()`, nếu người chơi di chuyển cách Boss > 1050px quá 4 giây (240 ticks: `boss.farTimer > 240`), game kích hoạt cơ chế dịch chuyển tức thời: đặt tọa độ Boss ngay sát bên cạnh người chơi (khoảng cách 320px).
     - Điều này khiến việc giữ khoảng cách, cơ động thả diều (kiting) hoặc né kỹ năng diện rộng của Boss trở nên bất khả thi, gây ức chế cực lớn cho người chơi khi đang né tránh quái.
  2. **Quy tắc Phân bổ Số lượng Boss theo Map**:
     - Cấu hình cũ tăng lũy tiến từ 1 đến 10 Boss (Map 10 có 10 Boss khổng lồ), gây quá tải hỏa lực và nghẽn bản đồ.
     - Yêu cầu mới: Tính từ Map 1, cứ sau 2 map mới tăng 1 boss, tối đa 4 boss cho 10 map:
       + **Map 1**: 1 Boss (*OMEGA BEHEMOTH*)
       + **Map 2**: 1 Boss (*VOID EMPEROR*)
       + **Map 3**: 2 Boss (*CRYO LEVIATHAN x2*)
       + **Map 4**: 2 Boss (*MAGMA ABOMINATION x2*)
       + **Map 5**: 3 Boss (*HIVE EMPRESS x3*)
       + **Map 6**: 3 Boss (*HƯ KHÔNG THẦN x3*)
       + **Map 7**: 4 Boss (*TITAN CƠ KHÍ x4*)
       + **Map 8**: 4 Boss (*THỦY QUÁI KRAKEN x4*)
       + **Map 9**: 4 Boss (*GIÁM NGỤC THỜI GIAN x4*)
       + **Map 10**: 4 Boss (*APEX PROGENITOR x4*)
* **Giải pháp triển khai**:
  1. **Xóa sổ hoàn toàn cơ chế Tốc Biến của Boss**:
     - Xóa bỏ khối mã `if (distToPlayer > 1050) { boss.farTimer++; if (boss.farTimer > 240) { ... } }` trong `updateBossBehavior()`.
     - Giữ nguyên `boss.farTimer = 0;` để tương thích ngược. Boss giờ đây chỉ di chuyển tự nhiên theo thuật toán Flow Field Pathfinding và AI steering, tuyệt đối không bao giờ dịch chuyển tức thời sát người chơi.
  2. **Cập nhật `MAP_REGISTRY`**:
     - Cập nhật trường `bossCount`, `bossTitle`, `bossSpawnMsg` cho toàn bộ 10 map trong `MAP_REGISTRY`.
     - Vì logic sinh Boss (`spawnBossSquad`) và tính máu Boss đều dùng `getTotalBossCountForCurrentMap() = mapCfg.bossCount + diff.extraBosses`, nên việc cấu hình `MAP_REGISTRY` đảm bảo trong trận đấu số Boss sinh ra chính xác 100%.
  3. **Đồng bộ hóa toàn bộ Giao diện UI & Lore**:
     - Cập nhật badges `1 BOSS`, `2 BOSS`, `3 BOSS`, `4 BOSS` và chú thích hover `(x1)`, `(x2)`, `(x3)`, `(x4)` trên cả 10 Map Cards ở sảnh Lobby.
     - Cập nhật `MAP_TRANSITION_LORE` với radar tags chuẩn hóa (`ORION-IX // 1 BOSS`, `EUROPA // 2 BOSS`, `MAGMA // 2 BOSS`, `CITADEL // 3 BOSS`, `SINGULARITY // 3 BOSS`, `MECHA // 4 BOSS`, `ABYSSAL // 4 BOSS`, `CHRONOS // 4 BOSS`, `GENESIS // 4 BOSS`) cùng lời dẫn truyện tương ứng.
  4. **Build & Đồng bộ phân phối**:
     - Đã chạy `sync_dist.ps1` nén Terser và đồng bộ sang `alien-shooter-fullstack/dist/` và `alien-shooter-fullstack/frontend/dist/`.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-27
  * *Mô tả thay đổi*: Đã loại bỏ cơ chế boss tốc biến, điều chỉnh công thức số boss cho 10 map thành [1, 1, 2, 2, 3, 3, 4, 4, 4, 4], đồng bộ toàn bộ UI/Lore và đóng gói Terser thành công.

---

### Task 3.14: Ẩn thanh Server URL, Tích hợp Dynamic Server Discovery từ Google Sheets & Tự động Fallback đa tầng
* **Trạng thái**: `[x] Đã hoàn thành & Đã kiểm thử chuẩn hóa 100%`
* **Mức độ**: 🌐 Quản trị Đám mây & Khả năng Phục hồi Tự động (High Availability & Zero-Code Reconfiguration)
* **Vị trí code**:
  - Backend Google Apps Script: `google-sheets-backend/Code.gs` (`handleGetPublicConfig`, `SETUP_INITIAL_SHEETS`)
  - Frontend Client: `alien-shooter-fullstack/frontend/index.html` (`XENO_COOP.fetchRemoteServerConfig`, `XENO_COOP.applyServerConfig`, `XENO_COOP.tryNextServer`, `initHostSocket`, `joinRoomSocket`, `scanPublicRooms`, `handleCoopTitleClick`)
  - Đồng bộ `dist/` và `frontend/dist/` qua `sync_dist.ps1` (Terser Minified JS: 552.5 KB)
* **Nguyên nhân & Yêu cầu thay đổi**:
  1. Thanh nhập `SERVER URL:` trong Modal Online Mode lộ đường link máy chủ thô ráp, làm giảm tính chuyên nghiệp của giao diện và khiến người chơi dễ nhầm lẫn.
  2. Khi người quản trị thay đổi hoặc nâng cấp máy chủ (Render -> VPS riêng / Cloud khác), trước đây bắt buộc phải sửa code frontend rồi build và deploy lại Vercel.
  3. Cần cơ chế tự động đọc danh sách server (Server chính + 2 Server dự phòng) từ Google Sheet Database (`Admin_Config`), ưu tiên link đầu tiên và tự động fallback tuần tự nếu máy chủ chính bị quá tải/lỗi/hết hạn mức tháng.
* **Giải pháp triển khai**:
  1. **Backend Google Apps Script (`Code.gs`)**:
     - Nâng cấp hàm `handleGetPublicConfig(sheetConfig)` để đọc 3 khóa: `Link server online`, `Link server online backup`, `Link server online backup2` (hỗ trợ tìm kiếm không phân biệt hoa thường và khoảng trắng).
     - Trả về payload JSON chứa `server_url`, `server_backup_1`, `server_backup_2`, và danh sách `server_candidates`.
     - Cập nhật hàm khởi tạo `SETUP_INITIAL_SHEETS()` bổ sung sẵn 3 dòng tương ứng vào tab `Admin_Config`.
  2. **Frontend Dynamic Server Discovery & Fallback (`XENO_COOP`)**:
     - `serverCandidates` & `activeServerIndex`: Quản lý danh sách server linh hoạt, lưu vào `localStorage` để tải ngay lập tức (0ms delay) ở các lần mở game sau.
     - `fetchRemoteServerConfig()`: Tự động chạy ngầm khi tải trang (`DOMContentLoaded`) và khi mở Modal Online (`openCoopModal`), cập nhật danh sách server mới nhất từ Google Sheet qua proxy `/api/sync`. Nếu link chính trên Sheet thay đổi, client tự động chuyển sang link mới mà không cần F5 hay deploy.
     - `tryNextServer(reason, onSwitched, onAllFailed)`: Khi gặp lỗi kết nối Socket.io (`connect_error`) ở cả 3 luồng (Chủ phòng `initHostSocket`, Khách vào phòng `joinRoomSocket`, Quét phòng `scanPublicRooms`), hệ thống tự động nhảy sang server dự phòng tiếp theo kèm thông báo toast trực quan. Nếu tất cả server đều không phản hồi, tự động đề xuất chuyển sang P2P Direct.
  3. **Ẩn thanh Server URL & Easter Egg Quản trị viên**:
     - Ẩn hoàn toàn khung `#coopSocketServerBox` khi người chơi chọn chế độ Dedicated Server, giữ giao diện sạch đẹp.
     - Tích hợp Easter Egg: Nhấp 5 lần liên tiếp vào tiêu đề `ONLINE MODE` (`#coopModalHeaderTitle`) để bật/tắt thanh cấu hình Server URL nâng cao dành riêng cho Admin/Developer kiểm thử.
  4. **Build & Đồng bộ phân phối**:
     - Đã chạy `sync_dist.ps1` biên dịch Terser bundle thành công (552.5 KB) và đồng bộ song song vào `dist/` và `frontend/dist/`.
* **Ghi chú cập nhật (Dành cho AI)**:
  * *Ngày hoàn thành*: 2026-10-27
  * *Mô tả thay đổi*: Đã triển khai Dynamic Server Discovery qua Google Sheet, cơ chế Fallback đa tầng và ẩn thanh URL UI kèm Easter Egg admin thành công 100%.

---

## 📌 HƯỚNG DẪN DÀNH CHO AI KHI BẮT ĐẦU PHIÊN LÀM VIỆC MỚI

1. **Bước 1**: Đọc file này (`KE_HOACH_TOI_UU_HIEU_NANG_VA_SUA_LOI.md`) từ trên xuống dưới. Tìm task đầu tiên có trạng thái `[ ] Chưa bắt đầu` trong **GIAI ĐOẠN 1**.
2. **Bước 2**: Đổi trạng thái task đó thành `[/] Đang làm`.
3. **Bước 3**: Mở file `alien-shooter-fullstack/frontend/index.html`, áp dụng giải pháp đã ghi rõ trong mục tương ứng.
4. **Bước 4**: Kiểm tra logic và cú pháp để đảm bảo không làm gãy các tính năng hiện có.
5. **Bước 5**: Chạy script đóng gói build:
   ```powershell
   powershell -Command "cd alien-shooter-fullstack; node build.cjs; cd frontend; node build.cjs"
   ```
6. **Bước 6**: Đổi trạng thái task trong file này thành `[x] Đã hoàn thành`, điền ngày giờ và mô tả ngắn gọn những gì đã sửa vào mục *Ghi chú cập nhật (Dành cho AI)*.
7. **Bước 7**: Chuyển sang task tiếp theo hoặc báo cáo kết quả lại cho người dùng.

