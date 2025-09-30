@echo off
echo ====================================================================
echo C12USD Trust Wallet Submission - Automated Setup
echo ====================================================================
echo.
echo This script will help you submit your C12USD icon to Trust Wallet
echo.
echo PREREQUISITES:
echo [x] Icon optimized (9.5KB - DONE!)
echo [x] info.json files created (DONE!)
echo [ ] GitHub account (you need this)
echo [ ] Git installed (will check...)
echo.
pause

echo Checking if Git is installed...
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed!
    echo Please download from: https://git-scm.com/downloads
    echo After installing Git, run this script again.
    pause
    exit /b 1
)
echo [OK] Git is installed!
echo.

echo ====================================================================
echo STEP 1: Fork Trust Wallet Repository
echo ====================================================================
echo.
echo Please complete these steps in your browser:
echo.
echo 1. Go to: https://github.com/trustwallet/assets
echo 2. Click the "Fork" button (top right corner)
echo 3. Wait for the fork to complete
echo 4. You'll be redirected to YOUR fork
echo 5. Copy your GitHub username from the URL
echo.
echo Example: If URL is https://github.com/carnival12/assets
echo Then your username is: carnival12
echo.
set /p GITHUB_USERNAME="Enter your GitHub username: "

if "%GITHUB_USERNAME%"=="" (
    echo [ERROR] Username cannot be empty!
    pause
    exit /b 1
)

echo.
echo Your GitHub username: %GITHUB_USERNAME%
echo Your fork URL: https://github.com/%GITHUB_USERNAME%/assets
echo.
set /p CONFIRM="Is this correct? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Please run the script again.
    pause
    exit /b 1
)

echo.
echo ====================================================================
echo STEP 2: Cloning Your Fork
echo ====================================================================
echo.
cd C:\Users\tabor\Downloads
echo Cloning repository...
git clone https://github.com/%GITHUB_USERNAME%/assets.git
if errorlevel 1 (
    echo [ERROR] Failed to clone repository!
    echo Please check:
    echo - Your GitHub username is correct
    echo - You have forked the repository
    echo - Your internet connection is working
    pause
    exit /b 1
)
echo [OK] Repository cloned!
echo.

echo ====================================================================
echo STEP 3: Creating BSC Token Directory
echo ====================================================================
echo.
cd assets\blockchains\smartchain\assets
mkdir 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
cd 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
echo [OK] BSC directory created!
echo.

echo ====================================================================
echo STEP 4: Copying BSC Files
echo ====================================================================
echo.
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\logo.png" logo.png
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\info.json" info.json
echo [OK] BSC files copied!
echo.
dir
echo.
pause

echo ====================================================================
echo STEP 5: Creating Polygon Token Directory
echo ====================================================================
echo.
cd ..\..\..
cd blockchains\polygon\assets
mkdir 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
cd 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
echo [OK] Polygon directory created!
echo.

echo ====================================================================
echo STEP 6: Copying Polygon Files
echo ====================================================================
echo.
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\logo.png" logo.png
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\info.json" info.json
echo [OK] Polygon files copied!
echo.
dir
echo.
pause

echo ====================================================================
echo STEP 7: Committing Changes
echo ====================================================================
echo.
cd ..\..\..\..\
git status
echo.
echo Adding files to Git...
git add .
git commit -m "Add C12USD stablecoin (BSC + Polygon)"
echo [OK] Changes committed!
echo.
pause

echo ====================================================================
echo STEP 8: Pushing to Your Fork
echo ====================================================================
echo.
echo Pushing changes to GitHub...
git push origin master
if errorlevel 1 (
    echo.
    echo [INFO] If you see authentication error, you need to:
    echo 1. Create a Personal Access Token on GitHub
    echo 2. Go to: https://github.com/settings/tokens
    echo 3. Generate new token with 'repo' permissions
    echo 4. Use token as password when prompted
    echo.
    pause
    git push origin master
)
echo [OK] Changes pushed!
echo.

echo ====================================================================
echo STEP 9: Create Pull Request
echo ====================================================================
echo.
echo Now go to: https://github.com/%GITHUB_USERNAME%/assets
echo.
echo You should see a banner saying "Your recently pushed branches"
echo Click "Compare & pull request"
echo.
echo OR manually:
echo 1. Click "Pull requests" tab
echo 2. Click "New pull request"
echo 3. Click "Create pull request"
echo.
pause

echo ====================================================================
echo SUCCESS! Next Steps:
echo ====================================================================
echo.
echo 1. Fill in the Pull Request details (see PR_TEMPLATE.txt)
echo 2. Submit the Pull Request
echo 3. Wait for Trust Wallet team review (3-7 days)
echo 4. Respond to any feedback quickly
echo.
echo Your submission is complete! Check your email for updates.
echo.
echo ====================================================================
pause