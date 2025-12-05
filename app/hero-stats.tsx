import { Icons } from "@/app/icons";

interface HeroStatsProps {
  totalFollowers: number;
  weeklyGrowth: string;
}

export function HeroStats({ totalFollowers, weeklyGrowth }: HeroStatsProps) {
  return (
    <section className="flex flex-col items-center justify-center py-12 md:py-16 text-center animate-in slide-in-from-bottom-5 duration-500">
      <h2 className="text-slate-500 font-medium text-lg uppercase tracking-widest mb-4">
        Total Audience
      </h2>

      <div className="relative group cursor-default">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-slate-900 to-slate-700 leading-none pb-2">
          {(totalFollowers ?? 0).toLocaleString()}
        </h1>
        <div className="absolute -inset-10 bg-linear-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 -z-10 rounded-full"></div>
      </div>

      {weeklyGrowth !== "0.0" && (
        <div className="flex items-center gap-2 mt-6 bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold text-sm">
          <Icons.TrendingUp className="w-4 h-4" />
          <span>+{weeklyGrowth}% this week</span>
        </div>
      )}
    </section>
  );
}
