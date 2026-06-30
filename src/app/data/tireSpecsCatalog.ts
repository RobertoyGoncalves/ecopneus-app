import type { TireQualityTier } from "../domain/wearModel";

export type VehicleType = "Carro" | "Caminhão" | "Moto";

export type TireSpecEntry = {
  marca: string;
  modelo: string;
  km_estimado: number;
  tier: TireQualityTier;
  fonte: string;
  vehicleType: VehicleType;
};

export type TireLifespanResult = {
  km_estimado: number | null;
  fonte: string | null;
  origem?: "catalogo" | "tier";
  tier?: TireQualityTier;
};

/** Km de referência por faixa — alinhado ao texto do formulário. */
export const TIER_LIFE_KM: Record<TireQualityTier, number> = {
  economico: 40000,
  intermediario: 60000,
  premium: 80000,
};

const TIER_LABEL: Record<TireQualityTier, string> = {
  economico: "econômico",
  intermediario: "intermediário",
  premium: "premium",
};

/**
 * Catálogo curado para o mercado brasileiro.
 * Valores de garantia (mi EUA) foram ajustados para estimativa operacional realista em asfalto.
 */
export const TIRE_SPECS_CATALOG: TireSpecEntry[] = [
  // ── Michelin — Caminhão ───────────────────────────────────────────────────
  { marca: "Michelin", modelo: "X Multi Z", km_estimado: 85000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — longa distância caminhão" },
  { marca: "Michelin", modelo: "X Multi D", km_estimado: 90000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — longa distância caminhão" },
  { marca: "Michelin", modelo: "XZA2+", km_estimado: 80000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — regional caminhão" },
  { marca: "Michelin", modelo: "X Line Energy", km_estimado: 90000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — eficiência energética caminhão" },
  // ── Michelin — Carro ──────────────────────────────────────────────────────
  { marca: "Michelin", modelo: "Agilis 3", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — comercial leve" },
  { marca: "Michelin", modelo: "Primacy 4", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio" },
  { marca: "Michelin", modelo: "Pilot Sport 4", km_estimado: 40000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — performance (desgaste mais rápido)" },
  // ── Michelin — Moto ───────────────────────────────────────────────────────
  { marca: "Michelin", modelo: "Pilot Road 5", km_estimado: 30000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto turismo premium" },
  { marca: "Michelin", modelo: "Pilot Street 2", km_estimado: 15000, tier: "economico", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto urbana" },
  { marca: "Michelin", modelo: "Anakee Adventure", km_estimado: 25000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto adventure premium" },

  // ── Bridgestone — Caminhão ────────────────────────────────────────────────
  { marca: "Bridgestone", modelo: "R268", km_estimado: 80000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — regional caminhão" },
  { marca: "Bridgestone", modelo: "R250", km_estimado: 75000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — caminhão" },
  { marca: "Bridgestone", modelo: "M788", km_estimado: 70000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — urbano caminhão" },
  // ── Bridgestone — Carro ───────────────────────────────────────────────────
  { marca: "Bridgestone", modelo: "Ecopia H/L 422", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV" },
  // ── Bridgestone — Moto ────────────────────────────────────────────────────
  { marca: "Bridgestone", modelo: "Battlax BT46", km_estimado: 22000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto estrada" },
  { marca: "Bridgestone", modelo: "Battlax Sport T32", km_estimado: 28000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto turismo premium" },

  // ── Goodyear — Caminhão ───────────────────────────────────────────────────
  { marca: "Goodyear", modelo: "KMAX S", km_estimado: 82000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer caminhão" },
  { marca: "Goodyear", modelo: "KMAX D", km_estimado: 85000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive caminhão" },
  { marca: "Goodyear", modelo: "Cargo Marathon 2", km_estimado: 70000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — comercial caminhão" },
  // ── Goodyear — Carro ──────────────────────────────────────────────────────
  { marca: "Goodyear", modelo: "EfficientGrip Performance", km_estimado: 50000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio" },

  // ── Pirelli — Caminhão ────────────────────────────────────────────────────
  { marca: "Pirelli", modelo: "FH:01", km_estimado: 78000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer caminhão" },
  { marca: "Pirelli", modelo: "FR:01", km_estimado: 80000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive caminhão" },
  // ── Pirelli — Carro ───────────────────────────────────────────────────────
  { marca: "Pirelli", modelo: "Formula Evo", km_estimado: 45000, tier: "economico", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio" },
  { marca: "Pirelli", modelo: "Cinturato P7", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio" },
  // ── Pirelli — Moto ────────────────────────────────────────────────────────
  { marca: "Pirelli", modelo: "Angel GT", km_estimado: 25000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto turismo" },
  { marca: "Pirelli", modelo: "Sport Demon", km_estimado: 15000, tier: "economico", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto esportiva" },
  { marca: "Pirelli", modelo: "MT 60 RS", km_estimado: 20000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto trail" },

  // ── Continental — Caminhão ────────────────────────────────────────────────
  { marca: "Continental", modelo: "HSR2", km_estimado: 80000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — regional caminhão" },
  { marca: "Continental", modelo: "HDR2", km_estimado: 82000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive caminhão" },
  // ── Continental — Carro ───────────────────────────────────────────────────
  { marca: "Continental", modelo: "ContiCrossContact", km_estimado: 50000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV" },
  // ── Continental — Moto ────────────────────────────────────────────────────
  { marca: "Continental", modelo: "ContiMotion", km_estimado: 22000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto esportiva" },
  { marca: "Continental", modelo: "ContiRoad", km_estimado: 18000, tier: "economico", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto urbana" },

  // ── Firestone — Caminhão ──────────────────────────────────────────────────
  { marca: "Firestone", modelo: "FS561", km_estimado: 65000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — caminhão" },
  { marca: "Firestone", modelo: "FS400", km_estimado: 60000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — caminhão" },

  // ── Hankook — Caminhão ────────────────────────────────────────────────────
  { marca: "Hankook", modelo: "AH31", km_estimado: 70000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — comercial caminhão" },
  { marca: "Hankook", modelo: "DL10", km_estimado: 75000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive caminhão" },
  // ── Hankook — Carro ───────────────────────────────────────────────────────
  { marca: "Hankook", modelo: "Kinergy Eco2", km_estimado: 45000, tier: "economico", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio" },

  // ── Dunlop — Caminhão ─────────────────────────────────────────────────────
  { marca: "Dunlop", modelo: "SP 344", km_estimado: 68000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — comercial caminhão" },
  // ── Dunlop — Moto ─────────────────────────────────────────────────────────
  { marca: "Dunlop", modelo: "Roadsmart IV", km_estimado: 30000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto turismo premium" },
  { marca: "Dunlop", modelo: "TT900 GP", km_estimado: 12000, tier: "economico", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto esportiva" },

  // ── Yokohama — Caminhão ───────────────────────────────────────────────────
  { marca: "Yokohama", modelo: "904R", km_estimado: 72000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — comercial caminhão" },

  // ── Kumho — Caminhão ──────────────────────────────────────────────────────
  { marca: "Kumho", modelo: "KRS03", km_estimado: 65000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — comercial caminhão" },

  // ── Cooper — Carro ────────────────────────────────────────────────────────
  { marca: "Cooper", modelo: "Discoverer SRX", km_estimado: 85000, tier: "premium", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV (ref. garantia Cooper)" },
  { marca: "Cooper", modelo: "Discoverer Rugged Trek", km_estimado: 70000, tier: "premium", vehicleType: "Carro", fonte: "Estimativa EcoPneus — all-terrain SUV" },
  { marca: "Cooper", modelo: "Endeavor", km_estimado: 75000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — touring" },
  { marca: "Cooper", modelo: "Evolution Tour", km_estimado: 65000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — touring" },
  { marca: "Cooper", modelo: "CS5 Ultra Touring", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — all-season" },
  { marca: "Cooper", modelo: "Zeon LTZ", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — truck/SUV" },

  // ── General Tire — Carro ──────────────────────────────────────────────────
  { marca: "General Tire", modelo: "AltiMAX RT45", km_estimado: 85000, tier: "premium", vehicleType: "Carro", fonte: "Estimativa EcoPneus — touring (ref. garantia General)" },
  { marca: "General Tire", modelo: "AltiMAX RT43", km_estimado: 85000, tier: "premium", vehicleType: "Carro", fonte: "Estimativa EcoPneus — touring (ref. garantia General)" },
  { marca: "General Tire", modelo: "Grabber HTS60", km_estimado: 75000, tier: "premium", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV highway" },
  { marca: "General Tire", modelo: "Grabber APT", km_estimado: 70000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — all-terrain" },
  { marca: "General Tire", modelo: "Grabber ATX", km_estimado: 70000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — all-terrain" },
  { marca: "General Tire", modelo: "G-MAX AS-05", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — ultra-high performance" },

  // ── Linglong — Carro ──────────────────────────────────────────────────────
  { marca: "Linglong", modelo: "Crosswind HP010", km_estimado: 50000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio econômico" },
  { marca: "Linglong", modelo: "Crosswind HP010 Plus", km_estimado: 50000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio econômico" },
  { marca: "Linglong", modelo: "Crosswind 4x4 HP", km_estimado: 48000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV 4x4" },
  { marca: "Linglong", modelo: "Green-Max HP010", km_estimado: 45000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio" },

  // ── Nexen — Carro ─────────────────────────────────────────────────────────
  { marca: "Nexen", modelo: "Roadian GTX", km_estimado: 80000, tier: "premium", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV (ref. garantia Nexen)" },
  { marca: "Nexen", modelo: "CP672", km_estimado: 75000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — touring" },
  { marca: "Nexen", modelo: "N'Blue HD Plus", km_estimado: 50000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio" },
  { marca: "Nexen", modelo: "Roadian HP", km_estimado: 58000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV/pickup" },
  { marca: "Nexen", modelo: "N'Priz AH8", km_estimado: 85000, tier: "premium", vehicleType: "Carro", fonte: "Estimativa EcoPneus — touring (ref. garantia Nexen)" },

  // ── Sumitomo — Caminhão ───────────────────────────────────────────────────
  { marca: "Sumitomo", modelo: "ST788 SE", km_estimado: 75000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — steer caminhão" },
  // ── Sumitomo — Carro ──────────────────────────────────────────────────────
  { marca: "Sumitomo", modelo: "HTR A/S P02", km_estimado: 70000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — all-season" },
  { marca: "Sumitomo", modelo: "HTR A/S P03", km_estimado: 70000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — all-season" },
  { marca: "Sumitomo", modelo: "HTRZ III", km_estimado: 40000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — ultra-high performance verão" },

  // ── Petlas — Caminhão ─────────────────────────────────────────────────────
  { marca: "Petlas", modelo: "Full Power PT835", km_estimado: 55000, tier: "economico", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — caminhão regional" },
  // ── Petlas — Carro ────────────────────────────────────────────────────────
  { marca: "Petlas", modelo: "Explero H/T PT431", km_estimado: 50000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV/LTR" },
  { marca: "Petlas", modelo: "Elegant PT311", km_estimado: 42000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio" },

  // ── Roadstone — Carro ─────────────────────────────────────────────────────
  { marca: "Roadstone", modelo: "CP672", km_estimado: 75000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — touring (Roadstone/Nexen)" },
  { marca: "Roadstone", modelo: "N8000", km_estimado: 38000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — performance verão" },
  { marca: "Roadstone", modelo: "Roadian HP", km_estimado: 58000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV" },

  // ── Triangle — Carro ──────────────────────────────────────────────────────
  { marca: "Triangle", modelo: "TR918", km_estimado: 48000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio all-season" },
  { marca: "Triangle", modelo: "TR257", km_estimado: 52000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV highway" },
  { marca: "Triangle", modelo: "TR652", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — comercial leve" },

  // ── Fury — Caminhão ───────────────────────────────────────────────────────
  { marca: "Fury", modelo: "ST4000", km_estimado: 60000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — caminhão steer" },
  { marca: "Fury", modelo: "DR4000", km_estimado: 60000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — caminhão drive" },

  // ── Maggion — Caminhão ────────────────────────────────────────────────────
  { marca: "Maggion", modelo: "Estrada 1000", km_estimado: 55000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — caminhão regional" },
  { marca: "Maggion", modelo: "Rodo 1000", km_estimado: 60000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — caminhão longa distância" },

  // ── Multi B — Caminhão ────────────────────────────────────────────────────
  { marca: "Multi B", modelo: "Serviço 1000", km_estimado: 45000, tier: "economico", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — caminhão urbano" },
  { marca: "Multi B", modelo: "Rodo 900", km_estimado: 50000, tier: "economico", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — caminhão rodoviário" },

  // ── Radar — Carro ─────────────────────────────────────────────────────────
  { marca: "Radar", modelo: "Dimax R8+", km_estimado: 48000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV all-terrain" },
  { marca: "Radar", modelo: "Rivera Pro 2", km_estimado: 52000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio all-season" },
  { marca: "Radar", modelo: "Renegade R/T+", km_estimado: 45000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — truck/SUV" },

  // ── Riken — Carro ─────────────────────────────────────────────────────────
  { marca: "Riken", modelo: "Road Performance", km_estimado: 50000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio" },
  { marca: "Riken", modelo: "Cargo Speed", km_estimado: 58000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — comercial leve" },
  { marca: "Riken", modelo: "Ultrac", km_estimado: 42000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — performance" },

  // ── Toyomoto — Carro ──────────────────────────────────────────────────────
  { marca: "Toyomoto", modelo: "Forca", km_estimado: 40000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio" },
  { marca: "Toyomoto", modelo: "Dynamic", km_estimado: 45000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio/SUV" },

  // ── Levorin — Moto ────────────────────────────────────────────────────────
  { marca: "Levorin", modelo: "Formador H/F", km_estimado: 15000, tier: "economico", vehicleType: "Moto", fonte: "Estimativa EcoPneus — moto urbana nacional" },
  { marca: "Levorin", modelo: "Dual Sport", km_estimado: 18000, tier: "economico", vehicleType: "Moto", fonte: "Estimativa EcoPneus — moto trail nacional" },

  // ── Metzeler — Moto ───────────────────────────────────────────────────────
  { marca: "Metzeler", modelo: "Roadtec 01", km_estimado: 28000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto turismo premium" },
  { marca: "Metzeler", modelo: "Tourance Next 2", km_estimado: 25000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto adventure premium" },
];

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

type IndexedEntry = TireSpecEntry & { marcaKey: string; modeloKey: string };

const INDEXED: IndexedEntry[] = TIRE_SPECS_CATALOG.map((entry) => ({
  ...entry,
  marcaKey: normalizeKey(entry.marca),
  modeloKey: normalizeKey(entry.modelo),
}));

/** Fabricantes que possuem pelo menos um modelo para o tipo de veículo. */
export function getBrandsForVehicleType(vehicleType: string): string[] {
  const brands = new Set(
    INDEXED.filter((e) => e.vehicleType === vehicleType).map((e) => e.marca)
  );
  return [...brands].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export type GroupedModels = Record<TireQualityTier, string[]>;

/** Modelos agrupados por linha (tier), filtrados por vehicleType e opcionalmente por fabricante. */
export function getModelsGroupedByTier(vehicleType: string, brand = ""): GroupedModels {
  const brandKey = normalizeKey(brand);
  const pool = INDEXED.filter(
    (e) => e.vehicleType === vehicleType && (!brandKey || e.marcaKey === brandKey)
  );

  const groups: GroupedModels = { economico: [], intermediario: [], premium: [] };
  const seen = new Set<string>();

  for (const tier of ["economico", "intermediario", "premium"] as TireQualityTier[]) {
    for (const e of pool.filter((x) => x.tier === tier)) {
      if (!seen.has(e.modelo)) {
        seen.add(e.modelo);
        groups[tier].push(e.modelo);
      }
    }
    groups[tier].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  return groups;
}

/** Modelos do catálogo para autocomplete, filtrados por fabricante e opcionalmente por vehicleType. */
export function getModelsForBrand(brand: string, vehicleType?: string): string[] {
  const brandKey = normalizeKey(brand);
  const models = INDEXED
    .filter(
      (e) =>
        (!brandKey || e.marcaKey === brandKey) &&
        (!vehicleType || e.vehicleType === vehicleType)
    )
    .map((e) => e.modelo);
  return [...new Set(models)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function findExact(brandKey: string, modelKey: string): TireSpecEntry | null {
  if (brandKey) {
    const hit = INDEXED.find((e) => e.marcaKey === brandKey && e.modeloKey === modelKey);
    return hit ?? null;
  }
  const hits = INDEXED.filter((e) => e.modeloKey === modelKey);
  return hits.length === 1 ? hits[0] : null;
}

function findPartial(brandKey: string, modelKey: string): TireSpecEntry | null {
  const pool = brandKey ? INDEXED.filter((e) => e.marcaKey === brandKey) : INDEXED;
  const partial = pool.filter(
    (e) => e.modeloKey.includes(modelKey) || modelKey.includes(e.modeloKey)
  );
  if (partial.length === 1) return partial[0];
  return null;
}

function lookupCatalog(brand: string, model: string): TireLifespanResult | null {
  const entry = findCatalogEntry(brand, model);
  if (!entry) return null;
  return {
    km_estimado: entry.km_estimado,
    fonte: entry.fonte,
    origem: "catalogo",
    tier: entry.tier,
  };
}

/** Entrada exata ou parcial do catálogo local (marca + modelo). */
export function findCatalogEntry(brand: string, model: string): TireSpecEntry | null {
  const modelKey = normalizeKey(model);
  if (!modelKey) return null;

  const brandKey = normalizeKey(brand);
  return findExact(brandKey, modelKey) ?? findPartial(brandKey, modelKey);
}

/**
 * Resolve vida útil estimada: catálogo local → faixa (tier) do veículo.
 */
export function resolveTireLifespanKm(
  model: string,
  brand = "",
  tier: TireQualityTier = "intermediario"
): TireLifespanResult {
  const trimmed = model.trim();
  if (!trimmed) return { km_estimado: null, fonte: null };

  const fromCatalog = lookupCatalog(brand, trimmed);
  if (fromCatalog) return fromCatalog;

  const km = TIER_LIFE_KM[tier] ?? TIER_LIFE_KM.intermediario;
  return {
    km_estimado: km,
    fonte: `Referência faixa ${TIER_LABEL[tier]} (~${km.toLocaleString("pt-BR")} km) — EcoPneus`,
    origem: "tier",
  };
}
