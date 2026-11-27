import { api } from './api';
import type { VerificationResponse } from '../types/verification';

// Public multipart contract implemented by /api/v1/documents/verify.
export const verificationService = {
  verify(file: File, onProgress?: (percent: number) => void) {
    const form = new FormData();
    form.append('file', file);
    // The default JSON content type would make axios serialize the form; multipart keeps the binary file.
    return api.post<VerificationResponse>('/documents/verify', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: event => { if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100)); },
    });
  },
};
