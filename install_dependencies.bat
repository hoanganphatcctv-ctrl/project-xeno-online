@echo off
chcp 65001 > nul
title XENO CO-OP - CAI DAT DEPENDENCIES
echo ================================================================
echo   CAI DAT DEPENDENCIES CHO CA BACKEND VA FRONTEND
echo ================================================================

if exist "C:\Program Files\nodejs" set "PATH=C:\Program Files\nodejs;%PATH%"
if exist "%LOCALAPPDATA%\Programs\nodejs" set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] May cua ban chua cai dat Node.js!
    echo Vui long truy cap https://nodejs.org/ de tai va cai dat Node.js LTS truoc.
    pause
    exit /b 1
)

echo [1/2] Dang cai dat thu vien Backend (Node.js + Socket.io)...
cd /d "%~dp0backend"
call npm install

echo.
echo [2/2] Dang cai dat thu vien Frontend (React + Vite + Tailwind)...
cd /d "%~dp0frontend"
call npm install

echo.
echo ================================================================
echo   HOAN TAT CAI DAT! BAN CO THE CHAY start_backend.bat VA start_frontend.bat
echo ================================================================
pause

