"use client";

import { Icons, PlatformIcon } from "@/app/icons";
import { cn } from "@/libs/utils";
import { PlatformType } from "@/types/types";
import { useState } from "react";

type ConnectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (platform: PlatformType, url: string) => void;
  connectedPlatforms: PlatformType[];
  existingUrl?: string;
  editingPlatform?: PlatformType;
};

export function ConnectModal({
  isOpen,
  onClose,
  onConnect,
  connectedPlatforms,
  existingUrl = "",
  editingPlatform,
}: ConnectModalProps) {
  const [loading, setLoading] = useState<PlatformType | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(
    editingPlatform || null
  );
  const [url, setUrl] = useState(existingUrl);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handlePlatformClick(platform: PlatformType) {
    setSelectedPlatform(platform);
    // Keep existing URL if editing a connected platform
    setUrl("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlatform || !url) return;

    setError("");

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(selectedPlatform);
    try {
      await onConnect(selectedPlatform, url);
      setSelectedPlatform(null);
      setUrl("");
    } catch {
      setError("Failed to connect. Please try again.");
    }
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

        {!selectedPlatform ? (
          <>
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
                    disabled={isLoading}
                    onClick={() => handlePlatformClick(platform)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                      "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm",
                      isLoading && "opacity-50 cursor-not-allowed"
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
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                          Connected
                        </div>
                        <Icons.Edit2 className="w-4 h-4 text-slate-400" />
                      </div>
                    ) : (
                      <Icons.Plus className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedPlatform(null)}
              className="mb-4 text-slate-400 hover:text-slate-800 transition flex items-center gap-2"
            >
              <Icons.ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>

            <div className="flex items-center gap-3 mb-2">
              <PlatformIcon platform={selectedPlatform} className="w-6 h-6" />
              <h2 className="text-2xl font-bold text-slate-900">
                {connectedPlatforms.includes(selectedPlatform) ? "Edit" : "Connect"} {selectedPlatform}
              </h2>
            </div>
            <p className="text-slate-500 mb-6">
              Enter your {selectedPlatform} profile URL
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Profile URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={getPlaceholder(selectedPlatform)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  required
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={!url || loading !== null}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Icons.Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function getPlaceholder(platform: PlatformType): string {
  switch (platform) {
    case PlatformType.YOUTUBE:
      return "https://www.youtube.com/@username";
    case PlatformType.TWITTER:
      return "https://twitter.com/username";
    case PlatformType.INSTAGRAM:
      return "https://www.instagram.com/username";
    case PlatformType.TWITCH:
      return "https://www.twitch.tv/username";
    case PlatformType.TIKTOK:
      return "https://www.tiktok.com/@username";
    case PlatformType.LINKEDIN:
      return "https://www.linkedin.com/in/username";
  }
}
