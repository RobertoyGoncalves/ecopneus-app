import { BrowserRouter } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { FleetProvider } from "./contexts/FleetContext";
import { TripsProvider } from "./contexts/TripsContext";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FleetProvider>
          <TripsProvider>
            <AppRoutes />
          </TripsProvider>
        </FleetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}