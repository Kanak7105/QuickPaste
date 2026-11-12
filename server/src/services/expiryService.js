const DURATIONS = {
  "10m": 10 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
  never: null,
};

export const EXPIRY_OPTIONS = Object.keys(DURATIONS);

export function getExpiryDate(expiresIn) {
  const ms = DURATIONS[expiresIn];
  return ms ? new Date(Date.now() + ms) : null;
}

// The TTL monitor only runs about every 60 seconds, so an expired paste can
// still be in the collection for a short while. Add this filter to every read.
export function notExpiredFilter() {
  return { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] };
}
