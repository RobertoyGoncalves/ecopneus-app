import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpDown, Loader2, MapPin } from "lucide-react";
import { Button } from "./Button";
import type { Coordenada } from "@/types/geo";
import { buscarTemperaturaAtual } from "@/services/weatherService";
import { detectarPeriodo } from "../utils/periodoUtils";
import { temperatureForPeriod } from "../domain/wearModel";
import { velocidadeRealista } from "@/utils/velocidadeUtils";
import type { MapaRotaProps, MapboxLibs } from "./mapaRotaTypes";

const BRASIL_CENTER: [number, number] = [-51.9253, -14.235];
const DEFAULT_ZOOM = 4;
const GPS_ZOOM = 13;
const ROUTE_LAYER_ID = "rota-layer";
const ROUTE_SOURCE_ID = "rota-source";
const DEBOUNCE_MS = 300;
const PLACES_BASE = "https://places.googleapis.com/v1";

type MapPoint = {
  coord: Coordenada;
  label: string;
};

type MapboxRoute = {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
};

type DirectionsResponse = {
  routes?: MapboxRoute[];
  message?: string;
};

type MapInstance = InstanceType<MapboxLibs["mapboxgl"]["Map"]>;
type MarkerInstance = InstanceType<MapboxLibs["mapboxgl"]["Marker"]>;

// ── Google Places API (New) types ─────────────────────────────────────────────

type PlaceSuggestion = {
  placePrediction: {
    placeId: string;
    text: { text: string };
    structuredFormat?: {
      mainText: { text: string };
      secondaryText?: { text: string };
    };
  };
};

type AutocompleteResponse = { suggestions?: PlaceSuggestion[] };

type PlaceDetailsResponse = {
  location?: { latitude: number; longitude: number };
  displayName?: { text: string };
  formattedAddress?: string;
};

// ── Utility functions ─────────────────────────────────────────────────────────

async function loadMapboxLibs(): Promise<MapboxLibs> {
  const [mapboxMod, workerMod] = await Promise.all([
    import("mapbox-gl"),
    import("mapbox-gl/dist/mapbox-gl-csp-worker.js?worker"),
    import("mapbox-gl/dist/mapbox-gl.css"),
  ]);

  const mapboxgl =
    (mapboxMod as { default?: MapboxLibs["mapboxgl"] }).default ??
    (mapboxMod as unknown as MapboxLibs["mapboxgl"]);

  if (!mapboxgl?.Map) throw new Error("Falha ao carregar mapbox-gl.");

  const WorkerClass = workerMod.default;
  if (WorkerClass && "workerClass" in mapboxgl) mapboxgl.workerClass = WorkerClass;

  return { mapboxgl };
}

function getMapboxToken(): string {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) throw new Error("Chave Mapbox não configurada (VITE_MAPBOX_TOKEN).");
  return token;
}

function getGooglePlacesKey(): string {
  const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("Chave Google Places não configurada (VITE_GOOGLE_PLACES_API_KEY).");
  return key;
}

/**
 * POST /v1/places:autocomplete
 * Usa os headers obrigatórios da Places API (New): X-Goog-Api-Key e X-Goog-FieldMask.
 * Passa `signal` para permitir cancelamento via AbortController.
 */
async function googlePlacesAutocomplete(
  input: string,
  signal: AbortSignal,
): Promise<PlaceSuggestion[]> {
  const key = getGooglePlacesKey();
  const res = await fetch(`${PLACES_BASE}/places:autocomplete`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": [
        "suggestions.placePrediction.placeId",
        "suggestions.placePrediction.text",
        "suggestions.placePrediction.structuredFormat",
      ].join(","),
    },
    body: JSON.stringify({ input, regionCode: "BR", languageCode: "pt-BR" }),
  });
  if (!res.ok) throw new Error(`Google Places Autocomplete: HTTP ${res.status}`);
  const data = (await res.json()) as AutocompleteResponse;
  return data.suggestions ?? [];
}

/**
 * GET /v1/places/{placeId}
 * Retorna coordenadas e rótulo do lugar para repassar ao Mapbox Directions.
 */
