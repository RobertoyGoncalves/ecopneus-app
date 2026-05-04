import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { MapPin } from "lucide-react";
import { formatVehicleLabel, useFleet } from "../contexts/FleetContext";
import type { DayPeriod, RoadCondition, TireQualityTier } from "../domain/wearModel";
import {
  computeTripLifeConsumptionPercent,
  curbWeightForVehicleType,
  NOMINAL_LIFE_KM,
  temperatureForPeriod,
  wearSeverityLevel,
} from "../domain/wearModel";

interface Trip {
  id: number;
  vehicle: string;
  vehicleType: string;
  distance: string;
  weight: string;
  value: string;
  type: string;
  hasCargo: boolean;
  date: string;
  /** % de vida útil consumida nesta viagem (médio por pneu do veículo). */
  estimatedWear: number;
  wearLevel: "Baixo" | "Médio" | "Alto";
  tireCount: number;
  avgSpeedKmh?: number;
  roadCondition?: RoadCondition;
  dayPeriod?: DayPeriod;
}

const averageCargoByVehicleType: Record<string, { weight: string; value: string; type: string }> = {
  Carro: { weight: "120", value: "400", type: "Carga Leve" },
  Moto: { weight: "25", value: "180", type: "Entrega Leve" },
  Caminhão: { weight: "12000", value: "8000", type: "Carga Geral" },
};

const tierLabels: Record<TireQualityTier, string> = {
  economico: "Econômico",
  intermediario: "Intermediário",
  premium: "Premium",
};

