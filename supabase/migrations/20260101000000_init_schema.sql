-- ============================================================================
-- SPENDY / FINTRACK - INITIAL DATABASE SCHEMA MIGRATION
-- PostgreSQL 16+ on Supabase with Row Level Security (RLS)
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Custom Enums
do $$ begin
  create type payment_mode as enum ('cash', 'upi', 'debit_card', 'credit_card', 'net_banking', 'other');
exception
  when duplicate_object then null;
end $$;

-- 2. User Profiles Table (Synced with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  currency_code text not null default 'INR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default 'tag',
  color text not null default '#64748b',
  is_system boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Expenses Table
create table if not exists public.expenses (
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
create table if not exists public.budgets (
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
create index if not exists idx_expenses_user_spent_at on public.expenses (user_id, spent_at desc);
create index if not exists idx_expenses_category on public.expenses (category_id);
create index if not exists idx_budgets_user_month on public.budgets (user_id, month);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;

-- Profiles Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Categories Policies
drop policy if exists "Users can view own categories" on public.categories;
create policy "Users can view own categories" on public.categories
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own categories" on public.categories;
create policy "Users can insert own categories" on public.categories
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own categories" on public.categories;
create policy "Users can update own categories" on public.categories
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own categories" on public.categories;
create policy "Users can delete own categories" on public.categories
  for delete using (auth.uid() = user_id);

-- Expenses Policies
drop policy if exists "Users can view own expenses" on public.expenses;
create policy "Users can view own expenses" on public.expenses
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own expenses" on public.expenses;
create policy "Users can insert own expenses" on public.expenses
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own expenses" on public.expenses;
create policy "Users can update own expenses" on public.expenses
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own expenses" on public.expenses;
create policy "Users can delete own expenses" on public.expenses
  for delete using (auth.uid() = user_id);

-- Budgets Policies
drop policy if exists "Users can view own budgets" on public.budgets;
create policy "Users can view own budgets" on public.budgets
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own budgets" on public.budgets;
create policy "Users can insert own budgets" on public.budgets
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own budgets" on public.budgets;
create policy "Users can update own budgets" on public.budgets
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own budgets" on public.budgets;
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
