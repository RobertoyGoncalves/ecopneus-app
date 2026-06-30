import type { DayPeriod } from "../domain/wearModel";

export type MapaRotaResultado = {
  distanciaKm: number;
  velocidadeMediaKmh: number;
  periodoValor: DayPeriod;
  temperaturaC: number;
  duracaoMin: number;
  origem: string;
  destino: string;
  latOrigem: number;
  lonOrigem: number;
  latDestino: number;
  lonDestino: number;
};

export type MapaRotaProps = {
  vehicleType: string;
  onRotaCalculada: (resultado: MapaRotaResultado) => void;
};

export type MapboxLibs = {
  mapboxgl: typeof import("mapbox-gl").default;
  MapboxGeocoder: typeof import("@mapbox/mapbox-gl-geocoder").default;
};
