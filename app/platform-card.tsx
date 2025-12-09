"use client";

import { Icons, PlatformIcon } from "@/app/icons";
import { cn } from "@/libs/utils";
import { SocialProfile } from "@/types/types";
import Image from "next/image";
import { useState } from "react";

type PlatformCardProps = {
  profile: SocialProfile;
  onRefresh: (profile: SocialProfile) => void;
  onEdit: (profile: SocialProfile) => void;
  onRemove: (profile: SocialProfile) => void;
  isRefreshing: boolean;
};

export function PlatformCard({
  profile,
  onRefresh,
  onEdit,
  onRemove,
  isRefreshing,
}: PlatformCardProps) {
  const [avatarError, setAvatarError] = useState(false);

  // Get initials from handle (first 2 characters)
  const getInitials = () => {
    return profile.handle.substring(0, 2).toUpperCase();
  };

  // Check if avatar URL is valid
  const hasValidAvatar = profile.avatarUrl && profile.avatarUrl.trim() !== "";

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-xl transition group relative overflow-hidden animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {hasValidAvatar && !avatarError ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.handle}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full bg-slate-100 ring-2 ring-slate-100"
              onError={() => setAvatarError(true)}
              unoptimized
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-slate-100">
              {getInitials()}
            </div>
          )}
          <div
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-full",
              profile.growth24h >= 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            )}
          >
            {profile.growth24h > 0 ? "+" : ""}
            {profile.growth24h}%
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onRefresh(profile)}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
            title="Refresh follower count"
          >
            {isRefreshing ? (
              <Icons.Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icons.RefreshCw className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(profile)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"
            title="Edit platform URL"
          >
            <Icons.Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (
                confirm(`Remove ${profile.platform}? This cannot be undone.`)
              ) {
                onRemove(profile);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
            title="Remove platform"
          >
            <Icons.Trash2 className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center transition">
            <PlatformIcon platform={profile.platform} className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-3xl font-bold text-slate-800 tracking-tight">
          {(profile.followerCount ?? 0).toLocaleString()}
        </p>
        <p className="text-sm text-slate-500 font-medium mt-1">
          {profile.handle}
        </p>
      </div>

      <a
        href={profile.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 group/link"
      >
        View Profile
        <Icons.ArrowUpRight className="w-3 h-3 opacity-50 group-hover/link:opacity-100 transition-opacity" />
      </a>
    </div>
  );
}
