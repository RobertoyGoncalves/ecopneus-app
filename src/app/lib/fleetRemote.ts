import type { FleetTire, FleetVehicle } from "../domain/fleet";
import type { TireQualityTier } from "../domain/wearModel";
import { getSupabase } from "./supabaseClient";

function tierOk(t: unknown): t is TireQualityTier {
  return t === "economico" || t === "intermediario" || t === "premium";
}

function rowToVehicle(row: Record<string, unknown>): FleetVehicle {
  return {
    id: String(row.id),
    type: String(row.type ?? ""),
    brand: String(row.brand ?? ""),
    model: String(row.model ?? ""),
    year: String(row.year ?? ""),
    plate: String(row.plate ?? ""),
    tireCount: Math.max(0, Number(row.tire_count)),
    tireManufacturer: String(row.tire_manufacturer ?? "—"),
    tireModel: String(row.tire_model ?? "—"),
    tireQualityTier: tierOk(row.tire_quality_tier) ? row.tire_quality_tier : "intermediario",
  };
}

function rowToTire(row: Record<string, unknown>): FleetTire {
  return {
    id: String(row.id),
    model: String(row.model ?? ""),
    brand: String(row.brand ?? ""),
    axis: String(row.axis ?? ""),
    health: Math.min(100, Math.max(0, Number(row.health))),
    vehicleType: String(row.vehicle_type ?? ""),
    vehicle: String(row.vehicle_label ?? ""),
    vehicleId: String(row.vehicle_id ?? ""),
  };
}

/**
 * Busca todos os veículos e pneus cujo dono_id = donoId.
 *
 * donoId resolve para:
 *  - autônomo → supabaseUserId (id do próprio usuário)
 *  - chefe    → supabaseUserId (ele é o dono da frota)
 *  - funcionário → empresaId (id do chefe ao qual está vinculado)
 *
 * A RLS no banco aplica a mesma regra; o filtro explícito aqui é uma
 * segunda camada de segurança e garante que a query retorne apenas os
 * dados corretos mesmo antes da sessão do Supabase ser propagada.
 */
export async function remoteFetchFleet(donoId: string): Promise<{ vehicles: FleetVehicle[]; tires: FleetTire[] }> {
  const supabase = getSupabase();
  const { data: vRows, error: vErr } = await supabase
    .from("vehicles")
    .select("*")
    .eq("dono_id", donoId)
    .order("created_at", { ascending: false });
  if (vErr) throw vErr;

  const { data: tRows, error: tErr } = await supabase
    .from("tires")
    .select("*")
    .eq("dono_id", donoId);
  if (tErr) throw tErr;

  const vehicles = (vRows ?? []).map((r) => rowToVehicle(r as Record<string, unknown>));
  const tires = (tRows ?? []).map((r) => rowToTire(r as Record<string, unknown>));
  return { vehicles, tires };
}

/**
 * Cadastra um veículo novo com dono_id = donoId e cria seus pneus iniciais.
 *
 * Para funcionário: donoId = empresaId do chefe.
 * Para autônomo/chefe: donoId = supabaseUserId.
 *
 * user_id mantido com o mesmo valor que dono_id durante a transição
 * (coluna deprecada ainda é NOT NULL no schema).
 */
export async function remoteAddVehicle(donoId: string, draft: Omit<FleetVehicle, "id">): Promise<{ vehicles: FleetVehicle[]; tires: FleetTire[] }> {
  const supabase = getSupabase();
  const { data: row, error } = await supabase
    .from("vehicles")
    .insert({
      dono_id: donoId,
      user_id: donoId,   // deprecado; mesmo valor durante a transição
      type: draft.type,
      brand: draft.brand,
      model: draft.model,
      year: draft.year,
      plate: draft.plate,
      tire_count: draft.tireCount,
      tire_manufacturer: draft.tireManufacturer,
      tire_model: draft.tireModel,
      tire_quality_tier: draft.tireQualityTier,
    })
    .select()
    .single();
  if (error) throw error;
  const vehicle = rowToVehicle(row as Record<string, unknown>);
  const label = `${vehicle.brand} ${vehicle.model} • ${vehicle.plate}`;
  const tireInserts = [];
  for (let i = 0; i < vehicle.tireCount; i++) {
    tireInserts.push({
      dono_id: donoId,
      user_id: donoId,   // deprecado; mesmo valor durante a transição
      vehicle_id: vehicle.id,
      model: vehicle.tireModel,
      brand: vehicle.tireManufacturer,
      axis: axisForIndex(i, vehicle.tireCount),
      health: 100,
      vehicle_type: vehicle.type,
      vehicle_label: label,
    });
  }
  if (tireInserts.length > 0) {
    const { data: tRows, error: tErr } = await supabase.from("tires").insert(tireInserts).select();
    if (tErr) throw tErr;
    const inserted = (tRows ?? []).map((r) => rowToTire(r as Record<string, unknown>));
    return { vehicles: [vehicle], tires: inserted };
  }
  return { vehicles: [vehicle], tires: [] };
}

