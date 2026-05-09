"use client";

import { useState } from "react";

export default function ReportForm() {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate getting geolocation
      let location = { lat: 19.076, lng: 72.877, address: "Unknown" };
      if ("geolocation" in navigator) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              location = { lat: pos.coords.latitude, lng: pos.coords.longitude, address: "GPS Location" };
              resolve(true);
            },
            () => resolve(false) // Fallback
          );
        });
      }

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          location,
          isAnonymous: true, // Supporting anonymous whistleblowers
        })
      });

      if (res.ok) {
        setSuccess(true);
        setDescription("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
        <h3 className="text-xl font-bold text-emerald-400 mb-2">Complaint Submitted!</h3>
        <p className="text-emerald-200/70 mb-6">Our AI has automatically categorized your issue and routed it to the correct department.</p>
        <button onClick={() => setSuccess(false)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg">
          Report Another Issue
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 max-w-xl w-full text-left backdrop-blur-sm">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Describe the Issue</label>
        <textarea 
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Overflowing garbage bin near the park entrance..."
          className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white resize-none"
        />
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Powered by Gemini AI for auto-categorization
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
            GPS
          </div>
          Auto-attaching GPS location
        </div>
        <button 
          disabled={isSubmitting}
          type="submit"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition shadow-[0_0_15px_rgba(79,70,229,0.3)]"
        >
          {isSubmitting ? "Submitting..." : "Submit Anonymously"}
        </button>
      </div>
    </form>
  );
}
