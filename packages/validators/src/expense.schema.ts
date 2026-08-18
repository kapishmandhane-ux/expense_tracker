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
  category_id: z.string().uuid('Invalid category ID').nullable().optional(),
  payment_method: PaymentMethodEnum.default('upi'),
  note: z.string().max(255, 'Note cannot exceed 255 characters').optional().nullable(),
  spent_at: z.string().datetime().or(z.date()),
  receipt_storage_path: z.string().optional().nullable(),
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial().extend({
  id: z.string().uuid('Invalid expense ID'),
});

export const ExpenseFilterSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  category_id: z.string().uuid().optional(),
  payment_method: PaymentMethodEnum.optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
export type ExpenseFilterInput = z.infer<typeof ExpenseFilterSchema>;
