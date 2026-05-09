"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupervisorActions({ ticketId, isCritical }: { ticketId: string, isCritical: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const clearAlert = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${ticketId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status_name: "Assigned", 
          comment: "Supervisor reviewed escalation and re-assigned for priority action." 
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

  if (!isCritical) return null;

  return (
    <button 
      disabled={loading}
      onClick={clearAlert}
      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-bold transition ml-4"
    >
      {loading ? "Processing..." : "Acknowledge & Reassign"}
    </button>
  );
}
