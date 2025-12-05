import { HistoryPoint, PlatformType, SocialProfile, User } from "@/types/types";

// Initial Mock State
const DEFAULT_PROFILES: SocialProfile[] = [
  {
    id: "1",
    platform: PlatformType.INSTAGRAM,
    handle: "@victor_creates",
    profileUrl: "https://instagram.com/victor_creates",
    followerCount: 12540,
    avatarUrl: "https://picsum.photos/100/100?random=1",
    growth24h: 1.2,
    connected: true,
  },
  {
    id: "2",
    platform: PlatformType.TWITTER,
    handle: "@victor_dev",
    profileUrl: "https://twitter.com/victor_dev",
    followerCount: 8930,
    avatarUrl: "https://picsum.photos/100/100?random=2",
    growth24h: -0.5,
    connected: true,
  },
  {
    id: "3",
    platform: PlatformType.YOUTUBE,
    handle: "Victor Tech",
    profileUrl: "https://youtube.com/@victortech",
    followerCount: 45200,
    avatarUrl: "https://picsum.photos/100/100?random=3",
    growth24h: 3.4,
    connected: true,
  },
];

export const mockLogin = async (email: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "user_123",
        name: "Victor",
        email: email,
        avatarUrl: "https://picsum.photos/100/100?random=10",
      });
    }, 800);
  });
};

// Simulate searching for a creator and getting their specific stats
export const searchCreatorProfiles = async (
  query: string
): Promise<SocialProfile[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const seed = query.length;
      // Generate somewhat deterministic random stats based on name length
      resolve([
        {
          id: "s1",
          platform: PlatformType.YOUTUBE,
          handle: `${query} Official`,
          profileUrl: `https://youtube.com/results?search_query=${query}`,
          followerCount: seed * 15000 + 5000,
          avatarUrl: `https://picsum.photos/100/100?random=${seed}`,
          growth24h: 0.5,
          connected: true,
        },
        {
          id: "s2",
          platform: PlatformType.INSTAGRAM,
          handle: `@${query.toLowerCase().replace(" ", "_")}`,
          profileUrl: `https://instagram.com/${query
            .toLowerCase()
            .replace(" ", "_")}`,
          followerCount: seed * 8000 + 2000,
          avatarUrl: `https://picsum.photos/100/100?random=${seed + 1}`,
          growth24h: 1.2,
          connected: true,
        },
        {
          id: "s3",
          platform: PlatformType.TIKTOK,
          handle: `@${query.toLowerCase()}_tok`,
          profileUrl: `https://tiktok.com/@${query.toLowerCase()}_tok`,
          followerCount: seed * 25000,
          avatarUrl: `https://picsum.photos/100/100?random=${seed + 2}`,
          growth24h: 4.5,
          connected: true,
        },
      ]);
    }, 600);
  });
};

export const getProfiles = async (): Promise<SocialProfile[]> => {
  return new Promise((resolve) => {
    // In a real app, this would fetch from the backend API which aggregates data
    setTimeout(() => resolve([...DEFAULT_PROFILES]), 500);
  });
};

export const generateHistoryData = (
  days: number,
  profiles: SocialProfile[]
): HistoryPoint[] => {
  const data: HistoryPoint[] = [];
  const activeProfiles = profiles.filter((p) => p.connected);

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

export const connectProfile = async (
  platform: PlatformType
): Promise<SocialProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        platform: platform,
        handle: `@new_${platform.toLowerCase()}`,
        profileUrl: `https://${platform.toLowerCase()}.com/`,
        followerCount: Math.floor(Math.random() * 5000) + 1000,
        avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(
          Math.random() * 100
        )}`,
        growth24h: 5.0,
        connected: true,
      });
    }, 1500);
  });
};
