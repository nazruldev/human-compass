import type { MaskArray } from "react-native-mask-input";

/** 24h time mask: HH:mm with basic hour/minute bounds. */
export function maskTime24(text = ""): MaskArray {
  const clean = text.replace(/\D+/g, "");
  let secondH: RegExp = /\d/;
  if (clean.length >= 1 && clean[0] === "2") {
    secondH = /[0-3]/;
  }
  return [/[0-2]/, secondH, ":", /[0-5]/, /\d/];
}

export function isoDateToDdMmYyyyDisplay(iso: string): {
  masked: string;
  raw: string;
} {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return { masked: "", raw: "" };
  const dd = d.padStart(2, "0");
  const mm = m.padStart(2, "0");
  const raw = `${dd}${mm}${y}`;
  return { masked: `${dd}/${mm}/${y}`, raw };
}

export function isValidYyyyMmDd(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}
