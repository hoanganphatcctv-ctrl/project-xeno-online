# 🛸 Project Xeno: Reloaded — Fullstack Online Edition

> 🌐 **Website Live (Vercel CDN)**: [https://project-xeno-online.vercel.app](https://project-xeno-online.vercel.app)  
> 🚀 **Máy Chủ Socket.io Dedicated (Render)**: [https://project-xeno-online.onrender.com](https://project-xeno-online.onrender.com)  
> 📦 **Kho GitHub Chính Thức**: [https://github.com/hoanganphatcctv-ctrl/project-xeno-online](https://github.com/hoanganphatcctv-ctrl/project-xeno-online)

---

## 📚 TRUNG TÂM TÀI LIỆU CHÍNH THỨC (DOCS)

Toàn bộ tài liệu kiến trúc, mạng Co-Op, quy tắc hiệu năng, logic gameplay và quy trình đóng gói đã được chuẩn hóa duy nhất tại thư mục:  
👉 **[`docs/`](./docs/README.md)**

1. **[`docs/README.md`](./docs/README.md)**: Tổng quan hệ thống, tra cứu nhanh ID/Hàm cốt lõi và bảng mã Cheat.
2. **[`docs/01_KIEN_TRUC_HE_THONG_VA_MANG_COOP.md`](./docs/01_KIEN_TRUC_HE_THONG_VA_MANG_COOP.md)**: Mạng Hybrid 60Hz/30Hz, LERP, Dead Reckoning, Host-Authoritative, Dynamic Discovery & Fallback đa tầng.
3. **[`docs/02_QUY_TAC_VANG_HIEU_NANG_VA_DO_HOA.md`](./docs/02_QUY_TAC_VANG_HIEU_NANG_VA_DO_HOA.md)**: 7 Quy tắc vàng chống tụt FPS, VRAM ImageBitmap pre-baking, Spatial Hash Grid O(1), Sàn kính trong suốt.
4. **[`docs/03_LOGIC_GAMEPLAY_VU_KHI_VA_CAN_BANG.md`](./docs/03_LOGIC_GAMEPLAY_VU_KHI_VA_CAN_BANG.md)**: 7 loại vũ khí, sửa lỗi bắn liên tục chuột PC, cân bằng Boss 1-4, vòng tròn máy phát điện 360°, carryOver.
5. **[`docs/04_QUY_CHUAN_ASSET_VA_CLOUD_DATABASE.md`](./docs/04_QUY_CHUAN_ASSET_VA_CLOUD_DATABASE.md)**: Quy chuẩn đặt tên Asset, Google Sheets 5 tabs, Vercel Serverless Proxy và phòng thủ XSS.
6. **[`docs/05_HUONG_DAN_DONG_GOI_BUILD_VA_DEPLOY.md`](./docs/05_HUONG_DAN_DONG_GOI_BUILD_VA_DEPLOY.md)**: Quy trình nén Terser, deploy Vercel/Render 1-click và UptimeRobot.

---

## ⚡ LỆNH ĐÓNG GÓI NHANH (BUILD & DEPLOY)

Mọi chỉnh sửa chỉ thực hiện tại file: **`alien-shooter-fullstack/frontend/index.html`**.  
Sau đó chỉ cần chạy:
```powershell
.\deploy_nhanh.bat
```
Script sẽ tự động nén làm rối mã, đồng bộ sang `dist/` và đẩy thẳng lên Vercel Production.
