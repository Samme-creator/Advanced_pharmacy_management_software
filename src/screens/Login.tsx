import React, { useState } from "react";
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Loader2, 
  AlertCircle,
  Database,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || "Login fail. Unauthorized access.");
      }
    } catch (err) {
      setError("Network error. System unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl mb-6 shadow-2xl shadow-emerald-500/10">
            <Building className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">MEDICARE PRO</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Institutional Pharmacy Engine v3.0</p>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-500 space-y-6"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 animate-in shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-[11px] font-bold leading-tight">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operator ID</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter username"
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-[13px] outline-none focus:border-emerald-500/30 focus:bg-slate-900/80 transition-all font-medium"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Access Protocol</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  placeholder="Enter password"
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-[13px] outline-none focus:border-emerald-500/30 focus:bg-slate-900/80 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-slate-950 h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Initialize System <ShieldCheck className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-500 text-center font-medium opacity-60">
            Authorized Personnel Only. All logins are logged server-side.
          </p>
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
             <p className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-widest text-center">
               Default Demo Access: admin / admin123
             </p>
          </div>
        </form>

        <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2">
             <Database className="w-4 h-4 text-slate-400" />
             <span className="text-[9px] font-black uppercase text-slate-400">SQL Engine Active</span>
           </div>
           <div className="w-px h-3 bg-slate-700" />
           <div className="flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-slate-400" />
             <span className="text-[9px] font-black uppercase text-slate-400">RSA 4096 Secure</span>
           </div>
        </div>
      </div>
    </div>
  );
}
