"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LocationPickerMapWrapper from "./LocationPickerMapWrapper";

export default function CitizenReportForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = null;
      if (imagePreview) {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imagePreview })
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      const payloadLocation = location 
        ? { ...location, address: "GPS Location" } 
        : { lat: 19.076, lng: 72.877, address: "Default Location" };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: (session?.user as any)?.id,
          description,
          category_name: category || undefined,
          location: payloadLocation,
          media: imageUrl ? [imageUrl] : undefined,
          isAnonymous: false,
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setDescription("");
        setCategory("");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
        <div className="text-xl font-bold mb-4 text-emerald-400">SUBMITTED</div>
        <h3 className="text-xl font-bold text-emerald-400 mb-2">Complaint Submitted Successfully!</h3>
        <p className="text-sm text-gray-400 mb-1">Ticket ID: <code className="bg-white/10 px-2 py-0.5 rounded text-emerald-300 font-mono">{result.complaint_id}</code></p>
        <p className="text-sm text-gray-400 mb-6">Status: <span className="text-emerald-400 font-semibold">{result.status}</span></p>
        <p className="text-xs text-gray-500 mb-4">AI has auto-categorized your issue and routed it to the correct department.</p>
        <button onClick={() => setResult(null)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all">
          Report Another Issue
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg">New Complaint</h3>
        <span className="text-xs text-indigo-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          AI Triage Active
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Describe the Issue *</label>
        <textarea 
          required rows={4} value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Overflowing garbage bin near the park entrance on MG Road..."
          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white resize-none placeholder:text-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Category (optional — AI will auto-detect)</label>
        <select 
          value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white appearance-none"
        >
          <option value="">Let AI decide...</option>
          <option value="Garbage / Sanitation">Garbage / Sanitation</option>
          <option value="Roads / Potholes">Roads / Potholes</option>
          <option value="Water Supply">Water Supply</option>
          <option value="Electricity / Streetlights">Electricity / Streetlights</option>
          <option value="Drainage / Sewage">Drainage / Sewage</option>
          <option value="Parks & Recreation">Parks & Recreation</option>
          <option value="Public Transport">Public Transport</option>
          <option value="Animal Control">Animal Control</option>
          <option value="Vandalism / Graffiti">Vandalism / Graffiti</option>
          <option value="Traffic Signals / Signs">Traffic Signals / Signs</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Attach Photo (Optional)</label>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 transition-all bg-black/30 border border-white/10 rounded-xl"
        />
        {imagePreview && (
          <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-white/10">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >✕</button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Precise Location (GPS)</label>
        <LocationPickerMapWrapper location={location} setLocation={setLocation} />
      </div>

      <div className="flex justify-end pt-3 border-t border-white/5">
        <button 
          disabled={isSubmitting} type="submit"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          {isSubmitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </div>
    </form>
  );
}
