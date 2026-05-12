import crypto from "crypto";

/**
 * Generates a URL-friendly slug for public poll links.
 * Format: 8 random hex characters (e.g., "a3f8b2c1")
 */
export function generateSlug(): string {
  return crypto.randomBytes(4).toString("hex");
}

/**
 * Checks if a poll has expired based on its expiresAt timestamp.
 */
export function isPollExpired(expiresAt?: Date): boolean {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}

/**
 * Generates a unique anonymous respondent ID.
 */
export function generateAnonymousId(): string {
  return `anon_${crypto.randomBytes(8).toString("hex")}`;
}
