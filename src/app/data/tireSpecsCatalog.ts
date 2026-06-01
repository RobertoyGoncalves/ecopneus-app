import type { TireQualityTier } from "../domain/wearModel";

export type TireSpecEntry = {
  marca: string;
  modelo: string;
  km_estimado: number;
  tier: TireQualityTier;
  fonte: string;
};

export type TireLifespanResult = {
  km_estimado: number | null;
  fonte: string | null;
  origem?: "catalogo" | "tier";
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
  // ── Michelin ─────────────────────────────────────────────────────────────
  { marca: "Michelin", modelo: "X Multi Z", km_estimado: 85000, tier: "premium", fonte: "Catálogo EcoPneus — longa distância caminhão" },
  { marca: "Michelin", modelo: "X Multi D", km_estimado: 90000, tier: "premium", fonte: "Catálogo EcoPneus — longa distância caminhão" },
  { marca: "Michelin", modelo: "XZA2+", km_estimado: 80000, tier: "premium", fonte: "Catálogo EcoPneus — regional caminhão" },
  { marca: "Michelin", modelo: "X Line Energy", km_estimado: 90000, tier: "premium", fonte: "Catálogo EcoPneus — eficiência energética" },
  { marca: "Michelin", modelo: "Agilis 3", km_estimado: 55000, tier: "intermediario", fonte: "Catálogo EcoPneus — comercial leve" },
  { marca: "Michelin", modelo: "Primacy 4", km_estimado: 60000, tier: "intermediario", fonte: "Catálogo EcoPneus — passeio" },
  { marca: "Michelin", modelo: "Pilot Sport 4", km_estimado: 40000, tier: "premium", fonte: "Catálogo EcoPneus — performance (desgaste mais rápido)" },

  // ── Bridgestone ──────────────────────────────────────────────────────────
  { marca: "Bridgestone", modelo: "R268", km_estimado: 80000, tier: "premium", fonte: "Catálogo EcoPneus — regional caminhão" },
  { marca: "Bridgestone", modelo: "R250", km_estimado: 75000, tier: "premium", fonte: "Catálogo EcoPneus — caminhão" },
  { marca: "Bridgestone", modelo: "M788", km_estimado: 70000, tier: "intermediario", fonte: "Catálogo EcoPneus — urbano" },
  { marca: "Bridgestone", modelo: "Ecopia H/L 422", km_estimado: 55000, tier: "intermediario", fonte: "Catálogo EcoPneus — SUV" },

  // ── Goodyear ─────────────────────────────────────────────────────────────
  { marca: "Goodyear", modelo: "KMAX S", km_estimado: 82000, tier: "premium", fonte: "Catálogo EcoPneus — steer caminhão" },
  { marca: "Goodyear", modelo: "KMAX D", km_estimado: 85000, tier: "premium", fonte: "Catálogo EcoPneus — drive caminhão" },
  { marca: "Goodyear", modelo: "Cargo Marathon 2", km_estimado: 70000, tier: "intermediario", fonte: "Catálogo EcoPneus — comercial" },
  { marca: "Goodyear", modelo: "EfficientGrip Performance", km_estimado: 50000, tier: "intermediario", fonte: "Catálogo EcoPneus — passeio" },

  // ── Pirelli ──────────────────────────────────────────────────────────────
  { marca: "Pirelli", modelo: "FH:01", km_estimado: 78000, tier: "premium", fonte: "Catálogo EcoPneus — steer caminhão" },
  { marca: "Pirelli", modelo: "FR:01", km_estimado: 80000, tier: "premium", fonte: "Catálogo EcoPneus — drive caminhão" },
  { marca: "Pirelli", modelo: "Formula Evo", km_estimado: 45000, tier: "economico", fonte: "Catálogo EcoPneus — passeio" },
  { marca: "Pirelli", modelo: "Cinturato P7", km_estimado: 55000, tier: "intermediario", fonte: "Catálogo EcoPneus — passeio" },

  // ── Continental ──────────────────────────────────────────────────────────
  { marca: "Continental", modelo: "HSR2", km_estimado: 80000, tier: "premium", fonte: "Catálogo EcoPneus — regional caminhão" },
  { marca: "Continental", modelo: "HDR2", km_estimado: 82000, tier: "premium", fonte: "Catálogo EcoPneus — drive caminhão" },
  { marca: "Continental", modelo: "ContiCrossContact", km_estimado: 50000, tier: "intermediario", fonte: "Catálogo EcoPneus — SUV" },

  // ── Firestone ────────────────────────────────────────────────────────────
  { marca: "Firestone", modelo: "FS561", km_estimado: 65000, tier: "intermediario", fonte: "Catálogo EcoPneus — caminhão" },
  { marca: "Firestone", modelo: "FS400", km_estimado: 60000, tier: "intermediario", fonte: "Catálogo EcoPneus — caminhão" },

  // ── Hankook ──────────────────────────────────────────────────────────────
  { marca: "Hankook", modelo: "AH31", km_estimado: 70000, tier: "intermediario", fonte: "Catálogo EcoPneus — comercial" },
  { marca: "Hankook", modelo: "DL10", km_estimado: 75000, tier: "premium", fonte: "Catálogo EcoPneus — drive caminhão" },
  { marca: "Hankook", modelo: "Kinergy Eco2", km_estimado: 45000, tier: "economico", fonte: "Catálogo EcoPneus — passeio" },

  // ── Dunlop / Yokohama / Kumho ────────────────────────────────────────────
  { marca: "Dunlop", modelo: "SP 344", km_estimado: 68000, tier: "intermediario", fonte: "Catálogo EcoPneus — comercial" },
  { marca: "Yokohama", modelo: "904R", km_estimado: 72000, tier: "intermediario", fonte: "Catálogo EcoPneus — comercial" },
  { marca: "Kumho", modelo: "KRS03", km_estimado: 65000, tier: "intermediario", fonte: "Catálogo EcoPneus — comercial" },

  // ── Cooper (ajustado: garantia US reduzida ~25% para uso BR) ─────────────
  { marca: "Cooper", modelo: "Discoverer SRX", km_estimado: 85000, tier: "premium", fonte: "Estimativa EcoPneus — SUV (ref. garantia Cooper)" },
  { marca: "Cooper", modelo: "Discoverer Rugged Trek", km_estimado: 70000, tier: "premium", fonte: "Estimativa EcoPneus — all-terrain SUV" },
  { marca: "Cooper", modelo: "Endeavor", km_estimado: 75000, tier: "intermediario", fonte: "Estimativa EcoPneus — touring" },
  { marca: "Cooper", modelo: "Evolution Tour", km_estimado: 65000, tier: "intermediario", fonte: "Estimativa EcoPneus — touring" },
  { marca: "Cooper", modelo: "CS5 Ultra Touring", km_estimado: 60000, tier: "intermediario", fonte: "Estimativa EcoPneus — all-season" },
  { marca: "Cooper", modelo: "Zeon LTZ", km_estimado: 60000, tier: "intermediario", fonte: "Estimativa EcoPneus — truck/SUV" },

  // ── General Tire ──────────────────────────────────────────────────────────
  { marca: "General Tire", modelo: "AltiMAX RT45", km_estimado: 85000, tier: "premium", fonte: "Estimativa EcoPneus — touring (ref. garantia General)" },
  { marca: "General Tire", modelo: "AltiMAX RT43", km_estimado: 85000, tier: "premium", fonte: "Estimativa EcoPneus — touring (ref. garantia General)" },
  { marca: "General Tire", modelo: "Grabber HTS60", km_estimado: 75000, tier: "premium", fonte: "Estimativa EcoPneus — SUV highway" },
  { marca: "General Tire", modelo: "Grabber APT", km_estimado: 70000, tier: "intermediario", fonte: "Estimativa EcoPneus — all-terrain" },
  { marca: "General Tire", modelo: "Grabber ATX", km_estimado: 70000, tier: "intermediario", fonte: "Estimativa EcoPneus — all-terrain" },
  { marca: "General Tire", modelo: "G-MAX AS-05", km_estimado: 60000, tier: "intermediario", fonte: "Estimativa EcoPneus — ultra-high performance" },

  // ── Linglong (faixa econômica — valores conservadores) ───────────────────
  { marca: "Linglong", modelo: "Crosswind HP010", km_estimado: 50000, tier: "economico", fonte: "Estimativa EcoPneus — passeio econômico" },
  { marca: "Linglong", modelo: "Crosswind HP010 Plus", km_estimado: 50000, tier: "economico", fonte: "Estimativa EcoPneus — passeio econômico" },
  { marca: "Linglong", modelo: "Crosswind 4x4 HP", km_estimado: 48000, tier: "economico", fonte: "Estimativa EcoPneus — SUV 4x4" },
  { marca: "Linglong", modelo: "Green-Max HP010", km_estimado: 45000, tier: "economico", fonte: "Estimativa EcoPneus — passeio" },

  // ── Nexen ─────────────────────────────────────────────────────────────────
  { marca: "Nexen", modelo: "Roadian GTX", km_estimado: 80000, tier: "premium", fonte: "Estimativa EcoPneus — SUV (ref. garantia Nexen)" },
  { marca: "Nexen", modelo: "CP672", km_estimado: 75000, tier: "intermediario", fonte: "Estimativa EcoPneus — touring" },
  { marca: "Nexen", modelo: "N'Blue HD Plus", km_estimado: 50000, tier: "economico", fonte: "Estimativa EcoPneus — passeio" },
  { marca: "Nexen", modelo: "Roadian HP", km_estimado: 58000, tier: "intermediario", fonte: "Estimativa EcoPneus — SUV/pickup" },
  { marca: "Nexen", modelo: "N'Priz AH8", km_estimado: 85000, tier: "premium", fonte: "Estimativa EcoPneus — touring (ref. garantia Nexen)" },

  // ── Sumitomo ──────────────────────────────────────────────────────────────
  { marca: "Sumitomo", modelo: "HTR A/S P02", km_estimado: 70000, tier: "intermediario", fonte: "Estimativa EcoPneus — all-season" },
  { marca: "Sumitomo", modelo: "HTR A/S P03", km_estimado: 70000, tier: "intermediario", fonte: "Estimativa EcoPneus — all-season" },
  { marca: "Sumitomo", modelo: "ST788 SE", km_estimado: 75000, tier: "intermediario", fonte: "Estimativa EcoPneus — steer caminhão" },
  { marca: "Sumitomo", modelo: "HTRZ III", km_estimado: 40000, tier: "intermediario", fonte: "Estimativa EcoPneus — ultra-high performance verão" },

  // ── Petlas ────────────────────────────────────────────────────────────────
  { marca: "Petlas", modelo: "Explero H/T PT431", km_estimado: 50000, tier: "economico", fonte: "Estimativa EcoPneus — SUV/LTR" },
  { marca: "Petlas", modelo: "Full Power PT835", km_estimado: 55000, tier: "economico", fonte: "Estimativa EcoPneus — caminhão regional" },
  { marca: "Petlas", modelo: "Elegant PT311", km_estimado: 42000, tier: "economico", fonte: "Estimativa EcoPneus — passeio" },

  // ── Roadstone (Nexen) ─────────────────────────────────────────────────────
  { marca: "Roadstone", modelo: "CP672", km_estimado: 75000, tier: "intermediario", fonte: "Estimativa EcoPneus — touring (Roadstone/Nexen)" },
  { marca: "Roadstone", modelo: "N8000", km_estimado: 38000, tier: "intermediario", fonte: "Estimativa EcoPneus — performance verão" },
  { marca: "Roadstone", modelo: "Roadian HP", km_estimado: 58000, tier: "intermediario", fonte: "Estimativa EcoPneus — SUV" },

  // ── Triangle ──────────────────────────────────────────────────────────────
  { marca: "Triangle", modelo: "TR918", km_estimado: 48000, tier: "economico", fonte: "Estimativa EcoPneus — passeio all-season" },
  { marca: "Triangle", modelo: "TR257", km_estimado: 52000, tier: "economico", fonte: "Estimativa EcoPneus — SUV highway" },
  { marca: "Triangle", modelo: "TR652", km_estimado: 60000, tier: "intermediario", fonte: "Estimativa EcoPneus — comercial leve" },

  // ── Fury (nacional) ───────────────────────────────────────────────────────
  { marca: "Fury", modelo: "ST4000", km_estimado: 60000, tier: "intermediario", fonte: "Estimativa EcoPneus — caminhão steer" },
  { marca: "Fury", modelo: "DR4000", km_estimado: 60000, tier: "intermediario", fonte: "Estimativa EcoPneus — caminhão drive" },

  // ── Maggion (nacional) ────────────────────────────────────────────────────
  { marca: "Maggion", modelo: "Estrada 1000", km_estimado: 55000, tier: "intermediario", fonte: "Estimativa EcoPneus — caminhão regional" },
  { marca: "Maggion", modelo: "Rodo 1000", km_estimado: 60000, tier: "intermediario", fonte: "Estimativa EcoPneus — caminhão longa distância" },

  // ── Multi B (nacional) ────────────────────────────────────────────────────
  { marca: "Multi B", modelo: "Serviço 1000", km_estimado: 45000, tier: "economico", fonte: "Estimativa EcoPneus — caminhão urbano" },
  { marca: "Multi B", modelo: "Rodo 900", km_estimado: 50000, tier: "economico", fonte: "Estimativa EcoPneus — caminhão rodoviário" },

  // ── Radar ─────────────────────────────────────────────────────────────────
  { marca: "Radar", modelo: "Dimax R8+", km_estimado: 48000, tier: "economico", fonte: "Estimativa EcoPneus — SUV all-terrain" },
  { marca: "Radar", modelo: "Rivera Pro 2", km_estimado: 52000, tier: "economico", fonte: "Estimativa EcoPneus — passeio all-season" },
  { marca: "Radar", modelo: "Renegade R/T+", km_estimado: 45000, tier: "economico", fonte: "Estimativa EcoPneus — truck/SUV" },

  // ── Riken (grupo Michelin) ────────────────────────────────────────────────
  { marca: "Riken", modelo: "Road Performance", km_estimado: 50000, tier: "economico", fonte: "Estimativa EcoPneus — passeio" },
  { marca: "Riken", modelo: "Cargo Speed", km_estimado: 58000, tier: "intermediario", fonte: "Estimativa EcoPneus — comercial leve" },
  { marca: "Riken", modelo: "Ultrac", km_estimado: 42000, tier: "economico", fonte: "Estimativa EcoPneus — performance" },

  // ── Toyomoto ──────────────────────────────────────────────────────────────
  { marca: "Toyomoto", modelo: "Forca", km_estimado: 40000, tier: "economico", fonte: "Estimativa EcoPneus — passeio" },
  { marca: "Toyomoto", modelo: "Dynamic", km_estimado: 45000, tier: "economico", fonte: "Estimativa EcoPneus — passeio/SUV" },
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

/** Modelos do catálogo para autocomplete, filtrados por fabricante. */
export function getModelsForBrand(brand: string): string[] {
  const brandKey = normalizeKey(brand);
  const models = INDEXED.filter((e) => !brandKey || e.marcaKey === brandKey).map((e) => e.modelo);
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
  const modelKey = normalizeKey(model);
  if (!modelKey) return null;

  const brandKey = normalizeKey(brand);

  const exact = findExact(brandKey, modelKey);
  if (exact) {
    return { km_estimado: exact.km_estimado, fonte: exact.fonte, origem: "catalogo" };
  }

  const partial = findPartial(brandKey, modelKey);
  if (partial) {
    return { km_estimado: partial.km_estimado, fonte: partial.fonte, origem: "catalogo" };
  }

  return null;
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
