import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  Plus,
  Star,
  History,
  TrendingUp,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "../components/Modal";

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(setCustomers);
  };

  const handleEdit = (cust: Customer) => {
    setEditingId(cust.id);
    setFormData({
      name: cust.name,
      phone: cust.phone,
      address: cust.address || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: "", phone: "", address: "" });
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Registry</h1>
          <p className="text-[12px] text-slate-500 font-medium">{customers.length} registered customers in local database</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-[12px] font-bold h-10 flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Patient Profile
        </button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingId(null); }} 
        title={editingId ? "Update Patient Profile" : "Patient Registration"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
              value={formData.name ?? ""}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Ahmad Khan"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
              value={formData.phone ?? ""}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="03xx-xxxxxxx"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Residential Address</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium min-h-[100px]"
              value={formData.address ?? ""}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Full address of the patient..."
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20 disabled:opacity-50 cursor-pointer mt-4"
          >
            {loading ? "SAVING..." : "COMMIT TO REGISTRY"}
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-12 h-12" />
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Patients</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">{customers.length}</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] text-emerald-600 font-bold">+4 this week</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Active This Month</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">124</div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">82% retention rate</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Avg Patient Visit</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">1.4</div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">Visits per month</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none flex flex-col justify-center">
          <div className="text-[10px] opacity-80 font-bold uppercase tracking-widest mb-1 text-white">Loyalty Points</div>
          <div className="text-2xl font-black tracking-tighter">48,290</div>
          <div className="text-[10px] opacity-90 mt-2 font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Premium Tiers Active
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search patients by name or contact number..."
            className="flex-1 text-[12px] outline-none font-medium placeholder:text-slate-300"
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.map((c) => (
            <div key={c.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[12px]">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-slate-900 tracking-tight">{c.name}</h4>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {c.address || "No address provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last Visit</p>
                  <p className="text-[11px] font-black text-slate-700">2 days ago</p>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <button 
                  onClick={() => handleEdit(c)}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if(confirm(`Permanently remove ${c.name} from registry?`)) {
                      fetch(`/api/customers/${c.id}`, { method: "DELETE" }).then(fetchCustomers);
                    }
                  }}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                >
                   <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-400 text-[12px] font-medium">
              No patients found. Create a new patient profile to track prescriptions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
