"use client";

import {
  generateHistoryData,
  getProfiles,
  saveProfiles,
} from "@/libs/mockDataService";
import { HistoryPoint, PlatformType, SocialProfile, User } from "@/types/types";
import { useEffect, useState } from "react";

export function useDashboardData(user: User | null) {
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [refreshingPlatform, setRefreshingPlatform] =
    useState<PlatformType | null>(null);

  const loadDashboardData = () => {
    const data = getProfiles();
    setProfiles(data);
    const history = generateHistoryData(30, data);
    setHistoryData(history);
  };

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  async function handleConnectPlatform(platform: PlatformType, url: string, isFirstPlatform?: boolean) {
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
      const scrapedData = result.data;

      // Validate scraped data
      if (
        !scrapedData ||
        typeof scrapedData.followerCount !== "number" ||
        !scrapedData.handle
      ) {
        console.error("Validation failed:", {
          hasScrapedData: !!scrapedData,
          followerCount: scrapedData?.followerCount,
          followerCountType: typeof scrapedData?.followerCount,
          handle: scrapedData?.handle,
        });
        throw new Error("Invalid data received from scraping service");
      }

      // Create a new profile with the scraped data
      const newProfile: SocialProfile = {
        id: Math.random().toString(36).substring(7),
        platform,
        handle: scrapedData.handle,
        profileUrl: url,
        followerCount: scrapedData.followerCount,
        avatarUrl: scrapedData.avatarUrl || "/default-avatar.png",
        growth24h: 0, // Will be calculated after we have historical data
        connected: true,
      };

      // Update profiles and save to localStorage
      const updatedProfiles = [
        ...profiles.filter((p) => p.platform !== platform),
        newProfile,
      ];

      setProfiles(updatedProfiles);
      saveProfiles(updatedProfiles);

      setHistoryData(generateHistoryData(30, updatedProfiles));

      // Return the new profile so parent can use its avatar if needed
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

      const result = await response.json();
      const scrapedData = result.data;

      // Validate scraped data
      if (
        !scrapedData ||
        typeof scrapedData.followerCount !== "number" ||
        !scrapedData.handle
      ) {
        console.error("Validation failed:", {
          hasScrapedData: !!scrapedData,
          followerCount: scrapedData?.followerCount,
          followerCountType: typeof scrapedData?.followerCount,
          handle: scrapedData?.handle,
        });
        throw new Error("Invalid data received from scraping service");
      }

      // Calculate growth based on difference
      const oldCount = profile.followerCount;
      const newCount = scrapedData.followerCount;
      const growth =
        oldCount > 0 ? ((newCount - oldCount) / oldCount) * 100 : 0;

      // Update the profile with new data
      const updatedProfile: SocialProfile = {
        ...profile,
        followerCount: newCount,
        handle: scrapedData.handle,
        avatarUrl: scrapedData.avatarUrl || profile.avatarUrl,
        growth24h: parseFloat(growth.toFixed(2)),
      };

      // Update profiles and save to localStorage
      const updatedProfiles = profiles.map((p) =>
        p.platform === profile.platform ? updatedProfile : p
      );

      setProfiles(updatedProfiles);
      saveProfiles(updatedProfiles);

      setHistoryData(generateHistoryData(30, updatedProfiles));
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

  function handleRemovePlatform(profile: SocialProfile) {
    const updatedProfiles = profiles.filter((p) => p.id !== profile.id);
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
    setHistoryData(generateHistoryData(30, updatedProfiles));
  }

  function handleReorderPlatforms(reorderedProfiles: SocialProfile[]) {
    setProfiles(reorderedProfiles);
    saveProfiles(reorderedProfiles);
  }

  function handleEditPlatform(profile: SocialProfile) {
    // This will be handled in the parent component by opening the modal
    // with the profile data
    return profile;
  }

  return {
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
  };
}
