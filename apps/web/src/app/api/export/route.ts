import { NextRequest } from 'next/server';
import { handleExpenseCsvExport } from '@/backend/api/export/export-service';

export async function GET(request: NextRequest) {
  return handleExpenseCsvExport(request);
}
