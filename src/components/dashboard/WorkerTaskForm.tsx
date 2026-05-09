"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface WorkerTaskFormProps {
  ticketId: string;
  currentStatus: string;
}

export default function WorkerTaskForm({ ticketId, currentStatus }: WorkerTaskFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 })
        });
        if (res.ok) {
          const data = await res.json();
          setPhoto(data.url);
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${ticketId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_name: newStatus,
          comment: notes || (newStatus === "In Progress" ? "Worker started the job." : "Worker completed the job."),
          newMedia: photo ? [photo] : []
        })
      });

      if (res.ok) {
        setIsOpen(false);
        setPhoto(null);
        setNotes("");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getButtonConfig = () => {
    if (currentStatus === "Assigned") {
      return { 
        label: "Start Work", 
        nextStatus: "In Progress", 
        color: "bg-indigo-600 hover:bg-indigo-700",
        photoLabel: "Upload 'Before' Photo (Required)"
      };
    }
    if (currentStatus === "In Progress") {
      return { 
        label: "Resolve Task", 
        nextStatus: "Resolved", 
        color: "bg-emerald-600 hover:bg-emerald-700",
        photoLabel: "Upload 'After' Completion Photo (Required)"
      };
    }
    return null;
  };

  const config = getButtonConfig();
  if (!config) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition ${config.color}`}
      >
        {config.label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white">Update Task Status</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{config.photoLabel}</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-gray-300 hover:file:bg-white/10 transition-all"
                />
                {uploading && <p className="text-[10px] text-indigo-400 mt-1 animate-pulse">Uploading to Cloudinary...</p>}
                {photo && (
                  <div className="mt-3 relative w-full h-32 rounded-lg overflow-hidden border border-white/5 bg-black">
                    <img src={photo} alt="Upload Preview" className="w-full h-full object-contain" />
                    <button onClick={() => setPhoto(null)} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-xs">✕</button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Work Notes / Comments</label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your progress or resolution..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                disabled={loading || uploading || !photo}
                onClick={() => handleSubmit(config.nextStatus)}
                className={`px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg ${config.color} disabled:opacity-50`}
              >
                {loading ? "Saving..." : `Confirm ${config.label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
