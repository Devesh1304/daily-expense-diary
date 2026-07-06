# Firebase Setup Guide for Daily Expense Diary

## Step 1 — Create a Firebase Project (Free)

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name it: `daily-expense-diary` (or anything you like) → Continue
4. Disable Google Analytics (not needed) → **Create project**

---

## Step 2 — Add a Web App to Get Your Config

1. In your Firebase project, click the **`</>`** (Web) icon
2. Register app name: `daily-expense-diary`
3. Copy the `firebaseConfig` object shown — it looks like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "daily-expense-diary.firebaseapp.com",
  projectId: "daily-expense-diary",
  storageBucket: "daily-expense-diary.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456...",
};
```

4. Open `src/firebase/config.ts` in this project and **replace** the placeholder values with yours.

---

## Step 3 — Enable Email/Password Sign-In

1. In Firebase Console → **Authentication** → **Get started**
2. Under **Sign-in method**, enable **Email/Password**

---

## Step 4 — Create Firestore Database

1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in production mode** (we'll set proper rules below)
3. Choose a region (e.g., `asia-south1` for India) → **Enable**

---

## Step 5 — Set Firestore Security Rules

In Firebase Console → Firestore → **Rules**, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /transactions/{docId} {
      allow read, delete, update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /ledgerAccounts/{docId} {
      allow read, delete, update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Click **Publish**. This means every signed-in user can only ever read or write their own data.

---

## Step 6 — Run the App

```bash
cd D:\react\Rojmel
npx expo start          # then press 'w' for web, or scan the QR code with Expo Go
npx expo start --web    # opens directly in the browser
```

Sign up with an email + password on the app's first screen, then start adding Cash entries.

---

## Free Tier Limits (Firebase Spark Plan)

| Feature    | Free Limit           |
|------------|-----------------------|
| Reads      | 50,000 / day          |
| Writes     | 20,000 / day          |
| Storage    | 1 GB                  |
| Auth users | Unlimited             |
| Cost       | **₹0 forever**        |

Way more than a personal expense diary needs.

---

## Building the Android APK Later

Once you're happy testing in Expo Go / web, install EAS CLI and build:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

This needs your own free Expo account (`eas login`) — it isn't something that can be run for you automatically. The `preview` profile in `eas.json` is already configured to produce an installable `.apk` (not just an app-bundle).
