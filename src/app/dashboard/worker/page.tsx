import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import WorkerTaskForm from "@/components/dashboard/WorkerTaskForm";
import ComplaintInspector from "@/components/dashboard/ComplaintInspector";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function WorkerDashboard() {
  const session = await getServerSession(authOptions);
  const workerId = (session?.user as any)?.id;

  const assignedTickets = await prisma.complaint.findMany({
    where: { assignedToId: workerId },
    include: {
      status: true,
      category: true,
      department: true,
      location: true,
      user: true,
      media: true,
      assignedTo: true,
      logs: { orderBy: { timestamp: 'desc' }, take: 5 }
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }]
  });

  const pending = assignedTickets.filter(t => t.status.name === "Assigned").length;
  const inProgress = assignedTickets.filter(t => t.status.name === "In Progress").length;
  const resolved = assignedTickets.filter(t => t.status.name === "Resolved").length;

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav role="OFFICER" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Field Worker Portal</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage assigned tickets, update statuses, and escalate when needed.</p>
        </div>

        {session?.user && (session.user as any).role === "ADMIN" && (
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
            <span className="font-bold text-xs">NOTICE:</span>
            <div>
              <strong>Admin View Active:</strong> You are currently logged in as an Admin. This portal only displays tickets assigned to the <em>currently logged-in user</em>. To see the tickets you just assigned, you must log out and log in using the specific Field Worker's account, or view them in the Admin Dashboard's "All Complaints" table.
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
            <span className="text-xs text-gray-500 font-medium">Awaiting Action</span>
            <p className="text-2xl font-bold mt-1 text-yellow-400">{pending}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <span className="text-xs text-gray-500 font-medium">In Progress</span>
            <p className="text-2xl font-bold mt-1 text-blue-400">{inProgress}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <span className="text-xs text-gray-500 font-medium">Resolved</span>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{resolved}</p>
          </div>
        </div>

        {/* Ticket List */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg">Assigned Tickets</h2>

          {assignedTickets.length === 0 ? (
            <div className="p-16 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <p className="text-gray-500">No tickets assigned to you. Check back later!</p>
            </div>
          ) : (
            assignedTickets.map(ticket => {
              const priorityStyle: Record<string, string> = {
                CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse",
                HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
                MEDIUM: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                LOW: "bg-gray-500/20 text-gray-400 border-gray-500/30",
              };
              const statusColor: Record<string, string> = {
                "Assigned": "bg-yellow-500/20 text-yellow-400",
                "In Progress": "bg-indigo-500/20 text-indigo-400",
                "Resolved": "bg-emerald-500/20 text-emerald-400",
                "More Info Needed": "bg-orange-500/20 text-orange-400",
              };

              const now = new Date();
              const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < now && ticket.status.name !== "Resolved";

              return (
                <div key={ticket.id} className={`rounded-xl border transition-colors overflow-hidden ${
                  ticket.isEscalated ? 'bg-red-900/10 border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]' :
                  ticket.priority === 'CRITICAL' ? 'bg-red-500/[0.03] border-red-500/10' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}>
                  {ticket.isEscalated && (
                    <div className="bg-red-600 text-white font-bold text-center py-2 text-sm uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                      ESCALATED BY SUPERVISOR: SLA BREACHED — IMMEDIATE ACTION REQUIRED
                    </div>
                  )}
                  {/* Ticket Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityStyle[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[ticket.status.name] || "bg-white/10 text-gray-400"}`}>
                            {ticket.status.name}
                          </span>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                              OVERDUE
                            </span>
                          )}
                          <span className="text-[10px] text-gray-600 font-mono">#{ticket.id.slice(-6)}</span>
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{ticket.category.name}</h3>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <ComplaintInspector complaint={ticket} />
                        <WorkerTaskForm ticketId={ticket.id} currentStatus={ticket.status.name} />
                      </div>
                    </div>
                  </div>

                  {/* Complaint Details Section */}
                  <div className="px-5 pb-5 space-y-4">
                    {/* Full Description */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] uppercase text-gray-500 font-bold block mb-2">Description</span>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Location */}
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Location</span>
                        <p className="text-xs text-gray-300">{ticket.location?.address || "GPS Only"}</p>
                        {ticket.location && (
                          <p className="text-[10px] text-gray-600 mt-0.5">{ticket.location.latitude.toFixed(4)}, {ticket.location.longitude.toFixed(4)}</p>
                        )}
                      </div>

                      {/* Citizen Info */}
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Reported By</span>
                        <p className="text-xs text-gray-300">{ticket.isAnonymous ? "Anonymous" : (ticket.user?.name || "Unknown")}</p>
                        {!ticket.isAnonymous && ticket.user?.phone && (
                          <p className="text-[10px] text-gray-500 mt-0.5">TEL: {ticket.user.phone}</p>
                        )}
                      </div>

                      {/* Department */}
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Department</span>
                        <p className="text-xs text-gray-300">{ticket.department?.name || "General Services"}</p>
                      </div>

                      {/* SLA / Due Date */}
                      <div className={`p-3 rounded-lg border ${isOverdue ? 'bg-red-500/5 border-red-500/10' : 'bg-white/[0.02] border-white/5'}`}>
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Due Date</span>
                        <p className={`text-xs ${isOverdue ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                          {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Evidence Photos */}
                    {ticket.media && ticket.media.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-2">Evidence Photos</span>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {ticket.media.map((item: any, idx: number) => (
                            <div key={item.id} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-white/10 bg-black/40 relative group">
                              <img 
                                src={item.url} 
                                alt={`Evidence ${idx + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 text-[8px] text-white text-center">
                                {idx === 0 ? "Before" : `Photo ${idx + 1}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activity Log */}
                    {ticket.logs.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-2">Activity Log</span>
                        <div className="space-y-1.5">
                          {ticket.logs.map((log: any, idx: number) => (
                            <div key={log.id} className={`p-2.5 rounded-lg text-xs ${idx === 0 ? 'bg-indigo-500/5 border border-indigo-500/10 text-indigo-300' : 'bg-white/[0.02] border border-white/5 text-gray-500'}`}>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-semibold text-[10px]">
                                  {idx === 0 ? "Latest" : ""} {log.user?.name || "System"}
                                </span>
                                <span className="text-[10px] text-gray-600">
                                  {new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {log.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submitted Date */}
                    <div className="flex items-center justify-between text-[10px] text-gray-600 pt-2 border-t border-white/5">
                      <span>Submitted: {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Last Updated: {new Date(ticket.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
