# Product Requirements Document (PRD)

**Project Name:** Spendy / FinTrack — Unified Cross-Platform Personal Expense & Budget Management System  
**Document Version:** 2.0.0  
**Status:** Approved for Implementation  
**Target Launch:** Q4 2026  
**Architecture Model:** Turborepo Monorepo (Next.js 15 App Router + Expo React Native + Supabase PostgreSQL)

---

## 1. Executive Summary & Vision

### 1.1 Vision Statement
To provide individuals with an ultra-low-friction, reliable, and privacy-first personal finance tracking ecosystem. By combining a touch-optimized, sub-5-second entry mobile application with a comprehensive, analytical web dashboard, users gain continuous clarity over their spending patterns, budget limits, and financial health.

### 1.2 Core Problem Statement
* **Friction in Manual Logging:** Existing tools are bloated, requiring 10+ clicks or waiting through loading screens to log a single coffee or grocery run.
* **Platform Disconnection:** Web-only tools lack immediacy; mobile-only tools lack analytical depth and export flexibility.
* **Privacy & Data Ownership Concerns:** Many SaaS trackers sell anonymized financial data or charge recurring fees for simple relational tracking.

### 1.3 Strategic Goals & Target KPIs
| Metric Category | Target KPI | Measurement Method |
|---|---|---|
| **Logging Speed** | < 4 seconds from app launch to transaction saved | Automated client-side telemetry |
| **Cross-Client Sync** | < 1,000ms sync latency across active web/mobile sessions | Supabase Realtime WebSocket events |
| **System Reliability** | 99.95% uptime for read/write APIs | Supabase uptime monitoring |
| **Web Performance** | 95+ Lighthouse Score, First Contentful Paint (FCP) < 0.8s | Vercel Analytics / Core Web Vitals |
| **Data Integrity** | 100% strict tenant isolation via PostgreSQL RLS | Automated security test suites |

---

## 2. User Personas & Journey Mapping

### Persona A: "The Friction-Averse Spender" (Primary Mobile User)
* **Demographics:** Fast-paced student or working professional constantly making micro-transactions (UPI, contactless cards, cash).
* **Behavior:** Wants to enter an expense immediately at the checkout counter and close the app in under 5 seconds.
* **Core Pain Point:** Dropdown menus, slow animations, and mandatory fields that delay entry.
* **Critical Mobile Features:** Minimal numpad input, 1-tap quick category selection, biometric unlock, and offline queueing.

### Persona B: "The Strategic Budget Planner" (Primary Web User)
* **Demographics:** Analytical planner reviewing monthly finances, categorizing trends, setting quarterly targets, and exporting records.
* **Behavior:** Sits down weekly or monthly on a laptop/desktop to audit statements.
* **Core Pain Point:** Inability to filter complex data ranges, lack of customizable visual dashboards, difficult CSV exports.
* **Critical Web Features:** Interactive multi-axis charts, bulk-editing expense tables, receipt preview drawer, and CSV/Excel import/export.

---

## 3. Monorepo Architecture & Code Organization

The system is configured as a high-performance **Turborepo** monorepo using **pnpm workspaces** to enable maximum code reuse without duplicating business logic, validation schemas, or database typing.

