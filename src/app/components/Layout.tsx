import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { X } from "lucide-react";
import { Sidebar } from "./layout/Sidebar";
import { Topbar } from "./layout/Topbar";
import { useFleet } from "../contexts/FleetContext";
import { useTrips } from "../contexts/TripsContext";

const THEME_KEY = "ecopneus-theme";

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "dark";
  });

  const { tires } = useFleet();
  const { trips } = useTrips();

  useEffect(() => {
    applyTheme(isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  // Apply on first mount
  useEffect(() => {
    applyTheme(isDark);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDark = () => setIsDark((v) => !v);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-page)]">
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex-shrink-0 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {isMobileMenuOpen && (
          <button
            onClick={closeMobileMenu}
            aria-label="Fechar menu"
            className="absolute right-2 top-3 z-50 rounded-md p-1.5 text-white/60 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Sidebar
          onNavigate={closeMobileMenu}
          tireCount={tires.length}
          tripCount={trips.length}
        />
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          onMobileMenuToggle={toggleMobileMenu}
          isDark={isDark}
          onToggleDark={toggleDark}
        />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
