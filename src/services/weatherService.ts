export async function buscarTemperaturaAtual(lat: number, lon: number): Promise<number> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}&current_weather=true`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao buscar temperatura");

  const data = (await res.json()) as { current_weather?: { temperature?: number } };
  const temp = data.current_weather?.temperature;
  if (typeof temp !== "number") throw new Error("Temperatura indisponível");

  return temp;
}
