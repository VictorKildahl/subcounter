import { CustomTooltip } from "@/app/custom-tooltip";
import { HistoryPoint } from "@/types/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface GrowthChartProps {
  historyData: HistoryPoint[];
}

export function GrowthChart({ historyData }: GrowthChartProps) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h3 className="font-bold text-xl text-slate-800">
            Growth Composition
          </h3>
          <p className="text-slate-400 text-sm">Hover for platform breakdown</p>
        </div>
        <select className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg px-4 py-2 cursor-pointer hover:bg-slate-100 transition focus:ring-2 focus:ring-indigo-500/20 outline-none w-full sm:w-auto">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
        </select>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#6366f1",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="totalFollowers"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
