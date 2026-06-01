import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useSystem } from './contexts/SystemContext';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';
import { SystemSelectionPage } from './pages/SystemSelectionPage';
import { hasSelectedSystem, isAuthenticated } from './utils/storage';

function useHasCurrentSystemSelection() {
  const { hasSystemSelection } = useSystem();

  return hasSystemSelection && hasSelectedSystem();
}

function HomeRedirect() {
  const hasSystemSelection = useHasCurrentSystemSelection();

  if (!hasSystemSelection) {
    return <Navigate to="/systems" replace />;
  }

  return isAuthenticated() ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />;
}

function RequireSystemSelection({ children }: { children: ReactNode }) {
  const hasSystemSelection = useHasCurrentSystemSelection();

  if (!hasSystemSelection) {
    return <Navigate to="/systems" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/systems" element={<SystemSelectionPage />} />

      <Route
        path="/login"
        element={
          <RequireSystemSelection>
            <LoginPage />
          </RequireSystemSelection>
        }
      />

      <Route
        path="/chat"
        element={
          <RequireSystemSelection>
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          </RequireSystemSelection>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