function axisForIndex(index: number, total: number): string {
  if (total <= 1) return "Único";
  const half = Math.ceil(total / 2);
  return index < half ? "Dianteiro" : "Traseiro";
}

/**
 * Remove um veículo (e seus pneus por cascade).
 * Filtra por dono_id para garantir que só o dono (ou quem tem permissão via RLS) pode deletar.
 */
export async function remoteRemoveVehicle(donoId: string, vehicleId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId)
    .eq("dono_id", donoId);
  if (error) throw error;
}

/**
 * Remove um pneu individual.
 * Filtra por dono_id para garantir propriedade.
 */
export async function remoteRemoveTire(donoId: string, tireId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("tires")
    .delete()
    .eq("id", tireId)
    .eq("dono_id", donoId);
  if (error) throw error;
}

/**
 * Atualiza campos de um pneu existente.
 * Filtra por dono_id para garantir propriedade.
 */
export async function remoteUpdateTire(
  donoId: string,
  tireId: string,
  patch: Partial<Pick<FleetTire, "model" | "brand" | "axis" | "health">>
): Promise<void> {
  const supabase = getSupabase();
  const payload: Record<string, unknown> = {};
  if (patch.model !== undefined) payload.model = patch.model;
  if (patch.brand !== undefined) payload.brand = patch.brand;
  if (patch.axis !== undefined) payload.axis = patch.axis;
  if (patch.health !== undefined) {
    payload.health = Math.min(100, Math.max(0, Number(patch.health)));
  }
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase
    .from("tires")
    .update(payload)
    .eq("id", tireId)
    .eq("dono_id", donoId);
  if (error) throw error;
}

/**
 * Substitui um pneu: deleta o antigo e insere um novo no mesmo veículo.
 * dono_id = donoId em ambas as operações.
 */
export async function remoteReplaceTire(
  donoId: string,
  oldTireId: string,
  draft: Omit<FleetTire, "id" | "vehicle">,
  vehicleLabel: string
): Promise<FleetTire> {
  const supabase = getSupabase();
  const { error: delErr } = await supabase
    .from("tires")
    .delete()
    .eq("id", oldTireId)
    .eq("dono_id", donoId);
  if (delErr) throw delErr;

  const { data: row, error: insErr } = await supabase
    .from("tires")
    .insert({
      dono_id: donoId,
      user_id: donoId,   // deprecado; mesmo valor durante a transição
      vehicle_id: draft.vehicleId,
      model: draft.model,
      brand: draft.brand,
      axis: draft.axis,
      health: draft.health,
      vehicle_type: draft.vehicleType,
      vehicle_label: vehicleLabel,
    })
    .select()
    .single();
  if (insErr) throw insErr;
  return rowToTire(row as Record<string, unknown>);
}

/**
 * Aplica desgaste percentual a todos os pneus de um veículo após uma viagem.
 * Filtra pneus por dono_id = donoId e vehicle_id = vehicleId.
 */
export async function remoteApplyTripWear(donoId: string, vehicleId: string, lifeDeltaPercent: number): Promise<void> {
  if (!Number.isFinite(lifeDeltaPercent) || lifeDeltaPercent <= 0) return;
  const supabase = getSupabase();
  const { data: tires, error: fetchErr } = await supabase
    .from("tires")
    .select("id, health")
    .eq("dono_id", donoId)
    .eq("vehicle_id", vehicleId);
  if (fetchErr) throw fetchErr;
  for (const t of tires ?? []) {
    const id = String((t as Record<string, unknown>).id);
    const health = Number((t as Record<string, unknown>).health);
    const next = Math.round(Math.max(0, health - lifeDeltaPercent) * 100) / 100;
    const { error } = await supabase
      .from("tires")
      .update({ health: next })
      .eq("id", id)
      .eq("dono_id", donoId);
    if (error) throw error;
  }
}

/**
 * Cadastra um pneu avulso manualmente.
 * dono_id = donoId (chefe ou autônomo).
 */
export async function remoteAddManualTire(
  donoId: string,
  tire: Omit<FleetTire, "id" | "vehicleId"> & { vehicleId: string | null }
): Promise<FleetTire> {
  const supabase = getSupabase();
  if (!tire.vehicleId) {
    throw new Error("É necessário um veículo para cadastrar o pneu na nuvem.");
  }
  const { data: row, error } = await supabase
    .from("tires")
    .insert({
      dono_id: donoId,
      user_id: donoId,   // deprecado; mesmo valor durante a transição
      vehicle_id: tire.vehicleId,
      model: tire.model,
      brand: tire.brand,
      axis: tire.axis,
      health: tire.health,
      vehicle_type: tire.vehicleType,
      vehicle_label: tire.vehicle,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToTire(row as Record<string, unknown>);
}
