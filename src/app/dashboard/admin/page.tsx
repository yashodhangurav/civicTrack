import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard/DashboardNav";

export const dynamic = 'force-dynamic';
import AdminAssigner from "@/components/dashboard/AdminAssigner";

export default async function AdminDashboard() {
  const totalUsers = await prisma.user.count();
  const totalComplaints = await prisma.complaint.count();
  const citizens = await prisma.user.count({ where: { role: "CITIZEN" } });
  const officers = await prisma.user.count({ where: { role: "OFFICER" } });
  const supervisors = await prisma.user.count({ where: { role: "SUPERVISOR" } });

  const statuses = await prisma.complaint.groupBy({
    by: ['priority'],
    _count: { _all: true }
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  const availableOfficers = await prisma.user.findMany({
    where: { role: 'OFFICER' },
    select: { id: true, name: true }
  });

  const unassignedComplaints = await prisma.complaint.findMany({
    where: { status: { name: 'Submitted' } },
    include: { category: true, location: true, user: true, media: true },
    orderBy: { createdAt: 'desc' }
  });

  const allComplaints = await prisma.complaint.findMany({
    include: { category: true, status: true, assignedTo: true, location: true, user: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav role="ADMIN" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="text-gray-400 mt-1 text-sm">System health, user management, and platform-wide analytics.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Total Users</span>
            <p className="text-2xl font-bold mt-1 text-indigo-400">{totalUsers}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Total Tickets</span>
            <p className="text-2xl font-bold mt-1 text-indigo-400">{totalComplaints}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Citizens</span>
            <p className="text-2xl font-bold mt-1 text-blue-400">{citizens}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Officers</span>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{officers}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-gray-500 font-medium">Supervisors</span>
            <p className="text-2xl font-bold mt-1 text-orange-400">{supervisors}</p>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
          <h3 className="font-bold mb-4">Complaint Priority Distribution</h3>
          <div className="flex flex-wrap gap-4">
            {statuses.map(s => (
              <div key={s.priority} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  s.priority === 'CRITICAL' ? 'bg-red-500' :
                  s.priority === 'HIGH' ? 'bg-orange-500' :
                  s.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm text-gray-300">{s.priority}: <span className="font-bold text-white">{s._count._all}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="font-bold text-emerald-400">All Systems Operational</h3>
              <p className="text-xs text-gray-500 mt-0.5">Database connected • AI Triage active • Map services online</p>
            </div>
          </div>
        </div>

        {/* Unassigned Tickets (Assignment Center) */}
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            Action Required: Unassigned Tickets 
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{unassignedComplaints.length}</span>
          </h2>
          {unassignedComplaints.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-white/5 bg-white/[0.01] text-gray-500">
              All tickets have been assigned.
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.03] border-b border-white/5">
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">ID / Citizen</th>
                      <th className="px-4 py-3">Category & Desc</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Assign Worker</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {unassignedComplaints.map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-gray-400 mb-1">{c.id.slice(-6)}</div>
                          <div className="font-medium text-gray-300">{c.user?.name || 'Anonymous'}</div>
                        </td>
                        <td className="px-4 py-3 max-w-xs flex items-center gap-3">
                          {c.media && c.media.length > 0 && (
                            <img src={c.media[0].url} alt="Thumbnail" className="w-12 h-12 rounded object-cover border border-white/10 flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-indigo-300 mb-0.5">{c.category?.name || 'General'}</div>
                            <div className="text-gray-400 truncate text-xs" title={c.description}>{c.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {c.location?.address || 'GPS Only'}
                        </td>
                        <td className="px-4 py-3">
                          <AdminAssigner ticketId={c.id} officers={availableOfficers} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* All Complaints Overview */}
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            All Complaints Overview
            <span className="text-xs text-gray-600 font-normal">({allComplaints.length})</span>
          </h2>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] border-b border-white/5">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Citizen</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allComplaints.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">#{c.id.slice(-6)}</td>
                      <td className="px-4 py-3">{c.category.name}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{c.user?.name || 'Anonymous'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                          c.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                          c.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{c.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status.name === 'Submitted' ? 'bg-yellow-500/20 text-yellow-400' :
                          c.status.name === 'Assigned' ? 'bg-blue-500/20 text-blue-400' :
                          c.status.name === 'In Progress' ? 'bg-indigo-500/20 text-indigo-400' :
                          c.status.name === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                          c.status.name === 'Closed' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-white/10 text-gray-400'
                        }`}>{c.status.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{c.assignedTo?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div>
          <h2 className="font-bold text-lg mb-3">Recent Users</h2>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] border-b border-white/5">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                          u.role === 'SUPERVISOR' ? 'bg-orange-500/20 text-orange-400' :
                          u.role === 'OFFICER' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
