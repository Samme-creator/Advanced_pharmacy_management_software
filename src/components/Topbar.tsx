import { Bell, Search, PlusCircle, LogOut } from "lucide-react";
import { format } from "date-fns";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export default function Topbar({ user, setActiveTab, onLogout }: { user: any, setActiveTab: (tab: string) => void, onLogout: () => void }) {
  const today = format(new Date(), "EEEE, d MMM yyyy");

  const handleNotificationClick = () => {
    alert("System Notifications:\n- Low Stock: Brufen 400mg (22 remaining)\n- New Shipment: Panadol reached warehouse\n- Database: Auto-backup successful");
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, text: "Low Stock: Panadol 500mg (12 left)", type: "warning", time: "5m ago" },
    { id: 2, text: "New Shipment: Amoxicillin arrived", type: "success", time: "1h ago" },
    { id: 3, text: "Database Backup: Scheduled task complete", type: "info", time: "2h ago" },
  ]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setActiveTab("medicines");
      // Optional: Pass search query to medicines screen via URL or global state
      // For now, just switching tab is a good "functioning" step
    }
  };

  return (
    <div className="h-16 bg-white border-b border-border-brand px-8 flex items-center justify-between flex-shrink-0 shadow-sm relative z-50">
      <div className="flex items-center gap-8">
        <div className="relative">
          <label className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </label>
          <input 
            type="text" 
            placeholder="Search database (Enter)..." 
            className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" 
            onKeyDown={handleSearch}
          />
        </div>
        <div className="hidden lg:block">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Control Panel Header</p>
          <p className="text-[12px] font-black text-slate-900 tracking-tighter">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 text-right">Authenticated As</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1.5">
            {user?.full_name} ({user?.role})
          </p>
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        <button 
          onClick={() => setActiveTab("sales")}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]"
        >
          <PlusCircle className="w-4 h-4" />
          New Sale
        </button>

        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            "p-2.5 rounded-lg transition-all relative cursor-pointer",
            showNotifications ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
          )}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
        </button>

        {showNotifications && (
          <div className="absolute top-14 right-20 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">System Alerts</h3>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{notifications.length} New</span>
            </div>
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="flex gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    n.type === "warning" ? "bg-amber-500" : n.type === "success" ? "bg-emerald-500" : "bg-blue-500"
                  )} />
                  <div>
                    <p className="text-[11px] text-slate-700 font-medium group-hover:text-slate-900">{n.text}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 border-t border-slate-50">View All Logs</button>
          </div>
        )}

        <button 
          onClick={onLogout}
          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
