'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Tag,
  Utensils,
  Coffee,
  ShoppingCart,
  Car,
  Fuel,
  Plane,
  Receipt,
  Film,
  ShoppingBag,
  Gift,
  Activity,
  HeartPulse,
  Gamepad2,
  Wifi,
  Home,
  Briefcase,
  GraduationCap,
  Sparkles,
  DollarSign,
  Smartphone,
  BookOpen,
  Music,
  Dumbbell,
  Shield,
  Loader2,
} from 'lucide-react';
import { useCategoryMutations } from '@repo/api';
import { createClient } from '@/backend/supabase/client';

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  tag: Tag,
  utensils: Utensils,
  coffee: Coffee,
  'shopping-cart': ShoppingCart,
  car: Car,
  fuel: Fuel,
  plane: Plane,
  receipt: Receipt,
  film: Film,
  'shopping-bag': ShoppingBag,
  gift: Gift,
  activity: Activity,
  'heart-pulse': HeartPulse,
  gamepad: Gamepad2,
  wifi: Wifi,
  home: Home,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  'dollar-sign': DollarSign,
  smartphone: Smartphone,
  'book-open': BookOpen,
  music: Music,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
};

export const COLOR_PALETTE = [
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#78716c', // Stone
  '#64748b', // Slate
];

export interface CategoryItem {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  is_system?: boolean;
}

export interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
}: CategoryManagerModalProps) {
  const supabase = React.useMemo(() => createClient(), []);
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations(supabase);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [icon, setIcon] = useState('utensils');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingId(null);
    setName('');
    setColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
    setIcon('tag');
    setErrorMsg(null);
    setIsCreating(true);
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setIsCreating(false);
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color || COLOR_PALETTE[0]);
    setIcon(cat.icon || 'tag');
    setErrorMsg(null);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setErrorMsg(null);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingId) {
        await updateCategory.mutateAsync({
          id: editingId,
          name: name.trim(),
          color,
          icon,
        });
        setEditingId(null);
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          color,
          icon,
        });
        setIsCreating(false);
      }
      setName('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, isSystem?: boolean) => {
    if (isSystem) return;
    try {
      await deleteCategory.mutateAsync(id);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete category.');
    }
  };

  const SelectedIconComponent = ICON_MAP[icon] || Tag;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-2xl w-full p-6 sm:p-7 rounded-3xl space-y-6 shadow-2xl border border-slate-200/80 dark:border-white/10 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Category Manager
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize spending categories, colors, and icons
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Create / Edit Category Form */}
        {(isCreating || editingId) && (
          <form
            onSubmit={handleSaveCategory}
            className="p-5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.03] border border-indigo-500/30 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </span>

              {/* Live Preview Pill */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                style={{ backgroundColor: `${color}20`, color: color }}
              >
                <SelectedIconComponent className="h-3.5 w-3.5" />
                <span>{name || 'Category Name'}</span>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Subscriptions, Hobbies, Pet Care"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Color Swatches */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Color Palette
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-xl flex items-center justify-center transition-transform cursor-pointer ${
                      color === c ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-7 w-7 rounded-xl bg-transparent border-0 cursor-pointer p-0"
                  title="Custom Color"
                />
              </div>
            </div>

            {/* Icon Picker Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Icon
              </label>
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-28 overflow-y-auto p-1 border border-slate-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-slate-900/50">
                {Object.entries(ICON_MAP).map(([key, IconComp]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    className={`p-2 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      icon === key
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

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>{editingId ? 'Update Category' : 'Save Category'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Categories List */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Existing Categories ({categories.length})
            </span>
            {!isCreating && !editingId && (
              <button
                type="button"
                onClick={handleStartCreate}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Category</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const catColor = cat.color || '#64748b';
              const IconComp = (cat.icon && ICON_MAP[cat.icon]) ? ICON_MAP[cat.icon] : Tag;

              return (
                <div
                  key={cat.id}
                  className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex items-center justify-between hover:border-slate-300 dark:hover:border-white/20 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center shadow-xs"
                      style={{
                        backgroundColor: `${catColor}20`,
                        color: catColor,
                      }}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {cat.is_system ? 'Default category' : 'Custom user category'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {!cat.is_system && (
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.is_system)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Category"
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

      </div>
    </div>
  );
}
