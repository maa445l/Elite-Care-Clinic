@echo off
title Build the Elite Care Clinic installer
cd /d "%~dp0"
echo ============================================================
echo  Elite Care Clinic: building the Windows installer
echo  This needs the internet ONCE. It can take 5 to 15 minutes.
echo ============================================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install the LTS version from https://nodejs.org , restart the computer, then run this file again.
  pause
  exit /b 1
)
set CSC_IDENTITY_AUTO_DISCOVERY=false
echo Step 1 of 2: downloading the building tools...
call npm install
if errorlevel 1 (
  echo.
  echo npm install failed. Check the internet connection and try again.
  pause
  exit /b 1
)
echo.
echo Step 2 of 2: building the installer...
call npm run dist
if errorlevel 1 (
  echo.
  echo The build failed. If you see "Cannot create symbolic link", close this window,
  echo right-click BUILD-INSTALLER.bat and choose "Run as administrator".
  pause
  exit /b 1
)
echo.
echo ============================================================
echo  Done. Your installer is in the "dist" folder:
echo  Elite Care Clinic Setup 1.0.0.exe
echo ============================================================
explorer dist
pause
