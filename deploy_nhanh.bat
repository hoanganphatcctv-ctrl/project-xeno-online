@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\nodejs;%PATH%"

echo ========================================================
echo PROJECT XENO: RELOADED - DEPLOY TO GITHUB AND VERCEL
echo ========================================================
echo.

echo [1/3] Packing distribution folders (dist)...
powershell -ExecutionPolicy Bypass -File "%~dp0..\build_minified.ps1"
if errorlevel 1 (
    echo [Fallback] Running node build.cjs...
    call node build.cjs
    cd frontend
    call node build.cjs
    cd ..
)

echo.
echo [2/3] Staging changes and committing to Git...
git add -A
git commit -m "feat(coop): dynamic remote server discovery from Google Sheets, multi-tier fallback, and hidden server URL"

echo.
echo [3/3] Pushing to GitHub (origin main)...
git pull origin main --no-rebase --no-edit
git push origin main

echo.
echo ========================================================
echo SUCCESS! Vercel is now deploying automatically at:
echo https://project-xeno-online.vercel.app
echo ========================================================
echo.
pause
