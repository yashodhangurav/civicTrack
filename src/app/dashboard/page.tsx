import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role === "ADMIN") redirect("/dashboard/admin");
  if (role === "SUPERVISOR") redirect("/dashboard/supervisor");
  if (role === "OFFICER") redirect("/dashboard/worker");
  if (role === "CITIZEN") redirect("/dashboard/community");

  redirect("/login");
}
