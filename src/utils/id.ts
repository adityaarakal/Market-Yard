export function generateId(prefix: string, suffix?: string): string {
  const random = Math.random().toString(16).slice(2, 10);
  const base = `${prefix}_${Date.now()}_${random}`;
  return suffix ? `${base}_${suffix}` : base;
}
