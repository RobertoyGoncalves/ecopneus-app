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
          <span className="mb-1 text-[11px] font-medium tabular-nums text-gray-800">{d.value}</span>
          <div className="flex h-44 w-full max-w-[3.25rem] items-end justify-center">
            <div
              className="w-full rounded-t-lg bg-green-500"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 8 : 2)}%` }}
              title={`${d.name}: ${d.value}`}
            />
          </div>
          <span className="mt-2 max-w-full truncate text-center text-[10px] leading-tight text-gray-500">
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
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600">Visão geral do sistema de gestão de veículos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {metricsData.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">{metric.title}</p>
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">{metric.value}</h3>
                    <p className="text-xs md:text-sm text-gray-500">{metric.hint}</p>
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
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Saúde dos Pneus</h3>
            <p className="text-xs md:text-sm text-gray-600">Quantidade de pneus por faixa de vida útil</p>
          </CardHeader>
          <CardContent>
            <TireHealthBarChart data={tireHealthData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Últimas Viagens</h3>
          <p className="text-xs md:text-sm text-gray-600">Histórico recente de viagens realizadas</p>
        </CardHeader>
        <CardContent className="p-0">
          {recentTrips.length === 0 ? (
            <div className="px-4 lg:px-6 py-8 text-center text-sm text-gray-500">
              Nenhuma viagem registada. Cadastre viagens na página <strong>Viagens</strong> para ver o histórico aqui.
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Veículo</th>
                      <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Tipo</th>
                      <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Distância</th>
                      <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Data</th>
                      <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Valor</th>
                      <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip, index) => (
                      <tr
                        key={trip.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-900">{trip.vehicle}</td>
                        <td className="px-4 lg:px-6 py-3 md:py-4">
                          <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            {trip.vehicleType}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">
                          {Number(trip.distance).toLocaleString("pt-BR")} km
                        </td>
                        <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.date}</td>
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

              <div className="md:hidden space-y-3 p-4">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{trip.vehicle}</h4>
                        <p className="text-xs text-gray-500 mt-1">{trip.date}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.vehicleType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Distância</p>
                        <p className="text-sm font-medium text-gray-900">
                          {Number(trip.distance).toLocaleString("pt-BR")} km
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valor</p>
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
