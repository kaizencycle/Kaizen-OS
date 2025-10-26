/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_LAB6_API: string;
  readonly VITE_LEDGER_API?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

