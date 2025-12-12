import { HeroStats } from "@/app/hero-stats";
import { getTotalFollowers } from "@/data/famous-creators";
import {
  getAllFamousCreators,
  getFamousCreatorByUsername,
} from "@/libs/famous-creators";
import { PlatformType, SocialProfile } from "@/types/types";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPlatformGrid } from "./public-platform-grid";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const creator = await getFamousCreatorByUsername(username);

  if (!creator) {
    return {
      title: "Profile Not Found | Subcounter",
    };
  }

  return {
    title: `${creator.name} | Subcounter`,
    description: `View ${creator.name}'s social media stats across all platforms`,
  };
}

export async function generateStaticParams() {
  const famousCreators = await getAllFamousCreators();
  return famousCreators.map((creator) => ({
    username: creator.username,
  }));
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const creator = await getFamousCreatorByUsername(username);

  if (!creator) {
    notFound();
  }

  const totalFollowers = getTotalFollowers(creator);

  // Convert creator platforms to SocialProfile format for reusing components
  const profiles: SocialProfile[] = creator.platforms.map((p, index) => ({
    id: `${creator.id}-${p.platform}-${index}`,
    platform: p.platform as PlatformType,
    handle: p.handle || "",
    profileUrl: p.profileUrl,
    followerCount: p.followerCount,
    avatarUrl: creator.avatarUrl || "",
    growth24h: 0, // Static data, no growth tracking
    connected: true,
  }));

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-8 mb-4">
        <div className="relative inline-block mb-4">
          {creator.avatarUrl ? (
            <Image
              src={creator.avatarUrl}
              alt={creator.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full ring-4 ring-white shadow-xl"
              unoptimized
            />
          ) : (
            <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
              {creator.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
          {creator.name}
        </h1>
        <p className="text-slate-500 text-sm">@{creator.username}</p>
      </div>

      {/* Hero Stats - Same as dashboard */}
      <HeroStats totalFollowers={totalFollowers} weeklyGrowth="0.0" />

      {/* Platform Grid - Same layout as dashboard */}
      <PublicPlatformGrid profiles={profiles} />

      {/* CTA */}
      <div className="text-center mt-8 mb-12 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Want to track your own stats?
        </h2>
        <p className="text-slate-500 mb-6">
          Create your free dashboard and share your growth with the world
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl transition"
        >
          Get Started Free
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
      </div>
    </div>
  );
}