async function googlePlaceDetails(
  placeId: string,
): Promise<{ coord: Coordenada; label: string }> {
  const key = getGooglePlacesKey();
  const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "location,displayName,formattedAddress",
    },
  });
  if (!res.ok) throw new Error(`Google Place Details: HTTP ${res.status}`);
  const data = (await res.json()) as PlaceDetailsResponse;
  if (!data.location) throw new Error("Local sem coordenadas retornadas pela API.");
  const coord: Coordenada = { lat: data.location.latitude, lon: data.location.longitude };
  const label = data.formattedAddress ?? data.displayName?.text ?? placeId;
  return { coord, label };
}

function distanciaEntre(a: Coordenada, b: Coordenada): number {
  const dx = a.lat - b.lat;
  const dy = a.lon - b.lon;
  return dx * dx + dy * dy;
}

async function reverseGeocodeMapbox(lon: number, lat: number, token: string): Promise<string> {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json` +
    `?language=pt&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  const data = (await res.json()) as { features?: Array<{ place_name?: string }> };
  return data.features?.[0]?.place_name ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

async function buscarDirections(
  origem: Coordenada,
  destino: Coordenada,
  token: string,
): Promise<MapboxRoute> {
  const coords = `${origem.lon},${origem.lat};${destino.lon},${destino.lat}`;
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
    `?geometries=geojson&language=pt&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao calcular rota.");
  const data = (await res.json()) as DirectionsResponse;
  const route = data.routes?.[0];
  if (!route) throw new Error(data.message ?? "Rota não encontrada entre origem e destino.");
  return route;
}

function criarMarcadorOrigem(): HTMLElement {
  const el = document.createElement("div");
  el.className =
    "h-5 w-5 rounded-full border-2 border-blue-600 bg-white shadow-md ring-2 ring-white";
  return el;
}

function criarMarcadorDestino(): HTMLElement {
  const el = document.createElement("div");
  el.className = "flex h-8 w-8 items-center justify-center";
  el.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" class="h-7 w-7 drop-shadow"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>';
  return el;
}

// ── SearchField ───────────────────────────────────────────────────────────────
// Campo de busca com dropdown de sugestões da Google Places API.
// Gerencia seu próprio estado "open" para não poluir o componente pai.

type SearchFieldProps = {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: PlaceSuggestion) => void;
  suggestions: PlaceSuggestion[];
  buscando: boolean;
  buscaErro: string | null;
  placeholder: string;
  pinColor: string;
};

function SearchField({
  value,
  onChange,
  onSelect,
  suggestions,
  buscando,
  buscaErro,
  placeholder,
  pinColor,
}: SearchFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      {/* Input */}
      <div
        className="relative w-full rounded-xl border bg-[var(--bg-card)]"
        style={{ borderColor: "var(--border-color)" }}
      >
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          className="w-full rounded-xl bg-transparent px-4 py-3 pr-10 text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Atrasa o fechamento para que o onClick na sugestão dispare antes
            setTimeout(() => setOpen(false), 150);
          }}
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {buscando ? (
            <Loader2
              style={{ width: 14, height: 14, color: "var(--text-secondary)" }}
              className="animate-spin"
            />
          ) : (
            <MapPin style={{ width: 16, height: 16, color: pinColor }} />
          )}
        </div>
      </div>

      {/* Dropdown de sugestões */}
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border shadow-lg"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          {suggestions.map((s) => {
            const main =
              s.placePrediction.structuredFormat?.mainText.text ??
              s.placePrediction.text.text;
            const secondary =
              s.placePrediction.structuredFormat?.secondaryText?.text;
            return (
              <li
                key={s.placePrediction.placeId}
                className="cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-page)]"
                // preventDefault impede que o onBlur do input feche o dropdown
                // antes do onClick desta sugestão ser processado
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  onSelect(s);
                }}
              >
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {main}
                </span>
                {secondary && (
                  <span className="ml-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {secondary}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Mensagem discreta de erro de busca */}
      {buscaErro && (
        <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          ⚠️ {buscaErro}
        </p>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function MapaRotaMapbox({ vehicleType, onRotaCalculada }: MapaRotaProps) {
  const [origem, setOrigem] = useState<MapPoint | null>(null);
  const [destino, setDestino] = useState<MapPoint | null>(null);
  const [carregandoRota, setCarregandoRota] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mapPronto, setMapPronto] = useState(false);
  const [libsReady, setLibsReady] = useState(false);

  // ── Estado da busca Google Places — origem ──────────────────────────────────
  const [origemInput, setOrigemInput] = useState("");
  const [origemSuggestions, setOrigemSuggestions] = useState<PlaceSuggestion[]>([]);
  const [origemBuscando, setOrigemBuscando] = useState(false);
  const [origemBuscaErro, setOrigemBuscaErro] = useState<string | null>(null);

  // ── Estado da busca Google Places — destino ─────────────────────────────────
  const [destinoInput, setDestinoInput] = useState("");
  const [destinoSuggestions, setDestinoSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destinoBuscando, setDestinoBuscando] = useState(false);
  const [destinoBuscaErro, setDestinoBuscaErro] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const libsRef = useRef<MapboxLibs | null>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const markerOrigemRef = useRef<MarkerInstance | null>(null);
  const markerDestinoRef = useRef<MarkerInstance | null>(null);
  const lastRouteRef = useRef<MapboxRoute | null>(null);
  const gpsTentado = useRef(false);
  const origemRef = useRef<MapPoint | null>(null);
  const destinoRef = useRef<MapPoint | null>(null);

  // Timers de debounce para autocomplete
  const origemDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AbortControllers para evitar condição de corrida entre requisições
  const origemAbortRef = useRef<AbortController | null>(null);
  const destinoAbortRef = useRef<AbortController | null>(null);

  const tipoVeiculo = vehicleType || "Carro";

  useEffect(() => { origemRef.current = origem; }, [origem]);
  useEffect(() => { destinoRef.current = destino; }, [destino]);

  // Limpeza de timers e requisições em aberto ao desmontar
  useEffect(() => {
    return () => {
      if (origemDebounceRef.current) clearTimeout(origemDebounceRef.current);
      if (destinoDebounceRef.current) clearTimeout(destinoDebounceRef.current);
      origemAbortRef.current?.abort();
      destinoAbortRef.current?.abort();
    };
  }, []);

  // ── aplicarPonto ────────────────────────────────────────────────────────────
  // Atualiza o ponto selecionado (vindo da busca ou do clique no mapa)
  // e sincroniza o texto do input correspondente.
  const aplicarPonto = useCallback(
    (tipo: "origem" | "destino", coord: Coordenada, label: string) => {
      const ponto: MapPoint = { coord, label };
      if (tipo === "origem") {
        setOrigem(ponto);
        setOrigemInput(label);
        setOrigemSuggestions([]);
        setOrigemBuscaErro(null);
      } else {
        setDestino(ponto);
        setDestinoInput(label);
        setDestinoSuggestions([]);
        setDestinoBuscaErro(null);
      }
    },
    [],
  );

  // ── Handlers de input com debounce + AbortController ───────────────────────
  // Padrão anti-race-condition:
  //   1. Cancela o timer anterior (requisição ainda não disparada).
  //   2. Quando o timer dispara, aborta a requisição anterior em voo via
  //      AbortController e inicia uma nova com um controller fresco.
  //   3. Na resposta, verifica `signal.aborted` antes de atualizar o estado.
  //   4. No catch, ignora erros de AbortError (são esperados ao cancelar).

  const handleOrigemInputChange = useCallback((value: string) => {
    setOrigemInput(value);
    setOrigemBuscaErro(null);

    if (!value.trim()) {
      setOrigemSuggestions([]);
      setOrigem(null);
      if (origemDebounceRef.current) clearTimeout(origemDebounceRef.current);
      origemAbortRef.current?.abort();
      return;
    }

    if (origemDebounceRef.current) clearTimeout(origemDebounceRef.current);

    origemDebounceRef.current = setTimeout(() => {
      origemAbortRef.current?.abort();
      const controller = new AbortController();
      origemAbortRef.current = controller;

      setOrigemBuscando(true);
      void (async () => {
        try {
          const suggestions = await googlePlacesAutocomplete(value, controller.signal);
          if (controller.signal.aborted) return;
          setOrigemSuggestions(suggestions);
          setOrigemBuscando(false);
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
          setOrigemSuggestions([]);
          setOrigemBuscaErro("Busca indisponível no momento — tente clicar no mapa.");
          setOrigemBuscando(false);
        }
      })();
    }, DEBOUNCE_MS);
  }, []);

  const handleDestinoInputChange = useCallback((value: string) => {
    setDestinoInput(value);
    setDestinoBuscaErro(null);

    if (!value.trim()) {
      setDestinoSuggestions([]);
      setDestino(null);
      if (destinoDebounceRef.current) clearTimeout(destinoDebounceRef.current);
      destinoAbortRef.current?.abort();
      return;
    }

    if (destinoDebounceRef.current) clearTimeout(destinoDebounceRef.current);

    destinoDebounceRef.current = setTimeout(() => {
      destinoAbortRef.current?.abort();
      const controller = new AbortController();
      destinoAbortRef.current = controller;

      setDestinoBuscando(true);
      void (async () => {
        try {
          const suggestions = await googlePlacesAutocomplete(value, controller.signal);
          if (controller.signal.aborted) return;
          setDestinoSuggestions(suggestions);
          setDestinoBuscando(false);
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
          setDestinoSuggestions([]);
          setDestinoBuscaErro("Busca indisponível no momento — tente clicar no mapa.");
          setDestinoBuscando(false);
        }
      })();
    }, DEBOUNCE_MS);
  }, []);

  // ── handleSelecionarSugestao ────────────────────────────────────────────────
  // Ao clicar numa sugestão: busca Place Details para obter lat/lon
  // e repassa ao Mapbox Directions via aplicarPonto.
  const handleSelecionarSugestao = useCallback(
    async (tipo: "origem" | "destino", sugestao: PlaceSuggestion) => {
      const { placeId, text } = sugestao.placePrediction;

      // Fecha o dropdown imediatamente com o texto da sugestão
      if (tipo === "origem") {
        setOrigemInput(text.text);
        setOrigemSuggestions([]);
        setOrigemBuscando(true);
        setOrigemBuscaErro(null);
      } else {
        setDestinoInput(text.text);
        setDestinoSuggestions([]);
        setDestinoBuscando(true);
        setDestinoBuscaErro(null);
      }

      try {
        const { coord, label } = await googlePlaceDetails(placeId);
        aplicarPonto(tipo, coord, label);
      } catch (e) {
        console.error("Erro ao obter detalhes do lugar:", e);
        const msg = "Busca indisponível no momento — tente clicar no mapa.";
        if (tipo === "origem") setOrigemBuscaErro(msg);
        else setDestinoBuscaErro(msg);
      } finally {
        if (tipo === "origem") setOrigemBuscando(false);
        else setDestinoBuscando(false);
      }
    },
    [aplicarPonto],
  );

  // ── Mapbox: desenho de rota e marcadores ────────────────────────────────────

  const desenharRota = useCallback((map: MapInstance, geometry: GeoJSON.LineString) => {
    const mapboxgl = libsRef.current?.mapboxgl;
    if (!mapboxgl) return;

    const feature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry,
    };

    if (map.getSource(ROUTE_SOURCE_ID)) {
      (map.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource).setData(feature);
    } else {
      map.addSource(ROUTE_SOURCE_ID, { type: "geojson", data: feature });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#16a34a",
          "line-width": 4,
          "line-gap-width": 2,
          "line-opacity": 1,
        },
      });
    }

    const coords = geometry.coordinates as [number, number][];
    if (coords.length > 0) {
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: 48, maxZoom: 14 });
    }
  }, []);

  const limparRota = useCallback((map: MapInstance) => {
    if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
    if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
    lastRouteRef.current = null;
  }, []);

  const atualizarMarcadores = useCallback(
    (map: MapInstance, origemPt: MapPoint | null, destinoPt: MapPoint | null) => {
      const mapboxgl = libsRef.current?.mapboxgl;
      if (!mapboxgl) return;

      if (origemPt) {
        if (!markerOrigemRef.current) {
          markerOrigemRef.current = new mapboxgl.Marker({ element: criarMarcadorOrigem() });
        }
        markerOrigemRef.current.setLngLat([origemPt.coord.lon, origemPt.coord.lat]).addTo(map);
      } else {
        markerOrigemRef.current?.remove();
        markerOrigemRef.current = null;
      }

      if (destinoPt) {
        if (!markerDestinoRef.current) {
          markerDestinoRef.current = new mapboxgl.Marker({ element: criarMarcadorDestino() });
        }
        markerDestinoRef.current
          .setLngLat([destinoPt.coord.lon, destinoPt.coord.lat])
          .addTo(map);
      } else {
        markerDestinoRef.current?.remove();
        markerDestinoRef.current = null;
      }
    },
    [],
  );

  const previewRota = useCallback(
    async (origemPt: MapPoint, destinoPt: MapPoint) => {
      const map = mapRef.current;
      if (!map) return;

      setCarregandoRota(true);
      setErro(null);
      try {
        const token = getMapboxToken();
        const route = await buscarDirections(origemPt.coord, destinoPt.coord, token);
        lastRouteRef.current = route;
        desenharRota(map, route.geometry);
      } catch (e) {
        limparRota(map);
        setErro(e instanceof Error ? e.message : "Não foi possível traçar a rota no mapa.");
      } finally {
        setCarregandoRota(false);
      }
    },
    [desenharRota, limparRota],
  );

  // ── Inicialização do mapa Mapbox ────────────────────────────────────────────

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let cancelled = false;

    void (async () => {
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token) {
          setErro("Chave Mapbox não configurada (VITE_MAPBOX_TOKEN).");
          return;
        }

        const libs = await loadMapboxLibs();
        if (cancelled) return;

        libsRef.current = libs;
        setLibsReady(true);

        const { mapboxgl } = libs;
        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center: BRASIL_CENTER,
          zoom: DEFAULT_ZOOM,
        });

        mapRef.current = map;

        map.on("load", () => {
          if (!cancelled) setMapPronto(true);
        });

        // Clique no mapa: fallback manual quando a busca não encontra o ponto
        map.on("click", (e) => {
          void (async () => {
            const coord = { lat: e.lngLat.lat, lon: e.lngLat.lng };
            setErro(null);
            const label = await reverseGeocodeMapbox(coord.lon, coord.lat, token);

            const origemAtual = origemRef.current;
            const destinoAtual = destinoRef.current;

            if (!origemAtual) {
              aplicarPonto("origem", coord, label);
              return;
            }
            if (!destinoAtual) {
              aplicarPonto("destino", coord, label);
              return;
            }

            if (distanciaEntre(coord, origemAtual.coord) <= distanciaEntre(coord, destinoAtual.coord)) {
              aplicarPonto("origem", coord, label);
            } else {
              aplicarPonto("destino", coord, label);
            }
          })();
        });

        // Geolocalização: preenche a origem automaticamente se o usuário autorizar
        if (!gpsTentado.current && navigator.geolocation) {
          gpsTentado.current = true;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (cancelled) return;
              const coord = { lat: pos.coords.latitude, lon: pos.coords.longitude };
              map.flyTo({ center: [coord.lon, coord.lat], zoom: GPS_ZOOM });
              void reverseGeocodeMapbox(coord.lon, coord.lat, token).then((label) => {
                if (!cancelled) aplicarPonto("origem", coord, label);
              });
            },
            () => {
              // GPS negado ou indisponível — origem manual
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
          );
        }
      } catch (e) {
        if (!cancelled) {
          setErro(e instanceof Error ? e.message : "Falha ao inicializar o mapa Mapbox.");
        }
      }
    })();

    return () => {
      cancelled = true;
      markerOrigemRef.current?.remove();
      markerDestinoRef.current?.remove();
      markerOrigemRef.current = null;
      markerDestinoRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      libsRef.current = null;
      setLibsReady(false);
      setMapPronto(false);
    };
  }, [aplicarPonto]);

  // Atualiza marcadores e preview de rota sempre que origem/destino mudam
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapPronto || !libsReady) return;

    atualizarMarcadores(map, origem, destino);

    if (origem && destino) {
      void previewRota(origem, destino);
    } else {
      limparRota(map);
    }
  }, [origem, destino, mapPronto, libsReady, previewRota, atualizarMarcadores, limparRota]);

  // ── Handlers de UI ──────────────────────────────────────────────────────────

  const trocarOrigemDestino = () => {
    const o = origem;
    const d = destino;
    setOrigem(d);
    setDestino(o);
    setOrigemInput(d?.label ?? "");
    setDestinoInput(o?.label ?? "");
  };

  const handleCalcularRota = async () => {
    if (!origem || !destino) return;
    setCalculando(true);
    setErro(null);

    try {
      const token = getMapboxToken();
      const periodo = detectarPeriodo();

      let route = lastRouteRef.current;
      if (!route) {
        route = await buscarDirections(origem.coord, destino.coord, token);
        lastRouteRef.current = route;
        const map = mapRef.current;
        if (map) desenharRota(map, route.geometry);
      }

      const distanciaKmExata = route.distance / 1000;
      const distanciaKm = Math.round(distanciaKmExata);
      const duracaoMin = Math.round(route.duration / 60);
      const velocidadeBruta =
        route.duration > 0 ? distanciaKmExata / (route.duration / 3600) : 0;
      const velocidadeMediaKmh = Math.round(
        velocidadeRealista(velocidadeBruta, tipoVeiculo, distanciaKmExata),
      );

      const temperatura = await buscarTemperaturaAtual(
        origem.coord.lat,
        origem.coord.lon,
      ).catch(() => temperatureForPeriod(periodo));

      onRotaCalculada({
        distanciaKm,
        velocidadeMediaKmh,
        periodoValor: periodo,
        temperaturaC: temperatura,
        duracaoMin,
        origem: origem.label,
        destino: destino.label,
        latOrigem: origem.coord.lat,
        lonOrigem: origem.coord.lon,
        latDestino: destino.coord.lat,
        lonDestino: destino.coord.lon,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao calcular rota.");
    } finally {
      setCalculando(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Campos de busca (Google Places) */}
      <div className="flex flex-col gap-2 mb-3">
        {/* Origem */}
        <SearchField
          value={origemInput}
          onChange={handleOrigemInputChange}
          onSelect={(s) => void handleSelecionarSugestao("origem", s)}
          suggestions={origemSuggestions}
          buscando={origemBuscando}
          buscaErro={origemBuscaErro}
          placeholder="Ponto de partida"
          pinColor="#16a34a"
        />

        {/* Botão de inversão */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={trocarOrigemDestino}
            className="flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--bg-page)",
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
            title="Trocar origem e destino"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Destino */}
        <SearchField
          value={destinoInput}
          onChange={handleDestinoInputChange}
          onSelect={(s) => void handleSelecionarSugestao("destino", s)}
          suggestions={destinoSuggestions}
          buscando={destinoBuscando}
          buscaErro={destinoBuscaErro}
          placeholder="Destino"
          pinColor="#ef4444"
        />
      </div>

      {/* Botão calcular rota */}
      {origem && destino && (
        <Button
          type="button"
          variant="primary"
          className="w-full gap-2"
          disabled={calculando || carregandoRota}
          onClick={() => void handleCalcularRota()}
        >
          {calculando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando rota...
            </>
          ) : (
            "Calcular rota"
          )}
        </Button>
      )}

      {/* Mapa Mapbox (apenas renderização + Directions) */}
      <div
        className="relative w-full overflow-hidden rounded-xl border"
        style={{ height: 320, borderColor: "var(--border-color)" }}
      >
        <div ref={mapContainerRef} className="h-full w-full" />

        {(!libsReady || !mapPronto) && (
          <div
            className="absolute inset-0 flex items-center justify-center text-sm"
            style={{ backgroundColor: "var(--bg-page)", color: "var(--text-secondary)" }}
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando mapa...
          </div>
        )}

        {carregandoRota && (
          <div
            className="pointer-events-none absolute bottom-3 left-3 rounded-lg px-3 py-1.5 text-xs shadow"
            style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            Traçando rota...
          </div>
        )}
      </div>

      <p className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
        Clique no mapa ou busque por nome. Origem e destino continuam editáveis após calcular.
      </p>

      {erro && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {erro}
        </p>
      )}
    </div>
  );
}
