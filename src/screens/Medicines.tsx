import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ScanLine
} from "lucide-react";
import { Medicine } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import Modal from "../components/Modal";

export default function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    generic: "",
    category: "Tablet",
    buy_price: "",
    sell_price: "",
    stock: "",
    min_stock: "",
    expiry_date: ""
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = () => {
    fetch("/api/medicines")
      .then(res => res.json())
      .then(setMedicines);
  };

  const handleEdit = (med: Medicine) => {
    setEditingId(med.id);
    setFormData({
      name: med.name,
      generic: med.generic,
      category: med.category,
      buy_price: med.buy_price.toString(),
      sell_price: med.sell_price.toString(),
      stock: med.stock.toString(),
      min_stock: med.min_stock.toString(),
      expiry_date: med.expiry_date || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const status = Number(formData.stock) <= Number(formData.min_stock) ? "Low Stock" : "OK";
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/medicines/${editingId}` : "/api/medicines";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
          name: "",
          generic: "",
          category: "Tablet",
          buy_price: "",
          sell_price: "",
          stock: "",
          min_stock: "",
          expiry_date: ""
        });
        fetchMedicines();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = medicines.filter(m => 
    (m.name.toLowerCase().includes(search.toLowerCase()) || 
     m.generic.toLowerCase().includes(search.toLowerCase())) &&
    (filter === "All" || m.category === filter)
  );

  const handleScanBarcode = () => {
    alert("Activating scanner (Camera permission required)... No scanner hardware detected in browser environment.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medicine Inventory</h1>
          <p className="text-[12px] text-slate-500 font-medium">{medicines.length} items recorded in local database</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-[12px] font-bold h-10 flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Medicine
          </button>
          <button 
            onClick={handleScanBarcode}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[12px] font-bold h-10 flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ScanLine className="w-4 h-4" /> Scan Barcode
          </button>
        </div>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingId(null); }} 
        title={editingId ? "Update Medicine Record" : "Register New Medicine"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Medicine Name</label>
              <input 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                value={formData.name ?? ""}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Panadol"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Generic Name</label>
              <input 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                value={formData.generic ?? ""}
                onChange={e => setFormData({...formData, generic: e.target.value})}
                placeholder="e.g. Paracetamol"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium appearance-none"
                value={formData.category ?? ""}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Tablet">Tablet</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Capsule">Capsule</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expiry Date</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                value={formData.expiry_date ?? ""}
                onChange={e => setFormData({...formData, expiry_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Purchase Price</label>
              <input 
                type="number"
                step="0.01"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                placeholder="0.00"
                value={formData.buy_price ?? ""}
                onChange={e => setFormData({...formData, buy_price: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selling Price</label>
              <input 
                type="number"
                step="0.01"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                placeholder="0.00"
                value={formData.sell_price ?? ""}
                onChange={e => setFormData({...formData, sell_price: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">In Stock</label>
              <input 
                type="number"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                placeholder="0"
                value={formData.stock ?? ""}
                onChange={e => setFormData({...formData, stock: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Min Threshold</label>
              <input 
                type="number"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium"
                placeholder="low stock alert"
                value={formData.min_stock ?? ""}
                onChange={e => setFormData({...formData, min_stock: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20 disabled:opacity-50 cursor-pointer mt-4"
          >
            {loading ? "PROVISIONING..." : "COMMIT TO DATABASE"}
          </button>
        </form>
      </Modal>

      <div className="flex gap-4 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <label className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </label>
          <input 
            type="text" 
            placeholder="Search medicine, generic name, barcode..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-transparent rounded-lg text-[12px] outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/5 transition-all font-medium"
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="h-8 w-px bg-slate-100 mx-1"></div>

        <select 
          className="bg-transparent px-2 py-2 text-[12px] font-bold text-slate-600 outline-none cursor-pointer hover:text-emerald-600 transition-colors"
          value={filter ?? ""}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Tablet">Tablet</option>
          <option value="Syrup">Syrup</option>
          <option value="Injection">Injection</option>
          <option value="Capsule">Capsule</option>
        </select>

        <button 
          onClick={() => { setSearch(""); setFilter("All"); }}
          className="h-10 px-4 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-2 text-[12px] font-bold cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50/50 border-b border-slate-100 p-4">
          <div className="grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.8fr_0.7fr_0.9fr_0.5fr] gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">
            <span>Medicine Name</span>
            <span>Generic</span>
            <span>Category</span>
            <span className="text-right">Buy Rs.</span>
            <span className="text-right">Sell Rs.</span>
            <span className="text-center">Stock</span>
            <span className="text-right">Status</span>
            <span className="text-right">Actions</span>
          </div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {filtered.map((med) => (
            <div key={med.id} className="grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.8fr_0.7fr_0.9fr_0.5fr] gap-4 p-4 text-[11px] items-center hover:bg-slate-50/30 transition-colors group px-8">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                {med.name}
              </span>
              <span className="text-slate-500 font-medium italic">{med.generic}</span>
              <span className="text-slate-500">{med.category}</span>
              <span className="text-right text-slate-400 font-mono font-bold tracking-tight">{med.buy_price.toFixed(2)}</span>
              <span className="text-right text-slate-900 font-black font-mono tracking-tight">{med.sell_price.toFixed(2)}</span>
              <div className="flex justify-center">
                <span className={cn(
                  "px-2.5 py-0.5 rounded text-[10px] font-black min-w-[32px] text-center",
                  med.stock === 0 ? "bg-red-100 text-red-700" : 
                  med.stock <= med.min_stock ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-600"
                )}>
                  {med.stock}
                </span>
              </div>
              <div className="flex justify-end">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                  med.status === "OK" ? "bg-emerald-100 text-emerald-700" :
                  med.status === "Low Stock" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                )}>
                  {med.status}
                </span>
              </div>
              <div className="flex justify-end gap-1">
                <button 
                  onClick={() => handleEdit(med)}
                  className="p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if(confirm(`Permanently delete ${med.name}?`)) {
                      fetch(`/api/medicines/${med.id}`, { method: "DELETE" }).then(fetchMedicines);
                    }
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-200" />
              </div>
              <div>
                <p className="text-slate-900 font-bold">No results found</p>
                <p className="text-slate-400 text-[11px] mt-1">Try adjusting your search filters or generic names.</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-50/30 border-t border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-8">
          Showing {filtered.length} of {medicines.length} total medicines
        </div>
      </div>
    </div>
  );
}
