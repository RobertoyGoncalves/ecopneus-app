import type { TireQualityTier } from "./wearModel";

export interface FleetVehicle {
  id: string;
  type: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  tireCount: number;
  tireManufacturer: string;
  tireModel: string;
  tireQualityTier: TireQualityTier;
}

export interface FleetTire {
  id: string;
  model: string;
  brand: string;
  axis: string;
  health: number;
  vehicleType: string;
  vehicle: string;
  vehicleId: string;
}
