"use client";

import { ConnectModal } from "@/app/connect-modal";
import { EmptyState } from "@/app/empty-state";
import { GrowthChart } from "@/app/growth-chart";
import { Header } from "@/app/header";
import { HeroStats } from "@/app/hero-stats";
import { LoginPage } from "@/app/login-component";
import { PlatformGrid } from "@/app/platform-grid";
import { ShareModal } from "@/app/share-modal";
import { useDashboardData } from "@/app/use-dashboard-data";
import { getStoredUser, logout, mockLogin } from "@/libs/mockDataService";
import { PlatformType, SocialProfile, User } from "@/types/types";
import React, { useState } from "react";

export default function App() {
  const storedUser = getStoredUser();
  const [user, setUser] = useState<User | null>(storedUser);
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

  async function handleLogin(email: string) {
    const loggedInUser = await mockLogin(email);
    setUser(loggedInUser);
  }

  function handleLogout() {
    logout();
    setUser(null);
  }

  function handleSelectAvatar(avatarUrl: string) {
    if (user) {
      const updatedUser = { ...user, avatarUrl };
      setUser(updatedUser);
      // Update in localStorage
      localStorage.setItem("socialSync_user", JSON.stringify(updatedUser));
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

  const allPlatformsConnected =
    activeProfiles.length >= Object.values(PlatformType).length;

  // 1. Auth Guard
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 2. Main Dashboard
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
        avatarUrl={user.avatarUrl}
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
