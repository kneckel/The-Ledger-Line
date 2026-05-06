import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewslettersPage } from './pages/NewslettersPage';
import { EditorPage } from './pages/EditorPage';
import { SubscribersPage } from './pages/SubscribersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/newsletters" element={<NewslettersPage />} />
        <Route path="/newsletters/new" element={<EditorPage />} />
        <Route path="/newsletters/:id" element={<EditorPage />} />
        <Route path="/subscribers" element={<SubscribersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
