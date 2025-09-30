@echo off
REM Firebase Emulators Startup Script for Windows
REM C12USD Project - c12ai-dao-b3bbb

echo ========================================
echo Starting Firebase Emulators
echo Project: c12ai-dao-b3bbb
echo ========================================
echo.

REM Change to project root directory
cd /d %~dp0..

echo [INFO] Checking Firebase CLI installation...
firebase --version
if errorlevel 1 (
    echo [ERROR] Firebase CLI not found. Install it:
    echo npm install -g firebase-tools
    exit /b 1
)

echo.
echo [INFO] Starting emulators...
echo.
echo Emulator URLs:
echo   - Auth:      http://localhost:9099
echo   - Firestore: http://localhost:8080
echo   - Storage:   http://localhost:9199
echo   - Hosting:   http://localhost:5000
echo   - Emulator UI: http://localhost:4000
echo.

REM Start emulators with import/export
firebase emulators:start --project=c12ai-dao-b3bbb ^
  --import=./emulator-data ^
  --export-on-exit=./emulator-data

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start emulators
    echo.
    echo Possible causes:
    echo   1. Ports already in use
    echo   2. Firestore rules file missing
    echo   3. Firebase project not configured
    echo.
    echo To fix port conflicts, kill processes on:
    echo   netstat -ano ^| findstr :9099
    echo   netstat -ano ^| findstr :8080
    echo   netstat -ano ^| findstr :9199
    echo   netstat -ano ^| findstr :5000
    echo   netstat -ano ^| findstr :4000
    echo.
    pause
    exit /b 1
)
