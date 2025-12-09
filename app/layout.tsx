import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./header";
import { getCurrentUser } from "@/libs/auth-server";
import { UserProvider } from "@/providers/userProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubCounter",
  description: "See all your social media stats in one place",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  console.log(user);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider initialUser={user}>
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* <Header
            user={user}
            setUser={setUser}
            onShare={() => setIsShareModalOpen(true)}
            onConnect={() => setIsConnectModalOpen(true)}
          /> */}
            <Header />
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
