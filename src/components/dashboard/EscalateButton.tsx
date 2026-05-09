"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EscalateButton({ ticketId, isEscalated }: { ticketId: string, isEscalated?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEscalate = async () => {
    if (!confirm("Are you sure you want to escalate this task? The field worker will receive an immediate alert.")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/complaints/${ticketId}/escalate`, {
        method: "POST",
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

  if (isEscalated) {
    return <span className="px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/50 rounded text-xs font-bold ml-4">Already Escalated</span>;
  }

  return (
    <button 
      disabled={loading}
      onClick={handleEscalate}
      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-bold transition ml-4 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
    >
      {loading ? "Escalating..." : "Escalate to Worker"}
    </button>
  );
}
