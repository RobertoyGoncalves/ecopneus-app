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
  { marca: "Metzeler", modelo: "Karoo 3", km_estimado: 22000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto adventure" },
  { marca: "Metzeler", modelo: "Sportec M9 RR", km_estimado: 12000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto esportiva (desgaste rápido)" },
  { marca: "Metzeler", modelo: "ME 888 Marathon Ultra", km_estimado: 35000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto custom cruiser" },

  // ── Michelin — Carro (expansão) ───────────────────────────────────────────
  { marca: "Michelin", modelo: "CrossClimate 2", km_estimado: 65000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — all-season premium" },
  { marca: "Michelin", modelo: "Energy XM2+", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio econômico" },
  { marca: "Michelin", modelo: "Defender", km_estimado: 80000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring longa duração" },
  { marca: "Michelin", modelo: "Latitude Tour HP", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV highway" },
  { marca: "Michelin", modelo: "LTX Trail", km_estimado: 70000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },
  { marca: "Michelin", modelo: "Pilot Sport 5", km_estimado: 42000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "Michelin", modelo: "e.Primacy", km_estimado: 70000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — elétrico/híbrido" },

  // ── Michelin — Caminhão (expansão) ────────────────────────────────────────
  { marca: "Michelin", modelo: "X Works", km_estimado: 75000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — construção/mineração" },
  { marca: "Michelin", modelo: "X Works D", km_estimado: 78000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive off-road" },
  { marca: "Michelin", modelo: "XZE2", km_estimado: 82000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer regional" },
  { marca: "Michelin", modelo: "XDY", km_estimado: 88000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive longa distância" },

  // ── Michelin — Moto (expansão) ──────────────────────────────────────────────
  { marca: "Michelin", modelo: "Commander III", km_estimado: 32000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto custom cruiser" },
  { marca: "Michelin", modelo: "Power 5", km_estimado: 14000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto esportiva" },
  { marca: "Michelin", modelo: "City Grip 2", km_estimado: 18000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — scooter/urbana" },
  { marca: "Michelin", modelo: "Anakee Wild", km_estimado: 20000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto adventure" },

  // ── Bridgestone — Carro (expansão) ────────────────────────────────────────
  { marca: "Bridgestone", modelo: "Turanza T005", km_estimado: 65000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring premium" },
  { marca: "Bridgestone", modelo: "Potenza RE760 Sport", km_estimado: 45000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "Bridgestone", modelo: "Dueler H/P Sport", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV highway" },
  { marca: "Bridgestone", modelo: "Ecopia EP150", km_estimado: 50000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio eficiência" },
  { marca: "Bridgestone", modelo: "Atenza RE004", km_estimado: 48000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — performance verão" },
  { marca: "Bridgestone", modelo: "Blizzak LM005", km_estimado: 40000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — inverno" },
  { marca: "Bridgestone", modelo: "Alenza 001", km_estimado: 60000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV premium" },

  // ── Bridgestone — Caminhão (expansão) ─────────────────────────────────────
  { marca: "Bridgestone", modelo: "M729", km_estimado: 72000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — urbano caminhão" },
  { marca: "Bridgestone", modelo: "M710 Ecopia", km_estimado: 85000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — longa distância" },
  { marca: "Bridgestone", modelo: "R192", km_estimado: 78000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer regional" },
  { marca: "Bridgestone", modelo: "R294", km_estimado: 82000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive regional" },

  // ── Bridgestone — Moto (expansão) ─────────────────────────────────────────
  { marca: "Bridgestone", modelo: "Battlax BT45", km_estimado: 20000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto turismo" },
  { marca: "Bridgestone", modelo: "Battlax Adventure A41", km_estimado: 24000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto adventure" },
  { marca: "Bridgestone", modelo: "Battlax Hypersport S22", km_estimado: 10000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto esportiva (desgaste rápido)" },

  // ── Goodyear — Carro (expansão) ───────────────────────────────────────────
  { marca: "Goodyear", modelo: "Assurance MaxLife", km_estimado: 75000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring longa duração" },
  { marca: "Goodyear", modelo: "Eagle F1 Asymmetric 6", km_estimado: 42000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "Goodyear", modelo: "Wrangler All-Terrain Adventure", km_estimado: 65000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },
  { marca: "Goodyear", modelo: "Vector 4Seasons Gen-3", km_estimado: 58000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — all-season" },
  { marca: "Goodyear", modelo: "EfficientGrip 2 SUV", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV" },
  { marca: "Goodyear", modelo: "Cargo Ultra Grip", km_estimado: 50000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — comercial leve inverno" },

  // ── Goodyear — Caminhão (expansão) ──────────────────────────────────────────
  { marca: "Goodyear", modelo: "Fuel Max S", km_estimado: 88000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer longa distância" },
  { marca: "Goodyear", modelo: "OMNITRAC MSS II", km_estimado: 80000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — misto on/off-road" },
  { marca: "Goodyear", modelo: "Marathon LHD II", km_estimado: 75000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — urbano caminhão" },

  // ── Pirelli — Carro (expansão) ──────────────────────────────────────────────
  { marca: "Pirelli", modelo: "P Zero", km_estimado: 40000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "Pirelli", modelo: "Scorpion Verde All Season", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-season" },
  { marca: "Pirelli", modelo: "Cinturato P1", km_estimado: 48000, tier: "economico", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio econômico" },
  { marca: "Pirelli", modelo: "Cinturato All Season SF2", km_estimado: 62000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — all-season" },
  { marca: "Pirelli", modelo: "Scorpion ATR", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },
  { marca: "Pirelli", modelo: "P Zero Rosso", km_estimado: 38000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — performance verão" },

  // ── Pirelli — Caminhão (expansão) ─────────────────────────────────────────
  { marca: "Pirelli", modelo: "ST01", km_estimado: 76000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer caminhão" },
  { marca: "Pirelli", modelo: "TR01", km_estimado: 78000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — trailer caminhão" },

  // ── Pirelli — Moto (expansão) ───────────────────────────────────────────────
  { marca: "Pirelli", modelo: "Diablo Rosso IV", km_estimado: 12000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto esportiva" },
  { marca: "Pirelli", modelo: "Angel City", km_estimado: 16000, tier: "economico", vehicleType: "Moto", fonte: "Catálogo EcoPneus — scooter/urbana" },
  { marca: "Pirelli", modelo: "Night Dragon", km_estimado: 28000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto custom cruiser" },
  { marca: "Pirelli", modelo: "Scorpion Rally STR", km_estimado: 18000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto adventure" },

  // ── Continental — Carro (expansão) ────────────────────────────────────────
  { marca: "Continental", modelo: "PremiumContact 6", km_estimado: 60000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring premium" },
  { marca: "Continental", modelo: "EcoContact 6", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio eficiência" },
  { marca: "Continental", modelo: "CrossContact LX2", km_estimado: 58000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV highway" },
  { marca: "Continental", modelo: "SportContact 7", km_estimado: 40000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "Continental", modelo: "AllSeasonContact", km_estimado: 62000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — all-season" },
  { marca: "Continental", modelo: "VanContact Ultra", km_estimado: 65000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — van/comercial leve" },

  // ── Continental — Caminhão (expansão) ───────────────────────────────────────
  { marca: "Continental", modelo: "HSC2", km_estimado: 78000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer regional" },
  { marca: "Continental", modelo: "HDC1", km_estimado: 80000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive regional" },
  { marca: "Continental", modelo: "Conti Hybrid HS5", km_estimado: 85000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer longa distância" },

  // ── Continental — Moto (expansão) ───────────────────────────────────────────
  { marca: "Continental", modelo: "ContiTrailAttack 2", km_estimado: 20000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto adventure" },
  { marca: "Continental", modelo: "ContiAttack SM", km_estimado: 10000, tier: "premium", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto esportiva" },
  { marca: "Continental", modelo: "ContiScoot", km_estimado: 14000, tier: "economico", vehicleType: "Moto", fonte: "Catálogo EcoPneus — scooter" },

  // ── Firestone — Carro (expansão) ──────────────────────────────────────────────
  { marca: "Firestone", modelo: "F-590", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring" },
  { marca: "Firestone", modelo: "Destination LE3", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV highway" },
  { marca: "Firestone", modelo: "Destination A/T2", km_estimado: 65000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },

  // ── Firestone — Caminhão (expansão) ─────────────────────────────────────────
  { marca: "Firestone", modelo: "FD663", km_estimado: 68000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer caminhão" },
  { marca: "Firestone", modelo: "FS595", km_estimado: 70000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive caminhão" },

  // ── Hankook — Carro (expansão) ──────────────────────────────────────────────
  { marca: "Hankook", modelo: "Ventus Prime 4", km_estimado: 58000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring" },
  { marca: "Hankook", modelo: "Ventus S1 evo3", km_estimado: 42000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "Hankook", modelo: "Dynapro HP2", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV highway" },
  { marca: "Hankook", modelo: "Dynapro AT2", km_estimado: 62000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },
  { marca: "Hankook", modelo: "Optimo H724", km_estimado: 50000, tier: "economico", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio" },
  { marca: "Hankook", modelo: "Kinergy 4S2", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — all-season" },

  // ── Hankook — Caminhão (expansão) ───────────────────────────────────────────
  { marca: "Hankook", modelo: "DH31", km_estimado: 76000, tier: "premium", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive caminhão" },
  { marca: "Hankook", modelo: "TH31", km_estimado: 74000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — trailer caminhão" },
  { marca: "Hankook", modelo: "AM09", km_estimado: 70000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — misto on/off-road" },

  // ── Dunlop — Carro (expansão) ───────────────────────────────────────────────
  { marca: "Dunlop", modelo: "SP Sport Maxx 050+", km_estimado: 45000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "Dunlop", modelo: "Grandtrek PT3", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV highway" },
  { marca: "Dunlop", modelo: "SP Winter Sport 5", km_estimado: 40000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — inverno" },

  // ── Dunlop — Caminhão (expansão) ────────────────────────────────────────────
  { marca: "Dunlop", modelo: "SP 828", km_estimado: 70000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer caminhão" },

  // ── Dunlop — Moto (expansão) ──────────────────────────────────────────────────
  { marca: "Dunlop", modelo: "Geomax MX53", km_estimado: 8000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto off-road" },
  { marca: "Dunlop", modelo: "Trailmax Mission", km_estimado: 22000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto adventure" },

  // ── Yokohama — Carro (expansão) ───────────────────────────────────────────────
  { marca: "Yokohama", modelo: "Advan Sport V105", km_estimado: 42000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "Yokohama", modelo: "BluEarth-GT AE51", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring" },
  { marca: "Yokohama", modelo: "Geolandar G055", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV highway" },
  { marca: "Yokohama", modelo: "Geolandar A/T G015", km_estimado: 65000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },

  // ── Yokohama — Caminhão (expansão) ────────────────────────────────────────────
  { marca: "Yokohama", modelo: "124R", km_estimado: 74000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer caminhão" },
  { marca: "Yokohama", modelo: "TY517", km_estimado: 76000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive caminhão" },

  // ── Kumho — Carro (expansão) ──────────────────────────────────────────────────
  { marca: "Kumho", modelo: "Ecsta PS71", km_estimado: 42000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "Kumho", modelo: "Solus TA71", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring" },
  { marca: "Kumho", modelo: "Crugen HP71", km_estimado: 52000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV highway" },
  { marca: "Kumho", modelo: "Road Venture AT51", km_estimado: 60000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },

  // ── Kumho — Caminhão (expansão) ───────────────────────────────────────────────
  { marca: "Kumho", modelo: "KRD50", km_estimado: 70000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive caminhão" },
  { marca: "Kumho", modelo: "KLS11", km_estimado: 68000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — steer caminhão" },

  // ── BF Goodrich — Carro ───────────────────────────────────────────────────────
  { marca: "BF Goodrich", modelo: "All-Terrain T/A KO2", km_estimado: 70000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain premium" },
  { marca: "BF Goodrich", modelo: "Advantage T/A Sport", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring" },
  { marca: "BF Goodrich", modelo: "g-Force Sport Comp-2", km_estimado: 38000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — ultra-high performance" },
  { marca: "BF Goodrich", modelo: "Trail-Terrain T/A", km_estimado: 65000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },

  // ── BF Goodrich — Caminhão ────────────────────────────────────────────────────
  { marca: "BF Goodrich", modelo: "DR 450", km_estimado: 72000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Catálogo EcoPneus — drive caminhão" },

  // ── Barum — Carro ─────────────────────────────────────────────────────────────
  { marca: "Barum", modelo: "Bravuris 5HM", km_estimado: 50000, tier: "economico", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio econômico" },
  { marca: "Barum", modelo: "Polaris 5", km_estimado: 55000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring" },
  { marca: "Barum", modelo: "Quartaris 5", km_estimado: 48000, tier: "economico", vehicleType: "Carro", fonte: "Catálogo EcoPneus — all-season econômico" },

  // ── Nokian — Carro ────────────────────────────────────────────────────────────
  { marca: "Nokian", modelo: "Seasonproof 1", km_estimado: 65000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — all-season premium" },
  { marca: "Nokian", modelo: "WR Snowproof P", km_estimado: 50000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — inverno" },
  { marca: "Nokian", modelo: "Hakkapeliitta R5", km_estimado: 45000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — inverno extremo" },
  { marca: "Nokian", modelo: "Outpost AT", km_estimado: 68000, tier: "premium", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },

  // ── Maxxis — Carro ────────────────────────────────────────────────────────────
  { marca: "Maxxis", modelo: "Bravo HP-M3", km_estimado: 48000, tier: "economico", vehicleType: "Carro", fonte: "Catálogo EcoPneus — passeio" },
  { marca: "Maxxis", modelo: "Premitra HP5", km_estimado: 52000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — touring" },
  { marca: "Maxxis", modelo: "Victra Sport VS5", km_estimado: 40000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — performance verão" },
  { marca: "Maxxis", modelo: "AT980", km_estimado: 58000, tier: "intermediario", vehicleType: "Carro", fonte: "Catálogo EcoPneus — SUV all-terrain" },

  // ── Maxxis — Moto ─────────────────────────────────────────────────────────────
  { marca: "Maxxis", modelo: "MA-ST3", km_estimado: 18000, tier: "intermediario", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto turismo" },
  { marca: "Maxxis", modelo: "M6024", km_estimado: 8000, tier: "economico", vehicleType: "Moto", fonte: "Catálogo EcoPneus — moto off-road" },

  // ── Westlake — Carro ──────────────────────────────────────────────────────────
  { marca: "Westlake", modelo: "RP18", km_estimado: 42000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio econômico" },
  { marca: "Westlake", modelo: "SU318", km_estimado: 45000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV econômico" },
  { marca: "Westlake", modelo: "SL369", km_estimado: 48000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV all-terrain econômico" },

  // ── Apollo — Carro ────────────────────────────────────────────────────────────
  { marca: "Apollo", modelo: "Alnac 4G", km_estimado: 50000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio" },
  { marca: "Apollo", modelo: "Amazer 4G Life", km_estimado: 48000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio longa duração" },
  { marca: "Apollo", modelo: "Apterra HP", km_estimado: 52000, tier: "intermediario", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV highway" },

  // ── Aeolus — Carro ────────────────────────────────────────────────────────────
  { marca: "Aeolus", modelo: "PrecisionAce AG02", km_estimado: 45000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio" },
  { marca: "Aeolus", modelo: "CrossAce AT01", km_estimado: 50000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — SUV all-terrain" },

  // ── Fiorano — Carro ───────────────────────────────────────────────────────────
  { marca: "Fiorano", modelo: "Supermax", km_estimado: 38000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio econômico nacional" },
  { marca: "Fiorano", modelo: "Ecovision", km_estimado: 40000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio econômico nacional" },
  { marca: "Fiorano", modelo: "Aro 15", km_estimado: 42000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio econômico nacional" },

  // ── IRC — Moto ────────────────────────────────────────────────────────────────
  { marca: "IRC", modelo: "Road Winner", km_estimado: 16000, tier: "economico", vehicleType: "Moto", fonte: "Estimativa EcoPneus — moto urbana nacional" },
  { marca: "IRC", modelo: "RX-01", km_estimado: 12000, tier: "economico", vehicleType: "Moto", fonte: "Estimativa EcoPneus — moto off-road" },
  { marca: "IRC", modelo: "Tirex", km_estimado: 18000, tier: "intermediario", vehicleType: "Moto", fonte: "Estimativa EcoPneus — moto turismo" },

  // ── Levorin — Moto (expansão) ─────────────────────────────────────────────────
  { marca: "Levorin", modelo: "Matrix", km_estimado: 14000, tier: "economico", vehicleType: "Moto", fonte: "Estimativa EcoPneus — moto urbana nacional" },
  { marca: "Levorin", modelo: "Trail Force", km_estimado: 16000, tier: "economico", vehicleType: "Moto", fonte: "Estimativa EcoPneus — moto trail nacional" },

  // ── Maggion — Carro ───────────────────────────────────────────────────────────
  { marca: "Maggion", modelo: "Eco Sport", km_estimado: 42000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio nacional" },
  { marca: "Maggion", modelo: "Aro 14", km_estimado: 38000, tier: "economico", vehicleType: "Carro", fonte: "Estimativa EcoPneus — passeio econômico nacional" },

  // ── Nexen — Caminhão ──────────────────────────────────────────────────────────
  { marca: "Nexen", modelo: "Roadian 581", km_estimado: 68000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — steer caminhão" },

  // ── Cooper — Caminhão ─────────────────────────────────────────────────────────
  { marca: "Cooper", modelo: "Roadmaster RM300", km_estimado: 70000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — steer caminhão" },

  // ── General Tire — Caminhão ───────────────────────────────────────────────────
  { marca: "General Tire", modelo: "S581", km_estimado: 72000, tier: "intermediario", vehicleType: "Caminhão", fonte: "Estimativa EcoPneus — steer caminhão" },
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
