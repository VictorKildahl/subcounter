import { HistoryPoint, SocialProfile, User } from "@/types/types";

const STORAGE_KEY_PROFILES = "subcounter_profiles";
const STORAGE_KEY_USER = "subcounter_user";

// Simple auth function - stores user in localStorage
export const mockLogin = async (email: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: User = {
        id: "user_123",
        name: email.split("@")[0],
        email: email,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          email.split("@")[0]
        )}&background=6366f1&color=fff`,
      };

      // Store user in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      }

      resolve(user);
    }, 800);
  });
};

// Get stored user from localStorage
export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY_USER);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// Logout - clear user from localStorage
export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
};

// Get profiles from localStorage (no more hardcoded data)
export const getProfiles = (): SocialProfile[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

// Save profiles to localStorage
export const saveProfiles = (profiles: SocialProfile[]): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
};

// Generate history data based on current profiles
// This creates a simulated history by working backwards from current follower counts
export const generateHistoryData = (
  days: number,
  profiles: SocialProfile[]
): HistoryPoint[] => {
  const data: HistoryPoint[] = [];
  const activeProfiles = profiles.filter((p) => p.connected);

  // If no profiles, return empty history
  if (activeProfiles.length === 0) {
    return [];
  }

  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const point: HistoryPoint = {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      totalFollowers: 0,
    };

    activeProfiles.forEach((p) => {
      // Create some realistic looking random fluctuation history
      const volatility = p.followerCount * 0.05; // 5% volatility
      // Trend upwards slightly
      const trend = (days - i) * (p.followerCount * 0.001);

      const randomNoise =
        Math.floor(Math.random() * volatility) - volatility / 2;

      // Reverse engineer past data from current (approximate)
      // Current count - trend + noise
      const historicalCount = Math.floor(p.followerCount - trend + randomNoise);

      point[p.platform] = Math.max(0, historicalCount);
      point.totalFollowers += Math.max(0, historicalCount);
    });

    data.push(point);
  }
  return data;
};
