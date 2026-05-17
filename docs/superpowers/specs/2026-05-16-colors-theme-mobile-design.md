# Color Palette & NativeWind Theme for POS Mobile App

## Objective

Replicate the web app's color palette (defined in `global.css` with OKLCH tokens + CSS custom properties) in the React Native mobile app using **NativeWind v4** with **Tailwind CSS v4**, supporting automatic light/dark mode via system preference.

---

## Platform

- React Native (Expo 55 / RN 0.83)
- iOS & Android (no web target for this config)
- Dark mode: automatic (device `userInterfaceStyle`)

---

## How Colors Will Be Consumed

- **Tailwind utility classes** via `className` (e.g. `bg-background`, `text-foreground`, `border-border`)
- Direct color access via `useTheme()` hook if needed for programmatic usage

---

## Architecture

### 1. `src/global.css` — Theme configuration file

Single source of truth for the color system. Used by NativeWind to generate Tailwind utilities.

- Adapts the web `global.css` by removing web-only imports (`tw-animate-css`, `shadcn/tailwind.css`)
- Keeps all OKLCH base tokens and semantic variable definitions
- Defines both `:root` (light) and `.dark` color schemes
- Uses `@theme inline { ... }` to register all semantic colors as Tailwind utilities

### 2. `metro.config.js` — NativeWind plugin

Add `withNativeWind` to process the CSS file at build time.

### 3. `src/context/ThemeContext.tsx` — Theme provider

- Wraps the app and reacts to `useColorScheme()` changes
- Toggles the `.dark` class on the root view container
- Uses `expo-system-ui` to update status bar style
- Exposes `{ theme: 'light' | 'dark', colors: ColorTokens, isDark: boolean }`

### 4. `src/app/_layout.tsx` — Entry point

- Imports `../global.css` for NativeWind
- Wraps children with `ThemeProvider`
- Sets initial background color to match theme

### 5. Component migration

Existing `StyleSheet` usage replaced incrementally with `className`:

```tsx
// Before
<View style={styles.container}>
<Text style={styles.title}>Hello</Text>

// After
<View className="flex-1 justify-center items-center bg-background">
<Text className="text-foreground text-xl font-bold">Hello</Text>
```

---

## Color Token Mapping

All OKLCH base tokens from the web are preserved identically (base-50 through base-950, red, green, blue, yellow scales, black/white alphas).

Semantic mappings for **light mode** (`:root`):

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `--background` | white-alpha-100 | base-950 |
| `--foreground` | black-alpha-80 | base-50 |
| `--card` | white-alpha-100 | base-900 |
| `--card-foreground` | base-950 | base-50 |
| `--primary` | base-900 | base-200 |
| `--primary-foreground` | base-50 | base-900 |
| `--secondary` | base-100 | base-800 |
| `--muted` | base-100 | base-800 |
| `--muted-foreground` | base-500 | base-400 |
| `--accent` | base-100 | base-800 |
| `--destructive` | red-600 | red-600 |
| `--success` | green-600 | green-500 |
| `--info` | blue-600 | blue-500 |
| `--highlight` | yellow-200 | yellow-800 |
| `--border` | base-200 | white-alpha-10 |
| `--border-4` | base-400 | base-400 |
| `--ring` | base-300 | base-600 |
| `--active-status` | green-500 | green-500 |
| `--inactive-status` | red-500 | red-500 |
| `--pending-status` | yellow-500 | yellow-500 |

---

## Dependencies

```json
{
  "nativewind": "^4.2.4",
  "tailwindcss": "^4"
}
```

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/global.css` | **Create** — theme configuration |
| `metro.config.js` | **Modify** — add NativeWind plugin |
| `src/context/ThemeContext.tsx` | **Create** — theme provider |
| `src/app/_layout.tsx` | **Modify** — import CSS + wrap with ThemeProvider |
| `src/screens/HomeScreen.tsx` | **Modify** — migrate to Tailwind classes |
| `app.json` | **Verify** — `userInterfaceStyle: "automatic"` already set |

---

## Non-Goals

- No web-specific CSS features (animations, keyframes, hover states)
- No `tw-animate-css` or `shadcn/ui` web components
- No changes to API, session, or business logic
- No new screens or components beyond migration of existing ones
