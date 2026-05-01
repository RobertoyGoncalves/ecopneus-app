/**
 * Modelo empírico de consumo de vida útil dos pneus por viagem.
 * Base conceitual: fatores D, P, V, T, f(θ,Q) conforme trabalho — implementação opera
 * com fração de vida nominal (km típicos por tipo), modulada por agressividade de uso.
 */

export type RoadCondition = "Boa" | "Média" | "Ruim";

export type TireQualityTier = "economico" | "intermediario" | "premium";

export type DayPeriod = "manha" | "tarde" | "noite";

/** Tara média típica (kg) por tipo — calibração do protótipo. */
export const CURB_WEIGHT_KG: Record<string, number> = {
  Moto: 180,
  Carro: 1350,
  Caminhão: 12000,
};

/** Km nominais de referência até desgaste pleno — calibráveis na monografia. */
export const NOMINAL_LIFE_KM: Record<string, number> = {
  Moto: 30000,
  Carro: 50000,
  Caminhão: 90000,
};

/** Raios efetivos de referência (m) por tipo — documentação / extensões futuras. */
export const R_EFF_M_REF: Record<string, number> = {
  Moto: 0.285,
  Carro: 0.325,
  Caminhão: 0.52,
};

/** Temperatura de referência (°C) por período — proxy empírico simplificado. */
export const TEMP_C_BY_PERIOD: Record<DayPeriod, number> = {
  manha: 25,
  tarde: 30,
  noite: 20,
};

/** g(θ): pior estrada aumenta consumo relativo de vida útil. */
export function roadConditionFactor(condition: RoadCondition): number {
  switch (condition) {
    case "Boa":
      return 0.88;
    case "Média":
      return 1.0;
    case "Ruim":
      return 1.15;
    default:
      return 1.0;
  }
}

/** h(Q): econômico desgasta mais rápido, premium menos. */
export function tireTierFactor(tier: TireQualityTier): number {
  switch (tier) {
    case "economico":
      return 1.12;
    case "intermediario":
      return 1.0;
    case "premium":
      return 0.88;
    default:
      return 1.0;
  }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Velocidade média vs 80 km/h (referência neutra para o protótipo). */
export function speedFactor(avgSpeedKmh: number): number {
  const v = clamp(avgSpeedKmh || 80, 20, 160);
  return clamp(Math.pow(v / 80, 1.2), 0.75, 1.55);
}

/** Temperatura ambiente empírica: 25 °C neutro. */
export function temperatureFactorCelsius(tC: number): number {
  return clamp(1 + 0.006 * (tC - 25), 0.88, 1.15);
}

/** Massa total (kg) aumenta fadiga relativamente aos referenciais típicos. */
export function massLoadFactor(vehicleType: string, totalKg: number): number {
  const pRefByType: Record<string, number> = {
    Moto: 320,
    Carro: 1500,
    Caminhão: 13200,
  };
  const ref = pRefByType[vehicleType] ?? 1500;
  return clamp(totalKg / ref, 0.9, 1.45);
}

export function curbWeightForVehicleType(type: string): number {
  return CURB_WEIGHT_KG[type] ?? 1350;
}

export function temperatureForPeriod(p: DayPeriod): number {
  return TEMP_C_BY_PERIOD[p];
}

export interface WearTripInput {
  vehicleType: string;
  distanceKm: number;
  cargoKg: number;
  avgSpeedKmh: number;
  temperatureCelsius: number;
  roadCondition: RoadCondition;
  tier: TireQualityTier;
}

/** Retorna quantos pontos percentuais de vida útil consumir esta viagem (0–cap). */
export function computeTripLifeConsumptionPercent(input: WearTripInput): number {
  const nominal = NOMINAL_LIFE_KM[input.vehicleType] ?? 45000;
  const D = Math.max(0, input.distanceKm);
  if (!D || !input.vehicleType) return 0;

  const curb = curbWeightForVehicleType(input.vehicleType);
  const totalKg = curb + Math.max(0, input.cargoKg);

  const base = D / nominal;
  const fTheta = roadConditionFactor(input.roadCondition);
  const fq = tireTierFactor(input.tier);
  const fs = speedFactor(input.avgSpeedKmh);
  const ft = temperatureFactorCelsius(input.temperatureCelsius);
  const fm = massLoadFactor(input.vehicleType, totalKg);

  const aggravated = base * fTheta * fq * fs * ft * fm;
  const deltaPct = aggravated * 100;
  /** Teto por viagem para evitar valores extremos no protótipo. */
  return Math.round(clamp(deltaPct, 0, 40) * 10) / 10;
}

export function wearSeverityLevel(deltaPct: number): "Baixo" | "Médio" | "Alto" {
  if (deltaPct >= 6) return "Alto";
  if (deltaPct >= 2.5) return "Médio";
  return "Baixo";
}
