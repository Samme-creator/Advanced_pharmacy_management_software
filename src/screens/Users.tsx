import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  ShieldCheck, 
  User, 
  Settings, 
  MoreVertical, 
  Mail, 
  Phone,
  Power,
  Shield,
  Activity,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "../components/Modal";

interface SystemUser {
  id: number;
  username: string;
  full_name: string;
  role: string;
  contact: string;
  status: string;
  last_login?: string;
}

export default function Users() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "Staff",
    contact: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  };

  const handleEdit = (user: SystemUser) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      password: "", // Keep empty for password if not changing
      full_name: user.full_name,
      role: user.role,
      contact: user.contact
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      
      const payload: any = { ...formData };
      if (editingId && !formData.password) delete payload.password;
      if (!editingId) payload.status = "Active";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ username: "", password: "", full_name: "", role: "Staff", contact: "" });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (user: SystemUser) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    await fetch(`/api/users/${user.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchUsers();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Access Control</h1>
          <p className="text-[12px] text-slate-500 font-medium font-mono uppercase tracking-widest">User Governance & Security Engine</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert("Security policy engine active. V3.1 will allow rule definitions.")}
            className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-[12px] font-bold h-11 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" /> Security Policies
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[12px] font-bold h-11 flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Provision User
          </button>
        </div>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingId(null); }} 
        title={editingId ? "Update System Account" : "Account Provisioning"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
              value={formData.full_name ?? ""}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
              placeholder="e.g. Syed Samiullah"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username</label>
              <input 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                value={formData.username ?? ""}
                onChange={e => setFormData({...formData, username: e.target.value})}
                placeholder="e.g. sam38"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Access Pass</label>
              <input 
                required
                type="password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                value={formData.password ?? ""}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Access Level</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium appearance-none"
                value={formData.role ?? ""}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="Staff">Staff / Pharmacist</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact No.</label>
              <input 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                value={formData.contact ?? ""}
                onChange={e => setFormData({...formData, contact: e.target.value})}
                placeholder="03xx-xxxxxxx"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={formLoading}
            className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20 disabled:opacity-50 cursor-pointer mt-4"
          >
            {formLoading ? "PROVISIONING..." : "COMMIT TO DATABASE"}
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-500" /> System Load
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">Normal</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-2">All nodes functional</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Operators</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">{users.length}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-2">Active database nodes</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Admin Nodes</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">
            {users.filter(u => u.role === 'Admin').length}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-2">Privileged accounts</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border-none shadow-xl shadow-slate-900/10 text-white flex flex-col justify-center">
          <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest mb-1 px-1">Security Status</div>
          <div className="text-2xl font-black tracking-tighter flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" /> HARDENED
          </div>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-2 px-1">SQL Firewall Active</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <h3 className="text-[14px] font-black text-slate-900 tracking-tight">Active System Nodes</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Real-time sync</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
             <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-[11px]">
               Querying User Matrix...
             </div>
          ) : users.map((user) => (
            <div key={user.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                  user.role === 'Admin' 
                    ? "bg-slate-900 text-white border-slate-800" 
                    : "bg-white text-slate-400 border-slate-100 group-hover:border-slate-200 shadow-sm"
                )}>
                  {user.role === 'Admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-[14px] font-black text-slate-900 tracking-tight">{user.full_name}</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                      user.role === 'Admin' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> @{user.username}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {user.contact}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</p>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                    user.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? "bg-emerald-500" : "bg-red-500")} />
                    {user.status}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="p-3 bg-slate-50 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all cursor-pointer"
                    title="Edit System Node"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleStatus(user)}
                    className={cn(
                      "p-3 rounded-2xl transition-all cursor-pointer",
                      user.status === 'Active' 
                        ? "bg-red-50 text-red-600 hover:bg-red-100" 
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    )}
                    title={user.status === 'Active' ? "Deactivate Account" : "Activate Account"}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm(`Permanently revoke access for ${user.full_name}?`)) {
                        fetch(`/api/users/${user.id}`, { method: "DELETE" }).then(fetchUsers);
                      }
                    }}
                    className="p-3 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all cursor-pointer"
                    title="Delete User Node"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-3xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-[13px] font-black text-emerald-900 tracking-tight">Standard Security Protocol</h4>
            <p className="text-[11px] text-emerald-600 font-medium">Auto-lock session is enabled for all system nodes after 30 minutes of inactivity.</p>
          </div>
        </div>
        <button className="text-[12px] font-bold text-emerald-700 hover:underline cursor-pointer">
          Audit Logs
        </button>
      </div>
    </div>
  );
}
