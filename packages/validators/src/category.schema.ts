import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
  icon: z.string().min(1, 'Icon identifier is required').default('tag'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid HEX color code').default('#64748b'),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: z.string().uuid('Invalid category ID'),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
