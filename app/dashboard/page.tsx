import { getCurrentUser } from "@/libs/auth-server";
import { redirect } from "next/navigation";
import { DashboardClient } from "../dashboard-client";

export const metadata = {
  title: "Dashboard | Subcounter",
  description: "Track your growth across all social platforms",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center">
      <DashboardClient user={user} />
    </div>
  );
}
