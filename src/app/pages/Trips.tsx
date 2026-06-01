import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { formatVehicleLabel, useFleet } from "../contexts/FleetContext";
import { useTrips } from "../contexts/TripsContext";
import type { Trip } from "../domain/trip";
import type { DayPeriod, RoadCondition, TireQualityTier } from "../domain/wearModel";
import {
  computeTripLifeConsumptionPercent,
  curbWeightForVehicleType,
  NOMINAL_LIFE_KM,
  temperatureForPeriod,
  wearSeverityLevel,
} from "../domain/wearModel";
import { useGeolocation } from "../hooks/useGeolocation";
import { useViagemAutoFill } from "../hooks/useViagemAutoFill";
import { buscarSugestoesDestino, geocodificarEndereco } from "@/services/routeService";
import { periodOptionsWithTemperature } from "../utils/periodoUtils";

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

const destinoSugestoes = [
  "Maringá, PR",
  "Londrina, PR",
  "Curitiba, PR",
  "Cascavel, PR",
  "Ponta Grossa, PR",
  "São José dos Pinhais, PR",
  "Foz do Iguaçu, PR",
  "Campinas, SP",
  "São Paulo, SP",
  "Ribeirão Preto, SP",
  "Jundiaí, SP",
];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function Trips() {
  const { vehicles, tires, applyTripWearToVehicle } = useFleet();
  const { trips, addTrip } = useTrips();

  /** Se falso, usa a linha cadastrada no veículo; se verdadeiro, usa o select manual. */
  const [tierOverride, setTierOverride] = useState(false);

  const [filterType, setFilterType] = useState("Todos");
  const [destino, setDestino] = useState("");
  const [destinoSugestoesApi, setDestinoSugestoesApi] = useState<string[]>([]);

  const { obterPosicao, erro: erroGps, carregando: gpsCarregando } = useGeolocation();
  const { autoPreencher, status: autoFillStatus, erro: erroAutoFill, reset: resetAutoFill } =
    useViagemAutoFill();

  const autoFillCarregando = autoFillStatus === "carregando" || gpsCarregando;
  const autoFillErro = erroGps ?? erroAutoFill;

  const destinoSugestoesCompletas = useMemo(() => {
    const merged = [...destinoSugestoesApi, ...destinoSugestoes];
    const unique = Array.from(new Set(merged.map((x) => x.trim()).filter(Boolean)));
    const term = normalizeText(destino);
    if (!term) return unique.slice(0, 10);
    return unique
      .filter((item) => normalizeText(item).includes(term))
      .slice(0, 10);
  }, [destinoSugestoesApi, destino]);

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
    temperatureC: null as number | null,
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
  const tempCelsius =
    formData.temperatureC ?? temperatureForPeriod(formData.dayPeriod);

  const periodoOptions = useMemo(() => {
    const overrides =
      formData.temperatureC !== null
        ? { [formData.dayPeriod]: formData.temperatureC }
        : undefined;
    return periodOptionsWithTemperature(overrides);
  }, [formData.dayPeriod, formData.temperatureC]);

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

  useEffect(() => {
    const term = destino.trim();
    if (term.length < 3) {
      setDestinoSugestoesApi([]);
      return;
    }

    const timer = window.setTimeout(() => {
      void buscarSugestoesDestino(term)
        .then((items) => setDestinoSugestoesApi(items))
        .catch(() => setDestinoSugestoesApi([]));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [destino]);

  const handleAutoPreencher = async () => {
    resetAutoFill();
    if (!destino.trim()) return;

    try {
      const origem = await obterPosicao();
      const destinoNormalizado = normalizeText(destino);
      const destinoSugerido =
        [...destinoSugestoesApi, ...destinoSugestoes].find((item) =>
          normalizeText(item).startsWith(destinoNormalizado)
        ) ?? destino.trim();
      const coordDestino = await geocodificarEndereco(destinoSugerido, origem);
      const result = await autoPreencher(
        origem,
        coordDestino,
        formData.vehicleType || "Carro"
      );

      setFormData((f) => ({
        ...f,
        distance: String(result.distanciaKm),
        avgSpeedKmh: String(result.velocidadeMediaKmh),
        dayPeriod: result.periodoValor,
        temperatureC: result.temperaturaC,
      }));
    } catch {
      // Erros expostos via hooks (erroGps / erroAutoFill)
    }
  };

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

    const newTrip: Omit<Trip, "id"> = {
      vehicle: formData.vehicle,
      vehicleType: formData.vehicleType,
      distance: formData.distance,
      weight: finalWeight,
      value: finalValue,
      type: finalType,
      hasCargo: formData.hasCargo,
      date: new Date().toLocaleDateString("pt-BR"),
      recordedAtIso: new Date().toISOString(),
      estimatedWear: delta,
      wearLevel: wearSeverityLevel(delta),
      tireCount,
      avgSpeedKmh: Number(formData.avgSpeedKmh) || undefined,
      roadCondition: formData.roadCondition,
      dayPeriod: formData.dayPeriod,
    };
    addTrip(newTrip);
    setTierOverride(false);
    setDestino("");
    resetAutoFill();
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
      temperatureC: null,
      tireTier: "intermediario",
    });
  };

  const filteredTrips = filterType === "Todos"
    ? trips
    : trips.filter((t) => t.vehicleType === filterType);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900 md:text-3xl">Viagens</h1>
        <p className="text-sm text-slate-600 md:text-base">
          Registre viagens e veja o impacto estimado na vida útil dos pneus
        </p>
      </div>

      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <MapPin className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 md:text-lg">Registrar Nova Viagem</h3>
              <p className="text-xs text-slate-600 md:text-sm">
                Informe o destino para preencher distância, velocidade e período automaticamente,
                ou preencha manualmente
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm text-slate-700">Tipo de Veículo</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Caminhão">Caminhão</option>
                  <option value="Carro">Carro</option>
                  <option value="Moto">Moto</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-700">Veículo cadastrado</label>
                <select
                  value={formData.fleetVehicleId}
                  disabled={!formData.vehicleType || vehiclesForType.length === 0}
                  onChange={(e) => handleFleetVehicleChange(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 disabled:bg-slate-100 disabled:text-slate-500"
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

            <div className="space-y-3 rounded-xl border border-green-200/60 bg-green-50/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    label="Destino"
                    placeholder="Ex: Maringá, PR"
                    value={destino}
                    list="destino-sugestoes"
                    onChange={(e) => {
                      setDestino(e.target.value);
                      if (autoFillErro) resetAutoFill();
                    }}
                  />
                  <datalist id="destino-sugestoes">
                    {destinoSugestoesCompletas.map((cidade) => (
                      <option key={cidade} value={cidade} />
                    ))}
                  </datalist>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAutoPreencher}
                  disabled={autoFillCarregando || !destino.trim()}
                  className="shrink-0 gap-2 sm:mb-0"
                >
                  {autoFillCarregando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      Detectar automaticamente
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-600">
                Digite parte do destino (ex.: "Maring") e selecione a sugestão. A origem usa sua
                localização atual.
              </p>
              {autoFillErro && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {autoFillErro}
                </p>
              )}
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
                <label className="mb-2 block text-sm text-slate-700">Condição da estrada</label>
                <select
                  value={formData.roadCondition}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      roadCondition: e.target.value as RoadCondition,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25"
                >
                  <option value="Boa">Boa</option>
                  <option value="Média">Média</option>
                  <option value="Ruim">Ruim</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-700">Período do dia</label>
                <select
                  value={formData.dayPeriod}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      dayPeriod: e.target.value as DayPeriod,
                      temperatureC: null,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25"
                >
                  {periodoOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="mb-2 block text-sm text-slate-700">Linha dos pneus</label>
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
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 disabled:bg-slate-100 disabled:text-slate-600"
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
              <span className="text-sm text-slate-700">Tem carga?</span>
              <button
                type="button"
                onClick={() => handleHasCargoChange(true)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  formData.hasCargo
                    ? "bg-green-100 border-green-200 text-green-800"
                    : "bg-white border-slate-200 text-slate-700"
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
                    : "bg-white border-slate-200 text-slate-700"
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
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-medium text-slate-900">Antes de salvar — pré-visualização</p>
                <p className="text-sm text-slate-700">
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
                <p className="text-sm text-slate-700">
                  Temperatura{" "}
                  {formData.temperatureC !== null ? "atual" : "aproximada"}:{" "}
                  <span className="font-medium">{Math.round(tempCelsius)} °C</span>
                </p>
                <p className="text-sm text-slate-700">
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
              <h3 className="text-base font-semibold text-slate-900 md:text-lg">Viagens registradas</h3>
              <p className="text-xs text-slate-600 md:text-sm">{filteredTrips.length} viagens encontrada(s)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 md:text-sm">Filtrar:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 md:px-4 md:text-sm"
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
                <tr className="border-b border-slate-200 bg-slate-50/60">
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Veículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Distância (km)
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Carga?
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Peso carga (kg)
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    V méd (km/h)
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Estrada
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Vida / viagem %
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Pneus
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Uso
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 md:py-4 md:text-sm lg:px-6">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip, index) => (
                  <tr
                    key={trip.id}
                    className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 md:py-4 lg:px-6">
                      {trip.vehicle}
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.vehicleType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 md:py-4 lg:px-6">{trip.distance}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 md:py-4 lg:px-6">{trip.hasCargo ? "Sim" : "Não"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 md:py-4 lg:px-6">
                      {Number(trip.weight).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 md:py-4 lg:px-6">{trip.avgSpeedKmh ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 md:py-4 lg:px-6">{trip.roadCondition ?? "—"}</td>
                    <td className="px-4 py-3 md:py-4 lg:px-6">
                      <span className="text-sm font-medium text-slate-900">{trip.estimatedWear}%</span>
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
                    <td className="px-4 py-3 text-sm text-slate-700 md:py-4 lg:px-6">{trip.tireCount}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600 md:py-4 lg:px-6">
                      R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 lg:px-6 py-3 md:py-4">
                      <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        {trip.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 md:py-4 lg:px-6">{trip.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 lg:hidden">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-900 md:text-base">{trip.vehicle}</h4>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.vehicleType}
                      </span>
                      <span className="text-xs text-slate-500">{trip.date}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-2">
                  <div>
                    <p className="text-xs text-slate-500">Distância</p>
                    <p className="text-sm font-medium text-slate-900">{trip.distance} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tem carga?</p>
                    <p className="text-sm font-medium text-slate-900">{trip.hasCargo ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Peso carga</p>
                    <p className="text-sm font-medium text-slate-900">{Number(trip.weight).toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Vida / viagem</p>
                    <p className="text-sm font-medium text-slate-900">{trip.estimatedWear}% ({trip.wearLevel})</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Vméd</p>
                    <p className="text-sm font-medium text-slate-900">{trip.avgSpeedKmh ?? "—"} km/h</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Estrada</p>
                    <p className="text-sm font-medium text-slate-900">{trip.roadCondition ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pneus afetados</p>
                    <p className="text-sm font-medium text-slate-900">{trip.tireCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Valor</p>
                    <p className="text-sm font-medium text-green-600">
                      R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-1">
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
