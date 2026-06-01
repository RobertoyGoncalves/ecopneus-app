import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Car, CircleDot, Map as MapIcon, Menu, X, LogOut } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/app", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/app/vehicles", icon: Car, label: "Veículos" },
    { path: "/app/tires", icon: CircleDot, label: "Pneus" },
    { path: "/app/trips", icon: MapIcon, label: "Viagens" },
  ];

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app" || location.pathname === "/app/";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    logout();
  };

  // Gerar iniciais do usuário
  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex h-screen min-w-0 bg-slate-50">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-slate-800/60 bg-[#0f172a] px-4 py-3 text-white shadow-lg lg:hidden">
        <Link to="/app" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <BrandLogo className="h-7 w-auto max-w-[160px]" />
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-slate-800/70 bg-[#0f172a] text-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mt-14 border-b border-slate-800/70 p-6 lg:mt-0">
          <Link to="/app" className="block transition-opacity hover:opacity-95" onClick={closeMobileMenu}>
            <BrandLogo elevated className="h-11 w-auto max-w-full" />
          </Link>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#16a34a] text-white shadow-lg shadow-green-600/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout Section */}
        <div className="border-t border-slate-800/70 p-4">
          <div className="px-4 py-3 space-y-3">
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-green-500/20">
                <span className="text-sm font-bold text-white">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.fullName || "Usuário"}
                </p>
                  <p className="truncate text-xs text-slate-400">
                  {user?.email || "email@exemplo.com"}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-red-300 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">Sair da Conta</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
