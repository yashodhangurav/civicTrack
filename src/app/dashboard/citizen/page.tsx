import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CitizenActions from "@/components/dashboard/CitizenActions";
import CitizenReportForm from "@/components/dashboard/CitizenReportForm";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function CitizenDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  const myTickets = await prisma.complaint.findMany({
    where: { userId },
    include: { status: true, category: true, location: true, logs: { orderBy: { timestamp: 'desc' }, take: 3 } },
    orderBy: { createdAt: 'desc' }
  });

  const submitted = myTickets.filter(t => t.status.name === "Submitted").length;
  const inProgress = myTickets.filter(t => ["Assigned", "In Progress"].includes(t.status.name)).length;
  const resolved = myTickets.filter(t => t.status.name === "Resolved").length;

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav role="CITIZEN" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Complaints & Reports</h1>
          <p className="text-gray-400 mt-1 text-sm">Submit new issues, track progress on your tickets, and provide feedback on resolutions.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Total Reports</span>
            <p className="text-2xl font-bold mt-1 text-white">{myTickets.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Pending</span>
            <p className="text-2xl font-bold mt-1 text-yellow-400">{submitted}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">In Progress</span>
            <p className="text-2xl font-bold mt-1 text-blue-400">{inProgress}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Resolved</span>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{resolved}</p>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Report Form - Left */}
          <div className="lg:col-span-2">
            <CitizenReportForm />
          </div>

          {/* Ticket List - Right */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg">My Tickets</h2>
              <span className="text-xs text-gray-500">{myTickets.length} total</span>
            </div>

            {myTickets.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <p className="text-gray-500 text-sm">No complaints submitted yet. Use the form to report your first civic issue!</p>
              </div>
            ) : (
              myTickets.map(ticket => {
                const statusColor: Record<string, string> = {
                  "Submitted": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                  "Assigned": "bg-blue-500/20 text-blue-400 border-blue-500/30",
                  "In Progress": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
                  "Resolved": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                  "Closed": "bg-gray-500/20 text-gray-400 border-gray-500/30",
                  "More Info Needed": "bg-orange-500/20 text-orange-400 border-orange-500/30",
                };

                return (
                  <div key={ticket.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor[ticket.status.name] || "bg-white/10 text-gray-400"}`}>
                            {ticket.status.name}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono">#{ticket.id.slice(-6)}</span>
                          <span className="text-[10px] text-gray-600">{ticket.category.name}</span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">{ticket.description}</p>
                        {ticket.location && (
                          <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">Location: {ticket.location.address || `${ticket.location.latitude.toFixed(4)}, ${ticket.location.longitude.toFixed(4)}`}</p>
                        )}
                        <p className="text-[10px] text-gray-700 mt-1.5">Submitted {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        
                        {/* Latest activity log */}
                        {ticket.logs.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-gray-500">
                            <span className="font-semibold text-gray-400">Latest Update:</span> {ticket.logs[0].message}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <CitizenActions ticketId={ticket.id} currentStatus={ticket.status.name} citizenRating={ticket.citizenRating} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
