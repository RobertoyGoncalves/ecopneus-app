import type { Trip } from "../domain/trip";
import type { DayPeriod, RoadCondition } from "../domain/wearModel";
import { wearSeverityLevel } from "../domain/wearModel";
import { getSupabase } from "./supabaseClient";

function rowToTrip(row: Record<string, unknown>): Trip {
  const peso = Number(row.peso_carga ?? 0);
  const tipoCarga = String(row.tipo_carga ?? "");
  const estimatedWear = Number(row.vida_consumida_percent ?? 0);
  const createdAt = row.created_at != null ? String(row.created_at) : undefined;
  const createdDate =
    createdAt != null && !Number.isNaN(new Date(createdAt).getTime())
      ? new Date(createdAt).toLocaleDateString("pt-BR")
      : "";

  const roadCondition = row.condicao_estrada as RoadCondition | null;
  const dayPeriod = row.periodo_dia as DayPeriod | null;

  return {
    id: String(row.id),
    vehicle: String(row.vehicle_label ?? ""),
    vehicleType: String(row.vehicle_type ?? ""),
    distance: String(row.distancia_km ?? ""),
    weight: String(peso),
    value: String(row.valor_carga ?? "0"),
    type: tipoCarga || "Sem carga",
    hasCargo: peso > 0 && tipoCarga !== "Sem carga",
    date: createdDate,
    estimatedWear: Number.isFinite(estimatedWear) ? estimatedWear : 0,
    wearLevel: wearSeverityLevel(Number.isFinite(estimatedWear) ? estimatedWear : 0),
    tireCount: Math.max(0, Math.round(Number(row.pneus_afetados) || 0)),
    avgSpeedKmh:
      row.velocidade_media != null && Number.isFinite(Number(row.velocidade_media))
        ? Number(row.velocidade_media)
        : undefined,
    roadCondition: roadCondition ?? undefined,
    dayPeriod: dayPeriod ?? undefined,
    recordedAtIso: createdAt,
    origem: String(row.origem ?? ""),
    destino: String(row.destino ?? ""),
    latOrigem:
      row.lat_origem != null && Number.isFinite(Number(row.lat_origem))
        ? Number(row.lat_origem)
        : undefined,
    lonOrigem:
      row.lon_origem != null && Number.isFinite(Number(row.lon_origem))
        ? Number(row.lon_origem)
        : undefined,
    latDestino:
      row.lat_destino != null && Number.isFinite(Number(row.lat_destino))
        ? Number(row.lat_destino)
        : undefined,
    lonDestino:
      row.lon_destino != null && Number.isFinite(Number(row.lon_destino))
        ? Number(row.lon_destino)
        : undefined,
    vehicleId: row.vehicle_id != null ? String(row.vehicle_id) : undefined,
  };
}

function tripToInsert(
  userId: string,
  trip: Omit<Trip, "id">,
  vehicleId?: string | null
): Record<string, unknown> {
  return {
    user_id: userId,
    vehicle_id: vehicleId ?? trip.vehicleId ?? null,
    vehicle_label: trip.vehicle,
    vehicle_type: trip.vehicleType,
    origem: trip.origem || null,
    destino: trip.destino || null,
    lat_origem: trip.latOrigem ?? null,
    lon_origem: trip.lonOrigem ?? null,
    lat_destino: trip.latDestino ?? null,
    lon_destino: trip.lonDestino ?? null,
    distancia_km: Number(trip.distance) || null,
    velocidade_media: trip.avgSpeedKmh ?? null,
    condicao_estrada: trip.roadCondition ?? null,
    periodo_dia: trip.dayPeriod ?? null,
    peso_carga: Number(trip.weight) || 0,
    valor_carga: Number(trip.value) || 0,
    tipo_carga: trip.type,
    vida_consumida_percent: trip.estimatedWear,
    pneus_afetados: trip.tireCount,
  };
}

export async function fetchTrips(userId: string): Promise<Trip[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToTrip(r as Record<string, unknown>));
}

export async function insertTrip(
  userId: string,
  trip: Omit<Trip, "id">,
  vehicleId?: string | null
): Promise<Trip> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("trips")
    .insert(tripToInsert(userId, trip, vehicleId))
    .select()
    .single();
  if (error) throw error;
  return rowToTrip(data as Record<string, unknown>);
}

export async function deleteTrip(userId: string, tripId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", userId);
  if (error) throw error;
}