```text
expense-tracker/
├── apps/
│   ├── web/                              # Next.js 15 (App Router, Tailwind CSS, shadcn/ui)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/               # Unauthenticated auth routes
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   ├── register/page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (dashboard)/          # Authenticated app routes
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── expenses/page.tsx
│   │   │   │   │   ├── analytics/page.tsx
│   │   │   │   │   ├── budgets/page.tsx
│   │   │   │   │   ├── settings/page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── api/                  # Edge API routes (CSV export, webhooks)
│   │   │   │   │   └── export/route.ts
│   │   │   │   ├── globals.css
│   │   │   │   └── layout.tsx
│   │   │   ├── components/               # Web-specific presentation components
│   │   │   │   ├── charts/
│   │   │   │   │   ├── category-breakdown-chart.tsx
│   │   │   │   │   └── spending-trend-chart.tsx
│   │   │   │   ├── tables/
│   │   │   │   │   ├── expense-data-table.tsx
│   │   │   │   │   └── columns.tsx
│   │   │   │   ├── modals/
│   │   │   │   │   └── add-expense-dialog.tsx
│   │   │   │   └── nav/
│   │   │   │       ├── sidebar.tsx
│   │   │   │       └── header.tsx
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   └── supabase/
│   │   │   │       ├── client.ts         # Browser client
│   │   │   │       ├── server.ts         # Server component client
│   │   │   │       └── middleware.ts     # Cookie refresher helper
│   │   │   └── middleware.ts             # Next.js Edge Auth Middleware
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                           # React Native / Expo (Expo Router v3)
│       ├── app/
│       │   ├── _layout.tsx               # Root layout: Theme + Auth Guard + Providers
│       │   ├── (auth)/                   # Auth Stack
│       │   │   ├── login.tsx
│       │   │   ├── register.tsx
│       │   │   └── _layout.tsx
│       │   ├── (tabs)/                   # Bottom Tab Navigator
│       │   │   ├── index.tsx             # Quick Overview / Recent Transactions
│       │   │   ├── expenses.tsx          # Paginated History & Search
│       │   │   ├── add.tsx               # High-speed Numpad Entry Modal
│       │   │   ├── budgets.tsx           # Budget Progress Cards
│       │   │   ├── analytics.tsx         # Mobile Visual Summaries
│       │   │   └── _layout.tsx
│       │   └── expense/
│       │       └── [id].tsx              # Detail / Edit screen
│       ├── components/                   # Native components
│       │   ├── keypad/
│       │   │   └── custom-numpad.tsx
│       │   ├── cards/
│       │   │   ├── expense-item-card.tsx
│       │   │   └── budget-progress-bar.tsx
│       │   └── sheets/
│       │       └── category-picker-bottomsheet.tsx
│       ├── hooks/
│       │   ├── use-biometrics.ts
│       │   └── use-camera-receipt.ts
│       ├── lib/
│       │   └── supabase/
│       │       └── secure-client.ts      # Client backed by expo-secure-store
│       ├── app.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── types/                            # Shared TypeScript Definitions
│   │   ├── src/
│   │   │   ├── database.types.ts         # Generated via Supabase CLI
│   │   │   ├── domain.ts                 # Enums, UI mapped interfaces
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── validators/                       # Shared Zod Schemas
│   │   ├── src/
│   │   │   ├── expense.schema.ts
│   │   │   ├── category.schema.ts
│   │   │   ├── budget.schema.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                              # Data Hooks & Supabase Client Factory
│   │   ├── src/
│   │   │   ├── queries/
│   │   │   │   ├── use-expenses-query.ts
│   │   │   │   ├── use-categories-query.ts
│   │   │   │   └── use-budgets-query.ts
│   │   │   ├── mutations/
│   │   │   │   ├── use-expense-mutations.ts
│   │   │   │   └── use-category-mutations.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── utils/                            # Pure Utility Functions
│       ├── src/
│       │   ├── currency.ts               # INR (₹), USD ($), EUR (€) formatters
│       │   ├── date.ts                   # Range generators, timezone-aware boundaries
│       │   ├── calculations.ts           # Spending velocity, budget burn-rate
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── .gitignore
├── package.json                          # Workspace orchestration
├── pnpm-workspace.yaml
├── turbo.json                            # Task execution pipelines
└── README.md
```

---

## 4. Comprehensive Database Schema & Migrations

The database leverages PostgreSQL 16+ on Supabase with Row Level Security (RLS) enabled on all tables.

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Custom Enums
create type payment_mode as enum ('cash', 'upi', 'debit_card', 'credit_card', 'net_banking', 'other');

-- 2. User Profiles Table (Synced with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  currency_code text not null default 'INR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Categories Table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default 'tag',
  color text not null default '#64748b',
  is_system boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Expenses Table
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  payment_method payment_mode not null default 'upi',
  note text,
  receipt_storage_path text,
  spent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Budgets Table
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  monthly_limit numeric(12, 2) not null check (monthly_limit > 0),
  month date not null, -- Stored as YYYY-MM-01
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_category_month unique (user_id, category_id, month)
);

