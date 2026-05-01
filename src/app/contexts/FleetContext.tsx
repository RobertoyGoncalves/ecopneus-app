import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { TireQualityTier } from "../domain/wearModel";

const STORAGE_KEY = "ecopneu_fleet_v1";

export interface FleetVehicle {
  id: number;
  type: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  tireCount: number;
  tireManufacturer: string;
  tireModel: string;
  /** Classe empírica de qualidade dos pneus (afeta modelo de desgaste). */
  tireQualityTier: TireQualityTier;
}

export interface FleetTire {
  id: number;
  model: string;
  brand: string;
  axis: string;
  health: number;
  vehicleType: string;
  vehicle: string;
  vehicleId: number;
}

function formatVehicleLabel(v: FleetVehicle): string {
  return `${v.brand} ${v.model} • ${v.plate}`;
}

function axisForIndex(index: number, total: number): string {
  if (total <= 1) return "Único";
  const half = Math.ceil(total / 2);
  return index < half ? "Dianteiro" : "Traseiro";
}

function normalizeFleetFromStorage(data: unknown): { vehicles: FleetVehicle[]; tires: FleetTire[] } | null {
  const d = data as { vehicles?: unknown[]; tires?: unknown[] } | null;
  if (!d || !Array.isArray(d.vehicles) || !Array.isArray(d.tires)) return null;
  const tierOk = (t: unknown): t is TireQualityTier =>
    t === "economico" || t === "intermediario" || t === "premium";

  const vehicles = (d.vehicles as Partial<FleetVehicle>[]).map((v) => ({
    id: Number(v.id),
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
  const tires = (d.tires as Partial<FleetTire>[]).map((t, idx) => ({
    id: Number(t.id) || Date.now() + idx,
    model: String(t.model ?? ""),
    brand: String(t.brand ?? ""),
    axis: String(t.axis ?? "Dianteiro"),
    health: Math.min(100, Math.max(0, Number(t.health))),
    vehicleType: String(t.vehicleType ?? ""),
    vehicle: String(t.vehicle ?? ""),
    vehicleId: typeof t.vehicleId === "number" ? t.vehicleId : -1,
  }));
  return { vehicles, tires };
}

function buildInitialSeed(): { vehicles: FleetVehicle[]; tires: FleetTire[] } {
  const vehicles: FleetVehicle[] = [
    {
      id: 1,
      type: "Caminhão",
      brand: "Volvo",
      model: "FH 540",
      year: "2022",
      plate: "ABC-1234",
      tireCount: 10,
      tireManufacturer: "Michelin",
      tireModel: "XZY3",
      tireQualityTier: "premium",
    },
    {
      id: 2,
      type: "Carro",
      brand: "Toyota",
      model: "Corolla",
      year: "2023",
      plate: "XYZ-5678",
      tireCount: 4,
      tireManufacturer: "Pirelli",
      tireModel: "Cinturato",
      tireQualityTier: "intermediario",
    },
    {
      id: 3,
      type: "Moto",
      brand: "Honda",
      model: "CG 160",
      year: "2021",
      plate: "DEF-9012",
      tireCount: 2,
      tireManufacturer: "Pirelli",
      tireModel: "Super City",
      tireQualityTier: "economico",
    },
  ];

  const tires: FleetTire[] = [];
  vehicles.forEach((v) => {
    for (let i = 0; i < v.tireCount; i++) {
      tires.push({
        id: v.id * 1000 + i,
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

interface FleetContextType {
  vehicles: FleetVehicle[];
  tires: FleetTire[];
  addVehicle: (
    draft: Omit<FleetVehicle, "id">
  ) => void;
  removeVehicle: (vehicleId: number) => void;
  addManualTire: (
    tire: Omit<FleetTire, "id" | "vehicleId"> & {
      vehicleId: number | null;
    }
  ) => void;
  /** Desconta a mesma % de vida útil em todos os pneus ligados ao veículo (regra A). */
  applyTripWearToVehicle: (vehicleId: number, lifeDeltaPercent: number) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export function FleetProvider({ children }: { children: ReactNode }) {
  const [{ vehicles, tires }, setFleet] = useState<{ vehicles: FleetVehicle[]; tires: FleetTire[] }>(
    () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const parsed = normalizeFleetFromStorage(JSON.parse(raw));
            if (parsed) {
              return parsed;
            }
          } catch {
            /* usar seed */
          }
        }
      } catch {
        /* usar seed */
      }
      return buildInitialSeed();
    }
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicles, tires }));
  }, [vehicles, tires]);

  const addVehicle = useCallback((draft: Omit<FleetVehicle, "id">) => {
    const id = Date.now();
    const newVehicle: FleetVehicle = { ...draft, id };
    const label = formatVehicleLabel(newVehicle);
    const newTires: FleetTire[] = [];
    for (let i = 0; i < newVehicle.tireCount; i++) {
      newTires.push({
        id: id * 1000 + i,
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
  }, []);

  const removeVehicle = useCallback((vehicleId: number) => {
    setFleet((prev) => ({
      vehicles: prev.vehicles.filter((v) => v.id !== vehicleId),
      tires: prev.tires.filter((t) => t.vehicleId !== vehicleId),
    }));
  }, []);

  const applyTripWearToVehicle = useCallback((vehicleId: number, lifeDeltaPercent: number) => {
    if (!Number.isFinite(lifeDeltaPercent) || lifeDeltaPercent <= 0) return;
    setFleet((prev) => ({
      ...prev,
      tires: prev.tires.map((t) => {
        if (t.vehicleId !== vehicleId) return t;
        const next = Math.round(Math.max(0, t.health - lifeDeltaPercent) * 10) / 10;
        return { ...t, health: next };
      }),
    }));
  }, []);

  const addManualTire = useCallback(
    (
      tire: Omit<FleetTire, "id" | "vehicleId"> & {
        vehicleId: number | null;
      }
    ) => {
      const newId = Date.now();
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
          vehicleId: vehicle?.id ?? -1,
        };
        return { ...prev, tires: [full, ...prev.tires] };
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      vehicles,
      tires,
      addVehicle,
      removeVehicle,
      addManualTire,
      applyTripWearToVehicle,
    }),
    [vehicles, tires, addVehicle, removeVehicle, addManualTire, applyTripWearToVehicle]
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet deve ser usado dentro de FleetProvider");
  return ctx;
}

export { formatVehicleLabel };
