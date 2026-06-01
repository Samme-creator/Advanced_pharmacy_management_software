import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Building2,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "../components/Modal";

interface Supplier {
  id: number;
  name: string;
  company: string;
  contact: string;
  city: string;
  status: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    contact: "",
    city: "",
    status: "Active"
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    fetch("/api/suppliers")
      .then(res => res.json())
      .then(setSuppliers);
  };

  const handleEdit = (sub: Supplier) => {
    setEditingId(sub.id);
    setFormData({
      name: sub.name,
      company: sub.company,
      contact: sub.contact,
      city: sub.city,
      status: sub.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/suppliers/${editingId}` : "/api/suppliers";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: "", company: "", contact: "", city: "", status: "Active" });
        fetchSuppliers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.company.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Suppliers Directory</h1>
          <p className="text-[12px] text-slate-500 font-medium">{suppliers.length} active wholesale partners</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[12px] font-bold h-10 flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register Supplier
        </button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingId(null); }} 
        title={editingId ? "Update Partner Records" : "Wholesale Partner Registration"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Representative Name</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
              value={formData.name ?? ""}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Company / Firm</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
              value={formData.company ?? ""}
              onChange={e => setFormData({...formData, company: e.target.value})}
              placeholder="e.g. GSK Distributors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
              <input 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                value={formData.city ?? ""}
                onChange={e => setFormData({...formData, city: e.target.value})}
                placeholder="e.g. Mingora"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer mt-4"
          >
            {loading ? "REGISTERING..." : "AUTHORIZE SUPPLIER"}
          </button>
        </form>
      </Modal>

      <div className="relative">
        <label className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </label>
        <input 
          type="text" 
          placeholder="Search by name, company, or city..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[12px] outline-none shadow-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
          value={search ?? ""}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              )}>
                {s.status}
              </span>
            </div>

            <h3 className="text-[15px] font-black text-slate-900 tracking-tight mb-1">{s.name}</h3>
            <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mb-4">{s.company}</p>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-medium">{s.contact}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-medium">{s.city}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
              <button 
                onClick={() => handleEdit(s)}
                className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-lg text-[10px] font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => {
                  if(confirm(`Remove ${s.name} from wholesale directory?`)) {
                    fetch(`/api/suppliers/${s.id}`, { method: "DELETE" }).then(fetchSuppliers);
                  }
                }}
                className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-slate-400 font-medium">No suppliers found matching your search.</p>
        </div>
      )}
    </div>
  );
}
