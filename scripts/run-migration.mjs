/**
 * Aplica migrations SQL no Postgres do Supabase.
 *
 * Opção A — URI no .env.local (recomendado para script):
 *   SUPABASE_DB_URL=postgresql://postgres.[ref]:[SENHA]@aws-0-....pooler.supabase.com:6543/postgres
 *   npm run db:migrate
 *
 * Opção B — Supabase CLI (após `npx supabase login` e `npx supabase link`):
 *   npx supabase db push
 *
 * Opção C — SQL Editor no dashboard: cole supabase/migrations/003_tire_specs_cache.sql
 */
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

const env = { ...loadEnvLocal(), ...process.env };
const dbUrl = env.SUPABASE_DB_URL?.trim();

if (!dbUrl) {
  console.log(`
Não encontrei SUPABASE_DB_URL no .env.local.

Para aplicar a migration da tabela tire_specs_cache:

1) Supabase Dashboard → Project Settings → Database → Connection string → URI
   Adicione no .env.local:
   SUPABASE_DB_URL=postgresql://postgres.[ref]:[SUA_SENHA]@....supabase.com:6543/postgres

2) Rode novamente: npm run db:migrate

Ou cole o SQL no SQL Editor:
   ${resolve(root, "supabase/migrations/003_tire_specs_cache.sql")}
`);
  process.exit(1);
}

const migrationPath = resolve(root, "supabase/migrations/003_tire_specs_cache.sql");
const sql = readFileSync(migrationPath, "utf8");

let postgres;
try {
  postgres = (await import("postgres")).default;
} catch {
  console.error("Instale dependências: npm install");
  process.exit(1);
}

const pg = postgres(dbUrl, { max: 1, ssl: "require" });

try {
  await pg.unsafe(sql);
  console.log("Migration 003_tire_specs_cache aplicada com sucesso.");
} catch (err) {
  const msg = String(err?.message ?? err);
  if (msg.includes("already exists")) {
    console.log("Tabela tire_specs_cache já existe — nada a fazer.");
  } else {
    console.error("Erro ao aplicar migration:", msg);
    process.exit(1);
  }
} finally {
  await pg.end();
}
