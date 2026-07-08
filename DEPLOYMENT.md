# Daily Expense Diary - Deployment Guide

This guide covers deploying the **Daily Expense Diary** app on both Android (APK) and Web (GitHub Pages).

---

## 📱 Android APK Deployment

### **Option 1: Direct Installation (Single Device)**

#### Requirements:
- Android device (SDK 24+)
- USB cable or file transfer
- "Unknown sources" enabled in settings

#### Steps:

1. **Transfer APK to Device:**
   ```bash
   # Via USB cable
   adb push app-release.apk /sdcard/Download/
   
   # OR manually copy file via USB
   ```

2. **On Android Device:**
   - Open **File Manager**
   - Navigate to **Downloads**
   - Tap `app-release.apk`
   - Tap **Install**
   - Grant permissions if prompted
   - Wait for installation to complete

3. **Launch App:**
   - Find "Daily Expense Diary" in apps
   - Tap to open
   - Sign up or login

---

### **Option 2: Distribute via Cloud**

#### Using Google Drive:
1. Upload APK to Google Drive
2. Share link with users
3. Users download and install (see Option 1 steps 2-3)

#### Using GitHub Releases:
1. Go to your repository: https://github.com/Devesh1304/daily-expense-diary
2. Click **Releases** → **Create new release**
3. Tag: `v1.0.0`
4. Upload `app-release.apk`
5. Share release URL with users

#### Using Web Server:
1. Upload APK to web hosting
2. Share download link
3. Users download and install

---

### **Rebuilding APK (After Code Changes)**

#### Prerequisites:
- Java Development Kit (JDK 17+)
- Android SDK (API 35+)
- Expo CLI: `npm install -g expo-cli`

#### Steps:

```bash
# Navigate to project directory
cd D:\react\Rojmel

# 1. Update code as needed
# 2. Increment version in app.json
#    "version": "1.0.1" (was 1.0.0)
#    "versionCode": 3 (was 2)

# 3. Prebuild Android files
npx expo prebuild -p android --clean

# 4. Build APK
cd android
set JAVA_HOME=C:/Program Files/Eclipse Adoptium/jdk-17.0.19.10-hotspot
set ANDROID_HOME=%LOCALAPPDATA%/Android/Sdk
./gradlew.bat assembleRelease

# 5. APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

#### App.json Version Update:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 3
    }
  }
}
```

---

### **Device Requirements**

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| **Android Version** | 7.0 (API 24) | 12+ (API 31+) |
| **Screen Size** | 4.5" | 5.0"+ |
| **RAM** | 2GB | 4GB+ |
| **Storage** | 150MB free | 500MB+ |
| **Notch Support** | Any | Tested on notch devices |

---

### **Troubleshooting APK**

**Issue: "Unknown app from untrusted developer"**
- Solution: Settings → About → Tap Build Number 7x to enable Developer Mode
- Then: Settings → Developer Options → USB Debugging or Unknown Sources

**Issue: App crashes on login**
- Solution: Check Firebase credentials in `src/firebase/config.ts`
- Verify internet connection
- Clear app cache: Settings → Apps → Daily Expense Diary → Storage → Clear Cache

**Issue: APK won't install**
- Solution: Delete old version first
- Ensure device has 150MB+ free space
- Try on different device to verify APK integrity

**Issue: Notch content overlap**
- Solution: Already fixed (18px top padding)
- If still seeing overlap: Rebuild APK with latest code

---

## 🌐 Web App Deployment

### **Current Setup (GitHub Pages)**

The web app is **automatically deployed** every time you push to GitHub.

#### How It Works:
1. Code is pushed to `main` branch
2. GitHub Actions workflow triggers (`.github/workflows/deploy.yml`)
3. App builds with Metro bundler
4. Static files deploy to `gh-pages` branch
5. Live at: https://devesh1304.github.io/daily-expense-diary

---

### **Deploying Code Changes**

#### Quick Deployment:

```bash
# 1. Make your code changes
# 2. Stage files
git add .

# 3. Commit
git commit -m "Feature: add [feature name]

Detailed description of changes.

Co-Authored-By: Your Name <your.email@example.com>"

# 4. Push to GitHub
git push origin main

# 5. GitHub Actions automatically deploys
# Check status at: https://github.com/Devesh1304/daily-expense-diary/actions
```

