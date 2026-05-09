"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { signIn } from "next-auth/react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CITIZEN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        // Automatically sign in after successful registration
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.ok) {
          window.location.href = "/dashboard";
        } else {
          router.push("/login?registered=true");
        }
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8 group">
          <span>&larr;</span> Back to Home
        </Link>

        <form onSubmit={handleRegister} className="w-full p-8 bg-white/[0.03] border border-white/10 rounded-3xl space-y-5 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
            <p className="text-gray-400 mt-1 text-sm">Join the CivicTrack platform</p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
              Error: {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Role</label>
              <select 
                value={role} onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all appearance-none"
              >
                <option value="CITIZEN" className="bg-gray-900">Citizen (Public Reporter)</option>
                <option value="OFFICER" className="bg-gray-900">Field Worker (Service Staff)</option>
                <option value="SUPERVISOR" className="bg-gray-900">Supervisor (Compliance)</option>
                <option value="ADMIN" className="bg-gray-900">Administrator (Governance)</option>
              </select>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg">
            {loading ? "Creating Account..." : "Register Now"}
          </button>

          <p className="text-center text-sm text-gray-500 pt-2">
            Already have an account? <Link href="/login" className="text-indigo-400 hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
