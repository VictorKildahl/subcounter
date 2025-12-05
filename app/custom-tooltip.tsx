import { HistoryPoint, PlatformType } from "@/types/types";

const PLATFORM_COLORS: Record<PlatformType, string> = {
  [PlatformType.YOUTUBE]: "#ef4444",
  [PlatformType.TWITTER]: "#1e293b",
  [PlatformType.INSTAGRAM]: "#ec4899",
  [PlatformType.TWITCH]: "#a855f7",
  [PlatformType.TIKTOK]: "#0f172a",
  [PlatformType.LINKEDIN]: "#2563eb",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: HistoryPoint }[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
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
