import { Icons } from "@/app/icons";

interface EmptyStateProps {
  onConnect: () => void;
}

export function EmptyState({ onConnect }: EmptyStateProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
        <Icons.Plus className="w-10 h-10 text-indigo-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-3">
        No Platforms Connected
      </h2>
      <p className="text-slate-500 mb-8 max-w-md">
        Get started by connecting your social media accounts to track your
        follower growth across all platforms.
      </p>
      <button
        onClick={onConnect}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition flex items-center gap-2"
      >
        <Icons.Plus className="w-5 h-5" />
        Connect Your First Platform
      </button>
    </div>
  );
}
