# Migrate Tailwind/NativeWind to StyleSheet.create + Theme Helpers

**Date**: 2026-05-17
**Status**: Approved

## Problem

NativeWind v5 (preview) with TailwindCSS v4 has unreliable style application in certain scenarios. Some `className` styles don't apply at runtime. The project needs a dependable styling system.

## Decision

Replace Tailwind/NativeWind entirely with React Native's built-in `StyleSheet.create` + a lightweight `makeStyles` factory that provides typed theme-aware styles.

- **Zero new dependencies** -- uses only React Native built-ins
- **Same color palette** -- all 32 tokens preserved from `global.css` (oklch values)
- **Same dark mode behavior** -- `useColorScheme()` drives theme automatically
- **~93 className usages across 18 files** to migrate

## Architecture

```
src/theme/
├── colors.ts        → lightTheme + darkTheme objects with all 32 color tokens, radii, spacing
├── types.ts         → AppTheme type
├── useAppTheme.ts   → hook wrapping useColorScheme(), returns resolved theme
└── makeStyles.ts    → factory: (theme: AppTheme) => NamedStyles, cached per theme
```

### Color palette

All color values from `src/global.css` `:root` and `.dark` blocks are preserved as JS objects. The 32 tokens:

| Token | Light | Dark |
|-------|-------|------|
| background | `oklch(1 0 0)` (white) | `oklch(0.14 0 0)` (base-950) |
| foreground | `oklch(0 0 0 / 0.8)` | `oklch(0.985 0 0)` (base-50) |
| card | white | base-900 |
| cardForeground | base-950 | base-50 |
| popover | white | base-900 |
| popoverForeground | black | base-50 |
| primary | base-900 | base-200 |
| primaryForeground | base-50 | base-900 |
| secondary | base-100 | base-800 |
| secondaryForeground | base-900 | base-50 |
| muted | base-100 | base-800 |
| mutedForeground | base-500 | base-400 |
| accent | base-100 | base-800 |
| accentForeground | base-900 | base-50 |
| destructive | red-600 | red-600 |
| destructiveForeground | white | white |
| success | green-600 | green-500 |
| successForeground | white | white |
| info | blue-600 | blue-500 |
| infoForeground | white | white |
| highlight | yellow-200 | yellow-800 |
| highlightForeground | base-950 | base-50 |
| border | base-200 | white-alpha-10 |
| border4 | base-400 | base-400 |
| input | white | white-alpha-15 |
| ring | base-300 | base-600 |
| sidebar | base-50 | base-900 |
| sidebarForeground | base-700 | base-50 |
| sidebarPrimary | base-900 | base-200 |
| sidebarPrimaryForeground | base-50 | base-50 |
| sidebarAccent | base-100 | base-800 |
| sidebarAccentForeground | base-900 | base-50 |
| sidebarBorder | base-200 | white-alpha-10 |
| sidebarRing | base-300 | base-600 |
| chart1-5 | oklch values | oklch dark variants |
| activeStatus | green-500 | green-500 |
| activeStatusForeground | white | white |
| inactiveStatus | red-500 | red-500 |
| inactiveStatusForeground | white | white |
| pendingStatus | yellow-500 | yellow-500 |
| pendingStatusForeground | white | white |

### makeStyles factory

```ts
makeStyles((t: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: t.background,
    padding: t.spacing[4],
  },
}))
```

- Returns a `useStyles()` hook
- Styles are created via `StyleSheet.create` once per theme (light/dark)
- Cached globally in a `Map<string, T>` by theme key
- `useMemo` invalidates when theme changes

### useAppTheme hook

```ts
function useAppTheme(): { theme: AppTheme; isDark: boolean }
```

- Uses `useColorScheme()` (same as current `ThemeContext`)
- Returns the resolved theme object (light or dark) + `isDark` boolean
- No CSS classes, no DOM manipulation

### ThemeContext simplification

Current `ThemeContext.tsx` applies `className="dark"` to trigger CSS variants. After migration:

```tsx
function ThemeProvider({ children }) {
  const { theme, isDark } = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {children}
    </View>
  );
}
```

