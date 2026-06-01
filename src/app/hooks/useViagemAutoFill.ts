import { useCallback, useState } from "react";
import {
  calcularRota,
  routeProfileForVehicleType,
  type Coordenada,
} from "@/services/routeService";
import { buscarTemperaturaAtual } from "@/services/weatherService";
import { detectarPeriodo, labelPeriodo } from "../utils/periodoUtils";
import type { DayPeriod } from "../domain/wearModel";
import { temperatureForPeriod } from "../domain/wearModel";

export type CamposAutoPreenchidos = {
  distanciaKm: number;
  velocidadeMediaKmh: number;
  periodoDia: string;
  periodoValor: DayPeriod;
  temperaturaC: number;
  duracaoMin: number;
};

export type StatusAutoFill = "idle" | "carregando" | "sucesso" | "erro";

export function useViagemAutoFill() {
  const [status, setStatus] = useState<StatusAutoFill>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [campos, setCampos] = useState<CamposAutoPreenchidos | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setErro(null);
    setCampos(null);
  }, []);

  const autoPreencher = useCallback(
    async (origem: Coordenada, destino: Coordenada, vehicleType: string) => {
      setStatus("carregando");
      setErro(null);

      const periodo = detectarPeriodo();
      const profile = routeProfileForVehicleType(vehicleType);

      try {
        const rotaPromise = calcularRota(origem, destino, vehicleType, profile);
        const climaPromise = buscarTemperaturaAtual(origem.lat, origem.lon).catch(() =>
          temperatureForPeriod(periodo)
        );

        const [rota, temperatura] = await Promise.all([rotaPromise, climaPromise]);

        const result: CamposAutoPreenchidos = {
          distanciaKm: rota.distanciaKm,
          velocidadeMediaKmh: rota.velocidadeMediaKmh,
          periodoDia: labelPeriodo(periodo, temperatura),
          periodoValor: periodo,
          temperaturaC: temperatura,
          duracaoMin: rota.duracaoMin,
        };

        setCampos(result);
        setStatus("sucesso");
        return result;
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Não foi possível calcular automaticamente. Preencha manualmente.";
        setErro(msg);
        setStatus("erro");
        throw e;
      }
    },
    []
  );

  return { autoPreencher, campos, status, erro, reset };
}
