import { api } from './api';
import type { SealPosition } from '../utils/seal-position';

// Provisional path until the backend publishes its signing contract.
export const signatureService = {
  sign(file: File, seal: SealPosition, onProgress?: (percent: number) => void) {
    const form = new FormData();
    form.append('file', file);
    form.append('page', String(seal.page));
    form.append('x', String(seal.x));
    form.append('y', String(seal.y));
    // The default JSON content type would make axios serialize the form; multipart keeps the binary file.
    return api.post<Blob>('/documents/sign', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      onUploadProgress: event => { if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100)); },
    });
  },
};
