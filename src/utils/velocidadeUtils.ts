export function velocidadeRealista(
  velocidadeORS: number,
  tipoVeiculo: string,
  distanciaKm: number
): number {
  // Trecho muito curto: confia no ORS (saída/entrada de cidade, uso urbano).
  if (distanciaKm < 50) return velocidadeORS;

  type TipoBasico = "Caminhão" | "Carro" | "Moto";

  const tipo: TipoBasico =
    tipoVeiculo === "Caminhão"
      ? "Caminhão"
      : tipoVeiculo === "Moto"
        ? "Moto"
        : "Carro";

  // Faixas calibradas para contexto BR: misto (50–200 km) x rodovia predominante (>200 km).
  const PISO_MISTO: Record<TipoBasico, number> = {
    Caminhão: 75,
    Carro: 85,
    Moto: 80,
  };

  const TETO_MISTO: Record<TipoBasico, number> = {
    Caminhão: 90,
    Carro: 100,
    Moto: 100,
  };

  const PISO_RODOVIA: Record<TipoBasico, number> = {
    Caminhão: 82,
    Carro: 100,
    Moto: 95,
  };

  const TETO_RODOVIA: Record<TipoBasico, number> = {
    Caminhão: 95,
    Carro: 115,
    Moto: 115,
  };

  let piso: number;
  let teto: number;

  if (distanciaKm < 200) {
    piso = PISO_MISTO[tipo];
    teto = TETO_MISTO[tipo];
  } else {
    piso = PISO_RODOVIA[tipo];
    teto = TETO_RODOVIA[tipo];
  }

  // Se por algum motivo vier algo muito estranho do ORS, ainda assim clampamos na faixa.
  const ajustada = Math.min(Math.max(velocidadeORS, piso), teto);
  return ajustada;
}

