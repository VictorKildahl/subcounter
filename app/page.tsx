import { getCurrentUser } from "@/libs/auth-server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { useUser } from "@/providers/userProvider";

export const metadata = {
  title: "Dashboard | Subcounter",
  description: "Track your growth across all social platforms",
};

export default async function App() {
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  // if (!user) {
  //   redirect("/login");
  // }

  return (
    <div className="flex flex-col items-center">
      <h1>Front page goes here</h1>
      {user && <DashboardClient user={user} />}
    </div>
  );
}
