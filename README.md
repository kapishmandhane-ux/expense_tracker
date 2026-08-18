# Spendy / FinTrack — Unified Cross-Platform Expense Tracker

A modern, high-performance, privacy-first personal expense and budget management system engineered with a **Turborepo** monorepo, **Next.js 15 App Router**, **Expo (React Native)**, and **Supabase PostgreSQL 16+** with Row Level Security (RLS).

---

## 🌟 Day 1 Architecture & Milestones Accomplished

- [x] **Monorepo Orchestration**: Turborepo pipeline with pnpm/npm workspace linking apps and packages.
- [x] **Shared Packages (`packages/*`)**:
  - `@repo/types`: PostgreSQL database schema definitions and domain models.
  - `@repo/validators`: Zod validation schemas for transactions, budgets, categories, and authentication.
  - `@repo/utils`: Pure platform-agnostic currency formatters (INR ₹, USD $, EUR €), date boundaries, and budget burn-rate math.
  - `@repo/api`: Supabase client factories and TanStack Query hooks.
- [x] **Database & Security (`supabase/`)**:
  - Full PostgreSQL 16+ migration with custom enums (`payment_mode`), `profiles`, `categories`, `expenses`, and `budgets`.
  - Automated trigger (`handle_new_user`) seeding 8 default categories per new profile.
  - Row Level Security (RLS) policies enforcing 100% strict user tenant isolation (`auth.uid() = user_id`).
- [x] **Web Client (`apps/web`)**:
  - Next.js 15 App Router + Tailwind CSS with Frosted Glassmorphic Design System (Level 1–3 Glass).
  - Ambient glow mesh canvas, Next-Themes Day/Night toggle, and specular edge highlights.
  - Interactive Financial Overview Dashboard, Expense Ledger with CSV export, Budgets with burn-rate bars, and Analytics breakdown.
  - Supabase SSR authentication helpers and route protection Edge Middleware.
- [x] **Mobile Client (`apps/mobile`)**:
  - Expo SDK 51+ with Expo Router v3 file-based navigation (`(tabs)`, `(auth)`).
  - Native `expo-blur` frosted surfaces, custom zero-lag numpad entry, and SecureStore token persistence.

---

## 📁 Repository Structure

```text
expense-tracker/
├── apps/
│   ├── web/                     # Next.js 15 App Router Web Dashboard
│   └── mobile/                  # Expo (React Native) Mobile App
├── packages/
│   ├── types/                   # Shared TypeScript definitions & DB types
│   ├── validators/              # Shared Zod validation schemas
│   ├── utils/                   # Pure currency, date, and math calculations
│   └── api/                     # Supabase & TanStack Query client logic
├── supabase/
│   ├── migrations/              # SQL schema, triggers, and RLS policies
│   └── seed.sql                 # Development seed data
├── turbo.json                   # Task execution pipeline
├── pnpm-workspace.yaml          # Monorepo workspaces
└── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v20+` or `v22+`
- **Package Manager**: `npm` or `pnpm`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/kapishmandhane-ux/expense_tracker.git
cd expense_tracker

# Install monorepo dependencies
npm install # or pnpm install
```

### 3. Environment Configuration
Copy `.env.example` into `apps/web` and `apps/mobile`:
```bash
cp .env.example apps/web/.env.local
cp .env.example apps/mobile/.env.local
```

### 4. Running the Development Servers
```bash
# Run Web Application
npm run dev --filter=web    # http://localhost:3000

# Run Mobile Application
npm run dev --filter=mobile # Expo Metro Bundler
```

---

## 🔒 Security & Privacy
All expense records, category customizations, and budget limits are protected by PostgreSQL **Row Level Security (RLS)** at the database engine level. Clients cannot read or mutate data belonging to other tenants.
