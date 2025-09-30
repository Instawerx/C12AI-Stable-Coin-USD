#!/bin/bash
# Firebase Emulators Startup Script for Linux/macOS
# C12USD Project - c12ai-dao-b3bbb

set -e

echo "========================================"
echo "Starting Firebase Emulators"
echo "Project: c12ai-dao-b3bbb"
echo "========================================"
echo ""

# Change to project root directory
cd "$(dirname "$0")/.."

echo "[INFO] Checking Firebase CLI installation..."
if ! command -v firebase &> /dev/null; then
    echo "[ERROR] Firebase CLI not found. Install it:"
    echo "npm install -g firebase-tools"
    exit 1
fi

firebase --version
echo ""

echo "[INFO] Starting emulators..."
echo ""
echo "Emulator URLs:"
echo "  - Auth:        http://localhost:9099"
echo "  - Firestore:   http://localhost:8080"
echo "  - Storage:     http://localhost:9199"
echo "  - Hosting:     http://localhost:5000"
echo "  - Emulator UI: http://localhost:4000"
echo ""

# Start emulators with import/export
firebase emulators:start --project=c12ai-dao-b3bbb \
  --import=./emulator-data \
  --export-on-exit=./emulator-data

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Failed to start emulators"
    echo ""
    echo "Possible causes:"
    echo "  1. Ports already in use"
    echo "  2. Firestore rules file missing"
    echo "  3. Firebase project not configured"
    echo ""
    echo "To fix port conflicts, kill processes on:"
    echo "  lsof -ti:9099 | xargs kill -9"
    echo "  lsof -ti:8080 | xargs kill -9"
    echo "  lsof -ti:9199 | xargs kill -9"
    echo "  lsof -ti:5000 | xargs kill -9"
    echo "  lsof -ti:4000 | xargs kill -9"
    echo ""
    exit 1
fi
