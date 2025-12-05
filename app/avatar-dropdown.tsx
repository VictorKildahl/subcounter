"use client";

import { Icons, PlatformIcon } from "@/app/icons";
import { cn } from "@/libs/utils";
import { SocialProfile, User } from "@/types/types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type AvatarDropdownProps = {
  user: User;
  profiles: SocialProfile[];
  onSelectAvatar: (avatarUrl: string) => void;
  onConnect: () => void;
  onLogout: () => void;
  allPlatformsConnected: boolean;
};

export function AvatarDropdown({
  user,
  profiles,
  onSelectAvatar,
  onConnect,
  onLogout,
  allPlatformsConnected,
}: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userAvatarError, setUserAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const connectedProfiles = profiles.filter((p) => p.connected);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-slate-100 p-1 rounded-full transition group"
        title="Account menu"
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
        <Icons.ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-900">{user.email}</p>
          </div>

          {/* Avatar Selection */}
          {connectedProfiles.length > 0 && (
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Select Avatar
              </p>
              <div className="space-y-2">
                {connectedProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      onSelectAvatar(profile.avatarUrl);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
                      "hover:bg-indigo-50 hover:border-indigo-200",
                      user.avatarUrl === profile.avatarUrl
                        ? "bg-indigo-50 border border-indigo-200"
                        : "border border-transparent"
                    )}
                  >
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.platform}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full bg-slate-200"
                      unoptimized
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-xs text-slate-500">
                          {profile.platform}
                        </p>
                      </div>
                      <PlatformIcon
                        platform={profile.platform}
                        className="w-4 h-4"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Platform Menu */}
          {!allPlatformsConnected && (
            <div className="px-2 py-2 border-b border-slate-100">
              <button
                onClick={() => {
                  onConnect();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                <Icons.Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Connect Platform</span>
              </button>
            </div>
          )}

          {/* Logout */}
          <div className="px-2 py-2">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <Icons.LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