export function Trips() {
  const { vehicles, tires, applyTripWearToVehicle } = useFleet();

  /** Se falso, usa a linha cadastrada no veículo; se verdadeiro, usa o select manual. */
  const [tierOverride, setTierOverride] = useState(false);

  const [filterType, setFilterType] = useState("Todos");
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: 1,
      vehicle: "Volvo FH 540 • ABC-1234",
      vehicleType: "Caminhão",
      distance: "1245",
      weight: "25000",
      value: "8450.00",
      type: "Carga Geral",
      hasCargo: true,
      date: "05/04/2026",
      estimatedWear: 3.2,
      wearLevel: "Baixo",
      tireCount: 10,
      avgSpeedKmh: 78,
      roadCondition: "Média",
      dayPeriod: "tarde",
    },
    {
      id: 2,
      vehicle: "Toyota Corolla • XYZ-5678",
      vehicleType: "Carro",
      distance: "890",
      weight: "500",
      value: "6200.00",
      type: "Executivo",
      hasCargo: true,
      date: "04/04/2026",
      estimatedWear: 2.9,
      wearLevel: "Baixo",
      tireCount: 4,
      avgSpeedKmh: 72,
      roadCondition: "Boa",
      dayPeriod: "manha",
    },
    {
      id: 3,
      vehicle: "Honda CG 160 • DEF-9012",
      vehicleType: "Moto",
      distance: "120",
      weight: "0",
      value: "0",
      type: "Sem carga",
      hasCargo: false,
      date: "02/04/2026",
      estimatedWear: 0.5,
      wearLevel: "Baixo",
      tireCount: 2,
      avgSpeedKmh: 55,
      roadCondition: "Média",
      dayPeriod: "noite",
    },
  ]);

  const [formData, setFormData] = useState({
    fleetVehicleId: "",
    vehicle: "",
    vehicleType: "",
    distance: "",
    hasCargo: false,
    weight: "",
    value: "",
    type: "",
    avgSpeedKmh: "80",
    roadCondition: "Média" as RoadCondition,
    dayPeriod: "manha" as DayPeriod,
    tireTier: "intermediario" as TireQualityTier,
  });

  const vehiclesForType = useMemo(
    () => vehicles.filter((v) => v.type === formData.vehicleType),
    [vehicles, formData.vehicleType]
  );

  const selectedFleetVehicle =
    formData.fleetVehicleId !== ""
      ? vehicles.find((v) => String(v.id) === formData.fleetVehicleId)
      : undefined;

  const effectiveTier = useMemo((): TireQualityTier => {
    if (!selectedFleetVehicle) return formData.tireTier;
    if (!tierOverride) return selectedFleetVehicle.tireQualityTier;
    return formData.tireTier;
  }, [selectedFleetVehicle, tierOverride, formData.tireTier]);

  const tiresOfSelected = useMemo(
    () =>
      selectedFleetVehicle
        ? tires.filter((t) => t.vehicleId === selectedFleetVehicle.id)
        : [],
    [tires, selectedFleetVehicle]
  );

  const cargoKgCalc = formData.hasCargo ? Math.max(0, Number(formData.weight) || 0) : 0;
  const tempCelsius = temperatureForPeriod(formData.dayPeriod);

  const lifeConsumedPreview = useMemo(() => {
    if (!selectedFleetVehicle || !formData.vehicleType) return 0;
    const d = Math.max(0, Number(formData.distance) || 0);
    if (!d) return 0;
    return computeTripLifeConsumptionPercent({
      vehicleType: formData.vehicleType,
      distanceKm: d,
      cargoKg: cargoKgCalc,
      avgSpeedKmh: Math.max(0, Number(formData.avgSpeedKmh) || 0),
      temperatureCelsius: tempCelsius,
      roadCondition: formData.roadCondition,
      tier: effectiveTier,
    });
  }, [
    selectedFleetVehicle,
    formData.vehicleType,
    formData.distance,
    cargoKgCalc,
    formData.avgSpeedKmh,
    tempCelsius,
    formData.roadCondition,
    effectiveTier,
  ]);

  const wearLevelPreview = wearSeverityLevel(lifeConsumedPreview);
  const tireCount = selectedFleetVehicle?.tireCount ?? 0;
  const minTireHealth =
    tiresOfSelected.length > 0 ? Math.min(...tiresOfSelected.map((t) => t.health)) : undefined;
  const minAfterTrip =
    minTireHealth !== undefined ? minTireHealth - lifeConsumedPreview : undefined;

  const warnHighWear = lifeConsumedPreview >= 6;
  const warnCriticalTires =
    minAfterTrip !== undefined && lifeConsumedPreview > 0 && minAfterTrip < 15;

  const handleVehicleTypeChange = (vehicleType: string) => {
    setTierOverride(false);
    setFormData((current) => {
      const next = { ...current, vehicleType, fleetVehicleId: "", vehicle: "" };
      if (current.hasCargo && vehicleType) {
        const avg = averageCargoByVehicleType[vehicleType];
        if (avg) {
          next.weight = avg.weight;
          next.value = avg.value;
          next.type = avg.type;
        }
      }
      return next;
    });
  };

  const handleFleetVehicleChange = (idStr: string) => {
    setTierOverride(false);
    if (!idStr) {
      setFormData((c) => ({ ...c, fleetVehicleId: "", vehicle: "" }));
      return;
    }
    const v = vehicles.find((x) => String(x.id) === idStr);
    if (!v) return;
    setFormData((c) => ({
      ...c,
      fleetVehicleId: idStr,
      vehicle: formatVehicleLabel(v),
      tireTier: v.tireQualityTier,
    }));
  };

  const handleHasCargoChange = (hasCargo: boolean) => {
    if (!hasCargo) {
      setFormData((current) => ({ ...current, hasCargo: false, weight: "", value: "", type: "" }));
      return;
    }

    setFormData((current) => {
      const next = { ...current, hasCargo: true };
      const vt = current.vehicleType;
      const average = vt ? averageCargoByVehicleType[vt] : undefined;
      if (average) {
        next.weight = average.weight;
        next.value = average.value;
        next.type = average.type;
      }
      return next;
    });
  };

  const curbDisplay = selectedFleetVehicle
    ? curbWeightForVehicleType(selectedFleetVehicle.type)
    : null;
  const nominalKmRef = selectedFleetVehicle
    ? NOMINAL_LIFE_KM[selectedFleetVehicle.type] ?? null
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = formData.hasCargo ? formData.weight : "0";
    const finalValue = formData.hasCargo ? formData.value : "0";
    const finalType = formData.hasCargo ? formData.type : "Sem carga";

    if (!selectedFleetVehicle) return;

    const delta = computeTripLifeConsumptionPercent({
      vehicleType: formData.vehicleType,
      distanceKm: Math.max(0, Number(formData.distance) || 0),
      cargoKg: formData.hasCargo ? Math.max(0, Number(formData.weight) || 0) : 0,
      avgSpeedKmh: Math.max(0, Number(formData.avgSpeedKmh) || 0),
      temperatureCelsius: tempCelsius,
      roadCondition: formData.roadCondition,
      tier: effectiveTier,
    });

    if (delta <= 0) return;

    await applyTripWearToVehicle(selectedFleetVehicle.id, delta);

    const newTrip: Trip = {
      id: Date.now(),
      vehicle: formData.vehicle,
      vehicleType: formData.vehicleType,
      distance: formData.distance,
      weight: finalWeight,
      value: finalValue,
      type: finalType,
      hasCargo: formData.hasCargo,
      date: new Date().toLocaleDateString("pt-BR"),
      estimatedWear: delta,
      wearLevel: wearSeverityLevel(delta),
      tireCount,
      avgSpeedKmh: Number(formData.avgSpeedKmh) || undefined,
      roadCondition: formData.roadCondition,
      dayPeriod: formData.dayPeriod,
    };
    setTrips([newTrip, ...trips]);
    setTierOverride(false);
    setFormData({
      fleetVehicleId: "",
      vehicle: "",
      vehicleType: "",
      distance: "",
      hasCargo: false,
      weight: "",
      value: "",
      type: "",
      avgSpeedKmh: "80",
      roadCondition: "Média",
      dayPeriod: "manha",
      tireTier: "intermediario",
    });
  };

  const filteredTrips = filterType === "Todos"
    ? trips
    : trips.filter((t) => t.vehicleType === filterType);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Viagens</h1>
        <p className="text-sm md:text-base text-gray-600">
          Registre viagens e veja o impacto estimado na vida útil dos pneus
        </p>
      </div>

      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Registrar Nova Viagem</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Distância, peso total (veículo + carga), velocidade em km/h, estrada, período do dia
                (temperatura aproximada) e linha dos pneus
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Tipo de Veículo</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Caminhão">Caminhão</option>
                  <option value="Carro">Carro</option>
                  <option value="Moto">Moto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Veículo cadastrado</label>
                <select
                  value={formData.fleetVehicleId}
                  disabled={!formData.vehicleType || vehiclesForType.length === 0}
                  onChange={(e) => handleFleetVehicleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                  required
                >
                  <option value="">
                    {!formData.vehicleType
                      ? "Primeiro escolha o tipo"
                      : vehiclesForType.length === 0
                        ? "Nenhum veículo deste tipo — cadastre em Veículos"
                        : "Selecione o veículo"}
                  </option>
                  {vehiclesForType.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {formatVehicleLabel(v)}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Distância (km)"
                placeholder="1000"
                type="number"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                required
                min={0}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Input
                label="Velocidade média (km/h)"
                placeholder="80"
                type="number"
                min={20}
                value={formData.avgSpeedKmh}
                onChange={(e) => setFormData({ ...formData, avgSpeedKmh: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm text-gray-700 mb-2">Condição da estrada</label>
                <select
                  value={formData.roadCondition}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      roadCondition: e.target.value as RoadCondition,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="Boa">Boa</option>
                  <option value="Média">Média</option>
                  <option value="Ruim">Ruim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Período do dia</label>
                <select
                  value={formData.dayPeriod}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      dayPeriod: e.target.value as DayPeriod,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="manha">Manhã — 25 °C</option>
                  <option value="tarde">Tarde — 30 °C</option>
                  <option value="noite">Noite — 20 °C</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">Linha dos pneus</label>
                {selectedFleetVehicle && (
                  <label className="flex items-center gap-2 mb-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tierOverride}
                      onChange={(e) => setTierOverride(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Alterar só nesta viagem
                  </label>
                )}
                <select
                  value={formData.tireTier}
                  disabled={Boolean(selectedFleetVehicle) && !tierOverride}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      tireTier: e.target.value as TireQualityTier,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-600"
                >
                  <option value="economico">{tierLabels.economico}</option>
                  <option value="intermediario">{tierLabels.intermediario}</option>
                  <option value="premium">{tierLabels.premium}</option>
                </select>
                {selectedFleetVehicle && !tierOverride && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Usando a linha do cadastro do veículo:{" "}
                    <span className="font-medium text-gray-700">
                      {tierLabels[selectedFleetVehicle.tireQualityTier]}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Tem carga?</span>
              <button
                type="button"
                onClick={() => handleHasCargoChange(true)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  formData.hasCargo
                    ? "bg-green-100 border-green-200 text-green-800"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => handleHasCargoChange(false)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  !formData.hasCargo
                    ? "bg-green-100 border-green-200 text-green-800"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                Não
              </button>
            </div>

            {formData.hasCargo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Peso da carga (kg)"
                  placeholder="25000"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required={formData.hasCargo}
                />
                <Input
                  label="Valor da Carga (R$)"
                  placeholder="5000.00"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required={formData.hasCargo}
                />
                <Input
                  label="Tipo de Carga"
                  placeholder="Ex: Carga Geral"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required={formData.hasCargo}
                />
              </div>
            )}

            {selectedFleetVehicle?.type === "Caminhão" && (
              <p className="text-sm text-gray-600">
                Pneus cadastrados neste veículo:{" "}
                <span className="font-semibold text-gray-900">{selectedFleetVehicle.tireCount}</span>
              </p>
            )}

            {selectedFleetVehicle && curbDisplay !== null && (
              <p className="text-xs text-gray-500">
                Peso do veículo (referência por tipo):{" "}
                <span className="font-medium text-gray-700">{curbDisplay} kg</span>
                {nominalKmRef !== null && (
                  <>
                    {" "}
                    · Referência de vida útil:{" "}
                    <span className="font-medium text-gray-700">
                      {(nominalKmRef / 1000).toFixed(0)} mil km
                    </span>
                  </>
                )}
              </p>
            )}

            {(warnHighWear || warnCriticalTires) && lifeConsumedPreview > 0 && (
              <div
                className={`rounded-xl border p-4 space-y-1 ${
                  warnCriticalTires
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                {warnHighWear && (
                  <p className="text-sm font-medium">
                    Desgaste relativo alto neste cenário (~{lifeConsumedPreview.toFixed(1)}% de vida
                    por pneu).
                  </p>
                )}
                {warnCriticalTires && (
                  <p className="text-sm">
                    Após registrar, a vida mais baixa pode cair para cerca de{" "}
                    <strong>{minAfterTrip!.toFixed(1)}%</strong> — revise a troca/manutenção.
                  </p>
                )}
              </div>
            )}

            {formData.vehicleType && selectedFleetVehicle && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">Antes de salvar — pré-visualização</p>
                <p className="text-sm text-gray-700">
                  Consumo estimado de vida útil por pneu (esta viagem):{" "}
                  <span className="font-semibold text-gray-900">
                    {lifeConsumedPreview.toFixed(1)}%
                  </span>
                  <span
                    className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs ${
                      wearLevelPreview === "Alto"
                        ? "bg-red-100 text-red-800"
                        : wearLevelPreview === "Médio"
                          ? "bg-yellow-100 text-yellow-900"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {wearLevelPreview}
                  </span>
                </p>
                <p className="text-sm text-gray-700">
                  Temperatura aproximada: <span className="font-medium">{tempCelsius} °C</span>
                </p>
                <p className="text-sm text-gray-700">
                  Pneus no veículo: <span className="font-semibold">{tireCount}</span> — o mesmo
                  percentual vale para todos
                </p>
              </div>
            )}

            <Button type="submit" variant="primary">
              Registrar viagem e atualizar pneus
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Viagens registradas</h3>
              <p className="text-xs md:text-sm text-gray-600">{filteredTrips.length} viagens encontrada(s)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-gray-600">Filtrar:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-xs md:text-sm"
              >
                <option value="Todos">Todos</option>
                <option value="Caminhão">Caminhão</option>
                <option value="Carro">Carro</option>
                <option value="Moto">Moto</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Veículo
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Tipo
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Distância (km)
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Carga?
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Peso carga (kg)
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    V méd (km/h)
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Estrada
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Vida / viagem %
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Pneus
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Valor
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Uso
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip, index) => (
                  <tr
                    key={trip.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-900 font-medium">
                      {trip.vehicle}
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.vehicleType}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.distance}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.hasCargo ? "Sim" : "Não"}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">
                      {Number(trip.weight).toLocaleString()}
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.avgSpeedKmh ?? "—"}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.roadCondition ?? "—"}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="text-sm font-medium text-gray-900">{trip.estimatedWear}%</span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          trip.wearLevel === "Alto"
                            ? "bg-red-100 text-red-700"
                            : trip.wearLevel === "Médio"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {trip.wearLevel}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.tireCount}</td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-green-600 font-medium">
                      R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        {trip.type}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4 text-sm text-gray-700">{trip.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3 p-4">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm md:text-base">{trip.vehicle}</h4>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.vehicleType}
                      </span>
                      <span className="text-xs text-gray-500">{trip.date}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Distância</p>
                    <p className="text-sm font-medium text-gray-900">{trip.distance} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tem carga?</p>
                    <p className="text-sm font-medium text-gray-900">{trip.hasCargo ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Peso carga</p>
                    <p className="text-sm font-medium text-gray-900">{Number(trip.weight).toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vida / viagem</p>
                    <p className="text-sm font-medium text-gray-900">{trip.estimatedWear}% ({trip.wearLevel})</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vméd</p>
                    <p className="text-sm font-medium text-gray-900">{trip.avgSpeedKmh ?? "—"} km/h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estrada</p>
                    <p className="text-sm font-medium text-gray-900">{trip.roadCondition ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pneus afetados</p>
                    <p className="text-sm font-medium text-gray-900">{trip.tireCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="text-sm font-medium text-green-600">
                      R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="pt-1 border-t border-gray-100">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                    {trip.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
