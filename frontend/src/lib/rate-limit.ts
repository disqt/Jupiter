const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, windowMs = 60000, max = 5): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  // Cleanup old entries periodically
  if (rateMap.size > 10000) {
    rateMap.forEach((val, key) => {
      if (val.resetAt < now) rateMap.delete(key);
    });
  }

  if (!entry || entry.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > max;
}
