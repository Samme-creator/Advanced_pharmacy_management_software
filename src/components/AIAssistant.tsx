import { useState } from "react";
import { Bot, Send, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hello! I am your MediCare Advisor. How can I help you today with drug information or interactions?" }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;

    const userMsg = prompt;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", content: "Error: Could not connect to AI advisor." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-12 right-8 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-40 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Bot className="w-6 h-6 relative z-10" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-[92vw] md:w-[380px] h-[55vh] max-h-[480px] min-h-[350px] bg-white rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] border border-slate-200 flex flex-col z-[9999] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-lg relative shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-[14px] font-black tracking-tight">MediCare AI</h3>
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest leading-none">Medical Advisor</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 -mr-1 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all relative z-[10000] group/close pointer-events-auto"
                aria-label="Close Chat"
              >
                <X className="w-6 h-6 group-hover/close:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-slate-50/50 custom-scrollbar overscroll-contain">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] p-3.5 rounded-2xl text-[12px] shadow-sm leading-relaxed font-medium",
                    m.role === "user" 
                      ? "bg-slate-900 text-white rounded-tr-sm shadow-slate-900/10" 
                      : "bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex gap-2.5 items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                    Consulting Advisor...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-5 bg-white border-t border-slate-100">
              <div className="relative">
                <textarea 
                  rows={1}
                  placeholder="Ask about generics, dosage or interactions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-[13px] outline-none focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none max-h-32 font-medium"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !prompt.trim()}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale cursor-pointer shadow-lg shadow-slate-900/10 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-4 leading-relaxed font-medium px-4">
                AI advisor is for general guidance. Verify critical dosages with printed medical literature.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
