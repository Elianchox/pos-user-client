# POS User Client

Expo 55, React Native 0.83, expo-router, TypeScript.

## Key facts

- **Entrypoint**: `expo-router/entry` (not `App.tsx`). Routes live in `src/app/`.
- **No test runner** installed. There is no `npm test`.
- **No typecheck script**. `tsc` is not in `package.json`. TypeScript errors surface in-editor only.
- **Single lint command**: `npm run lint` (ESLint, flat config at `eslint.config.js`).
- `app.json` enables `reactCompiler` and `typedRoutes` experiments.

## Architecture

Horizontal by type. Route files in `app/` import and render from `screens/`.

```
src/
├── app/          expo-router routes (thin wrappers)
├── screens/      business logic & page layout
├── components/   reusable UI
├── hooks/        custom hooks
├── services/     API / business logic
├── types/        TS types & interfaces
├── constants/    app-wide constants
├── utils/        pure helpers
└── context/      React context providers
```

Path aliases: `@/` → `src/`, `@/assets/` → `assets/` (set in `tsconfig.json`).

## Known quirks

- `reset-project` script in `package.json` is stale (scripts/ dir removed). No need to run it.
- Splash screen plugin only has Android config. iOS uses the Expo icon at `assets/expo.icon/`.
- `app.json` → `scheme: "posuserclient"`. Used for deep linking.

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npx expo start` (or `npm start`) |
| Android | `npm run android` |
| iOS | `npm run ios` |
| Web | `npm run web` |
| Lint | `npm run lint` |

## Expo 55

- Applies to all codegen, plugin, and API decisions.
- Docs: https://docs.expo.dev/versions/v55.0.0/
- Do NOT use unversioned docs.

## Constraints

- Do NOT create `.md` files unless asked.
- `CLAUDE.md` delegates to this file via `@AGENTS.md`.
