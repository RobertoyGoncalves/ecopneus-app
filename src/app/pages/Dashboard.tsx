import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Activity,
  Truck,
  CircleDot,
  Route,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFleet } from "../contexts/FleetContext";
import { useTrips } from "../contexts/TripsContext";
import type { Trip } from "../domain/trip";
import { formatWearPercent } from "../domain/wearModel";

// ─── constants ───────────────────────────────────────────────────────────────

const BRASIL_CENTER: [number, number] = [-51.925, -14.235];
const MAP_ZOOM = 4;
const ROUTES_SOURCE = "dashboard-routes";
const ROUTES_LAYER = "dashboard-routes-line";

// ─── helpers ─────────────────────────────────────────────────────────────────

function tripSortTime(t: Trip): number {
  if (t.recordedAtIso) {
    const x = new Date(t.recordedAtIso).getTime();
    if (!Number.isNaN(x)) return x;
  }
  const raw = String(t.date ?? "").trim();
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();
  return 0;
}

function tireHealthBuckets(tires: { health: number }[]) {
  const buckets = { Excelente: 0, Bom: 0, "Atenção": 0, "Crítico": 0 };
  for (const t of tires) {
    const h = Number(t.health);
    if (!Number.isFinite(h)) continue;
    if (h >= 80) buckets.Excelente++;
    else if (h >= 60) buckets.Bom++;
    else if (h >= 40) buckets["Atenção"]++;
    else buckets["Crítico"]++;
  }
  return Object.entries(buckets).map(([name, value]) => ({ name, value }));
}

function tripHasRoute(t: Trip): boolean {
  return (
    t.latOrigem != null && t.lonOrigem != null &&
    t.latDestino != null && t.lonDestino != null &&
    Number.isFinite(t.latOrigem) && Number.isFinite(t.lonOrigem) &&
    Number.isFinite(t.latDestino) && Number.isFinite(t.lonDestino)
  );
}

function truncate(s: string | undefined, max: number): string {
  if (!s?.trim()) return "—";
  return s.trim().length > max ? s.trim().slice(0, max) + "…" : s.trim();
}

