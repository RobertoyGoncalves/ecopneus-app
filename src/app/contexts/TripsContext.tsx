import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export function TripsProvider({ children }: { children: ReactNode }) {
  const { supabaseUserId, authReady } = useAuth();
  const useRemote = isSupabaseConfigured() && !!supabaseUserId;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  useEffect(() => {
    if (!authReady) return;

    if (!useRemote || !supabaseUserId) {
      setTrips([]);
      setTripsLoading(false);
      return;
    }

    let cancelled = false;
    setTripsLoading(true);

    void tripsRemote
      .fetchTrips(supabaseUserId)
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
  }, [useRemote, authReady, supabaseUserId]);

  const addTrip = useCallback(
    async (trip: Omit<Trip, "id"> & { id?: string; vehicleId?: string }) => {
      const { vehicleId, ...tripFields } = trip;

      if (useRemote && supabaseUserId) {
        const inserted = await tripsRemote.insertTrip(supabaseUserId, tripFields, vehicleId ?? null);
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
    [useRemote, supabaseUserId]
  );

  const removeTrip = useCallback(
    async (tripId: string) => {
      if (useRemote && supabaseUserId) {
        await tripsRemote.deleteTrip(supabaseUserId, tripId);
      }
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    },
    [useRemote, supabaseUserId]
  );

  return (
    <TripsContext.Provider value={{ trips, tripsLoading, addTrip, removeTrip }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips(): TripsContextType {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTrips deve ser usado dentro de TripsProvider");
  return ctx;
}
