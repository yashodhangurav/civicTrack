"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardNav({ role }: { role: string }) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";

  const roleLabel: Record<string, string> = {
    CITIZEN: "Citizen",
    OFFICER: "Field Worker",
    SUPERVISOR: "Supervisor",
    ADMIN: "Administrator",
  };

  const roleColor: Record<string, string> = {
    CITIZEN: "bg-blue-500/20 text-blue-400",
    OFFICER: "bg-emerald-500/20 text-emerald-400",
    SUPERVISOR: "bg-orange-500/20 text-orange-400",
    ADMIN: "bg-purple-500/20 text-purple-400",
  };

    const dashboardPath: Record<string, string> = {
      ADMIN: "/dashboard/admin",
      SUPERVISOR: "/dashboard/supervisor",
      OFFICER: "/dashboard/worker",
      CITIZEN: "/dashboard/community",
    };
    const homePath = dashboardPath[role] || "/";

    return (
      <nav className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href={homePath} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">C</div>
            <span className="text-base font-bold tracking-tight hidden sm:block">CivicTrack</span>
          </Link>
        <div className="w-px h-6 bg-white/10 hidden sm:block" />
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${roleColor[role] || "bg-white/10 text-gray-400"}`}>
          {roleLabel[role] || role}
        </span>
        
        {role === "CITIZEN" && (
          <div className="hidden md:flex items-center gap-1 ml-4 bg-white/[0.03] p-1 rounded-lg border border-white/5">
            <Link 
              href="/dashboard/community" 
              className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Community View
            </Link>
            <Link 
              href="/dashboard/citizen" 
              className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              My Complaints
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400 hidden sm:block">{userName}</span>
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
