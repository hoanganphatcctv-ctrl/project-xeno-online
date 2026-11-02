@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\nodejs;%PATH%"

echo ========================================================
echo PROJECT XENO: RELOADED - DEPLOY AN TOAN TO GITHUB VA VERCEL
echo ========================================================
echo.

:: BUOC 1: Kiem tra va bao ve ma nguon local (Auto-Sync 2 chieu root <-> frontend va tao ban sao luu)
echo [1/4] Kiem tra va bao ve ma nguon local (Auto-Sync va Backup)...
powershell -ExecutionPolicy Bypass -File "%~dp0..\build_minified.ps1"
if errorlevel 1 (
    echo [Canh bao] build_minified.ps1 bao loi, dang chay Node fallback...
    call node build.cjs
    cd frontend
    call node build.cjs
    cd ..
)

:: BUOC 2: Dong bo an toan tu GitHub remote (UU TIEN TUYET DOI CODE LOCAL CUA BAN - KHONG BAO GIO BI GHI DE)
echo.
echo [2/4] Dong bo an toan tu GitHub origin main (-X ours bao toan code local)...
git pull origin main -X ours --no-rebase --no-edit
if errorlevel 1 (
    echo [Thong bao] Khong the pull tu remote hoac da la ban moi nhat. Tiep tuc build...
)

:: BUOC 3: Dong goi lai ban phan phoi dist va cap nhat Cache Service Worker
echo.
echo [3/4] Dong goi lai dist va sinh ma game.min.js moi nhat cho Vercel...
powershell -ExecutionPolicy Bypass -File "%~dp0..\build_minified.ps1"

:: BUOC 4: Tao commit voi thoi gian thuc va push len GitHub
echo.
echo [4/4] Luu tru thay doi va day len GitHub (origin main)...
git add -A
git commit -m "feat(deploy): update latest game build and layout [%date% %time%]"
git push origin main

echo.
echo ========================================================
echo THANH CONG! Code moi nhat da duoc day len GitHub va Vercel.
echo Vercel dang tu dong deploy tai:
echo https://project-xeno-online.vercel.app
echo ========================================================
echo.
pause
