# Java Installation Required for Firebase Emulators

## Issue

Firebase Emulators require Java to be installed. Current error:

```
Error: Could not spawn `java -version`.
Please make sure Java is installed and on your system PATH.
```

## Quick Fix (10 minutes)

### Step 1: Download Java JDK

**Option A: Oracle JDK (Recommended)**
1. Visit: https://www.oracle.com/java/technologies/downloads/#jdk21-windows
2. Download: **Windows x64 Installer** (jdk-21_windows-x64_bin.exe)
3. Run installer (accepts defaults)

**Option B: Microsoft OpenJDK**
1. Run this command to install via winget:
```bash
winget install Microsoft.OpenJDK.21
```

**Option C: Adoptium Eclipse Temurin**
1. Visit: https://adoptium.net/temurin/releases/
2. Download: **JDK 21 LTS - Windows x64 .msi**
3. Run installer

### Step 2: Verify Java Installation

After installation, **restart your terminal** and run:

```bash
java -version
```

Expected output:
```
java version "21.0.x"
Java(TM) SE Runtime Environment (build 21.0.x)
Java HotSpot(TM) 64-Bit Server VM (build 21.0.x)
```

### Step 3: Verify Java is in PATH

```bash
where java
```

Expected output:
```
C:\Program Files\Java\jdk-21\bin\java.exe
```

If not found, add to PATH manually:
1. Search "Environment Variables" in Windows
2. Click "Environment Variables"
3. Under "System Variables", select "Path"
4. Click "Edit"
5. Click "New"
6. Add: `C:\Program Files\Java\jdk-21\bin`
7. Click OK on all dialogs
8. **Restart terminal**

## After Java Installation

Once Java is installed and verified, start Firebase Emulators:

```bash
cd /c/Users/tabor/Downloads/C12USD_project/C12USD
firebase emulators:start --project=c12ai-dao-b3bbb
```

## Why Java is Required

Firebase Emulators (especially Firestore and Auth) run on the JVM (Java Virtual Machine):
- **Firestore Emulator:** Local NoSQL database simulation
- **Auth Emulator:** Local authentication service
- **Storage Emulator:** Local file storage

These emulators provide a complete local testing environment without connecting to production Firebase services.

## Alternative: Skip Emulators (Not Recommended)

If you want to skip emulator testing and go directly to production:

1. Complete the 3 manual Firebase Console steps:
   - Download service account key
   - Create Firestore database
   - Enable authentication providers

2. Deploy directly to production:
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules --project=c12ai-dao-b3bbb

# Deploy hosting
firebase deploy --only hosting --project=c12ai-dao-b3bbb
```

⚠️ **Warning:** Deploying without emulator testing is risky and may result in bugs in production.

## Troubleshooting

### "java: command not found" after installation

**Solution:** Restart your terminal (or VS Code) completely.

### Multiple Java versions installed

Check which version is active:
```bash
java -version
```

If wrong version, update PATH to prioritize correct Java installation.

### Permission issues during installation

**Solution:** Run installer as Administrator (right-click → "Run as administrator")

## Next Steps After Java Installation

1. ✅ Install Java JDK 21
2. ✅ Verify: `java -version`
3. ✅ Start emulators: `firebase emulators:start`
4. ✅ Seed test data
5. ✅ Test user registration
6. ✅ Test MetaMask connection
7. ✅ Deploy to production
