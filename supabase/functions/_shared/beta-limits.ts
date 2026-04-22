// Beta usage limits — bump or remove when paid plans launch.
export const BETA_ANALYSIS_CAP = 30;

export function isOverCap(used: number, limit: number = BETA_ANALYSIS_CAP): boolean {
  return used >= limit;
}