#### Manual Verification:

```bash
# Test web build locally before pushing
npm run build:web

# Serve locally
npx expo start --web

# Visit http://localhost:19006 in browser
```

---

### **Custom Domain (Optional)**

To use your own domain instead of GitHub Pages:

1. **Add CNAME file:**
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push origin main
   ```

2. **Update DNS:**
   - Go to domain registrar (GoDaddy, Namecheap, etc.)
   - Point DNS to GitHub Pages:
     ```
     A record: 185.199.108.153
     A record: 185.199.109.153
     A record: 185.199.110.153
     A record: 185.199.111.153
     CNAME record: your-username.github.io
     ```

3. **Update app.json:**
   ```json
   {
     "expo": {
       "experiments": {
         "baseUrl": "/"
       }
     }
   }
   ```

---

### **Troubleshooting Web App**

**Issue: "Page not found" after deployment**
- Solution: Check `baseUrl` in `app.json`
- Current: `"/daily-expense-diary"`
- Should match repository name

**Issue: Blank white screen**
- Solution: Check browser console (F12)
- Verify Firebase config is correct
- Check network requests (failing API calls?)

**Issue: Login not working on web**
- Solution: Ensure Firebase credentials are public API key (not private key)
- Check CORS settings in Firebase console

**Issue: Date picker not working**
- Solution: Already fixed with DateField.web.tsx
- Uses native browser input type="date"

---

## 🔄 Continuous Deployment (CI/CD)

### **GitHub Actions Workflow**

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build:web
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web-build
```

### **How It Works:**
- Every push to `main` automatically builds and deploys
- No manual steps needed
- Rollback: Revert commit and push

---

## 📊 Firebase Configuration

### **Production Setup:**

1. **Firebase Project ID:** `expense-tracker-3d565`
2. **Authentication:** Email/Password enabled
3. **Firestore:** Production mode with security rules
4. **Data Location:** Follows Firestore defaults

### **Security Rules:**

```firestore
match /ledgerAccounts/{id} {
  allow read, write: if request.auth.uid == resource.data.userId;
}

match /transactions/{id} {
  allow read, write: if request.auth.uid == resource.data.userId;
}
```

Each user only sees their own data.

---

## 📈 Monitoring & Updates

### **Track Deployments:**

**APK:** Manual version increments
```json
"version": "1.0.0" → "1.0.1"
"versionCode": 2 → 3
```

**Web:** Auto-deployed on push
- Check: https://github.com/Devesh1304/daily-expense-diary/actions
- View logs for build status

### **Monitor Firebase:**

1. Visit Firebase Console
2. View real-time users, data usage
3. Check security rule violations
4. Monitor quota usage

---

## 🔐 Security Checklist

Before production release:

- [ ] Firebase API key is **public** (safe to commit)
- [ ] Private keys are **NOT in repo** (use environment variables)
- [ ] Security rules are **not in development mode**
- [ ] HTTPS enforced (GitHub Pages does this)
- [ ] User data is **properly isolated**
- [ ] No sensitive data logged in console
- [ ] APK signed with release key (current: auto-signed)

---

## 📋 Version History

| Version | Date | Changes | APK | Web |
|---------|------|---------|-----|-----|
| **1.0.0** | 2026-07-08 | Initial release | ✅ | ✅ |

---

## 🤝 Support & Feedback

**For bugs or issues:**
1. Check GitHub Issues: https://github.com/Devesh1304/daily-expense-diary/issues
2. Create new issue with details
3. Include: Device info, app version, steps to reproduce

**For feature requests:**
- Open GitHub Discussion
- Or email: devesh1304@gmail.com

---

## 📚 Additional Resources

- **Firebase Docs:** https://firebase.google.com/docs
- **Expo Docs:** https://docs.expo.dev
- **React Native Docs:** https://reactnative.dev
- **GitHub Pages:** https://pages.github.com

---

**Last Updated:** 2026-07-08  
**Maintained By:** Devesh  
**Contact:** devesh1304@gmail.com
