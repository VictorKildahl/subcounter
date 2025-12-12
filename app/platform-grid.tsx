"use client";

import { PlatformCard } from "@/app/platform-card";
import { useDragReorder } from "@/app/use-drag-reorder";
import { PlatformType, SocialProfile } from "@/types/types";

interface PlatformGridProps {
  profiles: SocialProfile[];
  onRefresh: (profile: SocialProfile) => void;
  onEdit: (profile: SocialProfile) => void;
  onRemove: (profile: SocialProfile) => void;
  onReorder: (profiles: SocialProfile[]) => void;
  refreshingPlatform: PlatformType | null;
}

export function PlatformGrid({
  profiles,
  onRefresh,
  onEdit,
  onRemove,
  onReorder,
  refreshingPlatform,
}: PlatformGridProps) {
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragReorder({ items: profiles, onReorder });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {profiles.map((profile, index) => (
        <div
          key={profile.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            transition-all duration-200
            ${draggedIndex === index ? "opacity-50 scale-95" : ""}
            ${dragOverIndex === index ? "scale-105" : ""}
            cursor-move
          `}
        >
          <PlatformCard
            profile={profile}
            onRefresh={onRefresh}
            onEdit={onEdit}
            onRemove={onRemove}
            isRefreshing={refreshingPlatform === profile.platform}
          />
        </div>
      ))}
    </div>
  );
}
