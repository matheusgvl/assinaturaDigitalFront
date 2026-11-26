import { createBrowserRouter } from 'react-router-dom';
import { AppLayout, PublicLayout } from '../components/layout/Layouts';
import { HomePage, LoginPage, RegisterPage, DashboardPage, SignDocumentPage, VerifyDocumentPage, NotFoundPage } from '../pages/Pages';
export const router = createBrowserRouter([{ element: <PublicLayout />, children: [{ path: '/', element: <HomePage /> }, { path: '/login', element: <LoginPage /> }, { path: '/register', element: <RegisterPage /> }, { path: '/verify', element: <VerifyDocumentPage /> }] }, { element: <AppLayout />, children: [{ path: '/dashboard', element: <DashboardPage /> }, { path: '/sign', element: <SignDocumentPage /> }] }, { path: '*', element: <NotFoundPage /> }]);
