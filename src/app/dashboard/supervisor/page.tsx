import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import SupervisorActions from "@/components/dashboard/SupervisorActions";
import DashboardNav from "@/components/dashboard/DashboardNav";
import MapWrapper from "@/components/MapWrapper";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SupervisorAssigner from "@/components/dashboard/SupervisorAssigner";
import ComplaintInspector from "@/components/dashboard/ComplaintInspector";
import EscalateButton from "@/components/dashboard/EscalateButton";

export default async function SupervisorDashboard() {
  const session = await getServerSession(authOptions);
  const supervisorId = (session?.user as any)?.id;

  const complaints = await prisma.complaint.findMany({
    include: { status: true, category: true, assignedTo: true, user: true, location: true, media: true },
    orderBy: { createdAt: 'desc' }
  });

  const availableOfficers = await prisma.user.findMany({
    where: { role: 'OFFICER' },
    select: { id: true, name: true }
  });

  const pendingInspection = complaints.filter(
    c => c.status.name === 'Submitted' ||
      c.status.name === 'Assigned to Supervisor' ||
      (c.status.name === 'Assigned to Supervisor' && c.assignedToId === supervisorId)
  );

  const active = complaints.filter(c => c.status.name !== 'Resolved' && c.status.name !== 'Closed');
  const resolved = complaints.filter(c => c.status.name === 'Resolved');
  const critical = complaints.filter(c => c.priority === 'CRITICAL');
  const withRatings = complaints.filter(c => c.citizenRating !== null);
  const avgRating = withRatings.length > 0
    ? (withRatings.reduce((sum, c) => sum + (c.citizenRating || 0), 0) / withRatings.length).toFixed(1)
    : "N/A";

  const now = new Date();
  const breaches = active.filter(c => c.dueDate && new Date(c.dueDate) < now);

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav role="SUPERVISOR" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Supervisor Command Center</h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time civic issue monitoring, SLA tracking, and escalation management.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Active</span>
            <p className="text-2xl font-bold mt-1 text-orange-400">{active.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Resolved</span>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{resolved.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
            <span className="text-xs text-gray-500 font-medium">SLA Breaches</span>
            <p className="text-2xl font-bold mt-1 text-red-400">{breaches.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
            <span className="text-xs text-gray-500 font-medium">Critical</span>
            <p className="text-2xl font-bold mt-1 text-red-400">{critical.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Avg Rating</span>
            <p className="text-2xl font-bold mt-1 text-yellow-400">{avgRating} / 5</p>
          </div>
        </div>

        {/* SLA Breaches Alert */}
        {breaches.length > 0 && (
          <div className="p-5 bg-red-500/5 border border-red-500/15 rounded-xl">
            <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              SLA Breaches — Immediate Action Required
            </h3>
            <div className="space-y-2">
              {breaches.map(b => (
                <div key={b.id} className="flex items-center justify-between bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white">#{b.id.slice(-6)} — {b.category.name}</span>
                    <span className="text-xs text-gray-500 ml-3">Assigned to: {b.assignedTo?.name || 'Unassigned'}</span>
                    <span className="text-xs text-red-400/60 ml-3">Due: {b.dueDate ? new Date(b.dueDate).toLocaleDateString() + ' ' + new Date(b.dueDate).toLocaleTimeString() : "N/A"}</span>
                  </div>
                  <EscalateButton ticketId={b.id} isEscalated={(b as any).isEscalated} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Escalations */}
        {critical.length > 0 && (
          <div className="p-5 bg-orange-500/5 border border-orange-500/15 rounded-xl">
            <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Escalated Tickets (Poor Citizen Feedback)
            </h3>
            <div className="space-y-2">
              {critical.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-orange-500/5 p-3 rounded-lg border border-orange-500/10">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white">#{c.id.slice(-6)} — {c.category.name}</span>
                    {c.citizenRating && <span className="text-xs text-yellow-400 ml-3">Rating: {c.citizenRating}/5</span>}
                    {c.citizenFeedback && <span className="text-xs text-gray-500 ml-3">&quot;{c.citizenFeedback}&quot;</span>}
                  </div>
                  <SupervisorActions ticketId={c.id} isCritical={true} />
                </div>
              ))}
            </div>
          </div>
        )}



        {/* All Tickets Table */}
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            All Complaints <span className="text-xs text-gray-600 font-normal">({complaints.length})</span>
          </h2>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] border-b border-white/5">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {complaints.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">#{c.id.slice(-6)}</td>
                      <td className="px-4 py-3">{c.category.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                            c.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                              c.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                          }`}>{c.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status.name === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                            c.status.name === 'In Progress' ? 'bg-indigo-500/20 text-indigo-400' :
                              'bg-yellow-500/20 text-yellow-400'
                          }`}>{c.status.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{c.assignedTo?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <ComplaintInspector complaint={c} officers={availableOfficers} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Jurisdictional Map
          </h2>
          <MapWrapper />
        </div>
      </div>
    </div>
  );
}
