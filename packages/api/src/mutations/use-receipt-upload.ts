import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@repo/types';

export interface UploadReceiptResult {
  path: string;
  url: string;
  error: Error | null;
}

export function useReceiptUpload(supabase: SupabaseClient<Database, any, any>) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Upload a file (Image / PDF) to the 'receipts' bucket
   */
  const uploadReceipt = async (
    file: File,
    userId?: string
  ): Promise<UploadReceiptResult> => {
    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Get current user if userId not passed
      let uid = userId;
      if (!uid) {
        const { data } = await supabase.auth.getUser();
        uid = data?.user?.id || 'anonymous';
      }

      // Generate a clean sanitized unique file path: userId/timestamp_filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${uid}/${timestamp}_${sanitizedName}`;

      setUploadProgress(40);

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      setUploadProgress(80);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(data.path);

      setUploadProgress(100);
      setIsUploading(false);

      return {
        path: data.path,
        url: urlData.publicUrl,
        error: null,
      };
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      return {
        path: '',
        url: '',
        error: err instanceof Error ? err : new Error(err?.message || 'Failed to upload receipt'),
      };
    }
  };

  /**
   * Delete a receipt file from storage
   */
  const deleteReceipt = async (filePath: string): Promise<{ error: Error | null }> => {
    if (!filePath) return { error: null };
    try {
      const { error } = await supabase.storage.from('receipts').remove([filePath]);
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return {
        error: err instanceof Error ? err : new Error(err?.message || 'Failed to delete receipt'),
      };
    }
  };

  /**
   * Get public or display URL for a stored receipt path
   */
  const getReceiptUrl = (filePath: string | null | undefined): string | null => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
    return data.publicUrl;
  };

  return {
    uploadReceipt,
    deleteReceipt,
    getReceiptUrl,
    isUploading,
    uploadProgress,
  };
}
