# HobbyIt🎯

HobbyIt is a React Native mobile app that helps users track hobby practice sessions, monitor streaks, and view progress statistics.

## App Overview

HobbyIt is built with Expo + TypeScript and uses Firebase Firestore as the backend. The app supports:
- One-time onboarding with user profile creation
- Creating and managing hobbies
- Logging session duration by date
- Viewing per-hobby and overall stats
- Deleting hobbies and individual sessions with confirmations
- Offline-awareness messaging for network-dependent actions

## Main Features

- **Onboarding flow**
	- Splash screen checks local user session state
	- Welcome screen creates a user profile (name)
- **Hobby management**
	- Add hobbies with emoji icon selection
	- View hobby detail page with derived stats
	- Delete hobby (with cascade delete for related sessions)
- **Session tracking**
	- Log sessions by hobby, date, and duration
	- Validate date and duration inputs
	- Delete individual sessions (with confirmation)
- **Statistics**
	- Total hobbies, total hours, total sessions
	- Most practiced hobby
	- Recent sessions list

## Tech Stack

- **Framework**: React Native (Expo SDK 54) + TypeScript
- **Routing/Navigation**: Expo Router + React Navigation
- **State Management**: Zustand
- **Backend**: Firebase Firestore
- **Storage**: AsyncStorage
- **UI**: React Native Paper
- **Utilities**: NetInfo, DateTimePicker, Expo Vector Icons

## Project Structure

```text
MAD_miniproject/
├─ README.md
├─ SPEC.md
└─ hobby-tracker/
	 ├─ app/                    # Expo Router route entry files
	 ├─ src/
	 │  ├─ components/          # Reusable UI components
	 │  ├─ config/              # App configuration (Firebase, etc.)
	 │  ├─ constants/           # Theme/constants
	 │  ├─ screens/             # Screen containers/business logic
	 │  ├─ services/            # Firestore API layer
	 │  ├─ store/               # Zustand store
	 │  ├─ types/               # TS interfaces/types
	 │  └─ utils/               # Validation/date/helpers
	 ├─ .env.example            # Environment template
	 ├─ package.json
	 └─ tsconfig.json
```

## Installation & Setup

### 1) Prerequisites

- Node.js (LTS recommended)
- npm
- Expo Go app (for device testing) or emulator/simulator

### 2) Install dependencies

```bash
cd hobby-tracker
npm install
```

### 3) Configure environment variables

Create a `.env` file inside `hobby-tracker/` using `.env.example`:

```bash
cp .env.example .env
```

Then set your Firebase values:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_DATABASE_URL`

### 4) Run the app

```bash
npx expo start -c
```

From the Expo CLI menu, open Android, iOS, web, or Expo Go.

## Available Scripts

Run from `hobby-tracker/`:

- `npm run start` — start Expo dev server
- `npm run android` — open Android target
- `npm run ios` — open iOS target
- `npm run web` — run web target
- `npm run lint` — run lint checks

## Firebase Notes

- Firebase config is loaded from `EXPO_PUBLIC_*` env variables in `src/config/firebase.ts`.
- `.env` is git-ignored and should never be committed.
- `.env.example` is safe to commit and should contain placeholders only.

## Data Model Summary

- **User**: profile metadata and hobby references
- **Hobby**: hobby name/icon and computed stats
- **Session**: date + duration entries linked to hobby/user

See `SPEC.md` for full specification details.

## Troubleshooting

- If env variables are not picked up, restart Metro with cache clear:
	- `npx expo start -c`
- If Firebase initialization fails, verify all required `EXPO_PUBLIC_*` values are present in `.env`.

## License

This project is for educational/mini-project use.