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

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
