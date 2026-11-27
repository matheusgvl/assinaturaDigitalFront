import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppLayout, PublicLayout } from '../components/layout/Layouts';
import { LoginPage, RegisterPage, TotpPage, TotpLoginPage, RecoveryCodesPage, DashboardPage, NotFoundPage } from '../pages/Pages'; import { LandingPage } from '../pages/LandingPage';
import { RequireAuth } from './session'; import { SignDocumentPage } from '../pages/SignDocumentPage'; import { VerifyDocumentPage } from '../pages/VerifyDocumentPage'; import { AccountSecurityPage, DevicesPage, SessionsPage } from '../pages/SecurityPages';
// Exported so tests can mount the real route tree in a memory router.
export const routes: RouteObject[] = [
  { element: <PublicLayout />, children: [{ path: '/', element: <LandingPage /> }, { path: '/login', element: <LoginPage /> }, { path: '/register', element: <RegisterPage /> }, { path: '/login/totp', element: <TotpLoginPage /> }, { path: '/verify', element: <VerifyDocumentPage /> }] },
  { element: <RequireAuth />, children: [{ element: <AppLayout />, children: [{ path: '/dashboard', element: <DashboardPage /> }, { path: '/sign', element: <SignDocumentPage /> }, { path: '/passkeys', element: <DevicesPage /> }, { path: '/security', element: <AccountSecurityPage /> }, { path: '/security/sessions', element: <SessionsPage /> }, { path: '/security/totp', element: <TotpPage /> }, { path: '/security/recovery-codes', element: <RecoveryCodesPage /> }] }] },
  { path: '*', element: <NotFoundPage /> },
];
export const router = createBrowserRouter(routes);
