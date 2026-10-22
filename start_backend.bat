@echo off
chcp 65001 > nul
title XENO CO-OP - NODE.JS BACKEND SERVER
cd /d "%~dp0backend"
echo ================================================================
echo   DANG KHOI CHAY NODE.JS SOCKET.IO DEDICATED SERVER - PORT 4000
echo ================================================================
if exist "C:\Program Files\nodejs" set "PATH=C:\Program Files\nodejs;%PATH%"
if exist "%LOCALAPPDATA%\Programs\nodejs" set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"

where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] May cua ban chua nhan dien duoc Node.js!
    pause
    exit /b 1
)

call npm start
pause
