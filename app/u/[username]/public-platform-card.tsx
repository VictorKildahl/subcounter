"use client";

import { Icons, PlatformIcon } from "@/app/icons";
import { SocialProfile } from "@/types/types";
import Image from "next/image";
import { useState } from "react";

type PublicPlatformCardProps = {
  profile: SocialProfile;
};

export function PublicPlatformCard({ profile }: PublicPlatformCardProps) {
  const [avatarError, setAvatarError] = useState(false);

  // Get initials from handle (first 2 characters)
  const getInitials = () => {
    return profile.handle.substring(0, 2).toUpperCase();
  };

  // Check if avatar URL is valid
  const hasValidAvatar = profile.avatarUrl && profile.avatarUrl.trim() !== "";

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-xl transition group relative overflow-hidden">
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
        </div>
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center transition shadow-sm">
          <PlatformIcon platform={profile.platform} className="w-6 h-6" />
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