-- ============================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ============================================================================
create index idx_expenses_user_spent_at on public.expenses (user_id, spent_at desc);
create index idx_expenses_category on public.expenses (category_id);
create index idx_budgets_user_month on public.budgets (user_id, month);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Categories Policies
create policy "Users can view own categories" on public.categories
  for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories
  for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories
  for delete using (auth.uid() = user_id);

-- Expenses Policies
create policy "Users can view own expenses" on public.expenses
  for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on public.expenses
  for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on public.expenses
  for update using (auth.uid() = user_id);
create policy "Users can delete own expenses" on public.expenses
  for delete using (auth.uid() = user_id);

-- Budgets Policies
create policy "Users can view own budgets" on public.budgets
  for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on public.budgets
  for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on public.budgets
  for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on public.budgets
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- AUTOMATED PROFILE SEEDING TRIGGER
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');

  -- Seed Default Categories
  insert into public.categories (user_id, name, icon, color, is_system)
  values
    (new.id, 'Food & Dining', 'utensils', '#f97316', true),
    (new.id, 'Groceries', 'shopping-cart', '#10b981', true),
    (new.id, 'Transportation', 'car', '#3b82f6', true),
    (new.id, 'Bills & Utilities', 'receipt', '#8b5cf6', true),
    (new.id, 'Entertainment', 'film', '#ec4899', true),
    (new.id, 'Shopping', 'shopping-bag', '#eab308', true),
    (new.id, 'Health & Fitness', 'activity', '#06b6d4', true),
    (new.id, 'Others', 'more-horizontal', '#64748b', true);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 5. Shared Validation & Domain Schemas (Zod)

Located in `packages/validators/src/expense.schema.ts`:

```typescript
import { z } from 'zod';

export const PaymentMethodEnum = z.enum([
  'cash',
  'upi',
  'debit_card',
  'credit_card',
  'net_banking',
  'other',
]);

export const CreateExpenseSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a valid number' })
    .positive('Amount must be greater than zero')
    .max(10_000_000, 'Amount cannot exceed ₹10,000,000'),
  category_id: z.string().uuid('Invalid category ID'),
  payment_method: PaymentMethodEnum.default('upi'),
  note: z.string().max(255, 'Note cannot exceed 255 characters').optional().nullable(),
  spent_at: z.string().datetime().or(z.date()),
  receipt_storage_path: z.string().optional().nullable(),
});

export const BudgetSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  monthly_limit: z.number().positive('Budget limit must be greater than zero'),
  month: z.string().regex(/^\d{4}-\d{2}-01$/, 'Month must be in YYYY-MM-01 format'),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type BudgetInput = z.infer<typeof BudgetSchema>;
```

---

## 6. Authentication, Middlewares & Route Protection

```
                                  USER REQUEST
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
         Web App (Next.js)                         Mobile App (Expo)
                 │                                           │
       [ Edge middleware.ts ]                       [ Root _layout.tsx ]
                 │                                           │
    Reads HTTP-only cookies                      Reads expo-secure-store token
                 │                                           │
  ┌──────────────┴──────────────┐             ┌──────────────┴──────────────┐
  ▼                             ▼             ▼                             ▼
Valid Token               Expired/Missing Valid Token               Expired/Missing
  │                             │             │                             │
Allow Page Render        Redirect /login  Render Tab Navigator     Redirect /(auth)/login
                                              │                             │
                                              └──────────────┬──────────────┘
                                                             ▼
                                                Supabase Client Execution
                                                             │
                                                  [ PostgreSQL RLS ]
                                         Enforces `auth.uid() = user_id`
```

### 6.1 Web Edge Middleware (`apps/web/src/middleware.ts`)
* Intercepts all paths excluding `_next/static`, `_next/image`, and static assets.
* Refreshes access tokens via `@supabase/ssr`.
* Automatically redirects unauthenticated requests attempting to access `/(dashboard)` routes to `/login`.
* Automatically redirects authenticated users visiting `/login` or `/register` to `/dashboard`.

### 6.2 Mobile Route Guard (`apps/mobile/app/_layout.tsx`)
* Listens to Supabase `onAuthStateChange` events.
* Reads stored tokens from device hardware via `expo-secure-store`.
* Redirects unauthenticated states to `/(auth)/login`.
* Provides optional FaceID / Fingerprint biometric authentication gating on app foregrounding.

