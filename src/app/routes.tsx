import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Loader2 } from "lucide-react";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { NewLogin } from "./pages/NewLogin";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Vehicles } from "./pages/Vehicles";
import { Tires } from "./pages/Tires";
import { Settings } from "./pages/Settings";

const Trips = lazy(() =>
  import("./pages/Trips")
    .then((m) => ({ default: m.Trips }))
    .catch((err: unknown) => ({
      default: () => (
        <div className="p-6 text-sm text-amber-800">
          Erro ao carregar Viagens: {err instanceof Error ? err.message : "erro desconhecido"}
        </div>
      ),
    }))
);

const Funcionarios = lazy(() =>
  import("./pages/Funcionarios")
    .then((m) => ({ default: m.Funcionarios }))
    .catch((err: unknown) => ({
      default: () => (
        <div className="p-6 text-sm text-amber-800">
          Erro ao carregar Funcionários: {err instanceof Error ? err.message : "erro desconhecido"}
        </div>
      ),
    }))
);

function PageLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Carregando...
    </div>
  );
}

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
        <Route path="settings" element={<Settings />} />
        <Route
          path="trips"
          element={
            <Suspense fallback={<PageLoading />}>
              <Trips />
            </Suspense>
          }
        />
        <Route
          path="funcionarios"
          element={
            <Suspense fallback={<PageLoading />}>
              <Funcionarios />
            </Suspense>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