The `useTheme()` hook from context still works but delegates to `useAppTheme()` internally. All existing `useTheme()` callsites continue to work.

### Tailwind → RN mapping

| Tailwind class | React Native style |
|---|---|
| `flex-1` | `flex: 1` |
| `flex-row` | `flexDirection: "row"` |
| `flex-col` | `flexDirection: "column"` |
| `items-center` | `alignItems: "center"` |
| `items-start` | `alignItems: "flex-start"` |
| `items-end` | `alignItems: "flex-end"` |
| `justify-center` | `justifyContent: "center"` |
| `justify-between` | `justifyContent: "space-between"` |
| `justify-end` | `justifyContent: "flex-end"` |
| `justify-start` | `justifyContent: "flex-start"` |
| `text-center` | `textAlign: "center"` |
| `text-left` | `textAlign: "left"` |
| `text-right` | `textAlign: "right"` |
| `px-N` | `paddingHorizontal: t.spacing[N]` |
| `py-N` | `paddingVertical: t.spacing[N]` |
| `pt-N` / `pb-N` / `pl-N` / `pr-N` | `paddingTop/Bottom/Left/Right: t.spacing[N]` |
| `mx-N` / `my-N` / `mt-N` / `mb-N` / `ml-N` / `mr-N` | `margin*: t.spacing[N]` |
| `text-sm` / `text-base` / `text-lg` / `text-xl` | `fontSize: 14/16/18/20` |
| `font-medium` / `font-semibold` / `font-bold` | `fontWeight: "500"/"600"/"700"` |
| `rounded-lg` / `rounded-xl` / `rounded-2xl` | `borderRadius: t.radii.lg/xl/"2xl"` |
| `rounded-full` | `borderRadius: 9999` |
| `bg-COLOR` | `backgroundColor: t.COLOR` |
| `text-COLOR` | `color: t.COLOR` |
| `border-COLOR` | `borderColor: t.COLOR` |
| `border` | `borderWidth: 1` |
| `border-b` | `borderBottomWidth: 1` |
| `border-t` | `borderTopWidth: 1` |
| `overflow-hidden` | `overflow: "hidden"` |
| `gap-N` | `gap: t.spacing[N]` |
| `h-N` (literal) | `height: N` |
| `w-N` (literal) | `width: N` |
| `h-full` / `w-full` | `height/width: "100%"` |
| `min-h-screen` | `minHeight: "100%"` or Dimensions-based |
| `absolute` / `relative` | `position: "absolute"/"relative"` |
| `inset-0` | `...StyleSheet.absoluteFillObject` |

### Migration order

Files sorted by complexity (simplest first):

1. **Theme infra** -- create `src/theme/colors.ts`, `types.ts`, `useAppTheme.ts`, `makeStyles.ts`
2. **ThemeContext** -- simplify to StatusBar + background only
3. **UI components** (3 files) -- `LoadingState`, `EmptyState`, `ErrorState`
4. **Order components** (5 files) -- `StatusBadge`, `ConnectionStatus`, `OrderItemRow`, `OrderHeader`, `OrderItemGroup`
5. **General components** (3 files) -- `CameraPermissionGate`, `QrScanner`, `JoinTableForm`
6. **App screens** (5 files) -- `_layout.tsx`, `index.tsx`, `scan.tsx`, `order.tsx`, `thank-you.tsx`
7. **Utils** -- `src/utils/status.ts` (status color class strings → theme values)
8. **Cleanup** -- remove deps, configs, global.css
9. **Lint** -- `npm run lint`

### What gets removed

- `npm uninstall nativewind react-native-css tailwindcss @tailwindcss/postcss`
- Remove `postcss` if not needed by Expo
- Delete `src/global.css`
- Remove `withNativeWind` from `metro.config.js`
- Delete `postcss.config.mjs`
- Clean up `nativewind-env.d.ts`

## Verification

- `npm run lint` passes with zero errors
- App launches, light theme renders correctly
- Dark theme activates when system switches to dark mode
- All screens render identically to before
