# POS User Client

Expo 55, React Native 0.83, expo-router, TypeScript.

## Key facts

- **Entrypoint**: `expo-router/entry` (not `App.tsx`). Routes live in `src/app/`.
- **No test runner** installed. There is no `npm test`.
- **No typecheck script**. TypeScript errors surface in-editor only.
- **Single lint command**: `npm run lint` (ESLint, flat config at `eslint.config.js`).
- `app.json` enables `reactCompiler` and `typedRoutes` experiments.

## Styling

NativeWind v4 + TailwindCSS v4. Use `className` strings, not `StyleSheet.create`.
Theme is defined via CSS custom properties in `src/global.css` with a `.dark` variant.
Color tokens are accessed as Tailwind classes: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, etc.

## Data fetching

`@tanstack/react-query` v5. Hooks in `src/hooks/api/` wrap `useQuery`/`useMutation`.
API layer pattern: `constants/api.ts` (URLs) → `types/api.ts` (types) → `services/api/` (fetch via `apiFetch` with auto auth header) → `hooks/api/` (React Query wrappers).

Real-time order updates use SSE via `@microsoft/fetch-event-source` (`src/services/sse/client.ts`).

## State & persistence

- **Session**: AsyncStorage stores `mobile_session_token` and `mobile_table_id`.
  `SessionContext` exposes `useSession()` in `src/context/SessionContext.tsx`.
- **Theme**: `ThemeContext` exposes `useTheme()` in `src/context/ThemeContext.tsx`.
- Both providers are wired in `src/app/_layout.tsx` along with `QueryClientProvider`.

## Environment

- `EXPO_PUBLIC_API_URL` is the API base URL (Expo `EXPO_PUBLIC_` prefix).
- Define in `.env` file (gitignored).
- Default: `https://pos.eliancho.dev/api/mobile`

## Expo 55

- Docs: https://docs.expo.dev/versions/v55.0.0/
- Do NOT use unversioned docs.

## Constraints

- Do NOT create `.md` files unless asked.
- `CLAUDE.md` delegates to this file via `@AGENTS.md`.
