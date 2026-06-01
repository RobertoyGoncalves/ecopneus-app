import { resolveTireLifespanKm, type TireLifespanResult } from "../app/data/tireSpecsCatalog";
import type { TireQualityTier } from "../app/domain/wearModel";

export type { TireLifespanResult };

export type GetTireLifespanOptions = {
  brand?: string;
  tier?: TireQualityTier;
};

/** Busca vida útil: catálogo local → faixa por tier (sem API externa). */
export async function getTireLifespanKm(
  model: string,
  options?: GetTireLifespanOptions
): Promise<TireLifespanResult> {
  return resolveTireLifespanKm(model, options?.brand ?? "", options?.tier ?? "intermediario");
}
