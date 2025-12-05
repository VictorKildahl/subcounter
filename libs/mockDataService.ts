import { HistoryPoint, SocialProfile, User } from "@/types/types";

const STORAGE_KEYS = {
  USER: "socialSync_user",
  PROFILES: "socialSync_profiles",
};

/**
 * User Management
 */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
}

export function mockLogin(email: string): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: User = {
        id: Math.random().toString(36).substring(7),
        email,
        name: email.split("@")[0],
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      resolve(user);
    }, 500);
  });
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.PROFILES);
}

/**
 * Profile Management
 */
export function getProfiles(): SocialProfile[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
  return stored ? JSON.parse(stored) : [];
}

export function saveProfiles(profiles: SocialProfile[]): void {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
}

/**
 * Generate mock history data for charts
 */
export function generateHistoryData(
  days: number,
  profiles: SocialProfile[]
): HistoryPoint[] {
  const history: HistoryPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const point: HistoryPoint = {
      date: date.toISOString().split("T")[0],
      totalFollowers: 0,
    };

    let total = 0;
    profiles.forEach((profile) => {
      // Generate realistic-looking growth data
      const baseCount = profile.followerCount;
      const variance = Math.random() * 0.02 - 0.01; // -1% to +1% variance
      const dayFactor = (days - i) / days; // Earlier days have lower counts
      const count = Math.round(baseCount * dayFactor * (1 + variance));
      point[profile.platform] = count;
      total += count;
    });

    point.totalFollowers = total;
    history.push(point);
  }

  return history;
}
