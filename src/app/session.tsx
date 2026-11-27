import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import axios from 'axios';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { onSessionExpired, setAccessToken } from '../services/api';
import type { AuthUser } from '../types/auth';
import { ErrorState, LoadingState } from '../components/feedback';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
type Session = {
  status: SessionStatus;
  user: AuthUser | null;
  // True when an active session was lost (refresh rejected), so the login page can explain why.
  expired: boolean;
  reload: () => Promise<void>;
  signIn: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [expired, setExpired] = useState(false);
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Without a token in memory, /auth/me answers 401 and the API client tries the refresh cookie once.
  const check = useCallback(() => authService.me().then(
    response => { setUser(response.data); setStatus('authenticated'); },
    error => {
      setUser(null);
      // 401/403 means no valid session; anything else is an API failure the user can retry.
      const code = axios.isAxiosError(error) ? error.response?.status : undefined;
      setStatus(code === 401 || code === 403 ? 'unauthenticated' : 'error');
    },
  ), []);

  const reload = useCallback(async () => { setStatus('loading'); await check(); }, [check]);

  const signIn = useCallback(async (accessToken: string) => { setAccessToken(accessToken); setExpired(false); await reload(); }, [reload]);

  const signOut = useCallback(async () => {
    // Server-side invalidation of the refresh token and JWT (REQ-21, REQ-23); local state is cleared even if it fails.
    try { await authService.logout(); } catch { /* still end the local session */ }
    setAccessToken(null);
    setUser(null);
    setExpired(false);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => { void check(); }, [check]);

  // Only a session that was active counts as "expired"; a visitor without a session just sees the login.
  useEffect(() => onSessionExpired(() => {
    if (statusRef.current === 'authenticated') setExpired(true);
    setUser(null);
    setStatus('unauthenticated');
  }), []);

  return <SessionContext.Provider value={{ status, user, expired, reload, signIn, signOut }}>{children}</SessionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider');
  return session;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRedirectTarget() {
  const location = useLocation();
  return (location.state as { from?: string } | null)?.from ?? '/dashboard';
}

// Visual guard only; the backend must still reject unauthenticated requests.
export function RequireAuth() {
  const { status, reload } = useSession();
  const location = useLocation();
  if (status === 'loading') return <main className="app-main" id="main-content" tabIndex={-1}><LoadingState label="Verificando sessão…" /></main>;
  if (status === 'error') return <main className="app-main" id="main-content" tabIndex={-1}><ErrorState onRetry={() => void reload()} /></main>;
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
