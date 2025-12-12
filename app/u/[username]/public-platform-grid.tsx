"use client";

import { SocialProfile } from "@/types/types";
import { PublicPlatformCard } from "./public-platform-card";

interface PublicPlatformGridProps {
  profiles: SocialProfile[];
}

export function PublicPlatformGrid({ profiles }: PublicPlatformGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {profiles.map((profile) => (
        <PublicPlatformCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
