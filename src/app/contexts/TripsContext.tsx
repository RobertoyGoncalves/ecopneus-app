import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Trip } from "../domain/trip";
import * as tripsRemote from "../lib/tripsRemote";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

interface TripsContextType {
  trips: Trip[];
  tripsLoading: boolean;
  addTrip: (trip: Omit<Trip, "id"> & { id?: string; vehicleId?: string }) => Promise<void>;
  removeTrip: (tripId: string) => Promise<void>;
  /**
   * Quando preenchido (apenas para chefe), o Dashboard deve filtrar
   * as viagens para exibir apenas as operadas por esse funcionário.
   * null = visão agregada de toda a empresa (padrão).
   */
  filtroFuncionarioId: string | null;
  setFiltroFuncionarioId: (id: string | null) => void;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export function TripsProvider({ children }: { children: ReactNode }) {
  const { supabaseUserId, authReady, papel, empresaId } = useAuth();
  const useRemote = isSupabaseConfigured() && !!supabaseUserId;

  /**
   * donoId: o ID cujos dados devem ser buscados no banco.
   *
   * - funcionário → empresaId (chefe ao qual está vinculado)
   * - autônomo/chefe → supabaseUserId (dados próprios)
   * - não autenticado → null (bloqueia chamadas remotas)
   */
  const donoId = useMemo(() => {
    if (!supabaseUserId) return null;
    if (papel === "funcionario" && empresaId) return empresaId;
    return supabaseUserId;
  }, [supabaseUserId, papel, empresaId]);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  /** Filtro de funcionário específico para o chefe visualizar no dashboard.
   *  null = visão agregada de toda a empresa (padrão). */
  const [filtroFuncionarioId, setFiltroFuncionarioId] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;

    if (!useRemote || !donoId) {
      setTrips([]);
      setTripsLoading(false);
      return;
    }

    let cancelled = false;
    setTripsLoading(true);

    void tripsRemote
      .fetchTrips(donoId)
      .then((rows) => {
        if (!cancelled) setTrips(rows);
      })
      .catch((err) => {
        console.error("fetchTrips:", err);
        if (!cancelled) setTrips([]);
      })
      .finally(() => {
        if (!cancelled) setTripsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [useRemote, authReady, donoId]);

  useEffect(() => {
    if (!authReady) return;
    if (isSupabaseConfigured() && !supabaseUserId) {
      setFiltroFuncionarioId(null);
    }
  }, [authReady, supabaseUserId]);

  const addTrip = useCallback(
    async (trip: Omit<Trip, "id"> & { id?: string; vehicleId?: string }) => {
      const { vehicleId, ...tripFields } = trip;

      if (useRemote && donoId) {
        const inserted = await tripsRemote.insertTrip(donoId, tripFields, vehicleId ?? null);
        setTrips((prev) => [inserted, ...prev]);
        return;
      }

      const id =
        trip.id && String(trip.id).length > 0
          ? String(trip.id)
          : typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now());
      setTrips((prev) => [{ ...tripFields, id }, ...prev]);
    },
    [useRemote, donoId]
  );

  const removeTrip = useCallback(
    async (tripId: string) => {
      if (useRemote && donoId) {
        await tripsRemote.deleteTrip(donoId, tripId);
      }
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    },
    [useRemote, donoId]
  );

  return (
    <TripsContext.Provider value={{ trips, tripsLoading, addTrip, removeTrip, filtroFuncionarioId, setFiltroFuncionarioId }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips(): TripsContextType {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTrips deve ser usado dentro de TripsProvider");
  return ctx;
}
