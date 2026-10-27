# ⚡ 02. QUY TẮC VÀNG VỀ HIỆU NĂNG, VRAM & BỘ NHỚ
## Dự án: Project Xeno: Reloaded (Fullstack Online Edition)

> **CẢNH BÁO SỐNG CÒN DÀNH CHO AI & NHÀ PHÁT TRIỂN**:  
> Trò chơi đạt mức khung hình **60 – 200 FPS** và duy trì ổn định ngay cả khi có hơn 400 quái vật cùng lúc là nhờ vào **7 quy tắc kiến trúc bất biến** dưới đây. Bất kỳ sự vi phạm nào đối với các quy tắc này đều có thể gây tràn VRAM, giật lag tụt FPS hoặc làm đen toàn bộ màn hình game.

---

## 💎 QUY TẮC 1: BẢO VỆ MẶT SÀN KÍNH TRONG SUỐT (`surfaceCanvas` `alpha: true`)

* **Khởi tạo bắt buộc**:
  ```javascript
  const surfaceCtx = surfaceCanvas.getContext("2d", { alpha: true });
  ```
* **Lý do kỹ thuật**:
  * Canvas mặt sàn có kích thước bản đồ $5200 \times 3600\text{ px}$.
  * Từ **Map 2 đến Map 10**, mặt sàn các căn phòng trạm không gian được thiết kế bằng kính bán trong suốt (`rgba(..., 0.42 - 0.55)`), các khoảng trống bên ngoài phòng được xóa trong suốt (`surfaceCtx.clearRect`) để người chơi nhìn xuyên thấu xuống cảnh nền Vũ trụ, Sao Hải Vương, Tinh vân, Băng giá và Dung nham phía dưới.
* **Cấm kỵ**:
  > [!CAUTION]
  > **Tuyệt đối KHÔNG gán `{ alpha: false }`** cho `surfaceCanvas` với suy nghĩ "tối ưu RAM". Nếu đặt `alpha: false`, toàn bộ các vùng không gian trong suốt sẽ bị trình duyệt tô đen đặc xì, phá hủy 100% vẻ đẹp đồ họa của các màn chơi từ Map 2 trở đi!

---

## 🚀 QUY TẮC 2: TRIỆT TIÊU 100% `ctx.shadowBlur` THỜI GIAN THỰC (GPU PRE-BAKING)

* **Nguyên nhân gây tụt FPS**:
  * Lệnh `ctx.shadowBlur` trong Canvas 2D bắt buộc CPU phải thực hiện phép tính làm mờ Gaussian (Gaussian Blur) trên từng pixel trong mỗi frame 60Hz. Khi có nhiều vật thể phát sáng (Kén ngủ đông, Máy gia tốc, Hào quang nhân vật, Quái vật), FPS sẽ lập tức rơi từ 60 xuống dưới 15 FPS.
* **Giải pháp chuẩn hóa**:
  * Mọi hiệu ứng phát sáng quanh vật thể đều được vẽ trước **duy nhất 1 lần** vào canvas phụ lúc tải trang qua các hàm:
    * `bakeCustomPlayerSkinToGpu()`
    * `bakeCustomCryoPodToGpu()`
    * `bakeCustomParticleAcceleratorToGpu()`
    * `bakeCustomEntityStripToGpu()`
  * Chuyển thẳng bitmap đã làm mờ lên VRAM thông qua hàm `promoteCanvasToGpuBitmap()` (`createImageBitmap`), sau đó giải phóng hoàn toàn canvas tạm (`c.width = 0; c.height = 0`).
  * Trong vòng lặp render `renderWorld()`, chỉ dùng lệnh vẽ ảnh siêu tốc:
    ```javascript
    ctx.drawImage(bakedGlowSprite, drawX, drawY, drawW, drawH);
    ```
    kết hợp với `ctx.globalAlpha` hoặc `ctx.globalCompositeOperation = "lighter"`.

---

## 🎨 QUY TẮC 3: TÁI SỬ DỤNG `CanvasGradient` (CHỐNG GC CHURN)

