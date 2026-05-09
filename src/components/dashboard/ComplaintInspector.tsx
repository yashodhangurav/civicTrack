"use client";

import { useState } from "react";
import SupervisorAssigner from "./SupervisorAssigner";

interface ComplaintInspectorProps {
  complaint: any;
  officers?: { id: string, name: string }[];
}

export default function ComplaintInspector({ complaint, officers }: ComplaintInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors"
      >
        Inspect Details
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Inspect Complaint #{complaint.id.slice(-6)}</h3>
                <p className="text-xs text-gray-500">Submitted by {complaint.user?.name || "Anonymous"}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Category & Priority */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Category</span>
                  <p className="text-indigo-400 font-semibold">{complaint.category?.name}</p>
                </div>
                <div className="flex-1 text-right">
                  <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Priority</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    complaint.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    complaint.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                    complaint.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{complaint.priority}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] uppercase text-gray-500 font-bold block mb-2">Description</span>
                <p className="text-gray-300 text-sm leading-relaxed bg-white/[0.03] p-4 rounded-xl border border-white/5">
                  {complaint.description}
                </p>
              </div>

              {/* Photo Gallery (Before/After) */}
              {complaint.media && complaint.media.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-gray-500 font-bold block mb-2">Evidence & Resolution Photos</span>
                  <div className="grid grid-cols-2 gap-3">
                    {complaint.media.map((item: any, idx: number) => (
                      <div key={item.id} className="rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video relative group">
                        <img 
                          src={item.url} 
                          alt={`Evidence ${idx + 1}`} 
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx === 0 ? "Initial Report" : `Evidence ${idx}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">GPS Address</span>
                <p className="text-gray-400 text-sm">{complaint.location?.address || "GPS Coordinates Only"}</p>
              </div>
            </div>

            {/* Footer / Actions */}
            {officers && (
              <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                <span className="text-[10px] uppercase text-gray-500 font-bold block mb-3">Assign to Field Worker</span>
                <SupervisorAssigner ticketId={complaint.id} officers={officers} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
