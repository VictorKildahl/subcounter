// providers/user-provider.tsx
"use client";

import { User } from "@/types/types";
import { createContext, useContext } from "react";

const UserContext = createContext<User | null>(null);

export function UserProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={initialUser}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
