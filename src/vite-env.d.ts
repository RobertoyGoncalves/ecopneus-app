/// <reference types="vite/client" />

declare module "*?worker" {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_MAPBOX_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
