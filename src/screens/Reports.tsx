import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, 
  Download, 
  Calendar,
  AlertCircle,
  BarChart3,
  FileBarChart,
  ClipboardList
} from "lucide-react";
import { generateInventoryReport, generateSalesReport } from "@/lib/pdf";

export default function Reports() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ name: string; sales: number; profit: number }[]>([]);

  useEffect(() => {
    // Fetch real data
    const fetchData = async () => {
      const medRes = await fetch("/api/medicines");
      const meds = await medRes.json();
      setMedicines(meds);

      const saleRes = await fetch("/api/sales");
      const salesData = await saleRes.json();
      setSales(salesData);

      // Process sales for chart (last 7 days or sample grouped by date)
      // Since it's a demo, we'll refine the static data to reflect real counts
      const countsByDate: Record<string, { sales: number; profit: number }> = {};
      
      salesData.forEach((s: any) => {
        const date = new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!countsByDate[date]) countsByDate[date] = { sales: 0, profit: 0 };
        countsByDate[date].sales += s.net_total;
        countsByDate[date].profit += s.net_total * 0.3; // Estimated 30% margin for demo
      });

      const processedChart = Object.entries(countsByDate).map(([name, vals]) => ({
        name,
        sales: vals.sales,
        profit: vals.profit
      })).slice(-7); // Last 7 data points

      setChartData(processedChart.length > 0 ? processedChart : [
        { name: "No Data", sales: 0, profit: 0 }
      ]);
    };

    fetchData();
  }, []);

  const totalRevenue = sales.reduce((acc, s) => acc + s.net_total, 0);
  const totalProfit = totalRevenue * 0.3; // Sample estimation
  const lowStockCount = medicines.filter(m => m.stock <= m.min_stock).length;

  const handleExportSales = () => {
    generateSalesReport(sales);
  };

  const handleExportInventory = () => {
    generateInventoryReport(medicines);
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Intelligence</h1>
          <p className="text-[12px] text-slate-500 font-medium">Analytics and inventory auditing engine</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportSales}
            className="bg-white border border-slate-200 px-5 py-2.5 rounded-lg text-[12px] font-bold h-10 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export Sales
          </button>
          <button 
            onClick={handleExportInventory}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[12px] font-bold h-10 flex items-center gap-2 shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ClipboardList className="w-4 h-4 text-emerald-400" /> Audit Inventory
          </button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Revenue</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalRevenue)}</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] text-emerald-600 font-bold">+Live calculations</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Net Profit Est.</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalProfit)}</div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">Margin: 30%</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Transactions</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">{sales.length}</div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">Avg order: Rs. {(totalRevenue / (sales.length || 1)).toFixed(0)}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Low Stock Alerts</div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter">{lowStockCount}</div>
          <div className="flex items-center gap-1 mt-2">
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span className="text-[10px] text-red-600 font-bold">Action Required</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[14px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" /> Financial Performance
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div><span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revenue</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div><span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Profit</span></div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="profit" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-900 tracking-tight mb-8">Top Selling Categories</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Tablets", value: 45 },
                    { name: "Syrups", value: 25 },
                    { name: "Injections", value: 15 },
                    { name: "Others", value: 15 },
                  ]}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[0,1,2,3].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {[
              { label: "Tablets", val: "45%", color: "bg-emerald-500" },
              { label: "Syrups", val: "25%", color: "bg-blue-500" },
              { label: "Injections", val: "15%", color: "bg-amber-500" },
              { label: "Others", val: "15%", color: "bg-red-500" },
            ].map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                  <span className="text-[11px] font-bold text-slate-600">{cat.label}</span>
                </div>
                <span className="text-[11px] font-black text-slate-900 font-mono">{cat.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
