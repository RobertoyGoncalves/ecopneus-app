import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router";
import {
  LayoutDashboard,
  Car,
  CircleDot,
  Map as MapIcon,
  LogOut,
  Settings,
} from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { useAuth } from "../../contexts/AuthContext";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { AVATAR_KEY } from "../../pages/Settings";

interface SidebarProps {
  onNavigate?: () => void;
  tireCount?: number;
  tripCount?: number;
}

const MAIN_NAV = [
  { path: "/app", icon: LayoutDashboard, label: "Dashboard", end: true, badge: null as "tires" | "trips" | null },
  { path: "/app/vehicles", icon: Car, label: "Veículos", end: false, badge: null as "tires" | "trips" | null },
  { path: "/app/tires", icon: CircleDot, label: "Pneus", end: false, badge: "tires" as "tires" | "trips" | null },
  { path: "/app/trips", icon: MapIcon, label: "Viagens", end: false, badge: "trips" as "tires" | "trips" | null },
];

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-2 mt-4 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/30 first:mt-0">
      {label}
    </p>
  );
}

export function Sidebar({ onNavigate, tireCount = 0, tripCount = 0 }: SidebarProps) {
  const { user, logout, supabaseUserId } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    () => localStorage.getItem(AVATAR_KEY)
  );

  // Fetch avatar from Supabase when user loads
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabaseUserId) return;
    if (localStorage.getItem(AVATAR_KEY)) return; // already cached
    void getSupabase()
      .from("profiles")
      .select("avatar_url")
      .eq("id", supabaseUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url as string);
          localStorage.setItem(AVATAR_KEY, data.avatar_url as string);
        }
      });
  }, [supabaseUserId]);

  // Listen for avatar changes made in Settings (same tab)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === AVATAR_KEY) setAvatarUrl(e.newValue);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const badgeValue = (key: "tires" | "trips" | null): number | null => {
    if (key === "tires") return tireCount;
    if (key === "trips") return tripCount;
    return null;
  };

  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    onNavigate?.();
    logout();
  };

  return (
    <aside
      className="flex h-full w-56 flex-col text-white"
      style={{ backgroundColor: "var(--bg-sidebar)" }}
    >
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center border-b border-white/[0.06] px-5">
        <Link to="/app" onClick={onNavigate} className="block">
          <BrandLogo elevated className="h-8 w-auto max-w-[140px]" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <SectionLabel label="Principal" />
        <ul className="space-y-0.5">
          {MAIN_NAV.map(({ path, icon: Icon, label, end, badge }) => {
            const count = badgeValue(badge);
            return (
              <li key={path}>
                <NavLink
                  to={path}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-l-2 border-[#16a34a] bg-white/10 pl-[10px] text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white/90"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-4 w-4 flex-shrink-0 transition-colors ${
                          isActive ? "text-[#16a34a]" : "text-white/40"
                        }`}
                      />
                      <span className="flex-1">{label}</span>
                      {count != null && count > 0 && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <SectionLabel label="Conta" />
        <ul className="space-y-0.5">
          <li>
            <NavLink
              to="/app/settings"
              end={false}
              onClick={onNavigate}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-l-2 border-[#16a34a] bg-white/10 pl-[10px] text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Settings
                    className={`h-4 w-4 flex-shrink-0 transition-colors ${
                      isActive ? "text-[#16a34a]" : "text-white/40"
                    }`}
                  />
                  <span className="flex-1">Configurações</span>
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 border-t border-white/[0.06] p-3">
        <div className="mb-1 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-green-500/30">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-xs font-bold text-white">
                {getUserInitials()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {user?.fullName || "Usuário"}
            </p>
            <p className="truncate text-[11px] text-white/40">
              {user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
