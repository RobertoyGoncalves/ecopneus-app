import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FleetTire, FleetVehicle } from "../domain/fleet";
import type { TireQualityTier } from "../domain/wearModel";
import * as fleetRemote from "../lib/fleetRemote";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

export type { FleetTire, FleetVehicle } from "../domain/fleet";

const STORAGE_KEY = "ecopneu_fleet_v2";
const LEGACY_STORAGE_KEY = "ecopneu_fleet_v1";

function formatVehicleLabel(v: FleetVehicle): string {
  return `${v.brand} ${v.model} • ${v.plate}`;
}

function axisForIndex(index: number, total: number): string {
  if (total <= 1) return "Único";
  const half = Math.ceil(total / 2);
  return index < half ? "Dianteiro" : "Traseiro";
}

function tierOk(t: unknown): t is TireQualityTier {
  return t === "economico" || t === "intermediario" || t === "premium";
}

function isLegacyNumericId(id: unknown): boolean {
  if (typeof id === "number" && Number.isFinite(id)) return true;
  if (typeof id === "string" && /^\d+$/.test(id)) return true;
  return false;
}

function migrateLegacyFleet(d: {
  vehicles: Partial<FleetVehicle & { id?: unknown }>[];
  tires: Partial<FleetTire & { id?: unknown; vehicleId?: unknown }>[];
}): { vehicles: FleetVehicle[]; tires: FleetTire[] } {
  const idMap = new Map<string, string>();
  const vehicles: FleetVehicle[] = (d.vehicles ?? []).map((v) => {
    const newId = crypto.randomUUID();
    if (v.id != null) idMap.set(String(v.id), newId);
    return {
      id: newId,
      type: String(v.type ?? ""),
      brand: String(v.brand ?? ""),
      model: String(v.model ?? ""),
      year: String(v.year ?? ""),
      plate: String(v.plate ?? ""),
      tireCount: Math.max(0, Number(v.tireCount)),
      tireManufacturer: String(v.tireManufacturer ?? "—"),
      tireModel: String(v.tireModel ?? "—"),
      tireQualityTier: tierOk(v.tireQualityTier) ? v.tireQualityTier : "intermediario",
    };
  });

  const tires: FleetTire[] = (d.tires ?? []).map((t) => {
    const oldVid = t.vehicleId != null ? idMap.get(String(t.vehicleId)) : undefined;
    return {
      id: crypto.randomUUID(),
      model: String(t.model ?? ""),
      brand: String(t.brand ?? ""),
      axis: String(t.axis ?? "Dianteiro"),
      health: Math.min(100, Math.max(0, Number(t.health))),
      vehicleType: String(t.vehicleType ?? ""),
      vehicle: String(t.vehicle ?? ""),
      vehicleId: oldVid ?? "",
    };
  });

  return { vehicles, tires: tires.filter((t) => t.vehicleId !== "") };
}

function normalizeFleetFromStorage(data: unknown): { vehicles: FleetVehicle[]; tires: FleetTire[] } | null {
  const d = data as { vehicles?: unknown[]; tires?: unknown[] } | null;
  if (!d || !Array.isArray(d.vehicles) || !Array.isArray(d.tires)) return null;

  const firstV = d.vehicles[0] as { id?: unknown } | undefined;
  if (firstV && isLegacyNumericId(firstV.id)) {
    return migrateLegacyFleet({
      vehicles: d.vehicles as Partial<FleetVehicle & { id?: unknown }>[],
      tires: d.tires as Partial<FleetTire & { id?: unknown; vehicleId?: unknown }>[],
    });
  }

  const vehicles = (d.vehicles as Partial<FleetVehicle>[]).map((v) => ({
    id: String(v.id ?? ""),
    type: String(v.type ?? ""),
    brand: String(v.brand ?? ""),
    model: String(v.model ?? ""),
    year: String(v.year ?? ""),
    plate: String(v.plate ?? ""),
    tireCount: Math.max(0, Number(v.tireCount)),
    tireManufacturer: String(v.tireManufacturer ?? "—"),
    tireModel: String(v.tireModel ?? "—"),
    tireQualityTier: tierOk(v.tireQualityTier) ? v.tireQualityTier : "intermediario",
  }));

  const tires = (d.tires as Partial<FleetTire>[]).map((t) => ({
    id: String(t.id ?? "").length > 0 ? String(t.id) : crypto.randomUUID(),
    model: String(t.model ?? ""),
    brand: String(t.brand ?? ""),
    axis: String(t.axis ?? "Dianteiro"),
    health: Math.min(100, Math.max(0, Number(t.health))),
    vehicleType: String(t.vehicleType ?? ""),
    vehicle: String(t.vehicle ?? ""),
    vehicleId: String(t.vehicleId ?? ""),
  }));

  return { vehicles, tires };
}

