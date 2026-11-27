import { api } from './api';
import type { SealPosition } from '../utils/seal-position';

// Multipart contract implemented by the backend under /api/v1/documents/sign.
export const signatureService = {
  sign(file: File, seal: SealPosition, onProgress?: (percent: number) => void) {
    const form = new FormData();
    form.append('file', file);
    form.append('page', String(seal.page));
    form.append('x', String(seal.x));
    form.append('y', String(seal.y));
    // Leave Content-Type unset so the browser adds the multipart boundary.
    return api.post<Blob>('/documents/sign', form, {
      responseType: 'blob',
      onUploadProgress: event => { if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100)); },
    });
  },
};
