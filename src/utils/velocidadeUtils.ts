export function velocidadeRealista(
  velocidadeApi: number,
  tipoVeiculo: string,
  distanciaKm: number
): number {
  type TipoBasico = "Caminhão" | "Carro" | "Moto";

  const tipo: TipoBasico =
    tipoVeiculo === "Caminhão"
      ? "Caminhão"
      : tipoVeiculo === "Moto"
        ? "Moto"
        : "Carro";

  // Mapbox subestima em trechos urbanos — pisos calibrados para contexto BR.
  const PISO_URBANO: Record<TipoBasico, number> = {
    Caminhão: 45,
    Carro: 52,
    Moto: 50,
  };
  const TETO_URBANO: Record<TipoBasico, number> = {
    Caminhão: 58,
    Carro: 65,
    Moto: 70,
  };

  const PISO_MISTO_CURTO: Record<TipoBasico, number> = {
    Caminhão: 58,
    Carro: 68,
    Moto: 65,
  };
  const TETO_MISTO_CURTO: Record<TipoBasico, number> = {
    Caminhão: 72,
    Carro: 82,
    Moto: 85,
  };

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

  if (distanciaKm < 30) {
    piso = PISO_URBANO[tipo];
    teto = TETO_URBANO[tipo];
  } else if (distanciaKm < 50) {
    piso = PISO_MISTO_CURTO[tipo];
    teto = TETO_MISTO_CURTO[tipo];
  } else if (distanciaKm < 200) {
    piso = PISO_MISTO[tipo];
    teto = TETO_MISTO[tipo];
  } else {
    piso = PISO_RODOVIA[tipo];
    teto = TETO_RODOVIA[tipo];
  }

  return Math.min(Math.max(velocidadeApi, piso), teto);
}
