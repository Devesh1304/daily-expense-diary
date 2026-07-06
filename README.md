# Daily Expense Diary

A cash / ledger expense diary built with Expo + React Native + Firebase. Runs on Android (APK), iOS, and web from a single codebase.

## Features

- **Cash book** — credit/debit entries with Today/Week/Month/Custom filters, sortable table, running totals, and a closing balance.
- **Ledger** — every account (customer, supplier, bank, other) with its net balance, filterable by category, with a per-account transaction history.
- **Cloud sync** — Firebase Auth (email/password) + Firestore, so your diary follows you across devices and survives a phone reset.

## Getting Started

1. Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to create your free Firebase project and paste your config into `src/firebase/config.ts`.
2. Install dependencies (already done if you're reading this right after scaffolding):
   ```bash
   npm install
   ```
3. Run it:
   ```bash
   npx expo start          # scan QR with Expo Go for Android/iOS
   npx expo start --web    # open directly in a browser
   ```

## Project Structure

```
src/
  firebase/       Firebase config + Firestore CRUD functions
  context/        AuthContext (login state), TransactionsContext (live data)
  navigation/      Auth stack, bottom tabs, ledger stack
  screens/        Login, Signup, Home, CashScreen, Ledger, LedgerDetail
  components/     FilterPills, TransactionTable, TotalsBar, AddTransactionModal, DateField, LedgerAccountRow
  types/          Shared TypeScript types
  utils/          Date range + currency formatting helpers
  theme/          Shared colors
```

## Building the APK

See the "Building the Android APK Later" section in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) — it uses `eas build -p android --profile preview` with your own free Expo account.

## Deploying the web build to GitHub Pages

This repo ships with `.github/workflows/deploy.yml`, which builds the app as a static site (`npx expo export -p web`) and publishes it to GitHub Pages automatically on every push to `main`.

One-time setup:

1. Push this repo to GitHub (as `daily-expense-diary`, or update `expo.experiments.baseUrl` in `app.json` to match whatever name you use — it must be `/your-repo-name`).
2. In the repo on GitHub: **Settings → Pages → Source → GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab) — the site will appear at `https://<your-username>.github.io/daily-expense-diary/`.
4. In the Firebase console: **Authentication → Settings → Authorized domains → Add domain**, and add `<your-username>.github.io`. Without this, sign-in/sign-up will fail on the deployed site with an `auth/unauthorized-domain` error.
