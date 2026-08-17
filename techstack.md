# Technology Stack & Development Workflow Guide

**Project Name:** Spendy / FinTrack — Cross-Platform Expense Tracker  
**Document Version:** 1.0.0  
**File Name:** `techstack.md`  
**Purpose:** Outlines the complete technical stack, inter-package dependencies, development lifecycle, caching pipelines, and CI/CD automation to ensure zero-friction parallel development across Web and Mobile teams.

---

## 1. Complete Technology Matrix

| Layer / Responsibility | Tool / Technology | Version / Spec | Primary Rationale |
|---|---|---|---|
| **Monorepo Orchestration** | **Turborepo** + **pnpm Workspaces** | Turbo v2.x, pnpm v9.x | Ultra-fast remote caching, dependency graph task pipelining, and zero duplicated code. |
| **Web Client** | **Next.js (App Router)** | v15.x | Server Components (RSC), Edge Middleware, SEO, fast SSR, and zero-bundle server logic. |
| **Web Styling & UI** | **Tailwind CSS** + **shadcn/ui** | Tailwind v3.4+, Radix UI | Hardware-accelerated glassmorphism (`backdrop-blur-xl`), full keyboard accessible UI primitives. |
| **Web Theme System** | **next-themes** | v0.3+ | Seamless Day/Night mode toggling with zero hydration mismatch or flash of unstyled content (FOUC). |
| **Mobile Client** | **React Native / Expo** | Expo SDK 51+ (Expo Router v3) | Native 60fps gesture handling, file-based routing, instant OTA updates, and native hardware API access. |
| **Mobile Frosted UI** | **expo-blur** + **expo-linear-gradient** | Native iOS/Android compositors | Native `UIVisualEffectView` rendering for high-performance glass surfaces without frame drops. |
| **Backend & Database** | **Supabase (PostgreSQL 16+)** | Managed Cloud / Self-hosted | Auth, Realtime WebSockets, Storage (receipts), and Row Level Security (RLS) database middleware. |
| **Data Fetching & Cache** | **TanStack Query (React Query)** | v5.x | Instant optimistic UI updates, background revalidation, query deduping, and offline persistence. |
| **Schema Validation** | **Zod** | v3.23+ | Shared single source of truth for runtime form verification across Web, Mobile, and API handlers. |
| **Type Synchronization** | **Supabase CLI (`gen types`)** | CLI v1.180+ | Auto-generates TypeScript interfaces directly from live PostgreSQL database schema. |
| **Visual Analytics** | **Recharts** (Web) & **Victory Native** (Mobile) | React SVG / Skia | Highly customizable, hardware-rendered glass-styled financial graphs and category breakdowns. |
| **Deployments & CI/CD** | **Vercel** + **Expo Application Services (EAS)** | Git-triggered | Instant edge deployment for web; cloud-native binary compilations and OTA rollouts for mobile. |

---

## 2. Monorepo Architecture & Dependency Graph

```
                              ┌───────────────────────────┐
                              │     @repo/types (TS)      │
                              │  - database.types.ts      │
                              │  - domain.ts              │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │  @repo/validators (Zod)   │
                              │  - expense.schema.ts      │
                              │  - budget.schema.ts       │
                              └─────────────┬─────────────┘
                                            │
                      ┌─────────────────────┴─────────────────────┐
                      ▼                                           ▼
        ┌───────────────────────────┐               ┌───────────────────────────┐
        │     @repo/utils (Pure)    │               │      @repo/api (Data)     │
        │  - currency.ts (INR/USD)  │               │  - Supabase client hooks  │
        │  - date.ts & math.ts      │               │  - TanStack queries       │
        └─────────────┬─────────────┘               └─────────────┬─────────────┘
                      │                                           │
                      └─────────────────────┬─────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
      ┌───────────────────────────┐                   ┌───────────────────────────┐
      │      apps/web (Next.js)   │                   │    apps/mobile (Expo)     │
      │  - Edge middleware.ts     │                   │  - Root _layout.tsx       │
      │  - Tailwind Glass Theme   │                   │  - expo-blur Native UI    │
      │  - shadcn/ui Data Tables  │                   │  - Custom Numpad & Feed   │
      └───────────────────────────┘                   └───────────────────────────┘
```

### Dependency Rules:
1. **No Circular Imports:** Packages only depend downward. `apps/*` consume `packages/*`, but `packages/*` never import from `apps/*`.
2. **Pure Isolation in `@repo/utils`:** Never import React, React Native, or DOM APIs inside `utils`. It remains 100% platform-agnostic TypeScript.
3. **Type-Safe Contract:** All API mutations require Zod schema validation matching `@repo/types`.

---

## 3. High-Velocity Development Workflow

To ensure smooth, unhindered development without port collisions or local environment mismatches, adhere to the following workflow pipelines.

### 3.1 Initial Environment Setup

```bash
# 1. Clone repo & install isolated dependencies via pnpm
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
pnpm install

# 2. Setup local environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# 3. Start local Supabase instance (Docker-based)
pnpm supabase start
```

### 3.2 Concurrent Dev Server Execution

Turborepo handles parallel execution with distinct ports and live hot module reloading:

```bash
# Run both Web (http://localhost:3000) and Expo Mobile concurrently
pnpm dev

# Or run individual applications in isolation:
pnpm --filter web dev        # Runs Next.js only
pnpm --filter mobile dev     # Runs Expo Metro bundler only
```

### 3.3 Database Schema Migration & Type Sync Workflow

Whenever a database table or column changes, synchronize TypeScript types across both apps in one command:

```
[ Modify PostgreSQL Schema / Migrations ]
                   │
                   ▼
  pnpm db:migrate (Applies SQL migrations)
                   │
                   ▼
  pnpm db:types   (Runs `supabase gen types typescript`)
                   │
                   ▼
  [ @repo/types auto-updates ] -> Instant autocomplete in Web & Mobile!
```

---

## 4. Turborepo Pipeline Configuration (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## 5. Branching Strategy & Zero-Hindrance CI/CD Pipeline

```
  [ Feature Branch ] (feat/glass-numpad)
          │
          ├──> Pre-commit: lint-staged (ESLint + Prettier check)
          │
          ├──> Pull Request triggers GitHub Actions:
          │      ├── turbo run lint
          │      ├── turbo run typecheck
          │      └── turbo run build (Cached)
          │
          ▼
   [ Merge to main ]
          │
    ┌─────┴─────────────────────────┐
    ▼                               ▼
[ Vercel Edge Pipeline ]   [ EAS Cloud Build Pipeline ]
Deploy Next.js to Prod     Build iOS (IPA) & Android (AAB/APK)
Instant Live Web URL       OTA Update via expo-updates
```

---

## 6. Development Best Practices & Guardrails

* **Shared Formatting Rules:** Universal Prettier and ESLint configurations defined at the root workspace level ensure all files adhere to identical linting rules.
* **Optimistic Queries:** Always update TanStack Query cache locally before awaiting the Supabase network response to eliminate perceived latency.
* **Platform Conditional Code:** Keep styling primitives native. Use Tailwind classes inside `apps/web` and `StyleSheet` / NativeWind primitives inside `apps/mobile`.
* **Secrets Management:** Client-safe keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`) are committed in example configs; `SUPABASE_SERVICE_ROLE_KEY` is restricted solely to secure server-side environments.
