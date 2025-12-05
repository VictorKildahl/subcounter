"use client";

import { Icons } from "@/app/icons";
import { ShareCard } from "@/app/share-card";
import { cn } from "@/libs/utils";
import { PlatformType } from "@/types/types";
import { toPng } from "html-to-image";
import { useState } from "react";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  totalFollowers: number;
  handle: string;
  platforms: PlatformType[];
  avatarUrl?: string;
};

export function ShareModal({
  isOpen,
  onClose,
  totalFollowers,
  handle,
  platforms,
  avatarUrl,
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"image" | "embed">("image");
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  let cardRef: HTMLDivElement | null = null;

  if (!isOpen) return null;

  async function handleDownload() {
    if (cardRef) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(cardRef, {
          cacheBust: true,
          pixelRatio: 2,
        });
        const link = document.createElement("a");
        link.download = `social-sync-${handle}-stats.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to generate image", err);
      } finally {
        setIsDownloading(false);
      }
    }
  }

  const embedCode = `<iframe 
  src="https://subcounter.app/embed/${handle.replace("@", "")}" 
  width="400" 
  height="450" 
  frameborder="0" 
  scrolling="no" 
  style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"
></iframe>`;

  function handleCopyCode() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-auto md:min-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left/Top: Preview Area */}
        {/* Changed overflow-hidden to visible and added centered alignment safeguards */}
        <div className="bg-slate-50 flex-1 p-8 md:p-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 min-h-[400px]">
          <div className="relative flex items-center justify-center w-full h-full">
            <div className="transform scale-75 md:scale-90 origin-center shadow-2xl rounded-3xl">
              <ShareCard
                totalFollowers={totalFollowers}
                handle={handle}
                platforms={platforms}
                avatarUrl={avatarUrl}
                ref={(el) => {
                  cardRef = el;
                }}
              />
            </div>
          </div>
        </div>

        {/* Right/Bottom: Controls */}
        <div className="w-full md:w-96 p-8 flex flex-col bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Share Stats</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
            >
              <Icons.X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex p-1.5 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab("image")}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition",
                activeTab === "image"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Image
            </button>
            <button
              onClick={() => setActiveTab("embed")}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition",
                activeTab === "embed"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Embed
            </button>
          </div>

          <div className="flex-1">
            {activeTab === "image" ? (
              <p className="text-slate-500 leading-relaxed">
                Download a high-quality image of your current stats to share on
                Twitter, LinkedIn, or Instagram.
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-500 leading-relaxed">
                  Copy this code to embed your live stat card on your personal
                  website or portfolio.
                </p>
                <div className="bg-slate-900 rounded-2xl p-4 relative group shadow-inner">
                  <code className="text-xs text-slate-300 font-mono block break-all leading-relaxed">
                    {embedCode}
                  </code>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            {activeTab === "image" ? (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
              >
                {isDownloading ? (
                  <>
                    <Icons.Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Icons.Share2 className="w-5 h-5" />
                    Download Image
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleCopyCode}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-lg"
              >
                {copied ? (
                  <>
                    <Icons.Sparkles className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Icons.LayoutDashboard className="w-5 h-5" />
                    Copy Code
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
