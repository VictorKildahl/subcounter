import { formatFollowerCount, getTotalFollowers } from "@/data/famous-creators";
import { getCurrentUser } from "@/libs/auth-server";
import { getAllFamousCreators } from "@/libs/famous-creators";
import { PlatformType } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import { PlatformIcon } from "./icons";

export const metadata = {
  title: "Subcounter",
  description: "Track your growth across all social platforms",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  const famousCreators = await getAllFamousCreators();

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-20 md:py-32 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Track your social growth in real-time
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
          All your followers,{" "}
          <span className="text-indigo-600">one dashboard</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl">
          Connect your social accounts and track your follower growth across
          YouTube, Instagram, TikTok, X, and more — all in one beautiful
          dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl transition"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-full text-lg font-semibold shadow-sm hover:shadow transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-6 py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-12">
            Everything you need to track your growth
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Real-time Updates
              </h3>
              <p className="text-slate-600">
                See your follower counts update in real-time across all
                connected platforms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Growth Analytics
              </h3>
              <p className="text-slate-600">
                Track your daily, weekly, and monthly growth with beautiful
                charts and insights.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Multi-Platform
              </h3>
              <p className="text-slate-600">
                Connect YouTube, Instagram, TikTok, X, Twitch, and more in one
                place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Famous Creators Section */}
      <section className="w-full px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              See how the biggest creators stack up
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Track the follower counts of the world&apos;s most followed
              creators across all platforms
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {famousCreators.map((creator) => {
              const totalFollowers = getTotalFollowers(creator);
              return (
                <Link
                  key={creator.id}
                  href={`/u/${creator.username}`}
                  className="bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {creator.avatarUrl && (
                      <Image
                        src={creator.avatarUrl}
                        alt={creator.name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full ring-2 ring-white shadow-md"
                        unoptimized
                      />
                    )}
                    {!creator.avatarUrl && (
                      <div className="w-14 h-14 rounded-full bg-indigo-600 ring-2 ring-white shadow-md flex items-center justify-center text-white font-bold text-lg">
                        {creator.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition">
                        {creator.name}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">
                        @{creator.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatFollowerCount(totalFollowers)}
                      </p>
                      <p className="text-xs text-slate-400">Total Followers</p>
                    </div>
                    <div className="flex -space-x-1">
                      {creator.platforms.slice(0, 4).map((p) => (
                        <div
                          key={p.platform}
                          className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center"
                          title={p.platform}
                        >
                          <PlatformIcon
                            platform={p.platform as PlatformType}
                            className="w-3.5 h-3.5"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {creator.platforms.length} platforms
                    </span>
                    <span className="text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                      View stats
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
