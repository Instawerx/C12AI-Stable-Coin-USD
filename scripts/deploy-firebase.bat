@echo off
REM Firebase Deployment Script for Manual Payment System (Windows)
REM This script deploys Functions and Security Rules

echo.
echo ============================================
echo  Firebase Deployment Script
echo ============================================
echo.

REM Check we're in the right directory
if not exist "firebase.json" (
    echo ERROR: firebase.json not found
    echo Please run this script from the C12USD directory
    exit /b 1
)

REM Check login status
echo Checking Firebase login status...
firebase login:list
echo.

echo Current Firebase Project:
firebase use
echo.

set /p CONFIRM="Continue with deployment? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Deployment cancelled.
    exit /b 0
)

REM Step 1: Deploy Security Rules
echo.
echo ============================================
echo Step 1: Deploying Security Rules
echo ============================================
echo - Firestore Rules
echo - Storage Rules
echo.

firebase deploy --only firestore:rules,storage:rules

if %errorlevel% neq 0 (
    echo ERROR: Security rules deployment failed
    exit /b 1
)

echo.
echo SUCCESS: Security rules deployed!
echo.

REM Step 2: Deploy Functions
echo ============================================
echo Step 2: Deploying Firebase Functions
echo ============================================
echo - manualPayments-createManualPayment
echo - manualPayments-submitPaymentProof
echo - manualPayments-verifyManualPayment
echo - manualPayments-getManualPayment
echo - manualPayments-listPayments
echo - manualPayments-getAnalytics
echo.

REM Check if node_modules exists in functions
if not exist "functions\node_modules" (
    echo Installing function dependencies...
    cd functions
    call npm install
    cd ..
)

firebase deploy --only functions:manualPayments

if %errorlevel% neq 0 (
    echo ERROR: Functions deployment failed
    exit /b 1
)

echo.
echo ============================================
echo  Deployment Complete!
echo ============================================
echo.
echo Deployed Components:
echo   [X] Firestore Security Rules
echo   [X] Storage Security Rules
echo   [X] Firebase Functions (6 endpoints)
echo.
echo Next Steps:
echo   1. Test functions: firebase functions:log
echo   2. Verify security rules in Firebase Console
echo   3. Set up admin user (see ADMIN_SETUP_INSTRUCTIONS.md)
echo   4. Test admin access to /admin/payments
echo.
echo For troubleshooting, see: DEPLOYMENT_GUIDE.md
echo.

pause
