"use client";

import { Icons, PlatformIcon } from "@/app/icons";
import { cn } from "@/libs/utils";
import { SocialProfile, User } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type AvatarDropdownProps = {
  user: User;
  profiles: SocialProfile[];
  onSelectAvatar: (avatarUrl: string) => void;
  onConnect: (openModal: boolean) => void;
  onLogout: () => void;
  onReorderPlatforms: (profiles: SocialProfile[]) => void;
  onTogglePlatformVisibility: (profile: SocialProfile) => void;
  allPlatformsConnected: boolean;
};

export function AvatarDropdown({
  user,
  profiles,
  onSelectAvatar,
  onConnect,
  onLogout,
  onReorderPlatforms,
  onTogglePlatformVisibility,
  allPlatformsConnected,
}: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userAvatarError, setUserAvatarError] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [platformAvatarErrors, setPlatformAvatarErrors] = useState<Set<string>>(
    new Set()
  );
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

  // Separate visible and hidden platforms
  const visibleProfiles = connectedProfiles.filter((p) => !p.hidden);
  const hiddenProfiles = connectedProfiles.filter((p) => p.hidden);

  // Get the display avatar
  const getDisplayAvatar = () => {
    // If user has selected an initials avatar (platform with no image), return null to show initials
    if (user.avatarUrl?.startsWith("initials:")) {
      return null;
    }

    // If user has a selected avatar and it's not empty, use it
    if (user.avatarUrl && user.avatarUrl.trim() !== "" && !userAvatarError) {
      return user.avatarUrl;
    }

    // No avatar set - return null to show initials
    return null;
  };

  // Get user initials from email
  const getUserInitials = () => {
    return user.email.substring(0, 2).toUpperCase();
  };

  // Get initials from a handle string
  const getHandleInitials = (handle: string) => {
    return handle.substring(0, 2).toUpperCase();
  };

  const displayAvatar = getDisplayAvatar();

  // Check if avatar is an initials placeholder
  const isInitialsAvatar = user.avatarUrl?.startsWith("initials:");
  const initialsHandle = isInitialsAvatar
    ? user.avatarUrl?.replace("initials:", "")
    : null;

  console.log("🔍 AvatarDropdown render:", {
    userAvatarUrl: user.avatarUrl,
    isInitialsAvatar,
    initialsHandle,
    displayAvatar,
  });

  // Determine which initials to show
  const getDisplayInitials = () => {
    // If user selected a platform with initials, use that handle
    if (initialsHandle) {
      return getHandleInitials(initialsHandle);
    }

    // Otherwise use email initials
    return getUserInitials();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newVisibleProfiles = [...visibleProfiles];
    const draggedProfile = newVisibleProfiles[draggedIndex];
    newVisibleProfiles.splice(draggedIndex, 1);
    newVisibleProfiles.splice(dropIndex, 0, draggedProfile);

    // Merge with hidden profiles to maintain full list
    const reorderedProfiles = [...newVisibleProfiles, ...hiddenProfiles];

    onReorderPlatforms(reorderedProfiles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-slate-100 p-1 rounded-full transition group"
        title="Account menu"
      >
        {isInitialsAvatar ? (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
            {getHandleInitials(initialsHandle || "")}
          </div>
        ) : displayAvatar ? (
          <Image
            src={displayAvatar}
            alt="User"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full bg-slate-200"
            onError={() => setUserAvatarError(true)}
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
            {getDisplayInitials()}
          </div>
        )}
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
            <p className="font-semibold text-slate-900">{user?.email}</p>
          </div>

          {/* Avatar Selection */}
          {connectedProfiles.length > 0 && (
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Choose Avatar & Manage Platforms
              </p>

              {/* Visible Platforms */}
              {visibleProfiles.length > 0 && (
                <div className="space-y-2 mb-3">
                  {visibleProfiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "transition-all duration-200",
                        draggedIndex === index && "opacity-50 scale-95",
                        dragOverIndex === index && "scale-[1.02]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // If platform has no avatar, save initials identifier
                            const avatarToSave =
                              profile.avatarUrl &&
                              profile.avatarUrl.trim() !== ""
                                ? profile.avatarUrl
                                : `initials:${profile.handle}`;
                            onSelectAvatar(avatarToSave);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "flex-1 flex items-center gap-3 p-2 rounded-lg transition-all cursor-grab active:cursor-grabbing",
                            "hover:bg-indigo-50 hover:border-indigo-200",
                            user.avatarUrl === profile.avatarUrl ||
                              user.avatarUrl === `initials:${profile.handle}`
                              ? "bg-indigo-50 border border-indigo-200"
                              : "border border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-1 text-slate-400">
                            <Icons.GripVertical className="w-4 h-4" />
                          </div>
                          <div className="relative">
                            {profile.avatarUrl &&
                            profile.avatarUrl.trim() !== "" &&
                            !platformAvatarErrors.has(profile.id) ? (
                              <Image
                                src={profile.avatarUrl}
                                alt={profile.platform}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full bg-slate-200"
                                onError={() => {
                                  setPlatformAvatarErrors((prev) =>
                                    new Set(prev).add(profile.id)
                                  );
                                }}
                                unoptimized
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                                {profile.handle.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            {(user.avatarUrl === profile.avatarUrl ||
                              user.avatarUrl ===
                                `initials:${profile.handle}`) && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                                <Icons.Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <div className="text-left min-w-0 flex-1 max-w-24">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {profile.handle}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {profile.platform}
                              </p>
                            </div>
                            <PlatformIcon
                              platform={profile.platform}
                              className="w-4 h-4 shrink-0"
                            />
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePlatformVisibility(profile);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                          title="Hide platform"
                        >
                          <Icons.EyeOff className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden Platforms */}
              {hiddenProfiles.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Hidden
                  </p>
                  <div className="space-y-2">
                    {hiddenProfiles.map((profile) => (
                      <div key={profile.id} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex-1 flex items-center gap-3 p-2 rounded-lg border border-transparent opacity-60"
                          )}
                        >
                          <div className="relative">
                            {profile.avatarUrl &&
                            profile.avatarUrl.trim() !== "" &&
                            !platformAvatarErrors.has(profile.id) ? (
                              <Image
                                src={profile.avatarUrl}
                                alt={profile.platform}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full bg-slate-200"
                                onError={() => {
                                  setPlatformAvatarErrors((prev) =>
                                    new Set(prev).add(profile.id)
                                  );
                                }}
                                unoptimized
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-semibold">
                                {profile.handle.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <div className="text-left min-w-0 flex-1 max-w-24">
                              <p className="text-sm font-medium text-slate-700 truncate">
                                {profile.handle}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {profile.platform}
                              </p>
                            </div>
                            <PlatformIcon
                              platform={profile.platform}
                              className="w-4 h-4 shrink-0 opacity-50"
                            />
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePlatformVisibility(profile);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition"
                          title="Show platform"
                        >
                          <Icons.Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="px-2 py-2 border-b border-slate-100">
            <Link
              href="/profile"
              onClick={() => {
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            >
              <Icons.User className="w-4 h-4" />
              <span className="text-sm font-medium">Profile</span>
            </Link>
          </div>

          {/* Platform Menu */}
          {!allPlatformsConnected && (
            <div className="px-2 py-2 border-b border-slate-100">
              <button
                onClick={() => {
                  onConnect(true);
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
