import { api } from './api';
import type { VerificationResponse } from '../types/verification';

// Public multipart contract implemented by /api/v1/documents/verify.
export const verificationService = {
  verify(file: File, onProgress?: (percent: number) => void) {
    const form = new FormData();
    form.append('file', file);
    // Leave Content-Type unset so the browser adds the multipart boundary.
    return api.post<VerificationResponse>('/documents/verify', form, {
      onUploadProgress: event => { if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100)); },
    });
  },
};
