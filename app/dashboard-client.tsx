"use client";

import { ConnectModal } from "@/app/connect-modal";
import { EmptyState } from "@/app/empty-state";
import { GrowthChart } from "@/app/growth-chart";
import { HeroStats } from "@/app/hero-stats";
import { PlatformGrid } from "@/app/platform-grid";
import { ShareModal } from "@/app/share-modal";
import { useDashboardData } from "@/app/use-dashboard-data";
import { PlatformType, SocialProfile } from "@/types/types";
import { useMemo, useState } from "react";

interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
}

export function DashboardClient({ user }: DashboardClientProps) {
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
    handleRemovePlatform,
    handleReorderPlatforms,
    handleEditPlatform,
  } = useDashboardData(user);

  // Weekly growth percentage - calculated based on actual data
  const weeklyGrowth = useMemo(() => {
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
