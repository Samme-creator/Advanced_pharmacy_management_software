import { 
  LayoutDashboard, 
  Pill, 
  Receipt, 
  Package, 
  BarChart3, 
  Building2, 
  Users2, 
  UserCircle,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", section: "Main Menu" },
    { id: "medicines", icon: Pill, label: "Medicines" },
    { id: "sales", icon: Receipt, label: "Sales & Billing" },
    { id: "purchases", icon: Package, label: "Purchases" },
    { id: "reports", icon: BarChart3, label: "Reports", section: "Management" },
    { id: "suppliers", icon: Building2, label: "Suppliers" },
    { id: "customers", icon: Users2, label: "Customers" },
    { id: "users", icon: UserCircle, label: "Users" },
  ];

  const filteredNavItems = user?.role !== 'Admin' 
    ? navItems.filter(item => !['users', 'reports'].includes(item.id))
    : navItems;

  return (
    <div className="w-[210px] bg-sidebar flex-shrink-0 flex flex-col p-4 shadow-xl">
      <div className="mb-6 px-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">M+</div>
          <h1 className="text-white font-bold text-[14px] leading-tight">Medicare Pro<br/><span className="text-emerald-400 text-[10px] uppercase tracking-wider">Extra Edition</span></h1>
        </div>
      </div>

      <div className="flex-1">
        {filteredNavItems.map((item, index) => (
          <div key={item.id}>
            {item.section && (
              <div className="text-[9px] text-white/30 tracking-widest uppercase mt-6 mb-2 px-3 font-semibold">
                {item.section}
              </div>
            )}
            <button
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] transition-all cursor-pointer mb-0.5",
                activeTab === item.id 
                  ? "bg-sidebar-item-active text-white font-semibold" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-emerald-400" : "text-slate-500")} />
              {item.label}
            </button>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-white/5 text-[10px]">
            {user?.full_name?.split(' ').map((n: string) => n[0]).join('') || "U"}
          </div>
          <div>
            <div className="text-white text-[11px] font-bold">{user?.full_name || "Unknown"}</div>
            <div className="text-slate-500 text-[10px]">{user?.role || "Staff"}</div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
        >
          <LogOut className="w-4 h-4 opacity-70" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