---

## 7. Functional Feature Specifications

### 7.1 Transaction Management (P0)
* **Mobile Quick-Entry Flow:**
  1. User taps persistent center "+" action button.
  2. Native custom numpad opens instantly with zero input keyboard lag.
  3. User types amount (e.g. `250`).
  4. User taps one of the 8 grid category icons (e.g. `Food & Dining`).
  5. Payment method defaults to last-used (e.g. `UPI`).
  6. Tap "Save" or auto-save triggers; local cache updates immediately (optimistic UI), syncs in background.
* **Web Data Table Flow:**
  * Paginated table with multi-column sorting (Date, Amount, Category, Payment Method).
  * Date range picker presets (Today, This Week, This Month, Last 30 Days, Custom Range).
  * Bulk action support (Bulk Delete, Bulk Category Reassignment).
  * Inline edit and delete confirmation dialogs.

### 7.2 Budget Tracking & Burn Rates (P1)
* Users assign a monthly spending limit per category.
* **Visual Progress Bars:**
  * Safe (0% - 75%): Green
  * Warning (75% - 95%): Amber
  * Exceeded (> 95%): Crimson Red with over-budget warning tag.
* **Burn Rate Projection:** Calculates daily allowable spend remaining based on current day of the month vs. total limit.

### 7.3 Analytics & Reporting (P1)
* **Web Dashboard Visualizations (via Recharts / Tremor):**
  * Donut Chart: Category-wise percentage distribution.
  * Area Chart: Daily cumulative spend vs. previous month trend.
  * Bar Chart: Payment method usage breakdown (UPI vs. Credit Card vs. Cash).
* **Mobile Analytics:**
  * Clean category breakdown list with proportion percentages and total sum header.

### 7.4 Data Portability & Export (P2)
* Web export endpoint (`/api/export`) generates compliant CSV / Excel files based on active date filters.
* Fields included: `Transaction ID`, `Date`, `Category`, `Amount`, `Currency`, `Payment Mode`, `Notes`.

---

## 8. Non-Functional Requirements (NFRs) & Performance SLAs

| Attribute | Specification & SLA |
|---|---|
| **App Bundle Size (Mobile)** | < 25MB production standalone APK / IPA build |
| **First Contentful Paint (Web)**| < 0.8s on 4G standard network |
| **Optimistic UI Updates** | UI state updates in < 16ms (instant 60fps response) prior to Supabase roundtrip |
| **Database Query SLA** | All indexed expense queries execute in < 25ms at 100,000 rows |
| **Security Compliance** | TLS 1.3 in transit, AES-256 at rest; zero plain-text storage of auth tokens |
| **Accessibility (a11y)** | WCAG 2.1 AA compliance for web components; minimum 48x48px touch targets on mobile |

---

## 9. Implementation Roadmap & Milestones

```text
Sprint 1: Architecture & Auth Infrastructure (Days 1–3)
├── Setup Turborepo with pnpm workspaces (apps/web, apps/mobile, packages/*)
├── Configure Supabase PostgreSQL tables, indexes, triggers, and RLS policies
├── Implement @repo/validators Zod schemas and @repo/types generation
└── Implement Next.js SSR middleware and Expo SecureStore auth flow

Sprint 2: Core Expense Tracking & Optimistic CRUD (Days 4–7)
├── Build shared TanStack Query hooks in packages/api
├── Mobile: Custom numpad, instant category picker, and recent activity feed
├── Web: shadcn/ui DataTable with server-side pagination and filters
└── Implement optimistic updates for add/edit/delete operations

Sprint 3: Budgets, Aggregations & Analytics (Days 8–11)
├── Build budget calculations and burn rate utilities in packages/utils
├── Web: Integrate Recharts for category donut and spending velocity charts
├── Mobile: Add Category Budget Progress Cards with colored threshold alerts
└── Enable real-time WebSocket syncing across active tabs and devices

Sprint 4: Export, Optimization & Release (Days 12–14)
├── Implement CSV / Excel streaming export in apps/web/src/app/api/export
├── Add receipt image upload to Supabase Storage with signed URLs
├── Run Lighthouse audits and optimize mobile memory footprint
└── Configure Vercel production deployment and EAS mobile build pipeline
```
