"use client";

import { useDashboardData } from "@/app/use-dashboard-data";
import { User } from "@/types/types";
import { createContext, ReactNode, useContext } from "react";

// Type for the dashboard data context
type DashboardDataContextType = ReturnType<typeof useDashboardData>;

const DashboardDataContext = createContext<DashboardDataContextType | null>(
  null
);

export function DashboardDataProvider({
  user,
  children,
}: {
  user: User | null;
  children: ReactNode;
}) {
  const dashboardData = useDashboardData(user);

  return (
    <DashboardDataContext.Provider value={dashboardData}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardDataContext() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error(
      "useDashboardDataContext must be used within a DashboardDataProvider"
    );
  }
  return context;
}
