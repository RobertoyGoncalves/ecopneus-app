# Aplicar migration `tire_specs_cache`

A tabela de cache **ainda não existe** no projeto remoto até você rodar o SQL abaixo.

## Opção rápida (SQL Editor)

1. Abra [Supabase Dashboard](https://supabase.com/dashboard) → seu projeto → **SQL Editor**
2. Cole o conteúdo de `migrations/003_tire_specs_cache.sql`
3. Clique **Run**

## Opção via terminal

1. Em **Project Settings → Database**, copie a **Connection string (URI)**
2. No `.env.local`, adicione:
   ```
   SUPABASE_DB_URL=postgresql://postgres.[ref]:[SENHA]@....pooler.supabase.com:6543/postgres
   ```
3. Na raiz do projeto:
   ```bash
   npm run db:migrate
   ```

## Verificar

```bash
npm run setup:check
```

Deve mostrar `[x] Cache tire_specs_cache: tabela acessível`.
