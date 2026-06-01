const ORS_DIRECTIONS = "https://api.openrouteservice.org/v2/directions";
const ORS_GEOCODE = "https://api.openrouteservice.org/geocode/search";
import { velocidadeRealista } from "../utils/velocidadeUtils";

export type Coordenada = { lat: number; lon: number };

export type ResultadoRota = {
  distanciaKm: number;
  duracaoMin: number;
  velocidadeMediaKmh: number;
};

export type VehicleRouteProfile = "driving-car" | "driving-hgv";

export function routeProfileForVehicleType(vehicleType: string): VehicleRouteProfile {
  return vehicleType === "Caminhão" ? "driving-hgv" : "driving-car";
}

function getOrsApiKey(): string {
  const key = import.meta.env.VITE_ORS_API_KEY;
  if (!key) throw new Error("Chave OpenRouteService não configurada (VITE_ORS_API_KEY).");
  return key;
}

export async function geocodificarEndereco(
  endereco: string,
  focus?: Coordenada
): Promise<Coordenada> {
  const apiKey = getOrsApiKey();
  const query = encodeURIComponent(endereco.trim());
  if (!query) throw new Error("Informe um destino.");

  let url =
    `${ORS_GEOCODE}?api_key=${apiKey}&text=${query}&size=1&boundary.country=BRA`;
  if (focus) {
    url += `&focus.point.lat=${focus.lat}&focus.point.lon=${focus.lon}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao buscar endereço");

  const data = (await res.json()) as {
    features?: Array<{ geometry?: { coordinates?: [number, number] } }>;
  };

  const coords = data.features?.[0]?.geometry?.coordinates;
  if (!coords) {
    throw new Error("Endereço não encontrado — tente ser mais específico (cidade, estado).");
  }

  const [lon, lat] = coords;
  return { lat, lon };
}

export async function buscarSugestoesDestino(
  query: string,
  focus?: Coordenada
): Promise<string[]> {
  const apiKey = getOrsApiKey();
  const term = query.trim();
  if (term.length < 2) return [];

  let url =
    `${ORS_GEOCODE}?api_key=${apiKey}&text=${encodeURIComponent(term)}` +
    `&size=6&boundary.country=BRA`;
  if (focus) {
    url += `&focus.point.lat=${focus.lat}&focus.point.lon=${focus.lon}`;
  }

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = (await res.json()) as {
    features?: Array<{
      properties?: {
        label?: string;
        name?: string;
        region?: string;
      };
    }>;
  };

  const labels = (data.features ?? [])
    .map((f) => {
      const label = f.properties?.label?.trim();
      if (label) return label;
      const name = f.properties?.name?.trim();
      const region = f.properties?.region?.trim();
      return [name, region].filter(Boolean).join(", ");
    })
    .filter((v): v is string => Boolean(v));

  return Array.from(new Set(labels));
}

export async function calcularRota(
  origem: Coordenada,
  destino: Coordenada,
  vehicleType: string,
  profile: VehicleRouteProfile = "driving-car"
): Promise<ResultadoRota> {
  const apiKey = getOrsApiKey();

  const res = await fetch(`${ORS_DIRECTIONS}/${profile}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      coordinates: [
        [origem.lon, origem.lat],
        [destino.lon, destino.lat],
      ],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Limite diário da API de rotas atingido.");
    throw new Error("Falha ao calcular rota");
  }

  const data = (await res.json()) as {
    routes?: Array<{ summary?: { distance?: number; duration?: number } }>;
  };

  const segmento = data.routes?.[0]?.summary;
  if (!segmento?.distance || !segmento?.duration) {
    throw new Error("Rota não encontrada entre origem e destino.");
  }

  const distanciaKm = segmento.distance / 1000;
  const duracaoMin = segmento.duration / 60;
  const velocidadeORS = duracaoMin > 0 ? distanciaKm / (duracaoMin / 60) : 0;
  const velocidadeMediaKmh = velocidadeRealista(velocidadeORS, vehicleType, distanciaKm);

  return {
    distanciaKm: Math.round(distanciaKm),
    duracaoMin: Math.round(duracaoMin),
    velocidadeMediaKmh: Math.round(velocidadeMediaKmh),
  };
}
