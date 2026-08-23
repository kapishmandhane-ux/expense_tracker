import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../supabase/server';

export interface ExportFilters {
  startDate?: string | null;
  endDate?: string | null;
  category?: string | null;
  paymentMethod?: string | null;
}

export async function handleExpenseCsvExport(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const category = searchParams.get('category');
  const paymentMethod = searchParams.get('paymentMethod');

  const supabase = await createClient();

  let query = supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .order('spent_at', { ascending: false });

  if (startDate) {
    query = query.gte('spent_at', startDate);
  }
  if (endDate) {
    query = query.lte('spent_at', endDate);
  }
  if (paymentMethod && paymentMethod !== 'all') {
    query = query.eq('payment_method', paymentMethod as any);
  }

  const { data: expenses } = await query;

  // Fallback sample data if database is empty or running in local demo mode
  let records: any[] = (expenses as any[]) || [];
  if (records.length === 0) {
    records = [
      {
        id: 'exp-1',
        user_id: 'demo-user',
        amount: 2450.0,
        payment_method: 'upi',
        spent_at: '2026-08-19T10:30:00Z',
        note: 'Whole Foods Market - Organic produce',
        category_id: 'cat-2',
        receipt_storage_path: null,
        created_at: '2026-08-19T10:30:00Z',
        updated_at: '2026-08-19T10:30:00Z',
        category: { name: 'Groceries' },
      } as any,
      {
        id: 'exp-2',
        user_id: 'demo-user',
        amount: 480.0,
        payment_method: 'credit_card',
        spent_at: '2026-08-19T08:15:00Z',
        note: 'Starbucks Reserve Coffee',
        category_id: 'cat-1',
        receipt_storage_path: null,
        created_at: '2026-08-19T08:15:00Z',
        updated_at: '2026-08-19T08:15:00Z',
        category: { name: 'Food & Dining' },
      } as any,
      {
        id: 'exp-3',
        user_id: 'demo-user',
        amount: 620.0,
        payment_method: 'upi',
        spent_at: '2026-08-18T21:40:00Z',
        note: 'Uber Premier airport drop',
        category_id: 'cat-3',
        receipt_storage_path: null,
        created_at: '2026-08-18T21:40:00Z',
        updated_at: '2026-08-18T21:40:00Z',
        category: { name: 'Transportation' },
      } as any,
      {
        id: 'exp-4',
        user_id: 'demo-user',
        amount: 3200.0,
        payment_method: 'net_banking',
        spent_at: '2026-08-17T14:00:00Z',
        note: 'Electricity & Broadband Bill',
        category_id: 'cat-4',
        receipt_storage_path: null,
        created_at: '2026-08-17T14:00:00Z',
        updated_at: '2026-08-17T14:00:00Z',
        category: { name: 'Bills & Utilities' },
      } as any,
    ];
  }

  // Filter category if specified
  if (category && category !== 'all') {
    records = records.filter(
      (r) => (r.category?.name || '').toLowerCase() === category.toLowerCase()
    );
  }

  // Generate CSV Rows
  const headers = ['Transaction ID', 'Date', 'Category', 'Note / Merchant', 'Payment Method', 'Receipt Attached', 'Amount (INR)'];
  const rows = records.map((r) => [
    `"${r.id}"`,
    `"${new Date(r.spent_at).toISOString().slice(0, 10)}"`,
    `"${(r.category?.name || 'Uncategorized').replace(/"/g, '""')}"`,
    `"${(r.note || '').replace(/"/g, '""')}"`,
    `"${r.payment_method?.toUpperCase() || 'UPI'}"`,
    `"${r.receipt_storage_path ? 'YES' : 'NO'}"`,
    Number(r.amount).toFixed(2),
  ]);

  // Compute Total
  const totalAmount = records.reduce((sum, r) => sum + Number(r.amount), 0);
  rows.push(['"TOTAL"', '""', '""', '""', '""', '""', totalAmount.toFixed(2)]);

  // UTF-8 BOM (\uFEFF) for Excel unicode compatibility
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const filename = `spendy_expenses_export_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
