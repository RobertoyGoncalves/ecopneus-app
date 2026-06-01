import type { DayPeriod } from "../domain/wearModel";
import { temperatureForPeriod } from "../domain/wearModel";

const PERIOD_LABELS: Record<DayPeriod, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

export function detectarPeriodo(): DayPeriod {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return "manha";
  if (hora >= 12 && hora < 18) return "tarde";
  return "noite";
}

export function labelPeriodo(periodo: DayPeriod, temperatura: number): string {
  return `${PERIOD_LABELS[periodo]} — ${Math.round(temperatura)} °C`;
}

export function periodOptionsWithTemperature(temperaturaPorPeriodo?: Partial<Record<DayPeriod, number>>) {
  const periods: DayPeriod[] = ["manha", "tarde", "noite"];
  return periods.map((p) => ({
    value: p,
    label: labelPeriodo(p, temperaturaPorPeriodo?.[p] ?? temperatureForPeriod(p)),
  }));
}