* **Nguyên nhân**:
  * Việc gọi `ctx.createRadialGradient` hoặc `ctx.createLinearGradient` mới trong vòng lặp 60Hz tạo ra hàng chục nghìn đối tượng rác mỗi giây, khiến bộ thu gom rác (Garbage Collector) của trình duyệt kích hoạt liên tục, gây ra các cú giật khựng (Micro-stuttering).
* **Giải pháp chuẩn hóa**:
  * Luôn sử dụng hai hàm cache dùng chung:
    ```javascript
    getCachedRadialGradient(ctx, key, x0, y0, r0, x1, y1, r1, colorStops);
    getCachedLinearGradient(ctx, key, x0, y0, x1, y1, colorStops);
    ```
  * Đối với các hiệu ứng có kích thước biến thiên như vệt lửa sàn (`firePatches`) hoặc hồ phóng xạ (`nuclearPools`), luôn **làm tròn bán kính theo bước 4px** (`Math.round(r / 4) * 4`) để tái sử dụng tối đa gradient trong bộ nhớ cache.

---

## 🗂️ QUY TẮC 4: LƯỚI KHÔNG GIAN PHÂN VÙNG VẬT CẢN TĨNH ($O(1)$ SPATIAL HASH GRID)

* **Vấn đề khi có 400+ quái vật**:
  * Nếu duyệt tuyến tính mảng 300+ chướng ngại vật (`WALLS`, bàn điều khiển, kén ngủ đông, máy gia tốc, rào chắn, bồn hóa chất, thùng tiếp tế) cho 400 quái vật mỗi frame, CPU phải thực hiện trên 120,000 phép tính va chạm hình học/frame.
* **Giải pháp Spatial Hash Grid**:
  * Bản đồ $5200 \times 3600$ được phân chia thành lưới $26 \times 18 = 468$ ô, kích thước mỗi ô là `OBS_GRID_CELL = 200px`.
  * Các hàm va chạm:
    * `resolveWallSliding(entity)` (Trượt mép tường)
    * `circleHitsStaticObstacle(x, y, pad)` (Va chạm hình tròn)
    * `pointHitsWall(x, y)` (Đạn bắn trúng tường)
    * `hasLineOfSight(x1, y1, x2, y2)` (Kiểm tra che chắn tầm nhìn)
  * Chỉ truy vấn các ô lưới nằm trực tiếp quanh đối tượng (1–4 ô), giảm số phép thử va chạm từ 300+ xuống trung bình 2–4 vật cản (**giảm 98.7% tải tính toán CPU**).
  * Giữ nguyên vẹn 100% công thức toán học tính lực đẩy trượt (`overlap`) và tiếp xúc điểm, bảo toàn cảm giác di chuyển mượt mà.

---

## 🧠 QUY TẮC 5: BỘ ĐỆM THÔNG THOÁNG AI & SCREEN LOD

1. **Bộ Đệm Thông Thoáng Raycast Xen Kẽ (AI Clearance Interleaved Cache)**:
   * Quá trình kiểm tra thông thoáng đường đi `hasPathClearance()` của quái vật được lưu cache 3 frame so le theo mã định danh `e.id % 3`.
   * Giảm 66% số lượng tia raycast kiểm tra địa hình mà quái vật vẫn luồn lách qua chướng ngại vật cực kỳ nhạy bén.
2. **Screen LOD Ngoài Màn Hình (`dist > 1100px`)**:
   * Quái vật nằm ngoài khung nhìn người chơi (> 1100px) được giãn cách nhịp tính toán góc lái phức tạp sang 3 frame/lần.
3. **Bảo Toàn Thuật Toán Tìm Đường Bầy Đàn (BFS Flow Field 11,700 Ô)**:
   * Bản đồ trường véc-tơ Gradient Flow Field với 11,700 ô vẫn được cập nhật độc lập, đảm bảo quái vật từ mọi ngóc ngách bản đồ luôn biết tìm đường ngắn nhất để bao vây người chơi.

---

## ⏱️ QUY TẮC 6: FRAME PACER & SELF-HEALING WATCHDOG (400MS)

