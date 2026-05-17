# NativeWind Theme Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replicate the web color palette in the React Native mobile app using NativeWind + Tailwind CSS v4, with automatic system-based dark mode.

**Architecture:** A `global.css` file serves as the single source of truth for color tokens (NativeWind + Tailwind v4 `@theme`). A `ThemeContext` reads `useColorScheme()` and toggles `.dark` class. Existing screens migrate from `StyleSheet` to `className`.

**Tech Stack:** Expo 55, RN 0.83, NativeWind ^4.2.4, Tailwind CSS v4

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/global.css` | Create | NativeWind theme config — base tokens + semantic colors for light/dark |
| `metro.config.js` | Create | Metro bundler config with NativeWind plugin |
| `src/context/ThemeContext.tsx` | Create | React context — reads system color scheme, applies `.dark` class, exposes theme helpers |
| `src/app/_layout.tsx` | Modify | Import global.css, wrap with ThemeProvider |
| `src/screens/HomeScreen.tsx` | Modify | Migrate from StyleSheet to Tailwind className |

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install nativewind and tailwindcss**

```bash
npm install nativewind@^4.2.4 tailwindcss@^4
```

Expected: Packages added to `dependencies` in `package.json`.

---

### Task 2: Create `src/global.css`

**Files:**
- Create: `src/global.css`

This file mirrors the web's CSS color palette but:
- Removes web-only imports (`tw-animate-css`, `shadcn/tailwind.css`)
- Keeps all OKLCH base tokens identically
- Keeps identical semantic variable definitions in `:root` and `.dark`
- Registers all semantic colors in `@theme inline { ... }` for Tailwind utility generation

- [ ] **Step 1: Create global.css**

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-highlight: var(--highlight);
  --color-highlight-foreground: var(--highlight-foreground);
  --color-border: var(--border);
  --color-border-4: var(--border-4);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-active-status: var(--active-status);
  --color-active-status-foreground: var(--active-status-foreground);
  --color-inactive-status: var(--inactive-status);
  --color-inactive-status-foreground: var(--inactive-status-foreground);
  --color-pending-status: var(--pending-status);
  --color-pending-status-foreground: var(--pending-status-foreground);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --color-white: oklch(1 0 0);
  --color-black: oklch(0 0 0);
  --color-base-50: oklch(0.985 0 0);
  --color-base-100: oklch(0.97 0 0);
  --color-base-200: oklch(0.922 0 0);
  --color-base-300: oklch(0.87 0 0);
  --color-base-400: oklch(0.72 0 0);
  --color-base-500: oklch(0.56 0 0);
  --color-base-600: oklch(0.44 0 0);
  --color-base-700: oklch(0.37 0 0);
  --color-base-800: oklch(0.27 0 0);
  --color-base-900: oklch(0.20 0 0);
  --color-base-950: oklch(0.14 0 0);
  --color-black-alpha-0: oklch(0 0 0 / 0%);
  --color-black-alpha-001: oklch(0 0 0 / 0.01%);
  --color-black-alpha-333: oklch(0 0 0 / 3.33%);
  --color-black-alpha-5: oklch(0 0 0 / 5%);
  --color-black-alpha-10: oklch(0 0 0 / 10%);
  --color-black-alpha-15: oklch(0 0 0 / 15%);
  --color-black-alpha-20: oklch(0 0 0 / 20%);
  --color-black-alpha-30: oklch(0 0 0 / 30%);
  --color-black-alpha-40: oklch(0 0 0 / 40%);
  --color-black-alpha-50: oklch(0 0 0 / 50%);
  --color-black-alpha-60: oklch(0 0 0 / 60%);
  --color-black-alpha-70: oklch(0 0 0 / 70%);
  --color-black-alpha-80: oklch(0 0 0 / 80%);
  --color-black-alpha-90: oklch(0 0 0 / 90%);
  --color-black-alpha-95: oklch(0 0 0 / 95%);
  --color-black-alpha-100: oklch(0 0 0 / 100%);
  --color-white-alpha-0: oklch(1 0 0 / 0%);
  --color-white-alpha-001: oklch(1 0 0 / 0.01%);
  --color-white-alpha-333: oklch(1 0 0 / 3.33%);
  --color-white-alpha-5: oklch(1 0 0 / 5%);
  --color-white-alpha-10: oklch(1 0 0 / 10%);
  --color-white-alpha-15: oklch(1 0 0 / 15%);
  --color-white-alpha-20: oklch(1 0 0 / 20%);
  --color-white-alpha-30: oklch(1 0 0 / 30%);
  --color-white-alpha-40: oklch(1 0 0 / 40%);
  --color-white-alpha-50: oklch(1 0 0 / 50%);
  --color-white-alpha-60: oklch(1 0 0 / 60%);
  --color-white-alpha-70: oklch(1 0 0 / 70%);
  --color-white-alpha-80: oklch(1 0 0 / 80%);
  --color-white-alpha-90: oklch(1 0 0 / 90%);
  --color-white-alpha-95: oklch(1 0 0 / 95%);
  --color-white-alpha-100: oklch(1 0 0 / 100%);
  --color-red-50: oklch(0.971 0.013 17.304);
  --color-red-100: oklch(0.936 0.032 17.717);
  --color-red-200: oklch(0.885 0.062 18.334);
  --color-red-300: oklch(0.808 0.114 19.571);
  --color-red-400: oklch(0.704 0.191 22.216);
  --color-red-500: oklch(0.637 0.237 25.331);
  --color-red-600: oklch(0.577 0.245 27.325);
  --color-red-700: oklch(0.505 0.213 27.518);
  --color-red-800: oklch(0.444 0.177 26.899);
  --color-red-900: oklch(0.396 0.141 25.723);
  --color-red-950: oklch(0.258 0.092 26.042);
  --color-green-50: oklch(0.983 0.024 149.21);
  --color-green-100: oklch(0.962 0.044 156.74);
  --color-green-200: oklch(0.924 0.089 156.09);
  --color-green-300: oklch(0.829 0.164 154.58);
  --color-green-400: oklch(0.701 0.182 153.53);
  --color-green-500: oklch(0.627 0.194 149.21);
  --color-green-600: oklch(0.527 0.154 150.06);
  --color-green-700: oklch(0.448 0.119 151.32);
  --color-green-800: oklch(0.395 0.096 153.15);
  --color-green-900: oklch(0.320 0.071 154.06);
  --color-green-950: oklch(0.129 0.042 153.72);
  --color-blue-50: oklch(0.971 0.013 254.108);
  --color-blue-100: oklch(0.932 0.032 255.585);
  --color-blue-200: oklch(0.882 0.059 254.128);
  --color-blue-300: oklch(0.809 0.105 251.813);
  --color-blue-400: oklch(0.707 0.165 254.624);
  --color-blue-500: oklch(0.623 0.214 259.815);
  --color-blue-600: oklch(0.546 0.245 262.881);
  --color-blue-700: oklch(0.481 0.215 263.176);
  --color-blue-800: oklch(0.424 0.186 263.223);
  --color-blue-900: oklch(0.379 0.146 265.177);
  --color-blue-950: oklch(0.282 0.091 267.935);
  --color-yellow-50: oklch(0.987 0.026 102.212);
  --color-yellow-100: oklch(0.962 0.059 95.608);
  --color-yellow-200: oklch(0.941 0.116 95.808);
  --color-yellow-300: oklch(0.898 0.154 95.906);
  --color-yellow-400: oklch(0.852 0.199 91.936);
  --color-yellow-500: oklch(0.795 0.184 86.047);
  --color-yellow-600: oklch(0.681 0.162 75.834);
  --color-yellow-700: oklch(0.554 0.135 66.442);
  --color-yellow-800: oklch(0.45 0.103 58.482);
  --color-yellow-900: oklch(0.376 0.074 56.166);
  --color-yellow-950: oklch(0.188 0.035 59.982);
  --radius: 0.625rem;
  --card: var(--color-white-alpha-100);
  --card-foreground: var(--color-base-950);
  --popover: var(--color-white-alpha-100);
  --popover-foreground: var(--color-black-alpha-100);
  --primary: var(--color-base-900);
  --primary-foreground: var(--color-base-50);
  --secondary: var(--color-base-100);
  --secondary-foreground: var(--color-base-900);
  --muted: var(--color-base-100);
  --muted-foreground: var(--color-base-500);
  --accent: var(--color-base-100);
  --accent-foreground: var(--color-base-900);
  --destructive: var(--color-red-600);
  --destructive-foreground: var(--color-white-alpha-100);
  --success: var(--color-green-600);
  --success-foreground: var(--color-white-alpha-100);
  --info: var(--color-blue-600);
  --info-foreground: var(--color-white-alpha-100);
  --highlight: var(--color-yellow-200);
  --highlight-foreground: var(--color-base-950);
  --border: var(--color-base-200);
  --border-4: var(--color-base-400);
  --input: var(--color-white-alpha-100);
  --ring: var(--color-base-300);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: var(--color-base-50);
  --sidebar-foreground: var(--color-base-700);
  --sidebar-primary: var(--color-base-900);
  --sidebar-primary-foreground: var(--color-base-50);
  --sidebar-accent: var(--color-base-100);
  --sidebar-accent-foreground: var(--color-base-900);
  --sidebar-border: var(--color-base-200);
  --sidebar-ring: var(--color-base-300);
  --active-status: var(--color-green-500);
  --active-status-foreground: var(--color-white-alpha-100);
  --inactive-status: var(--color-red-500);
  --inactive-status-foreground: var(--color-white-alpha-100);
  --pending-status: var(--color-yellow-500);
  --pending-status-foreground: var(--color-white-alpha-100);
}

.dark {
  --card: var(--color-base-900);
  --card-foreground: var(--color-base-50);
  --popover: var(--color-base-900);
  --popover-foreground: var(--color-base-50);
  --primary: var(--color-base-200);
  --primary-foreground: var(--color-base-900);
  --secondary: var(--color-base-800);
  --secondary-foreground: var(--color-base-50);
  --muted: var(--color-base-800);
  --muted-foreground: var(--color-base-400);
  --accent: var(--color-base-800);
  --accent-foreground: var(--color-base-50);
  --destructive: var(--color-red-600);
  --destructive-foreground: var(--color-white-alpha-100);
  --success: var(--color-green-500);
  --success-foreground: var(--color-white-alpha-100);
  --info: var(--color-blue-500);
  --info-foreground: var(--color-white-alpha-100);
  --highlight: var(--color-yellow-800);
  --highlight-foreground: var(--color-base-50);
  --border: var(--color-white-alpha-10);
  --border-4: var(--color-base-400);
  --input: var(--color-white-alpha-15);
  --ring: var(--color-base-600);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: var(--color-base-900);
  --sidebar-foreground: var(--color-base-50);
  --sidebar-primary: var(--color-base-200);
  --sidebar-primary-foreground: var(--color-base-50);
  --sidebar-accent: var(--color-base-800);
  --sidebar-accent-foreground: var(--color-base-50);
  --sidebar-border: var(--color-white-alpha-10);
  --sidebar-ring: var(--color-base-600);
  --active-status: var(--color-green-500);
  --active-status-foreground: var(--color-white-alpha-100);
  --inactive-status: var(--color-red-500);
  --inactive-status-foreground: var(--color-white-alpha-100);
  --pending-status: var(--color-yellow-500);
  --pending-status-foreground: var(--color-white-alpha-100);
}

@layer base {
  * {
    @apply border-border;
  }
}
```

