import { createBrowserRouter } from 'react-router-dom';
import { AppLayout, PublicLayout } from '../components/layout/Layouts';
import { LoginPage, RegisterPage, PasskeyPage, TotpPage, TotpLoginPage, RecoveryCodesPage, DashboardPage, VerifyDocumentPage, SessionsPage, NotFoundPage } from '../pages/Pages'; import { LandingPage } from '../pages/LandingPage';
import { RequireAuth } from './session'; import { SignDocumentPage } from '../pages/SignDocumentPage';
export const router = createBrowserRouter([
  { element: <PublicLayout />, children: [{ path: '/', element: <LandingPage /> }, { path: '/login', element: <LoginPage /> }, { path: '/register', element: <RegisterPage /> }, { path: '/login/totp', element: <TotpLoginPage /> }, { path: '/verify', element: <VerifyDocumentPage /> }] },
  { element: <RequireAuth />, children: [{ element: <AppLayout />, children: [{ path: '/dashboard', element: <DashboardPage /> }, { path: '/sign', element: <SignDocumentPage /> }, { path: '/passkeys', element: <PasskeyPage /> }, { path: '/security/sessions', element: <SessionsPage /> }, { path: '/security/totp', element: <TotpPage /> }, { path: '/security/recovery-codes', element: <RecoveryCodesPage /> }] }] },
  { path: '*', element: <NotFoundPage /> },
]);
