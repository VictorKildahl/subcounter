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
import React, { useState } from "react";

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

  function handleSelectAvatar(avatarUrl: string) {
    if (user) {
      // Update user avatar - you might want to store this in your database
      console.log("Avatar selected:", avatarUrl);
      // TODO: Update user avatar in database
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
    const isFirstPlatform = profiles.filter((p) => p.connected).length === 0;
    const result = await handleConnectPlatform(platform, url, isFirstPlatform);

    // If this is the first platform and it was successfully connected, use its avatar
    if (result?.success && result?.isFirstPlatform && result?.profile && user) {
      // TODO: Update user avatar in database if needed
      console.log(
        "First platform connected with avatar:",
        result.profile.avatarUrl
      );
    }

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
    .filter((p) => p.connected)
    .reduce((acc, curr) => acc + curr.followerCount, 0);

  const activeProfiles = profiles.filter((p) => p.connected);

  const allPlatformsConnected =
    activeProfiles.length >= Object.values(PlatformType).length;

  return (
    <>
      <Header
        user={user}
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
        connectedPlatforms={activeProfiles.map((p) => p.platform)}
        editingPlatform={editingProfile?.platform}
        existingUrl={editingProfile?.url}
      />
    </>
  );
}
