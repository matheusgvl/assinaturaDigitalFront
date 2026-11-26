import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { AuthUser } from '../types/auth';
import { ErrorState, LoadingState } from '../components/feedback';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
type Session = { status: SessionStatus; user: AuthUser | null; reload: () => Promise<void> };

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

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

  useEffect(() => { void check(); }, [check]);

  return <SessionContext.Provider value={{ status, user, reload }}>{children}</SessionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider');
  return session;
}

// Visual guard only; the backend must still reject unauthenticated requests.
export function RequireAuth() {
  const { status, reload } = useSession();
  const location = useLocation();
  if (status === 'loading') return <main className="app-main" id="main-content"><LoadingState label="Verificando sessão…" /></main>;
  if (status === 'error') return <main className="app-main" id="main-content"><ErrorState onRetry={() => void reload()} /></main>;
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
