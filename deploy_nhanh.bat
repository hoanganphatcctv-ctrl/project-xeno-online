@echo off
chcp 65001 >nul
title PROJECT XENO - DEPLOY NHANH BAN ONLINE
echo ========================================================
echo 🚀 PROJECT XENO: RELOADED - TỰ ĐỘNG DEPLOY BẢN ONLINE
echo ========================================================
echo.

:: Tự động nhận diện đường dẫn Node.js nếu máy chưa nạp PATH
if exist "%LOCALAPPDATA%\Programs\nodejs" set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
if exist "C:\Program Files\nodejs" set "PATH=C:\Program Files\nodejs;%PATH%"

echo [1/3] Đang đóng gói bản phân phối dist cho bản Online...
node build.cjs
cd frontend
node build.cjs
cd ..

echo.
echo [2/3] Đang lưu trữ thay đổi và tạo commit Git...
git add .
git commit -m "update: deploy quick changes to vercel"

echo.
echo [3/3] Đang đẩy lên GitHub origin main...
git push origin main

echo.
echo ========================================================
echo ✅ HOÀN TẤT! Vercel đang tự động deploy tại:
echo 👉 https://project-xeno-online.vercel.app
echo ========================================================
echo.
pause

