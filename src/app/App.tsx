import { BrowserRouter } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { FleetProvider } from "./contexts/FleetContext";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FleetProvider>
          <AppRoutes />
        </FleetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}