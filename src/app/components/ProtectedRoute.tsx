import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 text-sm">
        Carregando sessão…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
