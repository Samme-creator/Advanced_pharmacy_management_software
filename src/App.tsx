/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./screens/Dashboard";
import Medicines from "./screens/Medicines";
import Sales from "./screens/Sales";
import Reports from "./screens/Reports";
import Suppliers from "./screens/Suppliers";
import Customers from "./screens/Customers";
import Purchases from "./screens/Purchases";
import Users from "./screens/Users";
import Login from "./screens/Login";
import AIAssistant from "./components/AIAssistant";
import { cn } from "./lib/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("medicare_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem("medicare_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("medicare_user");
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg select-none font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar user={user} setActiveTab={setActiveTab} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto p-8 relative scroll-smooth bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === "medicines" && <Medicines />}
            {activeTab === "sales" && <Sales />}
            {activeTab === "reports" && <Reports />}
            {activeTab === "suppliers" && <Suppliers />}
            {activeTab === "customers" && <Customers />}
            {activeTab === "purchases" && <Purchases />}
            {activeTab === "users" && <Users />}
            
            {["none"].includes(activeTab) && (
              <div className="h-full py-40 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-dashed border-emerald-100 italic">
                  <span className="text-4xl">🏗️</span>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Module in Construction</h2>
                  <p className="text-slate-400 font-medium text-[12px] mt-2 max-w-[300px]">The "{activeTab.toUpperCase()}" engine is being optimized for valid SQL transactions. Expected completion: v3.1</p>
                </div>
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-[12px] font-bold shadow-lg shadow-slate-900/10 hover:translate-y-[-1px] transition-all cursor-pointer"
                >
                  Return to Control Deck
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="h-8 bg-white border-t border-slate-100 px-8 flex items-center justify-between text-[10px] text-slate-400 select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="font-bold tracking-tight uppercase tracking-widest text-[9px]">Local Engine Connected · medicare_pro.sqlite</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-medium">University of Malakand · AI Dept</span>
            <span className="font-black text-slate-900 uppercase tracking-tighter">Medicare Pro Extra Edition v3.0</span>
          </div>
        </footer>
      </div>

      <AIAssistant />
    </div>
  );
}

