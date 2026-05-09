"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkerActions({ ticketId, currentStatus }: { ticketId: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status_name: string, comment?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${ticketId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_name, comment })
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

  if (currentStatus === "Assigned") {
    return (
      <button 
        disabled={loading}
        onClick={() => updateStatus("In Progress", "Field worker started investigation.")}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-sm font-medium transition"
      >
        {loading ? "Updating..." : "Start Work"}
      </button>
    );
  }

  if (currentStatus === "In Progress") {
    return (
      <div className="flex items-center gap-2">
        <button 
          disabled={loading}
          onClick={() => {
            const comment = prompt("Enter resolution notes:");
            if (comment !== null) updateStatus("Resolved", comment);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg text-sm font-medium transition"
        >
          {loading ? "Updating..." : "Mark Resolved"}
        </button>
        <button 
          disabled={loading}
          onClick={() => {
            const comment = prompt("Reason for escalation:");
            if (comment) updateStatus("More Info Needed", `Escalated: ${comment}`);
          }}
          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 disabled:opacity-50 rounded-lg text-sm font-medium transition"
        >
          Escalate
        </button>
      </div>
    );
  }

  return null;
}
