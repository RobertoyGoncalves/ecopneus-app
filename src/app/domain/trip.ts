import type { DayPeriod, RoadCondition } from "./wearModel";

export type TripWearLevel = "Baixo" | "Médio" | "Alto";

/** Viagem registada na app (persistida via TripsContext). */
export interface Trip {
  id: string;
  vehicle: string;
  vehicleType: string;
  distance: string;
  weight: string;
  value: string;
  type: string;
  hasCargo: boolean;
  date: string;
  estimatedWear: number;
  wearLevel: TripWearLevel;
  tireCount: number;
  avgSpeedKmh?: number;
  roadCondition?: RoadCondition;
  dayPeriod?: DayPeriod;
  /** ISO 8601 — usado para gráficos mensais (viagens antigas podem não ter). */
  recordedAtIso?: string;
  origem: string;
  destino: string;
  latOrigem?: number;
  lonOrigem?: number;
  latDestino?: number;
  lonDestino?: number;
  /** UUID do veículo na nuvem (quando persistido no Supabase). */
  vehicleId?: string;
  /** UUID do usuário que operou a viagem (operador_id no banco). */
  operadorId?: string;
}
