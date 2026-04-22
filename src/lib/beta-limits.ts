// Mirror of supabase/functions/_shared/beta-limits.ts for client-side use.
export const BETA_ANALYSIS_CAP = 30;

export function isOverCap(used: number, limit: number = BETA_ANALYSIS_CAP): boolean {
  return used >= limit;
}
