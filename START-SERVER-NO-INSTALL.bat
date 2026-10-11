@echo off
title Elite Care Clinic server
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS version from https://nodejs.org and try again.
  pause
  exit /b 1
)
start "" cmd /c "timeout /t 3 >nul & start http://localhost:3737"
node server\index.js
pause
