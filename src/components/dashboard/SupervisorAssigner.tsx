"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SupervisorAssignerProps {
  ticketId: string;
  officers: { id: string, name: string }[];
}

export default function SupervisorAssigner({ ticketId, officers }: SupervisorAssignerProps) {
  const router = useRouter();
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [slaHours, setSlaHours] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedOfficer) return alert("Please select a Field Worker first.");
    setLoading(true);

    try {
      const res = await fetch(`/api/complaints/${ticketId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_name: "Assigned",
          comment: "Supervisor manually assigned this ticket to a Field Worker.",
          assignedToId: selectedOfficer,
          slaHours: slaHours !== "" ? Number(slaHours) : undefined
        })
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2 sm:mt-0 sm:w-auto">
      <select 
        value={selectedOfficer}
        onChange={(e) => setSelectedOfficer(e.target.value)}
        className="w-full sm:w-48 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option value="">Select Worker...</option>
        {officers.map(o => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <input 
        type="number" 
        min="1"
        placeholder="SLA Hrs" 
        value={slaHours}
        onChange={(e) => setSlaHours(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full sm:w-24 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      <button 
        disabled={loading || !selectedOfficer}
        onClick={handleAssign}
        className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors"
      >
        {loading ? "..." : "Assign"}
      </button>
    </div>
  );
}