function buildInitialSeed(): { vehicles: FleetVehicle[]; tires: FleetTire[] } {
  const v1: FleetVehicle = {
    id: crypto.randomUUID(),
    type: "Caminhão",
    brand: "Volvo",
    model: "FH 540",
    year: "2022",
    plate: "ABC-1234",
    tireCount: 10,
    tireManufacturer: "Michelin",
    tireModel: "XZY3",
    tireQualityTier: "premium",
  };
  const v2: FleetVehicle = {
    id: crypto.randomUUID(),
    type: "Carro",
    brand: "Toyota",
    model: "Corolla",
    year: "2023",
    plate: "XYZ-5678",
    tireCount: 4,
    tireManufacturer: "Pirelli",
    tireModel: "Cinturato",
    tireQualityTier: "intermediario",
  };
  const v3: FleetVehicle = {
    id: crypto.randomUUID(),
    type: "Moto",
    brand: "Honda",
    model: "CG 160",
    year: "2021",
    plate: "DEF-9012",
    tireCount: 2,
    tireManufacturer: "Pirelli",
    tireModel: "Super City",
    tireQualityTier: "economico",
  };

  const vehicles = [v1, v2, v3];
  const tires: FleetTire[] = [];
  vehicles.forEach((v) => {
    for (let i = 0; i < v.tireCount; i++) {
      tires.push({
        id: crypto.randomUUID(),
        model: v.tireModel,
        brand: v.tireManufacturer,
        axis: axisForIndex(i, v.tireCount),
        health: Math.min(96, 82 + (i % 5) * 3),
        vehicleType: v.type,
        vehicle: formatVehicleLabel(v),
        vehicleId: v.id,
      });
    }
  });

  return { vehicles, tires };
}

function loadLocalFleetFromDisk(): { vehicles: FleetVehicle[]; tires: FleetTire[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = normalizeFleetFromStorage(JSON.parse(raw));
        if (parsed) return parsed;
      } catch {
        /* seed */
      }
    }
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      try {
        const legacyParsed = JSON.parse(legacyRaw) as { vehicles?: unknown[]; tires?: unknown[] };
        if (legacyParsed.vehicles?.length) {
          const migrated = migrateLegacyFleet({
            vehicles: legacyParsed.vehicles as Partial<FleetVehicle & { id?: unknown }>[],
            tires: (legacyParsed.tires ?? []) as Partial<FleetTire & { id?: unknown; vehicleId?: unknown }>[],
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          return migrated;
        }
      } catch {
        /* seed */
      }
    }
  } catch {
    /* seed */
  }
  return buildInitialSeed();
}

function initialFleetState(): { vehicles: FleetVehicle[]; tires: FleetTire[] } {
  if (isSupabaseConfigured()) {
    return { vehicles: [], tires: [] };
  }
  return loadLocalFleetFromDisk();
}

