# POS User Client

Mobile point-of-sale client built with Expo.

## Stack

- **Framework:** Expo 55
- **Runtime:** React Native 0.83, React 19
- **Routing:** expo-router (file-based)
- **Language:** TypeScript

## Quick start

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` (Android), `i` (iOS), `w` (web).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Start for Android |
| `npm run ios` | Start for iOS |
| `npm run web` | Start for web |
| `npm run lint` | Run Expo ESLint |

## Project structure

```
src/
├── app/          # expo-router file-based routes
│   ├── _layout.tsx
│   └── index.tsx
├── screens/      # Page-level components
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── services/     # API / business logic
├── types/        # TypeScript type definitions
├── constants/    # App constants
├── utils/        # Helper functions
└── context/      # React context providers
```

Architecture is **horizontal by type** — files are grouped by their role (component, screen, hook, etc.), not by feature domain.

Path aliases: `@/` → `./src/*`, `@/assets/*` → `./assets/*` (configured in `tsconfig.json`).