* **Nguyên nhân gây treo màn hình (Freeze Bug)**:
  * Trước đây, khi người chơi mở/đóng Kho Vũ Khí `[B]`, Cài đặt `[ESC]` hoặc màn hình chuyển Map, hàm `resetFramePacer()` hủy timer nhưng không kích hoạt lại frame kế tiếp khiến vòng lặp game chết đứng.
* **Cơ chế Khắc phục Triệt để**:
  1. Trong `resetFramePacer()`: Luôn kiểm tra điều kiện an toàn:
     ```javascript
     if (!loopRafId && !loopTimeoutId) {
         scheduleNextFrame();
     }
     ```
  2. **Watchdog Tự Phục Hồi 400ms**:
     * Một timer chạy ngầm độc lập mỗi 400ms: nếu phát hiện `performance.now() - lastLoopHeartbeat > 350` mà không có requestAnimationFrame nào đang chờ, nó sẽ **ngay lập tức đánh thức lại vòng lặp game**.
  3. **Khắc phục Spike Giật Hình khi Resume Game**:
     * Trong hàm `resumeGame()`, luôn gọi `resetFramePacer()` trước khi mở cờ `isPaused = false` để làm mới `loopLastTime`, tránh việc vòng lặp dồn 5 tick vật lý liên tiếp trong frame đầu tiên.

---

## 🛡️ QUY TẮC 7: MÔ HÌNH LAI WEBGL POST-PROCESSING FAIL-SAFE

Để mang lại đồ họa điện ảnh (Cinematic Visuals) mà vẫn an toàn 100% trên mọi nền tảng:

```mermaid
flowchart TD
    START["Kiểm tra Giao thức (window.location.protocol)"]
    START -->|Giao thức file:/// (Local Offline)| FILE_MODE["Tắt WebGL Canvas (display = none)<br>Chạy Canvas 2D Thuần Túy 100%<br>Tránh lỗi CORS Tainted Canvas gây đen màn hình"]
    START -->|Giao thức http: / https: (Web / Vercel)| WEB_MODE["Kích hoạt WebGL Shader GLSL ES 1.0<br>Neon Bloom, Chromatic Aberration, CRT, Vignette"]
    WEB_MODE --> FAIL_SAFE{"Lỗi Runtime / Mất Context GPU?"}
    FAIL_SAFE -->|Có Lỗi| AUTO_HIDE["Tự động ẩn WebGL Canvas (display = none)<br>Lộ Canvas 2D bên dưới ngay lập tức (Zero Black Screen)"]
    FAIL_SAFE -->|Bình Thường| RENDER_OK["Hiển thị Đồ họa Điện ảnh 60 FPS"]
```

* **Tiêu Chuẩn Không Bao Giờ Đen Màn Hình (Zero-Black-Screen Standard)**:
  * `gameCanvas` 2D luôn ở trạng thái hiển thị 100% (`opacity: 1`, `display: block`).
  * `webglCanvas` được lồng đè lên trên với thuộc tính `pointer-events: none`.
  * Toàn bộ mã nạp texture WebGL và vẽ shader được bọc kín trong khối `try/catch`. Nếu GPU gặp sự cố hoặc trình duyệt chặn đọc pixel, WebGL canvas lập tức tự ẩn đi, để lộ Canvas 2D bên dưới mà người chơi không hề nhận thấy gián đoạn.

---

## 🧹 DỌN DẸP TÀI NGUYÊN (CLEANUP PROTOCOL)

* **Web Audio API**:
  * Mọi `AudioBufferSourceNode` và `OscillatorNode` đều bắt buộc đăng ký sự kiện:
    ```javascript
    source.onended = () => {
        try { source.disconnect(); gain.disconnect(); } catch (e) {}
    };
    ```
  * Triệt tiêu hoàn toàn rò rỉ AudioNode trong Audio Graph của trình duyệt.
* **Mạng Co-Op**:
  * Khi người chơi trở về sảnh chờ hoặc chơi đơn (Solo), bắt buộc gọi `XENO_COOP.cleanup()` để ngắt toàn bộ timer ping, ngắt kết nối WebSocket/WebRTC và làm rỗng mảng `teammate.snapshotBuffer = []`.

