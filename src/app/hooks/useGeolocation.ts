import { useCallback, useState } from "react";
import type { Coordenada } from "@/services/routeService";

export type PosicaoAtual = Coordenada | null;

export function useGeolocation() {
  const [posicao, setPosicao] = useState<PosicaoAtual>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const obterPosicao = useCallback((): Promise<Coordenada> => {
    if (!navigator.geolocation) {
      const msg = "Geolocalização não suportada neste navegador.";
      setErro(msg);
      return Promise.reject(new Error(msg));
    }

    setCarregando(true);
    setErro(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coord = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setPosicao(coord);
          setCarregando(false);
          resolve(coord);
        },
        (err) => {
          const msg =
            err.code === err.PERMISSION_DENIED
              ? "Permissão de localização negada. Preencha os campos manualmente."
              : err.message || "Não foi possível obter a localização.";
          setErro(msg);
          setCarregando(false);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { posicao, erro, carregando, obterPosicao };
}
