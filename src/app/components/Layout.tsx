import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Car, CircleDot, Map as MapIcon, Menu, X, LogOut } from "lucide-react";
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
    <div className="flex h-screen min-w-0 bg-[#f8f9fa]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#1f2937] text-white z-40 px-4 py-3 flex items-center justify-between shadow-lg">
        <Link to="/app" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <img
            src="/brand/ecopneus-logo.png"
            alt="EcoPneus"
            className="h-7 w-auto max-w-[160px] object-contain object-left"
          />
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
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1f2937] text-white flex flex-col shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-700 mt-14 lg:mt-0">
          <Link to="/app" className="flex items-center gap-3 transition-opacity hover:opacity-95" onClick={closeMobileMenu}>
            <img
              src="/brand/ecopneus-logo.png"
              alt=""
              className="h-9 w-auto max-w-[120px] shrink-0 object-contain object-left"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-400">Painel</p>
              <p className="truncate text-sm text-gray-200">Soluções sustentáveis</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-[#22c55e] text-white shadow-lg shadow-green-500/20"
                    : "text-gray-300 hover:bg-[#374151] hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout Section */}
        <div className="p-4 border-t border-gray-700">
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
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || "email@exemplo.com"}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 border border-red-500/30 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10"
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