interface FleetContextType {
  vehicles: FleetVehicle[];
  tires: FleetTire[];
  /** True enquanto carrega frota do Supabase após login. */
  fleetLoading: boolean;
  addVehicle: (draft: Omit<FleetVehicle, "id">) => Promise<void>;
  removeVehicle: (vehicleId: string) => Promise<void>;
  addManualTire: (
    tire: Omit<FleetTire, "id" | "vehicleId"> & {
      vehicleId: string | null;
    }
  ) => Promise<void>;
  applyTripWearToVehicle: (vehicleId: string, lifeDeltaPercent: number) => Promise<void>;
  removeTire: (tireId: string) => Promise<void>;
  updateTire: (
    tireId: string,
    patch: Partial<Pick<FleetTire, "model" | "brand" | "axis" | "health">>
  ) => Promise<void>;
  replaceTire: (oldTireId: string, draft: Omit<FleetTire, "id" | "vehicle">) => Promise<void>;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export function FleetProvider({ children }: { children: ReactNode }) {
  const { supabaseUserId, authReady } = useAuth();
  const useRemote = isSupabaseConfigured() && !!supabaseUserId;

  const [{ vehicles, tires }, setFleet] = useState(initialFleetState);
  const [fleetLoading, setFleetLoading] = useState(() => isSupabaseConfigured());

  useEffect(() => {
    if (!useRemote) {
      setFleetLoading(false);
      return;
    }
    if (!authReady || !supabaseUserId) {
      setFleet({ vehicles: [], tires: [] });
      setFleetLoading(false);
      return;
    }

    let cancelled = false;
    setFleetLoading(true);
    void fleetRemote
      .remoteFetchFleet(supabaseUserId)
      .then((data) => {
        if (!cancelled) setFleet(data);
      })
      .catch(() => {
        if (!cancelled) setFleet({ vehicles: [], tires: [] });
      })
      .finally(() => {
        if (!cancelled) setFleetLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [useRemote, authReady, supabaseUserId]);

  useEffect(() => {
    if (!authReady) return;
    if (isSupabaseConfigured() && !supabaseUserId) {
      setFleet({ vehicles: [], tires: [] });
    }
  }, [authReady, supabaseUserId]);

  useEffect(() => {
    if (useRemote) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicles, tires }));
    } catch {
      /* ignore */
    }
  }, [vehicles, tires, useRemote]);

  const addVehicle = useCallback(
    async (draft: Omit<FleetVehicle, "id">) => {
      if (useRemote && supabaseUserId) {
        const { vehicles: nv, tires: nt } = await fleetRemote.remoteAddVehicle(supabaseUserId, draft);
        setFleet((prev) => ({
          vehicles: [...nv, ...prev.vehicles],
          tires: [...nt, ...prev.tires],
        }));
        return;
      }
      const id = crypto.randomUUID();
      const newVehicle: FleetVehicle = { ...draft, id };
      const label = formatVehicleLabel(newVehicle);
      const newTires: FleetTire[] = [];
      for (let i = 0; i < newVehicle.tireCount; i++) {
        newTires.push({
          id: crypto.randomUUID(),
          model: newVehicle.tireModel,
          brand: newVehicle.tireManufacturer,
          axis: axisForIndex(i, newVehicle.tireCount),
          health: 100,
          vehicleType: newVehicle.type,
          vehicle: label,
          vehicleId: id,
        });
      }
      setFleet((prev) => ({
        vehicles: [newVehicle, ...prev.vehicles],
        tires: [...newTires, ...prev.tires],
      }));
    },
    [useRemote, supabaseUserId]
  );

  const removeVehicle = useCallback(
    async (vehicleId: string) => {
      if (useRemote && supabaseUserId) {
        await fleetRemote.remoteRemoveVehicle(supabaseUserId, vehicleId);
        setFleet((prev) => ({
          vehicles: prev.vehicles.filter((v) => v.id !== vehicleId),
          tires: prev.tires.filter((t) => t.vehicleId !== vehicleId),
        }));
        return;
      }
      setFleet((prev) => ({
        vehicles: prev.vehicles.filter((v) => v.id !== vehicleId),
        tires: prev.tires.filter((t) => t.vehicleId !== vehicleId),
      }));
    },
    [useRemote, supabaseUserId]
  );

  const removeTire = useCallback(
    async (tireId: string) => {
      if (useRemote && supabaseUserId) {
        await fleetRemote.remoteRemoveTire(supabaseUserId, tireId);
        setFleet((prev) => ({
          ...prev,
          tires: prev.tires.filter((t) => t.id !== tireId),
        }));
        return;
      }
      setFleet((prev) => ({
        ...prev,
        tires: prev.tires.filter((t) => t.id !== tireId),
      }));
    },
    [useRemote, supabaseUserId]
  );

  const updateTire = useCallback(
    async (
      tireId: string,
      patch: Partial<Pick<FleetTire, "model" | "brand" | "axis" | "health">>
    ) => {
      if (useRemote && supabaseUserId) {
        await fleetRemote.remoteUpdateTire(supabaseUserId, tireId, patch);
        setFleet((prev) => ({
          ...prev,
          tires: prev.tires.map((t) => {
            if (t.id !== tireId) return t;
            let health = t.health;
            if (patch.health !== undefined) {
              health = Math.min(100, Math.max(0, Number(patch.health)));
            }
            return { ...t, ...patch, health };
          }),
        }));
        return;
      }
      setFleet((prev) => ({
        ...prev,
        tires: prev.tires.map((t) => {
          if (t.id !== tireId) return t;
          let health = t.health;
          if (patch.health !== undefined) {
            health = Math.min(100, Math.max(0, Number(patch.health)));
          }
          return { ...t, ...patch, health };
        }),
      }));
    },
    [useRemote, supabaseUserId]
  );

