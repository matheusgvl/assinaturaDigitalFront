import { createBrowserRouter } from 'react-router-dom';
import { AppLayout, PublicLayout } from '../components/layout/Layouts';
import { LoginPage, RegisterPage, TotpPage, TotpLoginPage, RecoveryCodesPage, DashboardPage, NotFoundPage } from '../pages/Pages'; import { LandingPage } from '../pages/LandingPage';
import { RequireAuth } from './session'; import { SignDocumentPage } from '../pages/SignDocumentPage'; import { VerifyDocumentPage } from '../pages/VerifyDocumentPage'; import { DevicesPage, SessionsPage } from '../pages/SecurityPages';
export const router = createBrowserRouter([
  { element: <PublicLayout />, children: [{ path: '/', element: <LandingPage /> }, { path: '/login', element: <LoginPage /> }, { path: '/register', element: <RegisterPage /> }, { path: '/login/totp', element: <TotpLoginPage /> }, { path: '/verify', element: <VerifyDocumentPage /> }] },
  { element: <RequireAuth />, children: [{ element: <AppLayout />, children: [{ path: '/dashboard', element: <DashboardPage /> }, { path: '/sign', element: <SignDocumentPage /> }, { path: '/passkeys', element: <DevicesPage /> }, { path: '/security/sessions', element: <SessionsPage /> }, { path: '/security/totp', element: <TotpPage /> }, { path: '/security/recovery-codes', element: <RecoveryCodesPage /> }] }] },
  { path: '*', element: <NotFoundPage /> },
]);
