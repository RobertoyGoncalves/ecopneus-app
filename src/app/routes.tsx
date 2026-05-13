import { Routes, Route, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { NewLogin } from "./pages/NewLogin";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Vehicles } from "./pages/Vehicles";
import { Tires } from "./pages/Tires";
import { Trips } from "./pages/Trips";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<NewLogin />} />
      <Route path="/cadastro" element={<Register />} />

      {/* URLs antigas (antes de /app) */}
      <Route path="/vehicles" element={<Navigate to="/app/vehicles" replace />} />
      <Route path="/tires" element={<Navigate to="/app/tires" replace />} />
      <Route path="/trips" element={<Navigate to="/app/trips" replace />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="tires" element={<Tires />} />
        <Route path="trips" element={<Trips />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
