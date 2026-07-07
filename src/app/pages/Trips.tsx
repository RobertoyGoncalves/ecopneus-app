import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { StatusBadge } from "../components/ui/StatusBadge";
import { MapPin } from "lucide-react";
import { formatVehicleLabel, useFleet } from "../contexts/FleetContext";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import type { Trip } from "../domain/trip";
import { getSupabase, isSupabaseConfigured } from "../lib/supabaseClient";
import {
  DriverAvatarButton,
  DriverSummaryModal,
  type OperatorProfile,
} from "../components/ui/DriverSummaryModal";
import type { DayPeriod, RoadCondition, TireQualityTier } from "../domain/wearModel";
import {
  computeTripLifeConsumptionPercent,
  curbWeightForVehicleType,
  formatWearPercent,
  NOMINAL_LIFE_KM,
  temperatureForPeriod,
  wearSeverityLevel,
} from "../domain/wearModel";
import { MapaRota, type MapaRotaResultado } from "../components/MapaRota";
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

export function Trips() {
  const { vehicles, tires, applyTripWearToVehicle } = useFleet();
  const { trips, addTrip } = useTrips();
  const { supabaseUserId, papel, empresaId } = useAuth();
  const donoId = papel === "funcionario" && empresaId ? empresaId : supabaseUserId;

  const [tierOverride, setTierOverride] = useState(false);
  const [filterType, setFilterType] = useState("Todos");

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
    origem: "",
    destino: "",
    latOrigem: undefined as number | undefined,
    lonOrigem: undefined as number | undefined,
    latDestino: undefined as number | undefined,
    lonDestino: undefined as number | undefined,
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

  const handleRotaCalculada = (resultado: MapaRotaResultado) => {
    setFormData((f) => ({
      ...f,
      distance: String(resultado.distanciaKm),
      avgSpeedKmh: String(resultado.velocidadeMediaKmh),
      dayPeriod: resultado.periodoValor,
      temperatureC: resultado.temperaturaC,
      origem: resultado.origem,
      destino: resultado.destino,
      latOrigem: resultado.latOrigem,
      lonOrigem: resultado.lonOrigem,
      latDestino: resultado.latDestino,
      lonDestino: resultado.lonDestino,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = formData.hasCargo ? formData.weight : "0";
    const finalValue = formData.hasCargo ? formData.value : "0";
    const finalType = formData.hasCargo ? formData.type : "Sem carga";

    if (!selectedFleetVehicle) return;

    const distanceKm = Math.max(0, Number(formData.distance) || 0);
    if (!distanceKm) return;

    const delta = computeTripLifeConsumptionPercent({
      vehicleType: formData.vehicleType,
      distanceKm,
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
      origem: formData.origem,
      destino: formData.destino,
      latOrigem: formData.latOrigem,
      lonOrigem: formData.lonOrigem,
      latDestino: formData.latDestino,
      lonDestino: formData.lonDestino,
      vehicleId: selectedFleetVehicle.id,
    };
    await addTrip(newTrip);
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
      temperatureC: null,
      tireTier: "intermediario",
      origem: "",
      destino: "",
      latOrigem: undefined,
      lonOrigem: undefined,
      latDestino: undefined,
      lonDestino: undefined,
    });
  };

  const filteredTrips = filterType === "Todos"
    ? trips
    : trips.filter((t) => t.vehicleType === filterType);

  // ── Operator profiles for Motorista column ────────────────────────────────

  const operatorIds = useMemo(
    () => [...new Set(filteredTrips.flatMap((t) => (t.operadorId ? [t.operadorId] : [])))],
    [filteredTrips]
  );

  const [operatorProfiles, setOperatorProfiles] = useState<Record<string, OperatorProfile>>({});
  const [driverModalId, setDriverModalId] = useState<string | null>(null);

  useEffect(() => {
    const ids = operatorIds;
    if (!ids.length || !isSupabaseConfigured() || !donoId) return;
    void getSupabase()
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", ids)
      .then(({ data }) => {
        const map: Record<string, OperatorProfile> = {};
        for (const row of data ?? []) {
          const r = row as { id: string; full_name: string | null; avatar_url: string | null };
          map[r.id] = { fullName: r.full_name, avatarUrl: r.avatar_url };
        }
        setOperatorProfiles((prev) => ({ ...prev, ...map }));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatorIds.join(","), donoId]);

  const selectCls = "h-11 w-full rounded-xl border px-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)]";
  const selectCls11 = selectCls + " disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <MapPin className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h3 className="text-base font-semibold md:text-lg" style={{ color: "var(--text-primary)" }}>Registrar Nova Viagem</h3>
              <p className="text-xs md:text-sm" style={{ color: "var(--text-secondary)" }}>
                Escolha origem e destino no mapa para calcular distância, velocidade e período,
                ou preencha manualmente
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Tipo de Veículo</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value)}
                  className={selectCls}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Caminhão">Caminhão</option>
                  <option value="Carro">Carro</option>
                  <option value="Moto">Moto</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Veículo cadastrado</label>
                <select
                  value={formData.fleetVehicleId}
                  disabled={!formData.vehicleType || vehiclesForType.length === 0}
                  onChange={(e) => handleFleetVehicleChange(e.target.value)}
                  className={selectCls11}
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
            </div>

            <MapaRota
              vehicleType={formData.vehicleType || "Carro"}
              onRotaCalculada={handleRotaCalculada}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Condição da estrada</label>
                <select
                  value={formData.roadCondition}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      roadCondition: e.target.value as RoadCondition,
                    }))
                  }
                  className={selectCls}
                >
                  <option value="Boa">Boa</option>
                  <option value="Média">Média</option>
                  <option value="Ruim">Ruim</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Período do dia</label>
                <select
                  value={formData.dayPeriod}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      dayPeriod: e.target.value as DayPeriod,
                      temperatureC: null,
                    }))
                  }
                  className={selectCls}
                >
                  {periodoOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="mb-2 block text-sm" style={{ color: "var(--text-primary)" }}>Linha dos pneus</label>
                {selectedFleetVehicle && (
                  <label className="flex items-center gap-2 mb-2 text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>
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
                  className={selectCls11}
                >
                  <option value="economico">{tierLabels.economico}</option>
                  <option value="intermediario">{tierLabels.intermediario}</option>
                  <option value="premium">{tierLabels.premium}</option>
                </select>
                {selectedFleetVehicle && !tierOverride && (
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                    Usando a linha do cadastro do veículo:{" "}
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {tierLabels[selectedFleetVehicle.tireQualityTier]}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>Tem carga?</span>
              <button
                type="button"
                onClick={() => handleHasCargoChange(true)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  formData.hasCargo
                    ? "bg-green-100 border-green-200 text-green-800"
                    : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
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
                    : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
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
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Pneus cadastrados neste veículo:{" "}
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{selectedFleetVehicle.tireCount}</span>
              </p>
            )}

            {selectedFleetVehicle && curbDisplay !== null && (
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Peso do veículo (referência por tipo):{" "}
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{curbDisplay} kg</span>
                {nominalKmRef !== null && (
                  <>
                    {" "}
                    · Referência de vida útil:{" "}
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
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
                    Desgaste relativo alto neste cenário (~{formatWearPercent(lifeConsumedPreview)} de vida
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
              <div
                className="space-y-2 rounded-xl border p-4"
                style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border-color)" }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Antes de salvar — pré-visualização</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Consumo estimado de vida útil por pneu (esta viagem):{" "}
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {formatWearPercent(lifeConsumedPreview)}
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
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Temperatura{" "}
                  {formData.temperatureC !== null ? "atual" : "aproximada"}:{" "}
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{Math.round(tempCelsius)} °C</span>
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Pneus no veículo: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{tireCount}</span> — o mesmo
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Viagens registradas</h3>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{filteredTrips.length} viagem(ns) encontrada(s)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm" style={{ color: "var(--text-secondary)" }}>Filtrar:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 rounded-xl border px-3 text-xs transition-all focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 md:px-4 md:text-sm bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)]"
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
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border-color)" }}
                >
                  {["Motorista", "Veículo", "Tipo", "Distância (km)", "Carga?", "Peso carga (kg)", "V méd (km/h)", "Estrada", "Vida / viagem", "Pneus", "Valor", "Uso", "Data"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip, index) => (
                  <tr
                    key={trip.id}
                    className="transition-colors last:border-0 hover:bg-[var(--bg-page)]"
                    style={
                      index < filteredTrips.length - 1
                        ? { borderBottom: "1px solid var(--border-color)" }
                        : undefined
                    }
                  >
                    <td className="px-5 py-3.5">
                      <DriverAvatarButton
                        operadorId={trip.operadorId}
                        profiles={operatorProfiles}
                        onOpen={(id) => setDriverModalId(id)}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{trip.vehicle}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={trip.vehicleType} label={trip.vehicleType} />
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{trip.distance}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{trip.hasCargo ? "Sim" : "Não"}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{Number(trip.weight).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{trip.avgSpeedKmh ?? "—"}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{trip.roadCondition ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="mr-1.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {formatWearPercent(trip.estimatedWear)}
                      </span>
                      <StatusBadge status={trip.wearLevel ?? "Baixo"} />
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{trip.tireCount}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-green-600">
                      R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
                        {trip.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{trip.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 lg:hidden">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="space-y-3 rounded-xl border p-4"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium md:text-base" style={{ color: "var(--text-primary)" }}>{trip.vehicle}</h4>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {trip.vehicleType}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{trip.date}</span>
                    </div>
                    {trip.operadorId && (
                      <div className="mt-2">
                        <DriverAvatarButton
                          operadorId={trip.operadorId}
                          profiles={operatorProfiles}
                          onOpen={(id) => setDriverModalId(id)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="grid grid-cols-2 gap-3 border-t pt-2"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Distância</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{trip.distance} km</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Tem carga?</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{trip.hasCargo ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Peso carga</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{Number(trip.weight).toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Vida / viagem</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{formatWearPercent(trip.estimatedWear)} ({trip.wearLevel})</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Vméd</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{trip.avgSpeedKmh ?? "—"} km/h</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Estrada</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{trip.roadCondition ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Pneus afetados</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{trip.tireCount}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Valor</p>
                    <p className="text-sm font-medium text-green-600">
                      R$ {Number(trip.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-1" style={{ borderColor: "var(--border-color)" }}>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                    {trip.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DriverSummaryModal
        driverId={driverModalId}
        onClose={() => setDriverModalId(null)}
      />
    </div>
  );
}
