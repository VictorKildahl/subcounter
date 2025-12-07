import { getCurrentUser } from "@/libs/auth-server";
import { redirect } from "next/navigation";
import { AuthForm } from "../auth-form";

export const metadata = {
  title: "Login | Subcounter",
  description: "Sign in to your subcounter account",
};

export default async function LoginPage() {
  // Check if user is already authenticated
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return <AuthForm mode="signin" />;
}
