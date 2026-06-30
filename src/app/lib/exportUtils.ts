import * as XLSX from "xlsx-js-style";
import type { Trip } from "../domain/trip";
import type { FleetTire, FleetVehicle } from "../domain/fleet";

// ─── Shared style primitives ──────────────────────────────────────────────────

const THIN_BORDER = {
  top:    { style: "thin", color: { rgb: "E5E7EB" } },
  bottom: { style: "thin", color: { rgb: "E5E7EB" } },
  left:   { style: "thin", color: { rgb: "E5E7EB" } },
  right:  { style: "thin", color: { rgb: "E5E7EB" } },
};

const HEADER_STYLE = {
  font:      { bold: true, color: { rgb: "166534" } },
  fill:      { fgColor: { rgb: "DCFCE7" } },
  alignment: { horizontal: "center", vertical: "center" },
  border:    THIN_BORDER,
};

type StatusColor = { bg: string; fg: string };

// ─── Core sheet styler ────────────────────────────────────────────────────────

/**
 * Applies to every cell in the sheet:
 * - header row → HEADER_STYLE
 * - data rows  → zebra striping + thin borders + vertical center
 * - statusCol  → override fill/font with colour coding from statusFn
 */
function applySheetStyles(
  ws: XLSX.WorkSheet,
  statusCol?: number,
  statusFn?: (dataRowIndex: number) => StatusColor | null
): void {
  const ref = ws["!ref"];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellRef]) continue;

      if (r === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ws[cellRef] as any).s = HEADER_STYLE;
        continue;
      }

      // Zebra: data starts at r=1. Row 1 = "odd" visual → light gray.
      const rowBg = r % 2 === 1 ? "F9FAFB" : "FFFFFF";

      const isStatusCell = statusCol !== undefined && c === statusCol && statusFn != null;
      if (isStatusCell) {
        const sc = statusFn(r - 1); // pass 0-based data index
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ws[cellRef] as any).s = sc
          ? {
              font:      { bold: true, color: { rgb: sc.fg } },
              fill:      { fgColor: { rgb: sc.bg } },
              alignment: { vertical: "center" },
              border:    THIN_BORDER,
            }
          : {
              fill:      { fgColor: { rgb: rowBg } },
              alignment: { vertical: "center" },
              border:    THIN_BORDER,
            };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ws[cellRef] as any).s = {
          fill:      { fgColor: { rgb: rowBg } },
          alignment: { vertical: "center" },
          border:    THIN_BORDER,
        };
      }
    }
  }

  // Freeze header row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ws as any)["!freeze"] = { xSplit: 0, ySplit: 1 };

  // Header row height (24 pt)
  ws["!rows"] = ws["!rows"] ?? [];
  ws["!rows"][0] = { hpt: 24 };
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

function wearColor(wearStr: string): StatusColor {
  const wear = Number(wearStr);
  if (wear > 5) return { bg: "FEE2E2", fg: "991B1B" };
  if (wear > 1) return { bg: "FEF9C3", fg: "854D0E" };
  return { bg: "DCFCE7", fg: "166534" };
}

function tireStatusColor(status: string): StatusColor {
  if (status === "Crítico") return { bg: "FEE2E2", fg: "991B1B" };
  if (status === "Atenção")  return { bg: "FEF9C3", fg: "854D0E" };
  return { bg: "DCFCE7", fg: "166534" };
}

// ─── Public exports ───────────────────────────────────────────────────────────

export function exportTripsToExcel(trips: Trip[]): void {
  const rows = trips.map((t) => ({
    "Veículo":        t.vehicle,
    "Origem":         t.origem  || "—",
    "Destino":        t.destino || "—",
    "Distância (km)": t.distance,
    "Data":           t.date,
    "Desgaste (%)":   Number(t.estimatedWear ?? 0).toFixed(2),
    "Status":         "Concluída",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  // Veículo | Origem | Destino | Distância (km) | Data | Desgaste (%) | Status
  ws["!cols"] = [
    { wch: 28 }, { wch: 35 }, { wch: 35 }, { wch: 22 },
    { wch: 20 }, { wch: 20 }, { wch: 18 },
  ];

  // Desgaste (%) is column index 5
  applySheetStyles(ws, 5, (i) => wearColor(rows[i]["Desgaste (%)"]));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Viagens");
  XLSX.writeFile(wb, `ecopneus-viagens-${Date.now()}.xlsx`);
}

export function exportFleetToExcel(
  vehicles: FleetVehicle[],
  tires: FleetTire[]
): void {
  // ── Sheet 1: Veículos ──────────────────────────────────────────────────────
  const vehicleRows = vehicles.map((v) => ({
    "Tipo":              v.type,
    "Marca":             v.brand,
    "Modelo":            v.model,
    "Ano":               v.year,
    "Placa":             v.plate,
    "Qtd. Pneus":        v.tireCount,
    "Fabricante do Pneu": v.tireManufacturer,
    "Modelo do Pneu":    v.tireModel,
    "Linha":             v.tireQualityTier,
  }));

  const wsVehicles = XLSX.utils.json_to_sheet(vehicleRows);
  // Tipo | Marca | Modelo | Ano | Placa | Qtd. Pneus | Fabricante do Pneu | Modelo do Pneu | Linha
  wsVehicles["!cols"] = [
    { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
    { wch: 16 }, { wch: 14 }, { wch: 26 }, { wch: 24 }, { wch: 20 },
  ];
  // No status column for vehicles — pass undefined
  applySheetStyles(wsVehicles);

  // ── Sheet 2: Pneus ─────────────────────────────────────────────────────────
  const tireRows = tires.map((t) => ({
    "Modelo":       t.model,
    "Fabricante":   t.brand,
    "Veículo":      t.vehicle,
    "Eixo":         t.axis,
    "Vida útil (%)": Number(t.health).toFixed(1),
    "Status":       t.health >= 60 ? "Excelente" : t.health >= 20 ? "Atenção" : "Crítico",
  }));

  const wsTires = XLSX.utils.json_to_sheet(tireRows);
  // Modelo | Fabricante | Veículo | Eixo | Vida útil (%) | Status
  wsTires["!cols"] = [
    { wch: 24 }, { wch: 20 }, { wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 18 },
  ];
  // Status is column index 5
  applySheetStyles(wsTires, 5, (i) => tireStatusColor(tireRows[i]["Status"]));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsVehicles, "Veículos");
  XLSX.utils.book_append_sheet(wb, wsTires, "Pneus");
  XLSX.writeFile(wb, `ecopneus-frota-${Date.now()}.xlsx`);
}
