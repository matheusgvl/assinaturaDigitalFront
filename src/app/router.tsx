import { createBrowserRouter } from 'react-router-dom';
import { AppLayout, PublicLayout } from '../components/layout/Layouts';
import { LoginPage, RegisterPage, PasskeyPage, TotpPage, TotpLoginPage, RecoveryCodesPage, DashboardPage, SignDocumentPage, VerifyDocumentPage, NotFoundPage } from '../pages/Pages'; import { LandingPage } from '../pages/LandingPage';
export const router = createBrowserRouter([
  { element: <PublicLayout />, children: [{ path: '/', element: <LandingPage /> }, { path: '/login', element: <LoginPage /> }, { path: '/register', element: <RegisterPage /> }, { path: '/passkeys', element: <PasskeyPage /> }, { path: '/security/totp', element: <TotpPage /> }, { path: '/login/totp', element: <TotpLoginPage /> }, { path: '/security/recovery-codes', element: <RecoveryCodesPage /> }, { path: '/verify', element: <VerifyDocumentPage /> }] },
  // Private routes are grouped here for the future authentication guard.
  { element: <AppLayout />, children: [{ path: '/dashboard', element: <DashboardPage /> }, { path: '/sign', element: <SignDocumentPage /> }] },
  { path: '*', element: <NotFoundPage /> },
]);
