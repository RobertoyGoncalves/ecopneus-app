import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { MapaRotaProps } from "./mapaRotaTypes";

export type { MapaRotaProps, MapaRotaResultado } from "./mapaRotaTypes";

function MapaRotaLoadError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
      <p className="font-medium">Não foi possível carregar o mapa.</p>
      <p className="mt-1 text-amber-800">{message}</p>
      <p className="mt-2 text-xs text-amber-700">
        Você ainda pode preencher distância e velocidade manualmente abaixo.
      </p>
    </div>
  );
}

const MapaRotaMapbox = lazy(() =>
  import("./MapaRotaMapbox")
    .then((m) => ({ default: m.MapaRotaMapbox }))
    .catch((err: unknown) => ({
      default: () => (
        <MapaRotaLoadError
          message={err instanceof Error ? err.message : "Erro desconhecido ao carregar Mapbox."}
        />
      ),
    }))
);

function MapaRotaFallback() {
  return (
    <div className="flex min-h-[560px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Carregando mapa...
    </div>
  );
}

type ErrorBoundaryState = { error: Error | null };

class MapaRotaErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("MapaRota error:", error, info);
  }

  render() {
    if (this.state.error) {
      return <MapaRotaLoadError message={this.state.error.message} />;
    }
    return this.props.children;
  }
}

export function MapaRota(props: MapaRotaProps) {
  return (
    <MapaRotaErrorBoundary>
      <Suspense fallback={<MapaRotaFallback />}>
        <MapaRotaMapbox {...props} />
      </Suspense>
    </MapaRotaErrorBoundary>
  );
}
