# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

## Project structure

Architecture: **horizontal by type**. Files grouped by role, not feature.

```
src/
├── app/          expo-router routes (thin wrappers only)
├── screens/      page-level components ← business logic lives here
├── components/   reusable UI components
├── hooks/        custom React hooks
├── services/     API calls, business logic layer
├── types/        TypeScript types and interfaces
├── constants/    app-wide constants
├── utils/        pure helper functions
└── context/      React context providers
```

Route files in `app/` must be thin — import and render from `screens/`.

## Paths

- `@/` → `./src/*`
- `@/assets/*` → `./assets/*`

## Commands

| Action | Command |
|--------|---------|
| Start dev server | `npx expo start` |
| Lint | `npm run lint` |

## Routing

- File-based routing via expo-router
- `app/_layout.tsx` sets the root Stack navigator
- See https://docs.expo.dev/router/introduction

## Conventions

- Avoid comments in components unless necessary
- Mimic existing code style in the file being modified
- Do NOT create `.md` documentation files unless explicitly requested
