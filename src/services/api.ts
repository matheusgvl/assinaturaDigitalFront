import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1', timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000), withCredentials: true, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => { const token = sessionStorage.getItem('access_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export function getApiErrorMessage(error: unknown): string { if (axios.isAxiosError(error)) return error.response?.data?.message ?? 'Não foi possível concluir a solicitação.'; return 'Ocorreu um erro inesperado.'; }
