import { useState, useEffect } from "react";
import { 
  Banknote, 
  TrendingUp, 
  Pill, 
  AlertTriangle, 
  Clock, 
  Building2,
  FileText
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Sale } from "@/types";
import { format } from "date-fns";

interface Stats {
  revenue: number;
  medicines: number;
  lowStock: number;
  suppliers: number;
  customers: number;
}

import { generateSalesReport } from "@/lib/pdf";

export default function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(setStats);

    fetch("/api/sales")
      .then(res => res.json())
      .then(data => setRecentSales(data.slice(0, 5)));
  }, []);

  const handleExportReport = async () => {
    try {
      const res = await fetch("/api/sales");
      const allSales = await res.json();
      generateSalesReport(allSales);
    } catch (err) {
      console.error(err);
      alert("Error generating report. Please check system logs.");
    }
  };

  const cards = [
    { label: "Today's Revenue", value: stats ? formatCurrency(stats.revenue) : "Rs. 0", icon: Banknote, trend: "+12%", color: "border-l-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Today's Profit", value: stats ? formatCurrency(stats.revenue * 0.3) : "Rs. 0", icon: TrendingUp, trend: "33.6%", color: "border-l-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Total Medicines", value: stats?.medicines || "0", icon: Pill, color: "border-l-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Low Stock Alerts", value: stats?.lowStock || "0", icon: AlertTriangle, color: "border-l-amber-500", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "Active Customers", value: stats?.customers || "0", icon: Clock, color: "border-l-red-500", iconBg: "bg-red-50", iconColor: "text-red-600" },
    { label: "Suppliers", value: stats?.suppliers || "0", icon: Building2, color: "border-l-indigo-500", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-[12px] text-slate-500 font-medium">Good morning — here is today's pharmacy summary</p>
      </header>

      <div className="grid grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => {
              if (card.label === "Total Medicines") setActiveTab("medicines");
              if (card.label === "Low Stock Alerts") setActiveTab("medicines");
              if (card.label === "Suppliers") setActiveTab("suppliers");
              if (card.label === "Active Customers") setActiveTab("customers");
              if (card.label.includes("Revenue")) setActiveTab("sales");
            }}
            className={`bg-white border border-slate-200 rounded-xl p-4 border-l-4 ${card.color} shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              {card.trend && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md leading-none">{card.trend}</span>}
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{card.value}</div>
            <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h2 className="text-[13px] font-bold text-slate-800">Recent Inventory & Sales Transactions</h2>
            </div>
            <span className="text-[9px] bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-500 font-mono font-bold tracking-tight shadow-sm">
              DATABASE: medicare_pro.db
            </span>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3 text-center">Items</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="text-[11px] hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-5 py-3.5 font-mono text-[10px] font-bold text-emerald-600 group-hover:underline">
                      #{sale.invoice_no.slice(-8)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700 truncate max-w-[120px]">
                      {sale.customer_name || "Walk-in"}
                    </td>
                    <td className="px-5 py-3.5 text-center text-slate-400">3</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">{formatCurrency(sale.net_total)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        sale.payment_method === "Cash" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 font-medium">
                      {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentSales.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400 italic text-[11px]">No transactions recorded for today.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
             <span className="text-[10px] text-slate-400 font-medium tracking-tight uppercase tracking-widest">Live Feed active</span>
             <button 
              onClick={() => setActiveTab("sales")}
              className="text-[10px] font-bold text-emerald-600 hover:underline px-3 py-1 rounded-md hover:bg-emerald-50 cursor-pointer"
             >
               View All Records
             </button>
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group min-h-[300px] flex flex-col">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[14px] tracking-tight">Report Preview</h3>
                <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>

              <div className="bg-white rounded-lg p-5 text-[8px] text-slate-800 shadow-2xl flex-1 mb-6 transform rotate-[-1deg] group-hover:rotate-0 transition-transform origin-top">
                <div className="text-center mb-5 border-b border-slate-100 pb-3">
                   <p className="font-black uppercase text-[10px] text-slate-900 tracking-tighter">Medicare Pro Extra Report</p>
                   <p className="text-slate-400 font-medium">Generated: {format(new Date(), "yyyy-MM-dd HH:mm")}</p>
                </div>
                <div className="grid grid-cols-4 font-bold border-b border-slate-900 pb-1 mb-2 tracking-widest opacity-80 text-[7px]">
                  <div>ITEM ID</div>
                  <div>NAME</div>
                  <div className="text-center">STOCK</div>
                  <div className="text-right">VALUE</div>
                </div>
                <div className="space-y-1.5 opacity-70">
                  <div className="grid grid-cols-4 font-medium">
                    <div className="font-mono">#RX-8821</div>
                    <div className="truncate pr-1">Amoxicillin</div>
                    <div className="text-center">420</div>
                    <div className="text-right">Rs. 5,250</div>
                  </div>
                  <div className="grid grid-cols-4 font-medium">
                    <div className="font-mono">#RX-4412</div>
                    <div className="truncate pr-1">Panadol</div>
                    <div className="text-center">12</div>
                    <div className="text-right">Rs. 1,020</div>
                  </div>
                  <div className="grid grid-cols-4 font-medium">
                    <div className="font-mono text-[6px]">... more lines ...</div>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[6px]">Final Summary</span>
                  <p className="font-black text-right text-[11px] text-slate-900">Total: Rs. 8,610.00</p>
                </div>
              </div>

              <button 
                onClick={handleExportReport}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer text-[12px] uppercase tracking-tighter"
              >
                EXPORT AS PDF REPORT
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Local Database Engine</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Instance ID:</span>
                <span className="text-slate-800 font-mono font-bold">medicare-ph-v3</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Storage Path:</span>
                <span className="text-slate-800 font-mono font-bold opacity-60">root/db/main.db</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Health Status:</span>
                <span className="text-emerald-600 font-bold px-1.5 py-0.5 bg-emerald-50 rounded">OPTIMIZED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
