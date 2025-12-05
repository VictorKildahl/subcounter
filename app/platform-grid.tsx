"use client";

import { PlatformCard } from "@/app/platform-card";
import { PlatformType, SocialProfile } from "@/types/types";
import { useState } from "react";

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newProfiles = [...profiles];
    const draggedProfile = newProfiles[draggedIndex];
    newProfiles.splice(draggedIndex, 1);
    newProfiles.splice(dropIndex, 0, draggedProfile);

    onReorder(newProfiles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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
