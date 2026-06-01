import { useState, useEffect } from "react";
import { 
  Search, 
  ShoppingCart, 
  X, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Minus,
  ScanLine
} from "lucide-react";
import { Medicine, CartItem } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { generateReceipt } from "@/lib/pdf";

export default function Sales() {
  const [activeSubTab, setActiveSubTab] = useState("new");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [loading, setLoading] = useState(false);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/medicines")
      .then(res => res.json())
      .then(setMedicines);
    
    fetchSalesHistory();
  }, []);

  const fetchSalesHistory = () => {
    fetch("/api/sales")
      .then(res => res.json())
      .then(setSalesHistory);
  };

  const addToCart = (med: Medicine) => {
    if (med.stock <= 0) return alert("Medicine out of stock!");
    
    setCart(prev => {
      const existing = prev.find(i => i.id === med.id);
      if (existing) {
        return prev.map(i => i.id === med.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...med, qty: 1 }];
    });
    setSearch("");
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.qty + delta);
        if (newQty > i.stock) {
          alert("Maximum stock reached!");
          return i;
        }
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = cart.reduce((acc, i) => acc + (i.qty * i.sell_price), 0);
  const netTotal = subtotal - discount + tax;
  const changeDue = amountPaid > netTotal ? amountPaid - netTotal : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          items: cart,
          subtotal,
          discount,
          tax,
          net_total: netTotal,
          payment_method: paymentMethod,
          amount_paid: amountPaid,
          change_due: changeDue
        })
      });

      if (response.ok) {
        const data = await response.json();
        generateReceipt({
          invoice_no: data.invoice_no,
          customer_name: customerName,
          total: subtotal,
          discount,
          tax,
          net_total: netTotal,
          payment_method: paymentMethod,
          amount_paid: amountPaid,
          change_due: changeDue
        }, cart);
        
        setCart([]);
        setAmountPaid(0);
        setDiscount(0);
        setSearch("");
        fetchSalesHistory();
        alert("SALE COMPLETED SUCCESSFULLY!\n\nInvoice: " + data.invoice_no + "\nReceipt has been downloaded to your system.");
      } else {
        const err = await response.json();
        alert("TRANSACTION FAILED: " + (err.error || "Unknown server error"));
      }
    } catch (err) {
      alert("NETWORK ERROR: Could not connect to the local database engine.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMeds = search.length > 0 
    ? medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.generic.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-400 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales & Billing POS</h1>
          <p className="text-[12px] text-slate-500 font-medium tracking-tight">System ready for transactions · Local Database active</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab("new")}
            className={cn(
              "px-5 py-2.5 rounded-lg text-[12px] font-bold transition-all shadow-sm cursor-pointer",
              activeSubTab === "new" ? "bg-emerald-600 text-white shadow-emerald-600/10" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            New Checkout
          </button>
          <button 
            onClick={() => { setActiveSubTab("history"); fetchSalesHistory(); }}
            className={cn(
              "px-5 py-2.5 rounded-lg text-[12px] font-bold transition-all shadow-sm cursor-pointer",
              activeSubTab === "history" ? "bg-emerald-600 text-white shadow-emerald-600/10" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            Recent History
          </button>
        </div>
      </header>

      {activeSubTab === "new" ? (
        <div className="grid grid-cols-[1fr_400px] gap-6 flex-1 overflow-hidden">
          {/* Left Column: Product Selection */}
          <div className="flex flex-col gap-6 overflow-hidden">
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm relative flex-shrink-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search medicine or scan barcode..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-transparent rounded-xl text-[13px] outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/5 transition-all font-medium"
                    value={search ?? ""}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="bg-slate-900 text-white px-6 rounded-xl flex items-center gap-2 text-[12px] font-bold hover:bg-slate-800 transition-all active:scale-[0.98]">
                  <ScanLine className="w-4 h-4" /> Scan Barcode
                </button>
              </div>

              {/* Floating Search Results */}
              {search.length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[400px] flex flex-col ring-4 ring-slate-900/5 animate-in slide-in-from-top-2 duration-200">
                  <div className="bg-slate-50/80 backdrop-blur-md p-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex justify-between items-center border-b border-slate-100">
                    <span>Matched {filteredMeds.length} Products</span>
                    <button onClick={() => setSearch("")} className="hover:text-red-500 transition-colors p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="overflow-auto divide-y divide-slate-50">
                    {filteredMeds.map(med => (
                      <div 
                        key={med.id} 
                        onClick={() => addToCart(med)}
                        className={cn(
                          "flex items-center justify-between p-4 hover:bg-emerald-50/50 cursor-pointer transition-all group",
                          med.stock === 0 && "opacity-50 grayscale bg-red-50/30"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{med.name}</span>
                          <span className="text-[11px] text-slate-500 font-medium italic">{med.generic} · {med.category}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-[13px] font-black text-slate-900 font-mono">Rs. {med.sell_price.toFixed(2)}</div>
                            <div className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block", med.stock < 10 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500")}>
                              Stock: {med.stock}
                            </div>
                          </div>
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all group-hover:rotate-90 group-hover:scale-110">
                            <Plus className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredMeds.length === 0 && (
                      <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-slate-200" />
                        </div>
                        <p className="text-slate-400 italic text-[11px]">No items found for "{search}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-[14px] font-bold text-slate-800 tracking-tight">Active Basket</h2>
                </div>
                <span className="text-[10px] text-white font-bold bg-slate-900 px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-slate-900/20">
                  {cart.length} LINE ITEMS
                </span>
              </div>

              <div className="flex-1 overflow-auto">
                {cart.length > 0 ? (
                  <div className="w-full">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                        <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100 bg-white">
                          <th className="px-6 py-4">Item & Generic</th>
                          <th className="px-6 py-4 text-center">Qty</th>
                          <th className="px-6 py-4 text-right">Unit Price</th>
                          <th className="px-6 py-4 text-right">Line Total</th>
                          <th className="px-6 py-4 w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {cart.map(item => (
                          <tr key={item.id} className="text-[12px] hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{item.name}</span>
                                <span className="text-[11px] text-slate-400 font-medium italic">{item.generic}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-slate-200/50"><Minus className="w-3 h-3" /></button>
                                <span className="font-black text-slate-900 min-w-[20px] text-center font-mono">{item.qty}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-slate-200/50"><Plus className="w-3 h-3" /></button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-slate-500 font-mono">Rs. {item.sell_price.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-black text-emerald-700 font-mono">Rs. {(item.qty * item.sell_price).toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 cursor-pointer"><X className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                      <ShoppingCart className="w-8 h-8 text-slate-200" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-bold text-[16px] tracking-tight">Your basket is empty</h3>
                      <p className="text-slate-400 text-[11px] font-medium mt-1 leading-relaxed max-w-[200px] mx-auto">Select products from search or scan barcodes to begin a new sale transaction.</p>
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 bg-slate-50/80 backdrop-blur-md border-t border-slate-200 flex-shrink-0">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    <button onClick={() => setCart([])} className="px-4 py-2 text-[10px] text-red-600 font-bold uppercase tracking-widest hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 cursor-pointer">
                      <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-4">Accumulated Subtotal</span>
                      <span className="text-[20px] font-black text-emerald-700 tracking-tighter font-mono">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Billing Summary */}
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col p-6 overflow-hidden relative border border-white/5">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4 flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-white tracking-tight leading-none mb-1">Billing Summary</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Transaction finalizing</p>
              </div>
            </div>

            <div className="flex-1 overflow-auto space-y-6 pr-1 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex justify-between text-[13px] text-slate-400 font-medium px-1">
                  <span>Gross Subtotal</span>
                  <span className="font-bold text-white font-mono">Rs. {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-slate-400 font-medium">Flat Discount (Rs.)</span>
                    <input 
                      type="number" 
                      className="w-24 text-right bg-transparent border-b border-emerald-500/30 outline-none text-emerald-400 font-black text-[14px] font-mono pr-1 focus:border-emerald-500 transition-colors"
                      value={discount ?? ""}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-slate-400 font-medium">Taxation (GST Rs.)</span>
                    <input 
                      type="number" 
                      className="w-24 text-right bg-transparent border-b border-white/10 outline-none text-white font-bold font-mono pr-1 focus:border-white/30 transition-colors"
                      value={tax ?? ""}
                      onChange={(e) => setTax(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 relative">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest leading-none mb-2">Net Payable Amount</span>
                  <span className="text-[32px] font-black text-white tracking-tighter font-mono leading-none">{formatCurrency(netTotal)}</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[70%]" />
                </div>
              </div>

              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-between px-1">
                    <span>Customer Identity</span>
                    <Plus className="w-3 h-3 cursor-pointer hover:text-emerald-400 transition-colors" />
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-[13px] text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-medium"
                    placeholder="Enter customer name..."
                    value={customerName ?? ""}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Processing Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Cash", "Online"].map(pm => (
                      <button 
                        key={pm}
                        onClick={() => setPaymentMethod(pm)}
                        className={cn(
                          "py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                          paymentMethod === pm 
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/10" 
                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                        )}
                      >
                        {pm} Payment
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl group transition-all hover:bg-emerald-500/15">
                  <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-3 block">Amount Collected (Cash Handover)</label>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-2xl font-black font-mono opacity-40 leading-none">Rs.</span>
                    <input 
                      type="number" 
                      className="w-full bg-transparent border-none p-0 text-[32px] font-black text-white outline-none placeholder:text-emerald-500/20 font-mono leading-none"
                      placeholder="0.00"
                      value={(amountPaid || "") ?? ""}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-4 px-2 border-t border-white/5">
                <span className="text-[12px] text-slate-500 font-medium">Internal Counter Balance (Due):</span>
                <span className="text-[16px] font-black text-emerald-400 font-mono tracking-tighter">{formatCurrency(changeDue)}</span>
              </div>
            </div>

            <div className="pt-6 flex-shrink-0">
              <button 
                disabled={cart.length === 0 || loading}
                onClick={handleCheckout}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all transform",
                  cart.length > 0 && !loading
                    ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-emerald-500/20" 
                    : "bg-white/5 text-slate-700 cursor-not-allowed shadow-none border border-white/5"
                )}
              >
                {loading ? "PROCESSING..." : <><CheckCircle2 className="w-5 h-5" /> GENERATE 58MM RECEIPT</>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-slate-800">Recent Transactions Log</h2>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Data Sync</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100 bg-white/50">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Net Total</th>
                  <th className="px-6 py-4 text-center">Payment</th>
                  <th className="px-6 py-4 text-center">Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salesHistory.map((sale) => (
                  <tr key={sale.id} className="text-[12px] hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600">#{sale.invoice_no.slice(-8)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{sale.customer_name}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(sale.net_total)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                        sale.payment_method === "Cash" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400 font-medium">
                      {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                        onClick={() => {
                          if (confirm(`Permanently delete invoice ${sale.invoice_no}?`)) {
                            fetch(`/api/sales/${sale.id}`, { method: "DELETE" }).then(fetchSalesHistory);
                          }
                        }}
                        className="p-2 text-slate-200 hover:text-red-500 transition-colors cursor-pointer"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
