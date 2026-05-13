import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Trip } from "../domain/trip";
import { useAuth } from "./AuthContext";

const STORAGE_PREFIX = "ecopneu_trips_v1";

function storageKey(userKey: string): string {
  return `${STORAGE_PREFIX}:${userKey}`;
}

function wearLevelOk(x: unknown): x is Trip["wearLevel"] {
  return x === "Baixo" || x === "Médio" || x === "Alto";
}

function normalizeTrip(raw: unknown): Trip | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = o.id != null ? String(o.id) : "";
  if (!id) return null;
  const vehicle = String(o.vehicle ?? "");
  const vehicleType = String(o.vehicleType ?? "");
  const distance = String(o.distance ?? "");
  const weight = String(o.weight ?? "");
  const value = String(o.value ?? "");
  const type = String(o.type ?? "");
  const hasCargo = Boolean(o.hasCargo);
  const date = String(o.date ?? "");
  const estimatedWear = Number(o.estimatedWear);
  const wearLevel = wearLevelOk(o.wearLevel) ? o.wearLevel : "Baixo";
  const tireCount = Math.max(0, Math.round(Number(o.tireCount) || 0));
  const avgSpeedKmh =
    o.avgSpeedKmh != null && Number.isFinite(Number(o.avgSpeedKmh))
      ? Number(o.avgSpeedKmh)
      : undefined;
  const roadCondition = o.roadCondition as Trip["roadCondition"];
  const dayPeriod = o.dayPeriod as Trip["dayPeriod"];
  const recordedAtIso =
    typeof o.recordedAtIso === "string" && o.recordedAtIso.length > 0 ? o.recordedAtIso : undefined;

  return {
    id,
    vehicle,
    vehicleType,
    distance,
    weight,
    value,
    type,
    hasCargo,
    date,
    estimatedWear: Number.isFinite(estimatedWear) ? estimatedWear : 0,
    wearLevel,
    tireCount,
    avgSpeedKmh,
    roadCondition,
    dayPeriod,
    recordedAtIso,
  };
}

function loadTrips(key: string): Trip[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeTrip).filter((t): t is Trip => t !== null);
  } catch {
    return [];
  }
}

interface TripsContextType {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, "id"> & { id?: string }) => void;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export function TripsProvider({ children }: { children: ReactNode }) {
  const { supabaseUserId, user, authReady } = useAuth();
  const userKey = supabaseUserId ?? user?.email ?? "guest";

  const [trips, setTrips] = useState<Trip[]>([]);
  const skipNextPersist = useRef(false);

  useEffect(() => {
    if (!authReady) return;
    skipNextPersist.current = true;
    setTrips(loadTrips(storageKey(userKey)));
  }, [authReady, userKey]);

  useEffect(() => {
    if (!authReady) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey(userKey), JSON.stringify(trips));
    } catch {
      /* ignore */
    }
  }, [trips, userKey, authReady]);

  const addTrip = useCallback((trip: Omit<Trip, "id"> & { id?: string }) => {
    const id =
      trip.id && String(trip.id).length > 0
        ? String(trip.id)
        : typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now());
    setTrips((prev) => [{ ...trip, id }, ...prev]);
  }, []);

  return (
    <TripsContext.Provider value={{ trips, addTrip }}>{children}</TripsContext.Provider>
  );
}

export function useTrips(): TripsContextType {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTrips deve ser usado dentro de TripsProvider");
  return ctx;
}
