// API Base URL Configuration
// Priority order:
// 1. process.env.NEXT_PUBLIC_API_URL (Next.js / Node environment variables)
// 2. import.meta.env.NEXT_PUBLIC_API_URL or VITE_API_URL (Vite environment variables)
// 3. Development fallback: '/api' (proxied to http://localhost:8080 by Vite)
// 4. Production fallback: 'http://localhost:8080/api'
const resolveBaseUrl = (): string => {
  const maybeProcess = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
  const fromProcess =
    maybeProcess?.env?.NEXT_PUBLIC_API_URL &&
    typeof maybeProcess.env.NEXT_PUBLIC_API_URL === 'string'
      ? maybeProcess.env.NEXT_PUBLIC_API_URL.trim()
      : undefined;

  // Vite exposes env vars on import.meta.env
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env ?? {} : {};
  const fromImportMeta =
    metaEnv.NEXT_PUBLIC_API_URL?.trim?.() || metaEnv.VITE_API_URL?.trim?.();

  if (fromProcess) {
    return fromProcess;
  }

  if (fromImportMeta) {
    return fromImportMeta;
  }

  // Development (Vite dev server) proxy to avoid CORS
  if (metaEnv?.DEV) {
    return '/api';
  }

  return 'http://localhost:8080/api';
};

export const BASE_URL = resolveBaseUrl();

if (!BASE_URL) {
  console.warn(
    '[Plateful] BASE_URL could not be resolved. Falling back to http://localhost:8080/api'
  );
}

