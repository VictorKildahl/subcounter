import { PlatformType } from "@/types/types";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  Edit2,
  LayoutDashboard,
  Loader2,
  LogOut,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

export const Icons = {
  TrendingUp,
  Users,
  Share2,
  Plus,
  MoreHorizontal,
  LayoutDashboard,
  BarChart3,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Search,
  LogOut,
  ChevronLeft,
  ChevronDown,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
};

type PlatformIconProps = {
  platform: PlatformType;
  className?: string;
};

export function PlatformIcon({
  platform,
  className = "w-6 h-6",
}: PlatformIconProps) {
  // Using simple SVG paths for brands to avoid external heavy icon libraries
  switch (platform) {
    case PlatformType.YOUTUBE:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`text-red-600 ${className}`}
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case PlatformType.TWITTER:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`text-slate-900 ${className}`}
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case PlatformType.INSTAGRAM:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-pink-600 ${className}`}
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case PlatformType.TWITCH:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`text-purple-600 ${className}`}
        >
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      );
    case PlatformType.TIKTOK:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`text-black ${className}`}
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.88-2.91 6.31-2.29 1.79-5.32 2.18-8.08 1.09-2.76-1.09-4.51-3.73-4.55-6.66-.03-2.69 1.34-5.18 3.56-6.49 1.05-.63 2.24-1 3.48-1.08V11.64c-1.04.14-2.03.62-2.78 1.34-.78.75-1.17 1.83-1.08 2.91.13 1.61 1.48 2.87 3.09 2.92 1.57.06 2.99-1.08 3.26-2.64V7.54c0-2.5-.02-5-.02-7.51z" />
        </svg>
      );
    case PlatformType.LINKEDIN:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`text-blue-600 ${className}`}
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    default:
      return <div className={`bg-gray-400 rounded-full ${className}`} />;
  }
}
