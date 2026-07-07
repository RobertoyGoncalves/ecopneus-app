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
    operadorId: row.operador_id != null ? String(row.operador_id) : undefined,
  };
}

/**
 * Monta o payload de inserção de uma viagem.
 *
 * donoId   → dono_id no banco (chefe ou autônomo; para funcionário = empresaId)
 * operatorId → operador_id no banco (sempre auth.uid() de quem está registrando)
 *
 * user_id mantido com o mesmo valor que dono_id durante a transição
 * (coluna deprecada ainda é NOT NULL no schema).
 */
function tripToInsert(
  donoId: string,
  operatorId: string,
  trip: Omit<Trip, "id">,
  vehicleId?: string | null
): Record<string, unknown> {
  return {
    dono_id: donoId,
    user_id: donoId,       // deprecado; mesmo valor durante a transição
    operador_id: operatorId,
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

/**
 * Busca todas as viagens cujo dono_id = donoId, ordenadas da mais recente.
 *
 * donoId resolve para:
 *  - autônomo   → supabaseUserId
 *  - chefe      → supabaseUserId
 *  - funcionário → empresaId (chefe ao qual está vinculado)
 */
export async function fetchTrips(donoId: string): Promise<Trip[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("dono_id", donoId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToTrip(r as Record<string, unknown>));
}

/**
 * Registra uma nova viagem.
 *
 * donoId     → passado pelo caller (supabaseUserId para autônomo/chefe;
 *               empresaId para funcionário — quando o contexto for atualizado).
 * operatorId → sempre auth.uid() da sessão ativa. Obtido internamente para
 *               garantir que o campo não pode ser forjado pelo caller.
 */
export async function insertTrip(
  donoId: string,
  trip: Omit<Trip, "id">,
  vehicleId?: string | null
): Promise<Trip> {
  const supabase = getSupabase();

  // operador_id deve ser sempre quem está autenticado no momento do registro,
  // independente do papel. Fallback para donoId apenas como segurança defensiva
  // (nunca deve ocorrer em condições normais).
  const { data: { session } } = await supabase.auth.getSession();
  const operatorId = session?.user?.id ?? donoId;

  const { data, error } = await supabase
    .from("trips")
    .insert(tripToInsert(donoId, operatorId, trip, vehicleId))
    .select()
    .single();
  if (error) throw error;
  return rowToTrip(data as Record<string, unknown>);
}

/**
 * Remove uma viagem.
 * Filtra por dono_id para garantir que só o dono (ou quem tem permissão via RLS) pode deletar.
 */
export async function deleteTrip(donoId: string, tripId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("dono_id", donoId);
  if (error) throw error;
}
