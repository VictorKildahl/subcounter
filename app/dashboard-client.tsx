"use client";

import { ConnectModal } from "@/app/connect-modal";
import { EmptyState } from "@/app/empty-state";
import { GrowthChart } from "@/app/growth-chart";
import { Header } from "@/app/header";
import { HeroStats } from "@/app/hero-stats";
import { PlatformGrid } from "@/app/platform-grid";
import { ShareModal } from "@/app/share-modal";
import { useDashboardData } from "@/app/use-dashboard-data";
import { signOut } from "@/libs/auth-client";
import { PlatformType, SocialProfile } from "@/types/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{
    platform: PlatformType;
    url: string;
  } | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined | null>(
    user.image
  );

  // Sync currentAvatar with user.image from server
  useEffect(() => {
    console.log("🔄 Syncing avatar from user prop:", user.image);
    setCurrentAvatar(user.image);
  }, [user.image]);

  const {
    profiles,
    historyData,
    refreshingPlatform,
    handleConnectPlatform,
    handleRefreshPlatform,
    handleRefreshAll,
    handleRemovePlatform,
    handleReorderPlatforms,
    handleEditPlatform,
    handleTogglePlatformVisibility,
    loadDashboardData,
  } = useDashboardData(user);

  // Weekly growth percentage - calculated based on actual data
  const weeklyGrowth = React.useMemo(() => {
    if (profiles.length === 0) return "0.0";
    const avgGrowth =
      profiles.reduce((acc, p) => acc + p.growth24h, 0) / profiles.length;
    return (avgGrowth * 7).toFixed(1); // Convert daily to weekly
  }, [profiles]);

  async function handleLogout() {
    await signOut();
    // Redirect to login page after signing out
    router.push("/login");
    router.refresh();
  }

  async function handleSelectAvatar(avatarUrl: string) {
    try {
      console.log("🎯 handleSelectAvatar called with:", avatarUrl);

      // Update local state immediately for instant feedback
      setCurrentAvatar(avatarUrl);
      console.log("🎯 currentAvatar state set to:", avatarUrl);

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

      const result = await response.json();
      console.log("🎯 Avatar update response:", result);

      // Refresh the router to get updated user data from server
      router.refresh();
    } catch (error) {
      console.error("Failed to update avatar:", error);
      // Revert on error
      setCurrentAvatar(user.image || undefined);
      alert("Failed to update avatar. Please try again.");
    }
  }

  function handleOpenEditModal(profile: {
    platform: PlatformType;
    url: string;
  }) {
    setEditingProfile(profile);
    setIsConnectModalOpen(true);
  }

  function handleCloseConnectModal() {
    setIsConnectModalOpen(false);
    setEditingProfile(null);
  }

  async function handleConnectOrEdit(platform: PlatformType, url: string) {
    await handleConnectPlatform(platform, url, false);
    handleCloseConnectModal();
  }

  function handleEdit(profile: SocialProfile) {
    handleEditPlatform(profile);
    handleOpenEditModal({
      platform: profile.platform,
      url: profile.profileUrl,
    });
  }

  const totalFollowers = profiles
    .filter((p) => p.connected && !p.hidden)
    .reduce((acc, curr) => acc + curr.followerCount, 0);

  const activeProfiles = profiles.filter((p) => p.connected && !p.hidden);

  const allPlatformsConnected =
    activeProfiles.length >= Object.values(PlatformType).length;

  // Transform user to include current avatar
  const userWithAvatar = {
    ...user,
    avatarUrl: currentAvatar || undefined,
  };

  return (
    <>
      <Header
        user={userWithAvatar}
        profiles={profiles}
        profileCount={profiles.length}
        allPlatformsConnected={allPlatformsConnected}
        refreshingPlatform={refreshingPlatform}
        onRefreshAll={handleRefreshAll}
        onShare={() => setIsShareModalOpen(true)}
        onConnect={() => setIsConnectModalOpen(true)}
        onLogout={handleLogout}
        onLogoClick={loadDashboardData}
        onSelectAvatar={handleSelectAvatar}
        onReorderPlatforms={handleReorderPlatforms}
        onTogglePlatformVisibility={handleTogglePlatformVisibility}
      />

      <main className="max-w-7xl mx-auto px-6 pb-20 pt-8">
        {profiles.length === 0 ? (
          <EmptyState onConnect={() => setIsConnectModalOpen(true)} />
        ) : (
          <>
            <HeroStats
              totalFollowers={totalFollowers}
              weeklyGrowth={weeklyGrowth}
            />
            <PlatformGrid
              profiles={activeProfiles}
              onRefresh={handleRefreshPlatform}
              onEdit={handleEdit}
              onRemove={handleRemovePlatform}
              onReorder={handleReorderPlatforms}
              refreshingPlatform={refreshingPlatform}
            />
            <GrowthChart historyData={historyData} />
          </>
        )}
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        totalFollowers={totalFollowers}
        handle={activeProfiles[0]?.handle || "My Stats"}
        platforms={activeProfiles.map((p) => p.platform)}
        avatarUrl={user.image || ""}
      />

      {/* Connect Modal */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={handleCloseConnectModal}
        onConnect={handleConnectOrEdit}
        profiles={profiles.filter((p) => p.connected)}
        editingPlatform={editingProfile?.platform}
        existingUrl={editingProfile?.url}
      />
    </>
  );
}
