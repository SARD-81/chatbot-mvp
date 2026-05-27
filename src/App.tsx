import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';
import { isAuthenticated } from './utils/storage';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated() ? (
            <Navigate to="/chat" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}