# System Design & UI/UX Specification: Glassmorphism Design System

**Project Name:** Spendy / FinTrack — Glassmorphism Design System Specification  
**Document Version:** 1.0.0  
**Target Platforms:** Web (Next.js 15 + Tailwind CSS) & Mobile (React Native / Expo + Expo Blur)  
**Supported Modes:** Dual Theme (Dark / Night Glass & Light / Day Glass)

---

## 1. Design Philosophy & Visual Tokens

Glassmorphism relies on the illusion of depth, layered frosted surfaces, dynamic refraction, and crisp border highlights. To prevent visual fatigue and ensure financial readability, high contrast ratios (WCAG 2.1 AA compliant) are strictly enforced across both Light (Day) and Dark (Night) modes.

### 1.1 Color Tokens & Palettes

#### Base & Ambient Canvas
* **Night Mode (Dark Glass):**
  * Background Canvas: `#07090E` (Deep Obsidian)
  * Mesh Glow 1: `rgba(99, 102, 241, 0.22)` (Electric Indigo)
  * Mesh Glow 2: `rgba(14, 165, 233, 0.18)` (Cyan Sky)
  * Mesh Glow 3: `rgba(236, 72, 153, 0.14)` (Neon Rose)
* **Day Mode (Light Glass):**
  * Background Canvas: `#F1F5F9` (Soft Slate)
  * Mesh Glow 1: `rgba(99, 102, 241, 0.12)` (Pastel Indigo)
  * Mesh Glow 2: `rgba(14, 165, 233, 0.10)` (Pastel Cyan)
  * Mesh Glow 3: `rgba(244, 114, 182, 0.08)` (Pastel Pink)

#### Functional Category Accents
* **Food & Dining:** `#F97316` (Warm Orange)
* **Groceries:** `#10B981` (Emerald Green)
* **Transit & Travel:** `#3B82F6` (Electric Blue)
* **Bills & Subscriptions:** `#8B5CF6` (Vivid Purple)
* **Entertainment:** `#EC4899` (Hot Pink)
* **Shopping:** `#EAB308` (Amber Gold)
* **Health & Fitness:** `#06B6D4` (Bright Cyan)

---

## 2. Glassmorphism Elevation System (Levels 1–3)

```text
┌─────────────────────────────────────────────────────────────────┐
│ Level 3: Modals, Popovers, Mobile Numpad (Highest Elevation)    │
│  - Night: rgba(255,255,255,0.08), Blur: 24px, Border: 20% white│
│  - Day:   rgba(255,255,255,0.75), Blur: 24px, Border: 40% white│
├─────────────────────────────────────────────────────────────────┤
│ Level 2: Surface Cards, Interactive Feed Items, Charts          │
│  - Night: rgba(255,255,255,0.04), Blur: 16px, Border: 12% white│
│  - Day:   rgba(255,255,255,0.55), Blur: 16px, Border: 30% white│
├─────────────────────────────────────────────────────────────────┤
│ Level 1: Canvas Base, Navigation Bars, Segment Controls         │
│  - Night: rgba(15,23,42,0.60),    Blur: 12px, Border: 8% white │
│  - Day:   rgba(255,255,255,0.40), Blur: 12px, Border: 20% white│
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 CSS / Tailwind Token Matrix

| Level | Role | Night Mode CSS Properties | Day Mode CSS Properties |
|---|---|---|---|
| **Level 1 (Nav/Bar)** | Header, Tabbar, Sidebar | `bg-slate-950/60 backdrop-blur-md border-white/[0.08]` | `bg-white/40 backdrop-blur-md border-white/40 shadow-sm` |
| **Level 2 (Cards)** | Expense Cards, Chart Tiles | `bg-white/[0.04] backdrop-blur-xl border-white/[0.12] shadow-2xl shadow-black/40` | `bg-white/60 backdrop-blur-xl border-white/60 shadow-lg shadow-slate-200/50` |
| **Level 3 (Modals)** | Numpad Sheet, Filter Dialogs | `bg-white/[0.09] backdrop-blur-2xl border-white/[0.20] shadow-2xl shadow-black/70` | `bg-white/80 backdrop-blur-2xl border-white/80 shadow-2xl shadow-slate-300/60` |

---

## 3. Theme Toggle & State Synchronization

The application enforces synchronized theme toggling across Next.js and Expo without causing hydration mismatches or layout shifts.

### 3.1 Theme Contract & Storage Key
* **Storage Key:** `spendy_theme_mode`
* **Supported Values:** `'system' | 'light' | 'dark'`
* **Web Engine:** `next-themes` (Injects `.dark` class on root `<html>`)
* **Mobile Engine:** React Context wrapping React Navigation / NativeWind themes

---

## 4. Web Implementation (Next.js 15 & Tailwind)

### 4.1 Global Ambient Canvas (`apps/web/src/app/layout.tsx`)

```tsx
import '@/globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300 relative overflow-x-hidden selection:bg-indigo-500/30">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* Ambient Glow Gradients */}
          <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/15 dark:bg-indigo-600/20 blur-[128px] pointer-events-none -z-10" />
          <div className="fixed top-1/3 -right-40 w-96 h-96 rounded-full bg-sky-400/15 dark:bg-sky-500/15 blur-[128px] pointer-events-none -z-10" />
          <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-pink-400/10 dark:bg-pink-600/15 blur-[128px] pointer-events-none -z-10" />
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 4.2 Theme Toggle Button (`apps/web/src/components/theme-toggle.tsx`)

