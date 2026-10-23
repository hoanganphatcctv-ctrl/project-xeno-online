@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\nodejs;%PATH%"

echo ========================================================
echo PROJECT XENO: RELOADED - DEPLOY TO GITHUB & VERCEL
echo ========================================================
echo.

echo [1/3] Packing distribution folders (dist)...
call node build.cjs
cd frontend
call node build.cjs
cd ..

echo.
echo [2/3] Staging changes and committing to Git...
git add -A
git commit -m "feat(multiplayer): refactor host-authoritative enemy sync (dead reckoning, lerp, networkId, enemy hit and death)"

echo.
echo [3/3] Pushing to GitHub (origin main)...
git push origin main

echo.
echo ========================================================
echo SUCCESS! Vercel is now deploying automatically at:
echo https://project-xeno-online.vercel.app
echo ========================================================
echo.
pause
