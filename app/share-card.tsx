import { Icons, PlatformIcon } from "@/app/icons";
import { cn } from "@/libs/utils";
import { PlatformType } from "@/types/types";
import Image from "next/image";

type ShareCardProps = {
  totalFollowers: number;
  handle: string;
  platforms?: PlatformType[];
  className?: string;
  avatarUrl?: string;
  ref?: React.Ref<HTMLDivElement>;
};

export function ShareCard({
  totalFollowers,
  handle,
  platforms = [],
  className = "",
  avatarUrl,
  ref,
}: ShareCardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-3xl overflow-hidden relative border border-slate-200 shadow-2xl",
        className
      )}
      style={{ width: "400px", height: "400px" }}
    >
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-100/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between p-8">
        {/* Header Branding */}
        <div className="flex items-center gap-2 self-start opacity-70">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px] font-bold">
            S
          </div>
          <span className="font-bold text-slate-700 text-sm tracking-tight">
            subcounter
          </span>
        </div>

        {/* Main Stats */}
        <div className="text-center w-full">
          <div className="mb-4 relative inline-block">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-2xl shadow-lg border-4 border-white object-cover"
                unoptimized
              />
            ) : (
              <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center text-white border-4 border-white">
                <Icons.TrendingUp className="w-8 h-8" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
              <div className="bg-green-500 w-3 h-3 rounded-full border border-white"></div>
            </div>
          </div>

          <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">
            Total Audience
          </h3>
          <div className="text-6xl font-black text-slate-900 tracking-tighter mb-2 leading-none">
            {(totalFollowers / 1000).toFixed(1)}k
          </div>
          <p className="font-semibold text-slate-500">
            @{handle.replace("@", "")}
          </p>
        </div>

        {/* Footer / Platforms */}
        <div className="w-full">
          {platforms.length > 0 && (
            <div className="flex justify-center gap-3 mb-6">
              {platforms.map((p) => (
                <div
                  key={p}
                  className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm"
                >
                  <PlatformIcon platform={p} className="w-4 h-4" />
                </div>
              ))}
            </div>
          )}

          <div className="w-full h-px bg-slate-100 mb-4"></div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-wide">
            <span>Verified Creator</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
