import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const env = loadEnvLocal();
const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

console.log("=== EcoPneus — verificação de setup ===\n");

console.log("[x] Catálogo de specs: local (src/app/data/tireSpecsCatalog.ts)");

if (!supabaseUrl || !anonKey) {
  console.log("[ ] Supabase: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes");
} else {
  console.log("[x] Supabase: variáveis presentes");
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/tire_specs_cache?select=model_key&limit=1`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    if (res.ok) {
      console.log("[x] Cache tire_specs_cache: tabela acessível (legado, opcional)");
    } else if (res.status === 404) {
      console.log("[ ] Cache tire_specs_cache: tabela ausente (opcional — specs usam catálogo local)");
    } else {
      const body = await res.text();
      console.log(`[ ] Cache tire_specs_cache: HTTP ${res.status} — ${body.slice(0, 120)}`);
    }
  } catch (e) {
    console.log("[ ] Cache: erro de rede —", e.message);
  }
}

console.log("\nReinicie após alterar .env.local: npm run dev");
