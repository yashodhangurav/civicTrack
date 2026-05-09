"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UpvoteButtonProps {
  complaintId: string;
  initialUpvotes: number;
  initialHasVoted: boolean;
}

export default function UpvoteButton({ complaintId, initialUpvotes, initialHasVoted }: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleVote = async () => {
    if (isLoading) return;
    
    // Optimistic update
    setUpvotes(prev => hasVoted ? prev - 1 : prev + 1);
    setHasVoted(!hasVoted);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/complaints/${complaintId}/upvote`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to vote");
      }

      const data = await res.json();
      
      // Sync with server state
      setUpvotes(data.upvotes);
      setHasVoted(data.hasVoted);
      router.refresh(); // Refresh to update other parts of the UI if needed
    } catch (error) {
      // Revert on error
      setUpvotes(prev => hasVoted ? prev + 1 : prev - 1);
      setHasVoted(hasVoted);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
        hasVoted 
          ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30" 
          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
      }`}
    >
      <svg 
        className={`w-4 h-4 transition-transform ${hasVoted ? "scale-110" : "opacity-70"}`} 
        fill={hasVoted ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={hasVoted ? 0 : 2} d="M5 15l7-7 7 7" />
        {hasVoted && <path d="M12 4l-7 7h14l-7-7z" />}
      </svg>
      <span>{upvotes}</span>
    </button>
  );
}