  const replaceTire = useCallback(
    async (oldTireId: string, draft: Omit<FleetTire, "id" | "vehicle">) => {
      if (useRemote && supabaseUserId) {
        const vehicle = vehicles.find((v) => v.id === draft.vehicleId);
        const label = vehicle ? formatVehicleLabel(vehicle) : "";
        const newTire = await fleetRemote.remoteReplaceTire(
          supabaseUserId,
          oldTireId,
          draft,
          label
        );
        setFleet((p) => ({
          ...p,
          tires: [newTire, ...p.tires.filter((t) => t.id !== oldTireId)],
        }));
        return;
      }
      setFleet((prev) => {
        const vehicle = prev.vehicles.find((v) => v.id === draft.vehicleId);
        const label = vehicle ? formatVehicleLabel(vehicle) : "";
        const newTire: FleetTire = {
          ...draft,
          id: crypto.randomUUID(),
          vehicle: label,
          vehicleType: vehicle?.type ?? draft.vehicleType,
        };
        return {
          ...prev,
          tires: [newTire, ...prev.tires.filter((t) => t.id !== oldTireId)],
        };
      });
    },
    [useRemote, supabaseUserId, vehicles]
  );

  const applyTripWearToVehicle = useCallback(
    async (vehicleId: string, lifeDeltaPercent: number) => {
      if (useRemote && supabaseUserId) {
        await fleetRemote.remoteApplyTripWear(supabaseUserId, vehicleId, lifeDeltaPercent);
        setFleet((prev) => ({
          ...prev,
          tires: prev.tires.map((t) => {
            if (t.vehicleId !== vehicleId) return t;
            const next =
              Math.round(Math.max(0, t.health - lifeDeltaPercent) * 10) / 10;
            return { ...t, health: next };
          }),
        }));
        return;
      }
      if (!Number.isFinite(lifeDeltaPercent) || lifeDeltaPercent <= 0) return;
      setFleet((prev) => ({
        ...prev,
        tires: prev.tires.map((t) => {
          if (t.vehicleId !== vehicleId) return t;
          const next =
            Math.round(Math.max(0, t.health - lifeDeltaPercent) * 10) / 10;
          return { ...t, health: next };
        }),
      }));
    },
    [useRemote, supabaseUserId]
  );

  const addManualTire = useCallback(
    async (
      tire: Omit<FleetTire, "id" | "vehicleId"> & {
        vehicleId: string | null;
      }
    ) => {
      if (useRemote && supabaseUserId) {
        const full = await fleetRemote.remoteAddManualTire(supabaseUserId, tire);
        setFleet((prev) => ({ ...prev, tires: [full, ...prev.tires] }));
        return;
      }
      const newId = crypto.randomUUID();
      setFleet((prev) => {
        const vehicle =
          tire.vehicleId !== null ? prev.vehicles.find((v) => v.id === tire.vehicleId) : undefined;
        const full: FleetTire = {
          id: newId,
          model: tire.model,
          brand: tire.brand,
          axis: tire.axis,
          health: tire.health,
          vehicleType: vehicle?.type ?? tire.vehicleType,
          vehicle: vehicle ? formatVehicleLabel(vehicle) : tire.vehicle,
          vehicleId: vehicle?.id ?? "",
        };
        return { ...prev, tires: [full, ...prev.tires] };
      });
    },
    [useRemote, supabaseUserId]
  );

  const value = useMemo(
    () => ({
      vehicles,
      tires,
      fleetLoading,
      addVehicle,
      removeVehicle,
      addManualTire,
      applyTripWearToVehicle,
      removeTire,
      updateTire,
      replaceTire,
    }),
    [
      vehicles,
      tires,
      fleetLoading,
      addVehicle,
      removeVehicle,
      addManualTire,
      applyTripWearToVehicle,
      removeTire,
      updateTire,
      replaceTire,
    ]
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet deve ser usado dentro de FleetProvider");
  return ctx;
}

export { formatVehicleLabel };
