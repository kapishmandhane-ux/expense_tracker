import { z } from 'zod';

export const BudgetSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  monthly_limit: z
    .number({ invalid_type_error: 'Limit must be a number' })
    .positive('Budget limit must be greater than zero')
    .max(100_000_000, 'Monthly budget limit too high'),
  month: z.string().regex(/^\d{4}-\d{2}-01$/, 'Month must be in YYYY-MM-01 format'),
});

export const UpdateBudgetSchema = BudgetSchema.partial().extend({
  id: z.string().uuid('Invalid budget ID'),
});

export type BudgetInput = z.infer<typeof BudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>;
