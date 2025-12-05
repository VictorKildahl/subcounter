"use client";

import { ConnectModal } from "@/app/connect-modal";
import { Icons } from "@/app/icons";
import { LoginPage } from "@/app/login-component";
import { PlatformCard } from "@/app/platform-card";
import { ShareModal } from "@/app/share-modal";
import {
  generateHistoryData,
  getProfiles,
  getStoredUser,
  logout,
  mockLogin,
  saveProfiles,
} from "@/libs/mockDataService";
import { cn } from "@/libs/utils";
import { HistoryPoint, PlatformType, SocialProfile, User } from "@/types/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PLATFORM_COLORS: Record<PlatformType, string> = {
  [PlatformType.YOUTUBE]: "#ef4444",
  [PlatformType.TWITTER]: "#1e293b",
  [PlatformType.INSTAGRAM]: "#ec4899",
  [PlatformType.TWITCH]: "#a855f7",
  [PlatformType.TIKTOK]: "#0f172a",
  [PlatformType.LINKEDIN]: "#2563eb",
};

// Custom Tooltip for the simplified chart
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: HistoryPoint }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Access the full data point
    return (
      <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl text-sm min-w-[200px]">
        <p className="font-bold text-slate-800 mb-2">{label}</p>
        <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
          <span className="text-slate-500">Total</span>
          <span className="font-bold text-indigo-600 text-lg">
            {(data.totalFollowers / 1000).toFixed(1)}k
          </span>
        </div>
        <div className="space-y-1">
          {Object.values(PlatformType).map((platform) => {
            // Only show if the platform data exists in this history point
            if (data[platform] !== undefined) {
              return (
                <div
                  key={platform}
                  className="flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                    ></div>
                    <span className="text-slate-500">{platform}</span>
                  </div>
                  <span className="font-medium text-slate-700">
                    {(data[platform] as number).toLocaleString()}
                  </span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }
  return null;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [refreshingPlatform, setRefreshingPlatform] =
    useState<PlatformType | null>(null);
  const [userAvatarError, setUserAvatarError] = useState(false);

  // Weekly growth percentage - calculated based on actual data
  const weeklyGrowth = React.useMemo(() => {
    if (profiles.length === 0) return "0.0";
    const avgGrowth =
      profiles.reduce((acc, p) => acc + p.growth24h, 0) / profiles.length;
    return (avgGrowth * 7).toFixed(1); // Convert daily to weekly
  }, [profiles]);

  // Load profiles from localStorage on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const loadDashboardData = () => {
    const data = getProfiles();
    setProfiles(data);
    const history = generateHistoryData(30, data);
    setHistoryData(history);
  };

  useEffect(() => {
    // Check for "session"
    if (!user) return;

    loadDashboardData();
  }, [user]);

  async function handleLogin(email: string) {
    const loggedInUser = await mockLogin(email);
    setUser(loggedInUser);
  }

  function handleLogout() {
    logout();
    setUser(null);
    setProfiles([]);
    setHistoryData([]);
  }

  const totalFollowers = profiles
    .filter((p) => p.connected)
    .reduce((acc, curr) => acc + curr.followerCount, 0);

  const activeProfiles = profiles.filter((p) => p.connected);

  const allPlatformsConnected =
    activeProfiles.length >= Object.values(PlatformType).length;

  async function handleConnectPlatform(platform: PlatformType, url: string) {
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

      const { data } = await response.json();

      // Create a new profile with the scraped data
      const newProfile: SocialProfile = {
        id: Math.random().toString(36).substring(7),
        platform,
        handle: data.handle,
        profileUrl: url,
        followerCount: data.followerCount,
        avatarUrl: data.avatarUrl || "/default-avatar.png",
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
      setIsConnectModalOpen(false);
    } catch (error) {
      console.error("Failed to connect platform:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to connect platform. Please try again."
      );
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

      const { data } = await response.json();

      // Calculate growth based on difference
      const oldCount = profile.followerCount;
      const newCount = data.followerCount;
      const growth =
        oldCount > 0 ? ((newCount - oldCount) / oldCount) * 100 : 0;

      // Update the profile with new data
      const updatedProfile: SocialProfile = {
        ...profile,
        followerCount: newCount,
        handle: data.handle,
        avatarUrl: data.avatarUrl || profile.avatarUrl,
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
    for (const profile of activeProfiles) {
      await handleRefreshPlatform(profile);
      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // 1. Auth Guard
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 2. Main Dashboard
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-100 md:border-none">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={loadDashboardData}
          title="Refresh dashboard"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
            S
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 hidden md:block">
            subcounter
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefreshAll}
            disabled={profiles.length === 0 || refreshingPlatform !== null}
            className={cn(
              "text-slate-500 hover:text-indigo-600 transition",
              (profiles.length === 0 || refreshingPlatform !== null) &&
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
            onClick={() => setIsShareModalOpen(true)}
            disabled={profiles.length === 0}
            className={cn(
              "text-slate-500 hover:text-indigo-600 transition",
              profiles.length === 0 && "opacity-30 cursor-not-allowed"
            )}
          >
            <Icons.Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            disabled={allPlatformsConnected}
            className={cn(
              "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:shadow transition flex items-center gap-2",
              allPlatformsConnected && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icons.Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Connect</span>
          </button>

          {/* User Profile / Logout */}
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:bg-red-50 p-1 pr-2 rounded-full transition group"
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
            <Icons.LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-20 pt-8">
        {profiles.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <Icons.Plus className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              No Platforms Connected
            </h2>
            <p className="text-slate-500 mb-8 max-w-md">
              Get started by connecting your social media accounts to track your
              follower growth across all platforms.
            </p>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition flex items-center gap-2"
            >
              <Icons.Plus className="w-5 h-5" />
              Connect Your First Platform
            </button>
          </div>
        ) : (
          <>
            {/* HERO SECTION */}
            <section className="flex flex-col items-center justify-center py-12 md:py-16 text-center animate-in slide-in-from-bottom-5 duration-500">
              <h2 className="text-slate-500 font-medium text-lg uppercase tracking-widest mb-4">
                Total Audience
              </h2>

              <div className="relative group cursor-default">
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-slate-900 to-slate-700 leading-none pb-2">
                  {totalFollowers.toLocaleString()}
                </h1>
                <div className="absolute -inset-10 bg-linear-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 -z-10 rounded-full"></div>
              </div>

              {weeklyGrowth !== "0.0" && (
                <div className="flex items-center gap-2 mt-6 bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold text-sm">
                  <Icons.TrendingUp className="w-4 h-4" />
                  <span>+{weeklyGrowth}% this week</span>
                </div>
              )}
            </section>
            {/* Platform Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {activeProfiles.map((profile) => (
                <PlatformCard
                  key={profile.id}
                  profile={profile}
                  onRefresh={handleRefreshPlatform}
                  isRefreshing={refreshingPlatform === profile.platform}
                />
              ))}
            </div>{" "}
            {/* Simplified Single Area Chart */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-800">
                    Growth Composition
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Hover for platform breakdown
                  </p>
                </div>
                <select className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg px-4 py-2 cursor-pointer hover:bg-slate-100 transition focus:ring-2 focus:ring-indigo-500/20 outline-none w-full sm:w-auto">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                </select>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient
                        id="colorTotal"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4f46e5"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4f46e5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value: number) =>
                        `${(value / 1000).toFixed(0)}k`
                      }
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "#6366f1",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalFollowers"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
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
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnectPlatform}
        connectedPlatforms={activeProfiles.map((p) => p.platform)}
      />
    </div>
  );
}