```tsx
'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="relative p-2.5 rounded-xl bg-white/40 dark:bg-white/[0.06] backdrop-blur-lg border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-200 shadow-sm"
      aria-label="Toggle visual theme"
    >
      <Sun className="h-5 w-5 text-amber-500 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute top-2.5 left-2.5 h-5 w-5 text-indigo-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
```

### 4.3 Glassmorphic Card Example (`apps/web/src/components/metric-card.tsx`)

```tsx
interface MetricCardProps {
  title: string
  amount: string
  subtitle?: string
}

export function MetricCard({ title, amount, subtitle }: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-6 bg-white/50 dark:bg-white/[0.04] backdrop-blur-xl border border-white/60 dark:border-white/[0.12] shadow-lg shadow-slate-200/40 dark:shadow-2xl dark:shadow-black/40 transition-all duration-300 hover:border-indigo-400/50 dark:hover:border-indigo-400/30">
      {/* Specular Edge Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">{amount}</h3>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subtitle}</p>}
    </div>
  )
}
```

---

## 5. Mobile Implementation (React Native / Expo)

### 5.1 Native Glass Surface Component (`apps/mobile/components/glass-card.tsx`)

```tsx
import React from 'react'
import { StyleSheet, View, ViewStyle, useColorScheme } from 'react-native'
import { BlurView } from 'expo-blur'

interface GlassCardProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function GlassCard({ children, style }: GlassCardProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View style={[styles.outerContainer, isDark ? styles.borderDark : styles.borderLight, style]}>
      <BlurView
        intensity={isDark ? 35 : 55}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.blurContent, isDark ? styles.bgDark : styles.bgLight]}
      >
        {children}
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  borderDark: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  borderLight: {
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  blurContent: {
    padding: 20,
  },
  bgDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  bgLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
})
```

### 5.2 Mobile Day/Night Toggle Switch (`apps/mobile/components/theme-switch.tsx`)

```tsx
import React from 'react'
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native'
import { GlassCard } from './glass-card'

interface ThemeSwitchProps {
  currentTheme: 'light' | 'dark'
  onToggle: (theme: 'light' | 'dark') => void
}

export function ThemeSwitch({ currentTheme, onToggle }: ThemeSwitchProps) {
  const isDark = currentTheme === 'dark'

  return (
    <GlassCard style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={() => onToggle('light')}
          style={[styles.pill, !isDark && styles.activePillLight]}
        >
          <Text style={[styles.label, !isDark ? styles.activeTextLight : styles.inactiveText]}>
            ☀️ Day
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onToggle('dark')}
          style={[styles.pill, isDark && styles.activePillDark]}
        >
          <Text style={[styles.label, isDark ? styles.activeTextDark : styles.inactiveText]}>
            🌙 Night
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  activePillLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTextDark: {
    color: '#ffffff',
  },
  activeTextLight: {
    color: '#0f172a',
  },
  inactiveText: {
    color: '#64748b',
  },
})
```

---

## 6. Glassmorphic Data Visualizations & Charts

### Web Chart Glass Styling (Recharts)
* **Tooltips:** Wrapped in `backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 rounded-xl p-3 shadow-xl`.
* **Area Gradients:** Top stop `rgba(99, 102, 241, 0.45)`, bottom stop `rgba(99, 102, 241, 0.00)`.
* **Grid Lines:** `stroke="rgba(148, 163, 184, 0.15)"` with dashed strokes.

---

## 7. Accessibility, Contrast & Fallback Matrix

| Condition | Fallback Strategy |
|---|---|
| **Low-End Android Device (Laggy Blur)** | Automatically disable `BlurView` and apply solid `rgba(15, 23, 42, 0.85)` / `rgba(255, 255, 255, 0.90)` backgrounds. |
| **User prefers-reduced-motion** | Disable background ambient glow drifting animations and instant-switch themes without cross-fade. |
| **High Contrast Mode (a11y)** | Increase card borders from `1px solid rgba(...)` to `2px solid rgba(255,255,255,0.4)` on night and `2px solid #64748B` on day. |
