# 🛸 Project Xeno: Reloaded — Fullstack Online Edition

> **Website Live (Vercel)**: [https://project-xeno-online.vercel.app](https://project-xeno-online.vercel.app)  
> **GitHub Repository**: [https://github.com/hoanganphatcctv-ctrl/project-xeno-online](https://github.com/hoanganphatcctv-ctrl/project-xeno-online)

---

## 📚 TÀI LIỆU BÀN GIAO CHO TRỢ LÝ AI & NHÀ PHÁT TRIỂN

Khi bắt đầu phiên làm việc mới, vui lòng đọc theo thứ tự ưu tiên sau để nắm bắt toàn bộ kiến trúc và cơ cấu logic tối ưu hiện tại:

1. **[`HUONG_DAN_CHO_AI_PHIEN_TIEP_THEO.md`](./HUONG_DAN_CHO_AI_PHIEN_TIEP_THEO.md)**: Cẩm nang bàn giao hệ thống, bảng tra cứu hàm/ID cốt lõi, quy tắc tối ưu VRAM/RAM, cơ chế `carryOver` khi chơi lại vs. qua màn, giao diện `MISSION COMPLETED`, Asset Máy Gia Tốc & Mini Map.
2. **[`../KE_HOACH_TOI_UU_HIEU_NANG_VA_SUA_LOI.md`](../KE_HOACH_TOI_UU_HIEU_NANG_VA_SUA_LOI.md)**: Nhật ký hoàn thành 100% cả 3 Giai đoạn tối ưu hiệu năng, bảo mật và gameplay.
3. **[`../PROJECT_ARCHITECTURE_GUIDE.md`](../PROJECT_ARCHITECTURE_GUIDE.md)**: Kiến trúc tổng thể hệ thống, mạng Hybrid Co-Op 60Hz/30Hz và Cloud Database.
4. **[`../HUONG_DAN_DAT_TEN_ASSET.md`](../HUONG_DAN_DAT_TEN_ASSET.md)**: Quy chuẩn đặt tên và cơ chế nạp/pre-bake Asset tùy chỉnh.

---

## ⚡ LỆNH ĐÓNG GÓI NHANH (BUILD PRODUCTION)

Sau mọi chỉnh sửa tại `frontend/index.html`, chạy lệnh sau để nén `game.min.js` và đồng bộ cả `dist/` lẫn `frontend/dist/`:

```powershell
node build.cjs
```

<!-- deploy-trigger: vercel sync -->
