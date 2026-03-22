export function daysSinceIso(isoDate: string | null | undefined, now: Date = new Date()): number {
  if (!isoDate) {
    return 999;
  }

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 999;
  }

  const diffMs = now.getTime() - parsed.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatTimestampForDisplay(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return 'Never';
  }

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Never';
  }

  return parsed.toLocaleDateString();
}

