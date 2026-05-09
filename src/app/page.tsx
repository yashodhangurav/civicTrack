"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">C</div>
          <span className="text-lg font-bold tracking-tight">CivicTrack</span>
        </Link>
        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors">How it Works</a>
          <a href="#features" className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors">Features</a>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-medium hidden lg:block">Logged in as {(session.user as any).role}</span>
              <Link href="/dashboard" className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                My Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/register" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Register
              </Link>
              <Link href="/login" className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center pt-20 md:pt-32 pb-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-indigo-300 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Open311-compliant • AI Triage • Live Maps
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 leading-[0.9]">
          <span className="bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent">Report Civic Issues.</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Routes Them Instantly.</span>
        </h1>

        <p className="text-base md:text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
          Submit complaints with photos and location. Our AI auto-categorizes, assigns the right department, and tracks resolution — all in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full max-w-4xl">
          <Link
            href="/dashboard/community"
            className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-white/[0.03] border border-white/10 text-white font-bold rounded-2xl hover:bg-white/[0.08] transition-all"
          >
            <span className="text-lg">See All Complaints</span>
          </Link>
        </div>

        {/* Trust signals */}
        <div className="mt-16 flex items-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Anonymous Reporting</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> AI Auto-Triage</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> SLA Tracking</span>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 block">End-to-End Workflow</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">From Report to Resolution</h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">Every complaint follows a structured lifecycle with full transparency and SLA enforcement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Submit", desc: "Citizens report issues with description, photos, and GPS location. AI auto-categorizes and assigns priority.", icon: "", color: "from-indigo-600/20 to-indigo-600/5 border-indigo-500/20" },
              { step: "02", title: "Triage & Assign", desc: "Gemini AI classifies the issue type and routes it to the correct department. Staff is notified instantly.", icon: "", color: "from-purple-600/20 to-purple-600/5 border-purple-500/20" },
              { step: "03", title: "Resolve & Verify", desc: "Field workers resolve the issue, citizens rate the outcome. Poor ratings trigger automatic escalation.", icon: "", color: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/20" },
            ].map((item) => (
              <div key={item.step} className={`p-8 rounded-2xl bg-gradient-to-b ${item.color} border backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                <span className="absolute top-4 right-4 text-6xl font-black text-white/[0.03]">{item.step}</span>
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Workflow states visualization */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs">
            {["Submitted", "Assigned", "In Progress", "Resolved", "Closed"].map((state, i) => (
              <div key={state} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-semibold">{state}</span>
                {i < 4 && <span className="text-gray-600">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3 block">Platform Features</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Built for Modern Governance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "AI-Powered Triage", desc: "Google Gemini classifies complaints via NLP, auto-assigning category and priority levels.", icon: "" },
              { title: "Live Geospatial Dashboard", desc: "MapTiler-powered maps show real-time issue distribution across jurisdictions.", icon: "" },
              { title: "SLA Enforcement", desc: "Automatic breach alerts when response or resolution times exceed configurable thresholds.", icon: "" },
              { title: "Citizen Feedback Loop", desc: "Citizens rate resolutions. Poor ratings auto-escalate to management for review.", icon: "" },
              { title: "Role-Based Access", desc: "Separate dashboards for Citizens, Field Workers, Supervisors, and Administrators.", icon: "" },
              { title: "Full Audit Trail", desc: "Every status change, comment, and action is logged for complete transparency.", icon: "" },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-start gap-4 group">
                <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform">{f.icon}</span>
                <div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to Transform Civic Engagement?</h2>
          <p className="text-gray-400 mb-8">Join the platform that empowers citizens and streamlines government response.</p>
          <Link href="/login" className="inline-flex px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] text-lg">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-gray-600">
        <p>© 2026 CivicTrack • Open311 Compliant Civic Issue Tracking Platform</p>
      </footer>
    </div>
  );
}