---

### Task 3: Create `metro.config.js`

**Files:**
- Create: `metro.config.js`

Configure Metro to use NativeWind's plugin for CSS processing.

- [ ] **Step 1: Create metro.config.js**

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
```

---

### Task 4: Create `src/context/ThemeContext.tsx`

**Files:**
- Create: `src/context/ThemeContext.tsx`

A React context that:
- Reads the system color scheme via `useColorScheme()` from `react-native`
- Toggles the `.dark` class on the root view
- Exposes `{ theme, isDark, colors }` for programmatic access

- [ ] **Step 1: Create ThemeContext**

```tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [theme, setTheme] = useState<Theme>(systemScheme ?? 'light')

  useEffect(() => {
    setTheme(systemScheme ?? 'light')
  }, [systemScheme])

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      <View className={`flex-1 bg-background ${isDark ? 'dark' : ''}`}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </View>
    </ThemeContext.Provider>
  )
}
```

---

### Task 5: Update `src/app/_layout.tsx`

**Files:**
- Modify: `src/app/_layout.tsx`

Import global.css for NativeWind and wrap the existing providers with ThemeProvider.

- [ ] **Step 1: Modify _layout.tsx**

```tsx
import '../global.css'

import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/context/SessionContext'
import { ThemeProvider } from '@/context/ThemeContext'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
```

---

### Task 6: Migrate `src/screens/HomeScreen.tsx`

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

Replace `StyleSheet.create()` with Tailwind `className`.

- [ ] **Step 1: Update HomeScreen to use Tailwind classes**

```tsx
import { Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">POS User Client</Text>
      <Text className="mt-2 text-base text-muted-foreground">Point of Sale System</Text>
    </View>
  )
}
```

---

### Task 7: Verify the Setup

- [ ] **Step 1: Verify no lint errors**

```bash
npm run lint
```

Expected: No errors (or only pre-existing warnings).

- [ ] **Step 2: Verify the build compiles (TypeScript check)**

```bash
npx tsc --noEmit
```

Expected: No type errors. If `tsc` is not a script, the command might fail — that's expected per AGENTS.md ("No typecheck script"). Skip if unavailable.
