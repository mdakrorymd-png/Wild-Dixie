import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.ownerId && (!user.role || user.role === "owner")) redirect("/onboarding");
  redirect("/dashboard");
}
