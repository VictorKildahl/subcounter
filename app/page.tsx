"use client";

import { ConnectModal } from "@/app/connect-modal";
import { Icons, PlatformIcon } from "@/app/icons";
import { LoginPage } from "@/app/login-component";
import { ShareModal } from "@/app/share-modal";
import {
  connectProfile,
  generateHistoryData,
  getProfiles,
  mockLogin,
  searchCreatorProfiles,
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
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Weekly growth percentage - calculated once on mount
  const [weeklyGrowth] = useState(() => (Math.random() * 5).toFixed(1));

  const loadDashboardData = async () => {
    setIsLoading(true);
    const data = await getProfiles();
    setProfiles(data);
    const history = generateHistoryData(30, data);
    setHistoryData(history);
    setIsLoading(false);
  };

  useEffect(() => {
    // Check for "session" (mock)
    if (!user) return;

    const fetchData = async () => {
      await loadDashboardData();
    };

    void fetchData();
  }, [user]);

  async function handleLogin(email: string) {
    const loggedInUser = await mockLogin(email);
    setUser(loggedInUser);
  }

  function handleLogout() {
    setUser(null);
    setProfiles([]);
    setHistoryData([]);
    setSearchQuery("");
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchCreatorProfiles(searchQuery);
    setProfiles(results);
    setHistoryData(generateHistoryData(30, results));
    setIsSearching(false);
  }

  const totalFollowers = profiles
    .filter((p) => p.connected)
    .reduce((acc, curr) => acc + curr.followerCount, 0);

  const activeProfiles = profiles.filter((p) => p.connected);

  const allPlatformsConnected =
    activeProfiles.length >= Object.values(PlatformType).length;

  async function handleConnectPlatform(platform: PlatformType) {
    const newProfile = await connectProfile(platform);

    setProfiles((prev) => {
      const filtered = prev.filter((p) => p.platform !== platform);
      return [...filtered, newProfile];
    });

    const updatedProfiles = [
      ...profiles.filter((p) => p.platform !== platform),
      newProfile,
    ];
    setHistoryData(generateHistoryData(30, updatedProfiles));
    setIsConnectModalOpen(false);
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
          title="Back to home"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
            S
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 hidden md:block">
            SocialSync
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 md:mx-12">
          <form onSubmit={handleSearch} className="relative group">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition" />
            <input
              type="text"
              placeholder="Search for creators (e.g., 'MrBeast')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition shadow-sm"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Icons.Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="text-slate-500 hover:text-indigo-600 transition"
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
              src={user.avatarUrl || "/default-avatar.png"}
              alt="User"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full bg-slate-200"
              unoptimized
            />
            <Icons.LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
          </button>
        </div>
      </nav>

      {isLoading ? (
        <div className="min-h-[80vh] flex items-center justify-center">
          <Icons.Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 pb-20 pt-8">
          {/* HERO SECTION */}
          <section className="flex flex-col items-center justify-center py-12 md:py-16 text-center animate-in slide-in-from-bottom-5 duration-500">
            <h2 className="text-slate-500 font-medium text-lg uppercase tracking-widest mb-4">
              {searchQuery ? `Stats for "${searchQuery}"` : "Total Audience"}
            </h2>

            <div className="relative group cursor-default">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-slate-900 to-slate-700 leading-none pb-2">
                {totalFollowers.toLocaleString()}
              </h1>
              <div className="absolute -inset-10 bg-linear-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 -z-10 rounded-full"></div>
            </div>

            <div className="flex items-center gap-2 mt-6 bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold text-sm">
              <Icons.TrendingUp className="w-4 h-4" />
              <span>+{weeklyGrowth}% this week</span>
            </div>
          </section>

          {/* Platform Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activeProfiles.map((profile) => (
              <a
                key={profile.id}
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition group relative overflow-hidden animate-in fade-in duration-500 block"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition">
                      <PlatformIcon
                        platform={profile.platform}
                        className="w-6 h-6"
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      profile.growth24h >= 0
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    )}
                  >
                    {profile.growth24h > 0 ? "+" : ""}
                    {profile.growth24h}%
                  </div>
                </div>

                <div>
                  <p className="text-3xl font-bold text-slate-800 tracking-tight">
                    {profile.followerCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                    {profile.handle}
                    <Icons.ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                  </p>
                </div>
              </a>
            ))}
          </div>

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
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
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
        </main>
      )}

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
