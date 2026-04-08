/**
 * Konfigurasi overlay darkness per route (0–100).
 * Semakin tinggi = semakin gelap.
 * Default dipakai jika route tidak ada di config.
 */
export const OVERLAY_DARKNESS_CONFIG = {
  default: 95,
  routes: {
    "(onboarding)/upperCanon": 95,
    "(onboarding)/lowerCanon": 95,
    "(onboarding)/cardDetail": 98,
    "(onboarding)": 50,
    "(main)/home": 90,
    "(auth)/complete-your-account": 98,
    // Tambah route lain di sini, contoh:
    "(auth)": 100,
    "sso-callback": 95,
    // "sso-callback": 50,
  } as Record<string, number>,
} as const;

export function getOverlayDarkness(pathname: string): number {
  const path = pathname.replace(/^\//, "") || "";
  const entries = Object.entries(OVERLAY_DARKNESS_CONFIG.routes);
  entries.sort((a, b) => b[0].length - a[0].length);
  for (const [route, darkness] of entries) {
    if (path === route || path.startsWith(route + "/")) return darkness;
  }
  return OVERLAY_DARKNESS_CONFIG.default;
}

/** Pakai segments (array) dari useSegments() - lebih reliable di root layout */
export function getOverlayDarknessFromSegments(segments: string[]): number {
  const path = segments.join("/") || "";
  return getOverlayDarkness(path || "/");
}
