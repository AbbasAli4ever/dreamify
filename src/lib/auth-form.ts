/** Client-side checks before calling Supabase; the server validates again. */
export const MIN_PASSWORD = 8;

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function cleanEmail(value: string) {
  return value.trim().toLowerCase();
}
