/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_CONTACT_FORM_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
