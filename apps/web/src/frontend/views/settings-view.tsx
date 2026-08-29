'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Globe,
  Tag,
  Plus,
  Trash2,
  Edit2,
  Check,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ThemeToggle } from '../components/theme-toggle';
import { useCurrency } from '../components/currency-provider';
import { useCategoriesQuery, useCategoryMutations } from '@repo/api';
import { createClient } from '@/backend/supabase/client';
import { SupportedCurrencyCode } from '@repo/utils';
import { ICON_MAP, COLOR_PALETTE } from '../components/category-manager-modal';

export function SettingsView() {
  const supabase = React.useMemo(() => createClient(), []);
  const { currency, setCurrency, currencyList, format } = useCurrency();
  const { data: categories = [] } = useCategoriesQuery(supabase);
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations(supabase);

  // Profile Form State
  const [fullName, setFullName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@example.com');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState(COLOR_PALETTE[0]);
  const [catIcon, setCatIcon] = useState('tag');
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Load User Data from Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email || 'user@example.com');
        (supabase.from('profiles') as any)
          .select('*')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }: any) => {
            if (profile?.full_name) setFullName(profile.full_name);
          });
      }
    });
  }, [supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(false);

    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await (supabase.from('profiles') as any)
          .update({ full_name: fullName, currency_code: currency })
          .eq('id', data.user.id);
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {} finally {
      setIsSavingProfile(false);
    }
  };

  const handleStartCreateCat = () => {
    setEditingCatId(null);
    setCatName('');
    setCatColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
    setCatIcon('tag');
    setCatError(null);
    setIsCreatingCategory(true);
  };

  const handleStartEditCat = (cat: any) => {
    setIsCreatingCategory(false);
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatColor(cat.color || COLOR_PALETTE[0]);
    setCatIcon(cat.icon || 'tag');
    setCatError(null);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('Category name is required.');
      return;
    }
    setCatSubmitting(true);
    setCatError(null);

    try {
      if (editingCatId) {
        await updateCategory.mutateAsync({
          id: editingCatId,
          name: catName.trim(),
          color: catColor,
          icon: catIcon,
        });
        setEditingCatId(null);
      } else {
        await createCategory.mutateAsync({
          name: catName.trim(),
          color: catColor,
          icon: catIcon,
        });
        setIsCreatingCategory(false);
      }
      setCatName('');
    } catch (err: any) {
      setCatError(err?.message || 'Failed to save category.');
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleDeleteCat = async (id: string, isSystem?: boolean) => {
    if (isSystem) return;
    try {
      await deleteCategory.mutateAsync(id);
    } catch (err: any) {
      setCatError(err?.message || 'Failed to delete category.');
    }
  };

  const SelectedIconComp = ICON_MAP[catIcon] || Tag;

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings & Customization
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your profile, active currency, visual theme, and custom spending categories
        </p>
      </div>

      {/* 1. Profile Card */}
      <div className="glass-card p-6 space-y-5 rounded-3xl relative">
        <div className="specular-line" />
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-500" />
            Profile Information
          </h2>
          {profileSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Saved Successfully</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isSavingProfile ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Currency & Localization */}
      <div className="glass-card p-6 space-y-5 rounded-3xl relative">
        <div className="specular-line" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-sky-500" />
              Active Currency & Localization
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose your primary currency for all financial charts, metrics, and receipts
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            Preview: {format(14250.50)}
          </span>
        </div>

        {/* Currency Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currencyList.map((c) => {
            const isSelected = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code as SupportedCurrencyCode)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{c.flag}</span>
                  {isSelected && (
                    <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {c.code} ({c.symbol})
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Custom Category Management */}
      <div className="glass-card p-6 space-y-5 rounded-3xl relative">
        <div className="specular-line" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-500" />
              Category Customization
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add custom spending categories with personalized colors and lifestyle icons
            </p>
          </div>

          {!isCreatingCategory && !editingCatId && (
            <button
              onClick={handleStartCreateCat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Category</span>
            </button>
          )}
        </div>

        {catError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{catError}</span>
          </div>
        )}

        {/* Category Form */}
        {(isCreatingCategory || editingCatId) && (
          <form
            onSubmit={handleSaveCategory}
            className="p-5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-indigo-500/30 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {editingCatId ? 'Edit Category' : 'New Custom Category'}
              </span>

              {/* Preview Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                style={{ backgroundColor: `${catColor}20`, color: catColor }}
              >
                <SelectedIconComp className="h-3.5 w-3.5" />
                <span>{catName || 'Preview'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Coffee, Subscriptions, Fitness"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Color Accent
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCatColor(c)}
                    className={`h-7 w-7 rounded-xl flex items-center justify-center transition-transform cursor-pointer ${
                      catColor === c ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {catColor === c && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="h-7 w-7 rounded-xl bg-transparent border-0 cursor-pointer p-0"
                  title="Custom HEX Color"
                />
              </div>
            </div>

            {/* Icons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Icon
              </label>
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-28 overflow-y-auto p-1 border border-slate-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-slate-900/50">
                {Object.entries(ICON_MAP).map(([key, IconComp]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCatIcon(key)}
                    className={`p-2 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      catIcon === key
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                    title={key}
                  >
                    <IconComp className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingCategory(false);
                  setEditingCatId(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={catSubmitting}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition cursor-pointer"
              >
                {catSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>{editingCatId ? 'Update Category' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Existing Categories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat: any) => {
            const color = cat.color || '#64748b';
            const IconComp = (cat.icon && ICON_MAP[cat.icon]) ? ICON_MAP[cat.icon] : Tag;

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {cat.is_system ? 'System Default' : 'Custom Category'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEditCat(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {!cat.is_system && (
                    <button
                      onClick={() => handleDeleteCat(cat.id, cat.is_system)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Preferences & Theme */}
      <div className="glass-card p-6 space-y-4 rounded-3xl relative">
        <div className="specular-line" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-500" />
          Appearance & Theme
        </h2>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Theme Mode</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toggle between Night Glass and Day Glass interface
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
