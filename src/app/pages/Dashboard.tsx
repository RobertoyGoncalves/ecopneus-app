import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "../components/Card";
import { CircleDot, Car, Map as MapIcon } from "lucide-react";
import { useFleet } from "../contexts/FleetContext";
import { useTrips } from "../contexts/TripsContext";
import type { Trip } from "../domain/trip";

function TireHealthBarChart({ data }: { data: { name: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-[250px] w-full min-w-0 items-end justify-between gap-1 px-1 md:h-[300px] md:gap-2">
      {data.map((d) => (
        <div key={d.name} className="flex min-w-0 flex-1 flex-col items-center justify-end">
          <span className="mb-1 text-[11px] font-medium tabular-nums text-slate-800">{d.value}</span>
          <div className="flex h-44 w-full max-w-[3.25rem] items-end justify-center">
            <div
              className="w-full rounded-t-lg bg-green-500"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 8 : 2)}%` }}
              title={`${d.name}: ${d.value}`}
            />
          </div>
          <span className="mt-2 max-w-full truncate text-center text-[10px] leading-tight text-slate-500">
            {d.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function tripSortTime(t: Trip): number {
  if (t.recordedAtIso) {
    const x = new Date(t.recordedAtIso).getTime();
    if (!Number.isNaN(x)) return x;
  }
  const raw = String(t.date ?? "").trim();
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (m) {
    return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();
  }
  return 0;
}

function tireHealthBuckets(tires: { health: number }[]): { name: string; value: number }[] {
  let excelente = 0;
  let bom = 0;
  let atencao = 0;
  let critico = 0;
  for (const t of tires) {
    const h = Number(t.health);
    if (!Number.isFinite(h)) continue;
    if (h >= 80) excelente += 1;
    else if (h >= 60) bom += 1;
    else if (h >= 40) atencao += 1;
    else critico += 1;
  }
  return [
    { name: "Excelente", value: excelente },
    { name: "Bom", value: bom },
    { name: "Atenção", value: atencao },
    { name: "Crítico", value: critico },
  ];
}

export function Dashboard() {
  const { vehicles, tires, fleetLoading } = useFleet();
  const { trips } = useTrips();

  const avgTireHealth = useMemo(() => {
    if (tires.length === 0) return null;
    const sum = tires.reduce((acc, t) => acc + Number(t.health), 0);
    return sum / tires.length;
  }, [tires]);

  const tireHealthData = useMemo(() => tireHealthBuckets(tires), [tires]);

  const recentTrips = useMemo(() => {
    return [...trips].sort((a, b) => tripSortTime(b) - tripSortTime(a)).slice(0, 8);
  }, [trips]);

  const metricsData = useMemo(
    () => [
      {
        title: "Vida Média dos Pneus",
        value: avgTireHealth != null ? `${avgTireHealth.toFixed(1)}%` : "—",
        hint: tires.length > 0 ? `${tires.length} pneu(ns)` : "Nenhum pneu cadastrado",
        icon: CircleDot,
        color: "bg-green-500",
      },
      {
        title: "Veículos Cadastrados",
        value: fleetLoading ? "…" : String(vehicles.length),
        hint: fleetLoading ? "Carregando frota…" : "Total na frota",
        icon: Car,
        color: "bg-blue-500",
      },
      {
        title: "Pneus Cadastrados",
        value: fleetLoading ? "…" : String(tires.length),
        hint: fleetLoading ? "Carregando frota…" : "Total instalado",
        icon: CircleDot,
        color: "bg-purple-500",
      },
      {
        title: "Viagens Registradas",
        value: String(trips.length),
        hint: "Registadas em Viagens",
        icon: MapIcon,
        color: "bg-orange-500",
      },
    ],
    [avgTireHealth, vehicles.length, tires.length, trips.length, fleetLoading]
  );

  return (
    <div className="min-w-0 p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900 md:text-3xl">Dashboard</h1>
        <p className="text-sm text-slate-600 md:text-base">Visão geral do sistema de gestão de veículos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {metricsData.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-2 text-xs text-slate-600 md:text-sm">{metric.title}</p>
                    <h3 className="mb-1 text-2xl font-semibold text-slate-900 md:text-3xl">{metric.value}</h3>
                    <p className="text-xs text-slate-500 md:text-sm">{metric.hint}</p>
                  </div>
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mb-6 md:mb-8 max-w-2xl">
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-slate-900 md:text-lg">Saúde dos Pneus</h3>
            <p className="text-xs text-slate-600 md:text-sm">Quantidade de pneus por faixa de vida útil</p>
          </CardHeader>
          <CardContent>
            <TireHealthBarChart data={tireHealthData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-slate-900 md:text-lg">Últimas Viagens</h3>
          <p className="text-xs text-slate-600 md:text-sm">Histórico recente de viagens realizadas</p>
        </CardHeader>
        <CardContent className="p-0">
          {recentTrips.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500 lg:px-6">
              Nenhuma viagem registada. Cadastre viagens na página <strong>Viagens</strong> para ver o histórico aqui.
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60">
                      <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">Veículo</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">Distância</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">Data</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">Valor</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip, index) => (
                      <tr
                        key={trip.id}
                        className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-slate-900 md:py-4 lg:px-6">{trip.vehicle}</td>
                        <td className="px-4 lg:px-6 py-3 md:py-4">
                          <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            {trip.vehicleType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 md:py-4 lg:px-6">
                          {Number(trip.distance).toLocaleString("pt-BR")} km
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 md:py-4 lg:px-6">{trip.date}</td>
                        <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-green-600 font-medium">
                          R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 lg:px-6 py-3 md:py-4">
                          <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            Concluída
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900">{trip.vehicle}</h4>
                        <p className="mt-1 text-xs text-slate-500">{trip.date}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.vehicleType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                      <div>
                        <p className="text-xs text-slate-500">Distância</p>
                        <p className="text-sm font-medium text-slate-900">
                          {Number(trip.distance).toLocaleString("pt-BR")} km
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Valor</p>
                        <p className="text-sm font-medium text-green-600">
                          R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        Concluída
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
