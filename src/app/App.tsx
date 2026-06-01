import { BrowserRouter } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { FleetProvider } from "./contexts/FleetContext";
import { TripsProvider } from "./contexts/TripsContext";
import { AppRoutes } from "./routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FleetProvider>
          <TripsProvider>
            <AppRoutes />
            <Toaster richColors position="top-center" />
          </TripsProvider>
        </FleetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}