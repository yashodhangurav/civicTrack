import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Link from "next/link";
import UpvoteButton from "@/components/dashboard/UpvoteButton";
export const dynamic = 'force-dynamic';

export default async function CommunityDashboard({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  const resolvedSearchParams = await searchParams;
  const activeFilter = resolvedSearchParams.filter || "all";
  
  const allComplaints = await prisma.complaint.findMany({
    include: {
      status: true,
      category: true,
      location: true,
      media: true,
      user: { select: { name: true } },
      logs: { orderBy: { timestamp: 'desc' }, take: 1 }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Group complaints by Status
  const submitted = allComplaints.filter(c => c.status.name === "Submitted")
    .sort((a, b) => ((b as any).upvoterIds?.length || 0) - ((a as any).upvoterIds?.length || 0));
  
  const assigned = allComplaints.filter(c => c.status.name === "Assigned" || c.status.name === "Assigned to Supervisor")
    .sort((a, b) => ((b as any).upvoterIds?.length || 0) - ((a as any).upvoterIds?.length || 0));
    
  const inProgress = allComplaints.filter(c => c.status.name === "In Progress");
  
  const resolved = allComplaints.filter(c => c.status.name === "Resolved" || c.status.name === "Closed");

  let sections = [
    { id: "action-needed", title: "Submitted / Action Needed", complaints: submitted, showUpvote: true },
    { id: "in-progress", title: "Assigned & Scheduled", complaints: assigned, showUpvote: true },
    { id: "in-progress", title: "Work In Progress", complaints: inProgress, showUpvote: false },
    { id: "resolved", title: "Resolved / Completed", complaints: resolved, showUpvote: false },
  ];

  if (activeFilter !== "all") {
    sections = sections.filter(s => s.id === activeFilter);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav role="CITIZEN" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">
        {/* Header & Hero */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/20 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Issues Board</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl leading-relaxed">
              Transparency matters. View all civic issues reported in your community, vote on pressing problems, and track their resolution status.
            </p>
          </div>
          
          <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
            <Link 
              href="/dashboard/citizen" 
              className="group relative inline-flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_60px_rgba(99,102,241,0.5)]"
            >
              <span className="text-base">Report a New Issue</span>
            </Link>
          </div>
        </div>

        {/* Global KPIs / Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/dashboard/community?filter=all"
            className={`p-5 rounded-2xl border transition-all ${
              activeFilter === "all" ? "bg-white/10 border-white/20" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-sm text-gray-400 font-medium">Total Reports</span>
            <p className="text-3xl font-black mt-2 text-white">{allComplaints.length}</p>
          </Link>
          <Link 
            href="/dashboard/community?filter=action-needed"
            className={`p-5 rounded-2xl border transition-all ${
              activeFilter === "action-needed" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-sm text-gray-400 font-medium">Action Needed</span>
            <p className="text-3xl font-black mt-2 text-yellow-400">{submitted.length}</p>
          </Link>
          <Link 
            href="/dashboard/community?filter=in-progress"
            className={`p-5 rounded-2xl border transition-all ${
              activeFilter === "in-progress" ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-sm text-gray-400 font-medium">In Progress</span>
            <p className="text-3xl font-black mt-2 text-indigo-400">{inProgress.length + assigned.length}</p>
          </Link>
          <Link 
            href="/dashboard/community?filter=resolved"
            className={`p-5 rounded-2xl border transition-all ${
              activeFilter === "resolved" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-sm text-gray-400 font-medium">Resolved Issues</span>
            <p className="text-3xl font-black mt-2 text-emerald-400">{resolved.length}</p>
          </Link>
        </div>

        {/* Complaints by Status Sections */}
        <div className="space-y-16">
          {sections.map((section, idx) => {
            if (section.complaints.length === 0) return null;

            return (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gray-400">{section.complaints.length} issues</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.complaints.map(c => {
                    const statusStyle: Record<string, string> = {
                      "Submitted": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                      "Assigned": "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      "Assigned to Supervisor": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
                      "In Progress": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
                      "Resolved": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      "Closed": "bg-gray-500/10 text-gray-400 border-gray-500/20",
                    };
                    const timeAgo = Math.round((Date.now() - new Date(c.createdAt).getTime()) / 3600000);
                    const hasVoted = (c as any).upvoterIds?.includes(currentUserId);

                    return (
                      <div key={c.id} className="flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all hover:bg-white/[0.03]">
                        {/* Photo if exists */}
                        {c.media && c.media.length > 0 ? (
                          <div className="h-48 w-full bg-black/50 border-b border-white/5 relative">
                            <img src={c.media[0].url} alt="Issue" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute top-3 right-3 flex gap-2">
                              {section.showUpvote && (
                                <UpvoteButton 
                                  complaintId={c.id} 
                                  initialUpvotes={(c as any).upvoterIds?.length || 0} 
                                  initialHasVoted={hasVoted} 
                                />
                              )}
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded shadow-lg backdrop-blur-md border flex items-center ${statusStyle[c.status.name] || 'bg-black/50 text-white'}`}>
                                {c.status.name}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-3 w-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
                        )}

                        <div className="p-5 flex-1 flex flex-col">
                          {!c.media?.length && (
                            <div className="mb-3 flex items-center justify-between">
                              <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded border ${statusStyle[c.status.name] || 'bg-white/5 text-gray-400'}`}>
                                {c.status.name}
                              </span>
                              {section.showUpvote && (
                                <UpvoteButton 
                                  complaintId={c.id} 
                                  initialUpvotes={(c as any).upvoterIds?.length || 0} 
                                  initialHasVoted={hasVoted} 
                                />
                              )}
                            </div>
                          )}
                          
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-400">{c.category?.name || 'General'}</span>
                          </div>

                          <p className="text-sm text-gray-300 line-clamp-3 mb-4 flex-1">
                            "{c.description}"
                          </p>

                          <div className="space-y-2 mt-auto text-xs text-gray-500 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="truncate pr-2">Location: {c.location?.address || 'Location hidden'}</span>
                              <span className="flex-shrink-0">{timeAgo < 24 ? `${timeAgo}h ago` : `${Math.round(timeAgo/24)}d ago`}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span>Reported by: {c.isAnonymous ? 'Anonymous' : (c.user?.name || 'Citizen')}</span>
                              <span className="font-mono text-gray-600">#{c.id.slice(-6)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {allComplaints.length === 0 && (
            <div className="py-20 text-center border border-white/5 rounded-3xl bg-white/[0.01]">
              <h3 className="text-xl font-bold mb-2">No Community Issues</h3>
              <p className="text-gray-500 max-w-sm mx-auto">There are currently no civic issues reported in the system. Your city is looking great!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
