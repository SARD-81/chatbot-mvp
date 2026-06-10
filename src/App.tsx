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

/**
 * Home redirect:
 * - Not authenticated → /login
 * - Authenticated but no system → /systems
 * - Authenticated + system selected → /chat
 */
function HomeRedirect() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const hasSystem = hasSelectedSystem();
  return hasSystem ? <Navigate to="/chat" replace /> : <Navigate to="/systems" replace />;
}

/**
 * Guard: only allow access if user is authenticated.
 * Redirects to /login otherwise.
 */
function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * Guard: only allow access if user is authenticated AND has selected a system.
 */
function RequireAuthAndSystem({ children }: { children: ReactNode }) {
  const hasSystem = useHasCurrentSystemSelection();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!hasSystem) {
    return <Navigate to="/systems" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Home: smart redirect based on auth + system state */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Step 1: Global login — no system needed */}
      <Route path="/login" element={<LoginPage />} />

      {/* Step 2: Pick a system — must be authenticated */}
      <Route
        path="/systems"
        element={
          <RequireAuth>
            <SystemSelectionPage />
          </RequireAuth>
        }
      />

      {/* Step 3: Chat — must be authenticated AND have a system */}
      <Route
        path="/chat"
        element={
          <RequireAuthAndSystem>
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          </RequireAuthAndSystem>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