function wearBadge(pct: number): { bg: string; text: string } {
  if (pct < 1) return { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-400" };
  if (pct <= 5) return { bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-700 dark:text-yellow-400" };
  return { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400" };
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  icon: React.ElementType;
  delta?: string;
  deltaGood?: boolean;
}

function KpiCard({ label, value, hint, icon: Icon, delta, deltaGood }: KpiCardProps) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>
        <Icon className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
      </div>
      <p
        className="mt-3 text-3xl font-semibold leading-none"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {hint}
        </span>
        {delta && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              deltaGood
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
            }`}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Recharts Tooltip ────────────────────────────────────────────────────────

const BUCKET_COLORS: Record<string, string> = {
  Excelente: "#16a34a",
  Bom: "#3b82f6",
  "Atenção": "#eab308",
  "Crítico": "#ef4444",
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const color = BUCKET_COLORS[label ?? ""] ?? "#6b7280";
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      <p className="mb-1 font-semibold" style={{ color }}>
        {label}
      </p>
      <p style={{ color: "var(--text-secondary)" }}>
        {payload[0].value} pneu(s)
      </p>
    </div>
  );
}

// ─── Fleet Health Chart ───────────────────────────────────────────────────────

function FleetHealthChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-color)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#16a34a"
          strokeWidth={2.5}
          dot={(props) => {
            const { cx, cy, payload } = props as { cx: number; cy: number; payload: { name: string } };
            const color = BUCKET_COLORS[payload.name] ?? "#16a34a";
            return <circle key={cx} cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={2} />;
          }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Trips Map ────────────────────────────────────────────────────────────────

function DashboardTripsMap({ trips }: { trips: Trip[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const mapboxRef = useRef<typeof import("mapbox-gl").default | null>(null);
  const markersRef = useRef<import("mapbox-gl").Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const routedTrips = useMemo(() => trips.filter(tripHasRoute), [trips]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined;
      if (!token?.trim() || !containerRef.current) return;

      try {
        const [mapboxMod, workerMod] = await Promise.all([
          import("mapbox-gl"),
          // @ts-expect-error Vite worker import
          import("mapbox-gl/dist/mapbox-gl-csp-worker.js?worker"),
          // @ts-expect-error Vite CSS side-effect import
          import("mapbox-gl/dist/mapbox-gl.css"),
        ]);

        if (cancelled || !containerRef.current) return;

        const mapboxgl =
          (mapboxMod as { default?: typeof import("mapbox-gl").default }).default ??
          (mapboxMod as unknown as typeof import("mapbox-gl").default);

        const WorkerClass = workerMod.default;
        if (WorkerClass && "workerClass" in mapboxgl) {
          mapboxgl.workerClass = WorkerClass;
        }

        mapboxgl.accessToken = token;
        mapboxRef.current = mapboxgl;

        const map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: BRASIL_CENTER,
          zoom: MAP_ZOOM,
          attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        mapRef.current = map;

        map.on("load", () => {
          if (cancelled) return;
          map.resize();
          setMapReady(true);
        });
      } catch (err) {
        console.error("Dashboard map:", err);
      }
    })();

    return () => {
      cancelled = true;
      setMapReady(false);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl || !mapReady) return;

    const applyRoutes = () => {
      if (!map.isStyleLoaded()) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (map.getLayer(ROUTES_LAYER)) map.removeLayer(ROUTES_LAYER);
      if (map.getSource(ROUTES_SOURCE)) map.removeSource(ROUTES_SOURCE);

      if (routedTrips.length === 0) {
        map.flyTo({ center: BRASIL_CENTER, zoom: MAP_ZOOM });
        return;
      }

      const lineFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = routedTrips.map((trip) => ({
        type: "Feature",
        properties: { id: trip.id },
        geometry: {
          type: "LineString",
          coordinates: [
            [trip.lonOrigem!, trip.latOrigem!],
            [trip.lonDestino!, trip.latDestino!],
          ],
        },
      }));

      map.addSource(ROUTES_SOURCE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: lineFeatures },
      });
      map.addLayer({
        id: ROUTES_LAYER,
        type: "line",
        source: ROUTES_SOURCE,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#16a34a", "line-width": 2 },
      });

      for (const trip of routedTrips) {
        const origemEl = document.createElement("div");
        origemEl.className = "h-3 w-3 rounded-full border-2 border-white bg-green-600 shadow-md";
        const destinoEl = document.createElement("div");
        destinoEl.className = "h-3 w-3 rounded-full border-2 border-white bg-red-500 shadow-md";

        markersRef.current.push(
          new mapboxgl.Marker({ element: origemEl })
            .setLngLat([trip.lonOrigem!, trip.latOrigem!])
            .addTo(map)
        );
        markersRef.current.push(
          new mapboxgl.Marker({ element: destinoEl })
            .setLngLat([trip.lonDestino!, trip.latDestino!])
            .addTo(map)
        );
      }

      const bounds = new mapboxgl.LngLatBounds(BRASIL_CENTER, BRASIL_CENTER);
      for (const trip of routedTrips) {
        bounds.extend([trip.lonOrigem!, trip.latOrigem!]);
        bounds.extend([trip.lonDestino!, trip.latDestino!]);
      }
      map.fitBounds(bounds, { padding: 48, maxZoom: 8 });
    };

    if (map.isStyleLoaded()) {
      applyRoutes();
    } else {
      map.once("load", applyRoutes);
    }
  }, [routedTrips, mapReady]);

  return (
    <div>
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-lg border"
        style={{ height: 340, borderColor: "var(--border-color)" }}
      />
      <div className="mt-3 flex items-center gap-5 text-xs" style={{ color: "var(--text-secondary)" }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-600" /> Origem
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Destino
        </span>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { vehicles, tires, fleetLoading } = useFleet();
  const { trips } = useTrips();
  const navigate = useNavigate();

  const avgTireHealth = useMemo(() => {
    if (tires.length === 0) return null;
    const sum = tires.reduce((acc, t) => acc + Number(t.health), 0);
    return sum / tires.length;
  }, [tires]);

  const tireHealthData = useMemo(() => tireHealthBuckets(tires), [tires]);

  const recentTrips = useMemo(
    () => [...trips].sort((a, b) => tripSortTime(b) - tripSortTime(a)).slice(0, 8),
    [trips]
  );

  const kpis: KpiCardProps[] = [
    {
      label: "Vida Média dos Pneus",
      value: avgTireHealth != null ? `${avgTireHealth.toFixed(1)}%` : "—",
      hint: tires.length > 0 ? `${tires.length} pneu(s) cadastrado(s)` : "Nenhum pneu cadastrado",
      icon: Activity,
      delta: avgTireHealth != null && avgTireHealth >= 60 ? "Saudável" : undefined,
      deltaGood: true,
    },
    {
      label: "Veículos",
      value: fleetLoading ? "…" : String(vehicles.length),
      hint: "Total na frota",
      icon: Truck,
    },
    {
      label: "Pneus",
      value: fleetLoading ? "…" : String(tires.length),
      hint: "Total instalado",
      icon: CircleDot,
    },
    {
      label: "Viagens",
      value: String(trips.length),
      hint: "Registradas no sistema",
      icon: Route,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Linha 1 — KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Linha 2 — Gráfico + Mapa */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Fleet health chart */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Saúde da Frota
              </h3>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                Distribuição de pneus por faixa de vida útil
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Ao vivo
            </span>
          </div>
          <FleetHealthChart data={tireHealthData} />
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3">
            {Object.entries(BUCKET_COLORS).map(([name, color]) => (
              <span key={name} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Trips map */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Rotas recentes
            </h3>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              Origem e destino das viagens registradas
            </p>
          </div>
          <DashboardTripsMap trips={trips} />
        </div>
      </div>

      {/* Linha 3 — Últimas viagens */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Últimas Viagens
            </h3>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              Histórico recente de viagens realizadas
            </p>
          </div>
          <button
            onClick={() => void navigate("/app/trips")}
            className="flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14">
            <Route className="h-10 w-10" style={{ color: "var(--text-secondary)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Nenhuma viagem registrada ainda
            </p>
            <button
              onClick={() => void navigate("/app/trips")}
              className="rounded-lg bg-[#16a34a] px-4 py-2 text-xs font-medium text-white hover:opacity-90"
            >
              Registrar primeira viagem
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-page)" }}
                  >
                    {["Veículo", "Origem → Destino", "Distância", "Desgaste", "Data", "Status"].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((trip, index) => {
                    const wear = trip.estimatedWear;
                    const badge = wearBadge(wear);
                    const origem = truncate(trip.origem, 40);
                    const destino = truncate(trip.destino, 40);
                    return (
                      <tr
                        key={trip.id}
                        className="transition-colors hover:bg-[var(--bg-page)]"
                        style={
                          index < recentTrips.length - 1
                            ? { borderBottom: "1px solid var(--border-color)" }
                            : undefined
                        }
                      >
                        <td
                          className="px-5 py-3 text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {trip.vehicle}
                        </td>
                        <td
                          className="px-5 py-3 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                          title={`${trip.origem ?? "—"} → ${trip.destino ?? "—"}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            <span className="max-w-[120px] truncate" title={trip.origem ?? "—"}>
                              {origem}
                            </span>
                            <ArrowRight className="h-3 w-3 flex-shrink-0" />
                            <span className="max-w-[120px] truncate" title={trip.destino ?? "—"}>
                              {destino}
                            </span>
                          </span>
                        </td>
                        <td
                          className="px-5 py-3 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {Number(trip.distance).toLocaleString("pt-BR")} km
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}
                          >
                            {formatWearPercent(wear)}
                          </span>
                        </td>
                        <td
                          className="px-5 py-3 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {trip.date}
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                            Concluída
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 md:hidden">
              {recentTrips.map((trip) => {
                const badge = wearBadge(trip.estimatedWear);
                return (
                  <div
                    key={trip.id}
                    className="rounded-xl border p-4"
                    style={{
                      backgroundColor: "var(--bg-page)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {trip.vehicle}
                        </h4>
                        <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {trip.date}
                        </p>
                      </div>
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        Concluída
                      </span>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {truncate(trip.origem, 30)} → {truncate(trip.destino, 30)}
                    </p>
                    <div
                      className="mt-2 grid grid-cols-2 gap-2 border-t pt-2"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <div>
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Distância</p>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {Number(trip.distance).toLocaleString("pt-BR")} km
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Desgaste</p>
                        <span
                          className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}
                        >
                          {formatWearPercent(trip.estimatedWear)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
