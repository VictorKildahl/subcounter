"use client";

import { ConnectModal } from "@/app/connect-modal";
import { EmptyState } from "@/app/empty-state";
import { GrowthChart } from "@/app/growth-chart";
import { HeroStats } from "@/app/hero-stats";
import { PlatformGrid } from "@/app/platform-grid";
import { useDashboardData } from "@/app/use-dashboard-data";
import { getStoredUser } from "@/libs/mockDataService";
import { PlatformType, SocialProfile, User } from "@/types/types";
import React, { useState } from "react";

export default function App() {
  const storedUser = getStoredUser();
  const [user, setUser] = useState<User | null>(storedUser);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
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
    handleRemovePlatform,
    handleReorderPlatforms,
    handleEditPlatform,
  } = useDashboardData(user);

  // Weekly growth percentage - calculated based on actual data
  const weeklyGrowth = React.useMemo(() => {
    if (profiles.length === 0) return "0.0";
    const avgGrowth =
      profiles.reduce((acc, p) => acc + p.growth24h, 0) / profiles.length;
    return (avgGrowth * 7).toFixed(1); // Convert daily to weekly
  }, [profiles]);

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
      const updatedUser = { ...user, avatarUrl: result.profile.avatarUrl };
      setUser(updatedUser);
      localStorage.setItem("socialSync_user", JSON.stringify(updatedUser));
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

  return (
    <>
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
