export enum PlatformType {
  YOUTUBE = "YouTube",
  TWITTER = "Twitter", // X
  INSTAGRAM = "Instagram",
  TWITCH = "Twitch",
  LINKEDIN = "LinkedIn",
  TIKTOK = "TikTok",
}

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type SocialProfile = {
  id: string;
  platform: PlatformType;
  handle: string;
  profileUrl: string; // URL to the actual profile
  followerCount: number;
  avatarUrl: string;
  growth24h: number; // Percentage or raw number
  connected: boolean;
};

export type HistoryPoint = {
  date: string;
  totalFollowers: number;
  [key: string]: number | string; // Dynamic keys for individual platforms
};

export type AiInsight = {
  title: string;
  content: string;
  actionable: boolean;
};
