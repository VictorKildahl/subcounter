"use client";

import { Icons, PlatformIcon } from "@/app/icons";
import { cn } from "@/libs/utils";
import { PlatformType } from "@/types/types";
import { useState } from "react";

type ConnectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (platform: PlatformType) => void;
  connectedPlatforms: PlatformType[];
};

export function ConnectModal({
  isOpen,
  onClose,
  onConnect,
  connectedPlatforms,
}: ConnectModalProps) {
  const [loading, setLoading] = useState<PlatformType | null>(null);

  if (!isOpen) return null;

  async function handleConnect(platform: PlatformType) {
    setLoading(platform);
    await onConnect(platform);
    setLoading(null);
  }

  const platforms = Object.values(PlatformType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200 border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition"
        >
          <Icons.X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Connect Channel
        </h2>
        <p className="text-slate-500 mb-8">
          Select a platform to aggregate your stats.
        </p>

        <div className="space-y-3">
          {platforms.map((platform) => {
            const isConnected = connectedPlatforms.includes(platform);
            const isLoading = loading === platform;

            return (
              <button
                key={platform}
                disabled={isConnected || isLoading}
                onClick={() => handleConnect(platform)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                  isConnected
                    ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                    : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-4">
                  <PlatformIcon platform={platform} className="w-5 h-5" />
                  <span className="text-slate-700 font-semibold">
                    {platform}
                  </span>
                </div>
                {isLoading ? (
                  <Icons.Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                ) : isConnected ? (
                  <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                    Connected
                  </div>
                ) : (
                  <Icons.Plus className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
