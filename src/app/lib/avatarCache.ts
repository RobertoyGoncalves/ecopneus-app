/** Prefix for per-user avatar URL keys in localStorage. */
export const AVATAR_KEY_PREFIX = "ecopneus-avatar-url";

export function avatarStorageKey(userId: string): string {
  return `${AVATAR_KEY_PREFIX}-${userId}`;
}

/** Removes all avatar cache entries (per-user keys and legacy global key). */
export function clearAllAvatarCache(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(AVATAR_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}
