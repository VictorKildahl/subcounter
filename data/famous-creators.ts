import { PlatformType } from "@/types/types";

// Seed data for famous creators - only URLs, follower counts fetched dynamically
export type FamousCreatorSeed = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  platforms: {
    platform: PlatformType;
    profileUrl: string;
  }[];
};

export const famousCreatorSeeds: FamousCreatorSeed[] = [
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    username: "cristiano",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1594446880498401282/o4L2z8Ay_400x400.jpg",
    bio: "Professional footballer, 5x Ballon d'Or winner",
    platforms: [
      {
        platform: PlatformType.INSTAGRAM,
        profileUrl: "https://instagram.com/cristiano",
      },
      {
        platform: PlatformType.X,
        profileUrl: "https://x.com/Cristiano",
      },
      {
        platform: PlatformType.YOUTUBE,
        profileUrl: "https://youtube.com/@cristiano",
      },
      {
        platform: PlatformType.TIKTOK,
        profileUrl: "https://tiktok.com/@cristiano",
      },
    ],
  },
  {
    id: "kimkardashian",
    name: "Kim Kardashian",
    username: "kimkardashian",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1711802069362163712/Lp-bLdJn_400x400.jpg",
    bio: "Media personality, businesswoman, socialite",
    platforms: [
      {
        platform: PlatformType.INSTAGRAM,
        profileUrl: "https://instagram.com/kimkardashian",
      },
      {
        platform: PlatformType.X,
        profileUrl: "https://x.com/KimKardashian",
      },
      {
        platform: PlatformType.TIKTOK,
        profileUrl: "https://tiktok.com/@kimkardashian",
      },
    ],
  },
  {
    id: "mrbeast",
    name: "MrBeast",
    username: "mrbeast",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1660382895474098177/xmBhMVWi_400x400.jpg",
    bio: "YouTuber, philanthropist, entrepreneur",
    platforms: [
      {
        platform: PlatformType.YOUTUBE,
        profileUrl: "https://youtube.com/@MrBeast",
      },
      {
        platform: PlatformType.INSTAGRAM,
        profileUrl: "https://instagram.com/mrbeast",
      },
      {
        platform: PlatformType.X,
        profileUrl: "https://x.com/MrBeast",
      },
      {
        platform: PlatformType.TIKTOK,
        profileUrl: "https://tiktok.com/@mrbeast",
      },
    ],
  },
  {
    id: "selenagomez",
    name: "Selena Gomez",
    username: "selenagomez",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1804936821732040704/DL6_ZHXN_400x400.jpg",
    bio: "Singer, actress, producer",
    platforms: [
      {
        platform: PlatformType.INSTAGRAM,
        profileUrl: "https://instagram.com/selenagomez",
      },
      {
        platform: PlatformType.X,
        profileUrl: "https://x.com/selenagomez",
      },
      {
        platform: PlatformType.TIKTOK,
        profileUrl: "https://tiktok.com/@selenagomez",
      },
    ],
  },
  {
    id: "therock",
    name: "Dwayne Johnson",
    username: "therock",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1868031600058392576/K0R_0yCO_400x400.jpg",
    bio: "Actor, producer, retired professional wrestler",
    platforms: [
      {
        platform: PlatformType.INSTAGRAM,
        profileUrl: "https://instagram.com/therock",
      },
      {
        platform: PlatformType.X,
        profileUrl: "https://x.com/TheRock",
      },
      {
        platform: PlatformType.YOUTUBE,
        profileUrl: "https://youtube.com/@therock",
      },
      {
        platform: PlatformType.TIKTOK,
        profileUrl: "https://tiktok.com/@therock",
      },
    ],
  },
  {
    id: "kyliejenner",
    name: "Kylie Jenner",
    username: "kyliejenner",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1283639636627423237/xNjF-KGT_400x400.jpg",
    bio: "Founder of Kylie Cosmetics, media personality",
    platforms: [
      {
        platform: PlatformType.INSTAGRAM,
        profileUrl: "https://instagram.com/kyliejenner",
      },
      {
        platform: PlatformType.X,
        profileUrl: "https://x.com/KylieJenner",
      },
      {
        platform: PlatformType.TIKTOK,
        profileUrl: "https://tiktok.com/@kyliejenner",
      },
    ],
  },
  {
    id: "leomessi",
    name: "Lionel Messi",
    username: "leomessi",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1879882080002281472/VYXBqJK-_400x400.jpg",
    bio: "Professional footballer, 8x Ballon d'Or winner",
    platforms: [
      {
        platform: PlatformType.INSTAGRAM,
        profileUrl: "https://instagram.com/leomessi",
      },
      {
        platform: PlatformType.X,
        profileUrl: "https://x.com/TeamMessi",
      },
      {
        platform: PlatformType.TIKTOK,
        profileUrl: "https://tiktok.com/@leomessi",
      },
    ],
  },
  {
    id: "arianagrande",
    name: "Ariana Grande",
    username: "arianagrande",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1854199622468890625/HY6_X5s1_400x400.jpg",
    bio: "Singer, songwriter, actress",
    platforms: [
      {
        platform: PlatformType.INSTAGRAM,
        profileUrl: "https://instagram.com/arianagrande",
      },
      {
        platform: PlatformType.X,
        profileUrl: "https://x.com/ArianaGrande",
      },
      {
        platform: PlatformType.TIKTOK,
        profileUrl: "https://tiktok.com/@arianagrande",
      },
    ],
  },
  {
    id: "khaby",
    name: "Khaby Lame",
    username: "khaby",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1472571966591651842/JJTPXPb4_400x400.jpg",
    bio: "Content creator, comedian",
    platforms: [
      {
        platform: PlatformType.TIKTOK,
        profileUrl: "https://tiktok.com/@khaby.lame",
      },
      {
        platform: PlatformType.INSTAGRAM,
        profileUrl: "https://instagram.com/khaby00",
      },
      {
        platform: PlatformType.YOUTUBE,
        profileUrl: "https://youtube.com/@KhabyLame",
      },
    ],
  },
];

// Types for data fetched from DB
export type FamousCreator = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  platforms: {
    platform: string;
    handle: string | null;
    profileUrl: string;
    avatarUrl: string | null;
    followerCount: number;
  }[];
};

export function getTotalFollowers(creator: FamousCreator): number {
  return creator.platforms.reduce((acc, p) => acc + p.followerCount, 0);
}

export function formatFollowerCount(count: number): string {
  if (count >= 1000000000) {
    return (count / 1000000000).toFixed(1) + "B";
  }
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}
