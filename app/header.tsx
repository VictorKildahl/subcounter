"use client";

import { Icons } from "@/app/icons";
import { cn } from "@/libs/utils";
import { PlatformType, User } from "@/types/types";
import Image from "next/image";
import { useState } from "react";

interface HeaderProps {
  user: User;
  profileCount: number;
  allPlatformsConnected: boolean;
  refreshingPlatform: PlatformType | null;
  onRefreshAll: () => void;
  onShare: () => void;
  onConnect: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
}

export function Header({
  user,
  profileCount,
  allPlatformsConnected,
  refreshingPlatform,
  onRefreshAll,
  onShare,
  onConnect,
  onLogout,
  onLogoClick,
}: HeaderProps) {
  const [userAvatarError, setUserAvatarError] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-100 md:border-none">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={onLogoClick}
        title="Refresh dashboard"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
          S
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-800 hidden md:block">
          subcounter
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onRefreshAll}
          disabled={profileCount === 0 || refreshingPlatform !== null}
          className={cn(
            "text-slate-500 hover:text-indigo-600 transition",
            (profileCount === 0 || refreshingPlatform !== null) &&
              "opacity-30 cursor-not-allowed"
          )}
          title="Refresh all platforms"
        >
          {refreshingPlatform !== null ? (
            <Icons.Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Icons.RefreshCw className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onShare}
          disabled={profileCount === 0}
          className={cn(
            "text-slate-500 hover:text-indigo-600 transition",
            profileCount === 0 && "opacity-30 cursor-not-allowed"
          )}
        >
          <Icons.Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={onConnect}
          disabled={allPlatformsConnected}
          className={cn(
            "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:shadow transition flex items-center gap-2",
            allPlatformsConnected && "opacity-50 cursor-not-allowed"
          )}
        >
          <Icons.Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Connect</span>
        </button>

        {/* User Profile / Logout */}
        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 hover:bg-red-50 p-1 pr-2 rounded-full transition group"
        >
          <Image
            src={
              userAvatarError
                ? "/default-avatar.png"
                : user.avatarUrl || "/default-avatar.png"
            }
            alt="User"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full bg-slate-200"
            onError={() => setUserAvatarError(true)}
            unoptimized
          />
          <Icons.LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
        </button>
      </div>
    </nav>
  );
}
