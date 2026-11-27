import { api } from './api';
import type { VerificationResponse } from '../types/verification';

/** Contrato multipart publico do endpoint real /api/v1/documents/verify. */
export const verificationService = {
  /** Envia o arquivo para verificacao e recebe valid, tampered ou not_found. */
  verify(file: File, onProgress?: (percent: number) => void) {
    const form = new FormData();
    form.append('file', file);
    // O navegador precisa definir sozinho o boundary do multipart.
    return api.post<VerificationResponse>('/documents/verify', form, {
      onUploadProgress: event => { if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100)); },
    });
  },
};
