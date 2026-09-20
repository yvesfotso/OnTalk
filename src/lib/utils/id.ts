/**
 * Temporary client-side id for optimistic UI (e.g. an unconfirmed chat turn),
 * before the server assigns a real one. Kept outside any component so the
 * random call isn't textually inside a render body.
 */
export function tempId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
