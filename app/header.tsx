"use client";

import { AvatarDropdown } from "@/app/avatar-dropdown";
import { Icons } from "@/app/icons";
import { signOut } from "@/libs/auth-client";
import { cn } from "@/libs/utils";
import { useDashboardDataContext } from "@/providers/dashboardDataProvider";
import { useUser } from "@/providers/userProvider";
import { PlatformType } from "@/types/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConnectModal } from "./connect-modal";
import { ShareModal } from "./share-modal";

export function Header() {
  const router = useRouter();
  const storedUser = useUser();
  const {
    profiles,
    refreshingPlatform,
    handleConnectPlatform,
    handleRefreshAll,
    loadDashboardData,
    handleReorderPlatforms,
    handleTogglePlatformVisibility,
  } = useDashboardDataContext();
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined | null>(
    storedUser?.avatarUrl || undefined
  );

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{
    platform: PlatformType;
    url: string;
  } | null>(null);

  function handleCloseConnectModal() {
    setIsConnectModalOpen(false);
    setEditingProfile(null);
  }

  async function handleConnectOrEdit(platform: PlatformType, url: string) {
    const isFirstPlatform = profiles.filter((p) => p.connected).length === 0;
    const result = await handleConnectPlatform(platform, url, isFirstPlatform);

    // If this is the first platform and it was successfully connected, use its avatar
    if (
      result?.success &&
      result?.isFirstPlatform &&
      result?.profile &&
      storedUser
    ) {
      const updatedUser = {
        ...storedUser,
        avatarUrl: result.profile.avatarUrl,
      };
      localStorage.setItem("socialSync_user", JSON.stringify(updatedUser));
    }

    handleCloseConnectModal();
  }

  async function handleLogout() {
    await signOut();
    // Redirect to login page after signing out
    router.refresh();
  }

  const activeProfiles = profiles.filter((p) => p.connected);

  const allPlatformsConnected =
    activeProfiles.length >= Object.values(PlatformType).length;

  async function handleSelectAvatar(avatarUrl: string) {
    try {
      setCurrentAvatar(avatarUrl);

      const response = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      await response.json();

      router.refresh();
    } catch (error) {
      console.error("Failed to update avatar:", error);
      setCurrentAvatar(storedUser?.avatarUrl || undefined);
      alert("Failed to update avatar. Please try again.");
    }
  }

  const profileCount = profiles.length;
  const totalFollowers = profiles
    .filter((p) => p.connected)
    .reduce((acc, curr) => acc + curr.followerCount, 0);

  return (
    <>
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={handleCloseConnectModal}
        onConnect={handleConnectOrEdit}
        profiles={profiles.filter((p) => p.connected)}
        editingPlatform={editingProfile?.platform}
        existingUrl={editingProfile?.url}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        totalFollowers={totalFollowers}
        handle={activeProfiles[0]?.handle || "My Stats"}
        platforms={activeProfiles.map((p) => p.platform)}
        avatarUrl={storedUser?.avatarUrl}
      />

      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-100 md:border-none">
        <Link
          className="flex items-center gap-2 cursor-pointer"
          href="/"
          title="Refresh dashboard"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
            S
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 hidden md:block">
            subcounter
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefreshAll}
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
            // onClick={onShare}
            disabled={profileCount === 0}
            className={cn(
              "text-slate-500 hover:text-indigo-600 transition",
              profileCount === 0 && "opacity-30 cursor-not-allowed"
            )}
          >
            <Icons.Share2 className="w-5 h-5" />
          </button>

          {/* Connect Button - Only show if not all platforms are connected */}
          {!allPlatformsConnected && (
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:shadow transition flex items-center gap-2"
            >
              <Icons.Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Connect</span>
            </button>
          )}

          {/* Avatar Dropdown */}
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          {storedUser ? (
            <AvatarDropdown
              user={{
                ...storedUser,
                avatarUrl: currentAvatar ?? storedUser.avatarUrl,
              }}
              profiles={profiles}
              onSelectAvatar={handleSelectAvatar}
              onConnect={setIsConnectModalOpen}
              onLogout={handleLogout}
              onReorderPlatforms={handleReorderPlatforms}
              onTogglePlatformVisibility={handleTogglePlatformVisibility}
              allPlatformsConnected={allPlatformsConnected}
            />
          ) : (
            <Link
              href="/login"
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:shadow transition flex items-center gap-2"
            >
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
