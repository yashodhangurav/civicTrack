"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CitizenActions({ ticketId, currentStatus, citizenRating }: { ticketId: string, currentStatus: string, citizenRating: number | null }) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const submitFeedback = async () => {
    if (!rating) return alert("Please select a rating from 1 to 5");
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${ticketId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback })
      });
      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === "Resolved" && !citizenRating) {
    return (
      <>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition"
        >
          Rate Resolution
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">Rate Your Experience</h3>
              <p className="text-sm text-gray-400 mb-4">Are you satisfied with the resolution?</p>
              
              <div className="flex justify-between mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform ${rating && rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-600 hover:text-yellow-200'}`}
                  >
                    {star}
                  </button>
                ))}
              </div>

              <textarea 
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Optional feedback notes..."
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />

              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button disabled={loading} onClick={submitFeedback} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-sm font-medium">
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (citizenRating) {
    return <span className="text-yellow-400 font-bold text-sm">Rated {citizenRating}/5</span>;
  }

  return null;
}
