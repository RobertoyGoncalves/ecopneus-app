import { useState, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Modal } from "./Modal";
import { useAuth } from "../../contexts/AuthContext";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatWearPercent } from "../../domain/wearModel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripRow {
  id: string;
  vehicle_label: string | null;
  origem: string | null;
  destino: string | null;
  distancia_km: number | null;
  vida_consumida_percent: number | null;
  created_at: string | null;
}

interface DriverProfile {
  full_name: string | null;
  avatar_url: string | null;
}

interface DriverStats {
  total: number;
  avgKm: number;
  avgWear: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function wearBadge(pct: number): string {
  if (pct < 1) return "text-green-600 dark:text-green-400";
  if (pct <= 5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl border p-3 text-center"
      style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border-color)" }}
    >
      <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
    </div>
  );
}

// ─── Public avatar button (used in trip tables) ───────────────────────────────

export interface OperatorProfile {
  fullName: string | null;
  avatarUrl: string | null;
}

/**
 * Small avatar + first-name button rendered inside trip table cells.
 * Returns null when operadorId is absent (old trips without the field).
 */
export function DriverAvatarButton({
  operadorId,
  profiles,
  onOpen,
}: {
  operadorId?: string;
  profiles: Record<string, OperatorProfile>;
  onOpen: (id: string) => void;
}) {
  if (!operadorId) {
    return <span className="text-sm" style={{ color: "var(--text-secondary)" }}>—</span>;
  }

  const p = profiles[operadorId];
  const name = p?.fullName ?? null;
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <button
      type="button"
      onClick={() => onOpen(operadorId)}
      className="flex items-center gap-2 transition-opacity hover:opacity-70"
    >
      {p?.avatarUrl ? (
        <img src={p.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
      ) : (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-[9px] font-bold text-white">
          {initials}
        </div>
      )}
      <span
        className="max-w-[80px] truncate text-xs"
        style={{ color: "var(--text-secondary)" }}
      >
        {name ? name.split(" ")[0] : "…"}
      </span>
    </button>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export interface DriverSummaryModalProps {
  /** ID of the profile to display. null / undefined = modal closed. */
  driverId: string | null | undefined;
  onClose: () => void;
}

export function DriverSummaryModal({ driverId, onClose }: DriverSummaryModalProps) {
  const { supabaseUserId, papel, empresaId } = useAuth();
  const donoId = papel === "funcionario" && empresaId ? empresaId : supabaseUserId;

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [recentTrips, setRecentTrips] = useState<TripRow[]>([]);

  useEffect(() => {
    if (!driverId || !donoId || !isSupabaseConfigured()) {
      setProfile(null);
      setStats(null);
      setRecentTrips([]);
      return;
    }

    setLoading(true);

    void (async () => {
      try {
        const supabase = getSupabase();

        const [{ data: profileData }, { data: tripData, count }] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", driverId)
            .maybeSingle(),
          supabase
            .from("trips")
            .select(
              "id, vehicle_label, origem, destino, distancia_km, vida_consumida_percent, created_at",
              { count: "exact" }
            )
            .eq("operador_id", driverId)
            .eq("dono_id", donoId)
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        setProfile((profileData ?? null) as DriverProfile | null);

        const rows = (tripData ?? []) as TripRow[];
        const total = count ?? rows.length;
        const kmSum = rows.reduce((s, r) => s + (Number(r.distancia_km) || 0), 0);
        const wearSum = rows.reduce((s, r) => s + (Number(r.vida_consumida_percent) || 0), 0);

        setStats({
          total,
          avgKm: rows.length ? kmSum / rows.length : 0,
          avgWear: rows.length ? wearSum / rows.length : 0,
        });
        setRecentTrips(rows.slice(0, 3));
      } catch (err) {
        console.error("DriverSummaryModal:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [driverId, donoId]);

  const displayName = profile?.full_name || "Motorista";

  return (
    <Modal
      open={Boolean(driverId)}
      onClose={onClose}
      title="Resumo do Motorista"
      maxWidth="max-w-lg"
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-green-500/20"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-lg font-bold text-white ring-2 ring-green-500/20">
                {getInitials(profile?.full_name ?? null)}
              </div>
            )}
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {displayName}
              </p>
              {stats && (
                <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {stats.total} viagem{stats.total !== 1 ? "s" : ""} registrada
                  {stats.total !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Metrics grid */}
          {stats ? (
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total de viagens" value={String(stats.total)} />
              <StatCard
                label="Média km/viagem"
                value={stats.avgKm > 0 ? `${stats.avgKm.toFixed(0)} km` : "—"}
              />
              <StatCard
                label="Desgaste médio"
                value={stats.avgWear > 0 ? formatWearPercent(stats.avgWear) : "—"}
              />
            </div>
          ) : (
            <div
              className="rounded-xl border p-4 text-center text-sm"
              style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
            >
              Nenhuma viagem encontrada para este motorista.
            </div>
          )}

          {/* Recent trips */}
          {recentTrips.length > 0 && (
            <div>
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                Últimas viagens
              </p>
              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--border-color)" }}
              >
                {recentTrips.map((trip, i) => (
                  <div
                    key={trip.id}
                    className="px-4 py-3"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderTop: i > 0 ? "1px solid var(--border-color)" : undefined,
                    }}
                  >
                    {/* Vehicle + date */}
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {trip.vehicle_label || "—"}
                      </p>
                      <span
                        className="shrink-0 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {trip.created_at
                          ? new Date(trip.created_at).toLocaleDateString("pt-BR")
                          : "—"}
                      </span>
                    </div>

                    {/* Route */}
                    <div
                      className="mt-1 flex items-center gap-1 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span className="max-w-[110px] truncate">{trip.origem || "—"}</span>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      <span className="max-w-[110px] truncate">{trip.destino || "—"}</span>
                    </div>

                    {/* Distance + wear */}
                    <div className="mt-1.5 flex items-center gap-4 text-xs">
                      {trip.distancia_km != null && (
                        <span style={{ color: "var(--text-secondary)" }}>
                          {Number(trip.distancia_km).toLocaleString("pt-BR")} km
                        </span>
                      )}
                      {trip.vida_consumida_percent != null && (
                        <span className={`font-medium ${wearBadge(Number(trip.vida_consumida_percent))}`}>
                          {formatWearPercent(Number(trip.vida_consumida_percent))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
