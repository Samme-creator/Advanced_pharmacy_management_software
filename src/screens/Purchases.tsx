import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  ArrowUpRight, 
  Calendar,
  Clock,
  MoreVertical,
  ChevronRight,
  Trash2,
  Package
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Modal from "../components/Modal";

interface Purchase {
  id: number;
  po_no: string;
  supplier_name: string;
  total: number;
  status: string;
  created_at: string;
}

interface Medicine {
  id: number;
  name: string;
  buy_price: number;
}

interface Supplier {
  id: number;
  name: string;
}

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetchPurchases();
    fetch("/api/suppliers").then(res => res.json()).then(setSuppliers);
    fetch("/api/medicines").then(res => res.json()).then(setMedicines);
  }, []);

  const fetchPurchases = () => {
    fetch("/api/purchases")
      .then(res => res.json())
      .then(setPurchases);
  };

  const addItem = (medId: string) => {
    const med = medicines.find(m => m.id === Number(medId));
    if (!med) return;
    setCart(prev => [...prev, { ...med, qty: 1 }]);
  };

  const updateQty = (index: number, qty: number) => {
    const newCart = [...cart];
    newCart[index].qty = qty;
    setCart(newCart);
  };

  const removeItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce((acc, curr) => acc + (curr.buy_price * curr.qty), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !selectedSupplier) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: Number(selectedSupplier),
          items: cart,
          total: totalAmount
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setCart([]);
        setSelectedSupplier("");
        fetchPurchases();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Procurement</h1>
          <p className="text-[12px] text-slate-500 font-medium">Purchase orders and wholesale tracking</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[12px] font-bold h-10 flex items-center gap-2 shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Purchase Order
        </button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="New Purchase Logistics"
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Supplier</label>
            <select 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-[13px] outline-none focus:border-emerald-500/30 focus:bg-white transition-all font-medium appearance-none"
              value={selectedSupplier ?? ""}
              onChange={e => setSelectedSupplier(e.target.value)}
            >
              <option value="">Select a supplier...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Inventory Line Items</label>
              <select 
                className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg outline-none cursor-pointer"
                onChange={e => {
                  if (e.target.value) addItem(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="">+ Add Medicine</option>
                {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden min-h-[150px]">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-[11px] font-medium flex flex-col items-center gap-2">
                  <Package className="w-6 h-6 opacity-20" />
                  No items added to procurement list
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cart.map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between bg-white/50">
                      <div>
                        <p className="text-[12px] font-black text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight">Buy: {formatCurrency(item.buy_price)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-8">
                          <button 
                            type="button" 
                            onClick={() => updateQty(i, Math.max(1, item.qty - 1))}
                            className="px-2 hover:bg-slate-100 transition-colors"
                          >-</button>
                          <input 
                            readOnly 
                            className="w-10 text-center text-[11px] font-bold bg-transparent outline-none" 
                            value={item.qty} 
                          />
                          <button 
                            type="button" 
                            onClick={() => updateQty(i, item.qty + 1)}
                            className="px-2 hover:bg-slate-100 transition-colors"
                          >+</button>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeItem(i)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-xl">
             <div>
               <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Estimated Logistics Total</p>
               <p className="text-[18px] font-black tracking-tighter">{formatCurrency(totalAmount)}</p>
             </div>
             <button 
              type="submit"
              disabled={loading || cart.length === 0}
              className="bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
             >
               {loading ? "PROCESSING..." : "FINALIZE PO"}
             </button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-[14px] font-black text-slate-900 mb-1 tracking-tight">Active Orders</h3>
          <p className="text-[24px] font-black text-slate-900 tracking-tighter">12</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Pending Delivery</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-[14px] font-black text-slate-900 mb-1 tracking-tight">Procurement Value</h3>
          <p className="text-[24px] font-black text-slate-900 tracking-tighter">{formatCurrency(458200)}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Current Quarter</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-[14px] font-black text-slate-900 mb-1 tracking-tight">Avg. Fulfillment</h3>
          <p className="text-[24px] font-black text-slate-900 tracking-tighter">1.5 Days</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Lead Time Tracking</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-[14px] font-black text-slate-900 tracking-tight">Purchase Logs</h3>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by PO# or Supplier..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-lg text-[11px] outline-none focus:bg-white focus:border-emerald-500/30 transition-all font-bold"
              value={search ?? ""}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-black text-slate-900 font-mono tracking-tighter">{p.po_no}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-bold text-slate-700">{p.supplier_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      p.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[12px] font-black text-slate-900 font-mono tracking-tighter">{formatCurrency(p.total)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] text-slate-400 font-medium">{new Date(p.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm(`Cancel and delete Purchase Order ${p.po_no}?`)) {
                            fetch(`/api/purchases/${p.id}`, { method: "DELETE" }).then(fetchPurchases);
                          }
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ShoppingBag className="w-10 h-10 text-slate-200" />
                      <p className="text-[12px] text-slate-400 font-medium">No purchase logs found in local database.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
