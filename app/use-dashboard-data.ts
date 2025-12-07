"use client";

import { HistoryPoint, PlatformType, SocialProfile, User } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

interface PlatformMetric {
  id: string;
  platformId: string;
  followerCount: number;
  timestamp: string;
}

interface PlatformWithMetrics {
  id: string;
  platform: string;
  handle: string;
  profileUrl: string;
  avatarUrl: string;
  followerCount: number;
  growth24h: number;
  connected: boolean;
  hidden: boolean;
  metrics?: PlatformMetric[];
}

// Helper function to generate history data from platform metrics
function generateHistoryFromMetrics(
  platforms: PlatformWithMetrics[]
): HistoryPoint[] {
  const dateMap = new Map<string, HistoryPoint>();

  // Collect all metrics from all platforms
  platforms.forEach((platform) => {
    platform.metrics?.forEach((metric: PlatformMetric) => {
      const date = new Date(metric.timestamp).toLocaleDateString();

      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          totalFollowers: 0,
        });
      }

      const point = dateMap.get(date)!;
      const currentValue = point[platform.platform];
      const numericValue = typeof currentValue === "number" ? currentValue : 0;
      point[platform.platform] = numericValue + metric.followerCount;
      point.totalFollowers += metric.followerCount;
    });
  });

  // Convert to array and sort by date
  return Array.from(dateMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Keep last 30 days
}

export function useDashboardData(user: User | null) {
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [refreshingPlatform, setRefreshingPlatform] =
    useState<PlatformType | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch("/api/platforms");

      if (!response.ok) {
        throw new Error("Failed to fetch platforms");
      }

      const data = await response.json();
      const platformsData: PlatformWithMetrics[] = data.platforms || [];

      // Transform database records to SocialProfile format
      const transformedProfiles: SocialProfile[] = platformsData.map(
        (p: PlatformWithMetrics) => ({
          id: p.id,
          platform: p.platform as PlatformType,
          handle: p.handle,
          profileUrl: p.profileUrl,
          followerCount: p.followerCount,
          avatarUrl: p.avatarUrl || "",
          growth24h: p.growth24h || 0,
          connected: p.connected,
          hidden: p.hidden || false,
        })
      );

      setProfiles(transformedProfiles);

      // Generate history data from metrics
      if (platformsData.length > 0) {
        const history = generateHistoryFromMetrics(platformsData);
        setHistoryData(history);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  async function handleConnectPlatform(
    platform: PlatformType,
    url: string,
    isFirstPlatform?: boolean
  ) {
    try {
      // Call the scraping API
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform, url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to scrape profile");
      }

      const result = await response.json();
      const platformRecord = result.platformRecord;

      // Reload data from database
      await loadDashboardData();

      // Create a profile object to return
      const newProfile: SocialProfile = {
        id: platformRecord.id,
        platform: platformRecord.platform,
        handle: platformRecord.handle,
        profileUrl: platformRecord.profileUrl,
        followerCount: platformRecord.followerCount,
        avatarUrl: platformRecord.avatarUrl || "",
        growth24h: platformRecord.growth24h || 0,
        connected: true,
      };

      return { success: true, profile: newProfile, isFirstPlatform };
    } catch (error) {
      console.error("Failed to connect platform:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to connect platform. Please try again."
      );
      return { success: false };
    }
  }

  async function handleRefreshPlatform(profile: SocialProfile) {
    try {
      setRefreshingPlatform(profile.platform);

      // Call the scraping API with the existing profile URL
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: profile.platform,
          url: profile.profileUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to refresh profile");
      }

      // Reload data from database
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to refresh platform:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to refresh platform. Please try again."
      );
    } finally {
      setRefreshingPlatform(null);
    }
  }

  async function handleRefreshAll() {
    const activeProfiles = profiles.filter((p) => p.connected);
    for (const profile of activeProfiles) {
      await handleRefreshPlatform(profile);
      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async function handleRemovePlatform(profile: SocialProfile) {
    try {
      const response = await fetch(`/api/platforms?id=${profile.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete platform");
      }

      // Reload data from database
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to remove platform:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to remove platform. Please try again."
      );
    }
  }

  async function handleReorderPlatforms(reorderedProfiles: SocialProfile[]) {
    try {
      // Update local state immediately for smooth UX
      setProfiles(reorderedProfiles);

      // Update display order in database
      const platformsToUpdate = reorderedProfiles.map((p, index) => ({
        id: p.id,
        displayOrder: index,
      }));

      const response = await fetch("/api/platforms", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platforms: platformsToUpdate }),
      });

      if (!response.ok) {
        throw new Error("Failed to update platform order");
      }
    } catch (error) {
      console.error("Failed to reorder platforms:", error);
      // Reload from database on error
      await loadDashboardData();
    }
  }

  function handleEditPlatform(profile: SocialProfile) {
    // This will be handled in the parent component by opening the modal
    // with the profile data
    return profile;
  }

  async function handleTogglePlatformVisibility(profile: SocialProfile) {
    try {
      const response = await fetch("/api/platforms", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platforms: [
            {
              id: profile.id,
              hidden: !profile.hidden,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle platform visibility");
      }

      // Reload data from database
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to toggle platform visibility:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to toggle platform visibility. Please try again."
      );
    }
  }

  return {
    profiles,
    historyData,
    refreshingPlatform,
    loading,
    handleConnectPlatform,
    handleRefreshPlatform,
    handleRefreshAll,
    handleRemovePlatform,
    handleReorderPlatforms,
    handleEditPlatform,
    handleTogglePlatformVisibility,
    loadDashboardData,
  };
}
