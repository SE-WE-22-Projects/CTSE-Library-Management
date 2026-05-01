import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { useAuthStore } from './store/authStore';

import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { BooksList } from './pages/books/BooksList';
import { MyLendings } from './pages/lendings/MyLendings';
import { ManageBooks } from './pages/admin/ManageBooks';
import { Notifications } from './pages/notifications/Notifications';

// Auth Guard Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Public Only Guard (prevents logged in users from seeing login page)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/books', element: <BooksList /> },
      { path: '/lendings', element: <MyLendings /> },
      { path: '/admin/books', element: <ManageBooks /> },
      { path: '/notifications', element: <Notifications /> },
    ],
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
]);
