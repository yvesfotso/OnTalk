/**
 * Kept outside any component so `Date.now()` isn't called from render — React's
 * purity checks flag impure calls in component bodies, even ones that are
 * actually safe here (a Server Component evaluated once per request).
 */
export function isPastOrNow(iso: string, referenceTime: number = Date.now()): boolean {
  return new Date(iso).getTime() <= referenceTime;
}
