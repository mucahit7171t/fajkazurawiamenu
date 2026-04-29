"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Phone, Globe } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { settings, loading, fetchSettings, updateSetting } = useSettingsStore();
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings.phone) {
      setPhone(settings.phone);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading("Updating settings...");
    try {
      await updateSetting("phone", phone);
      toast.success("Settings updated successfully", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl md:text-6xl font-serif font-black italic tracking-tighter mb-2 uppercase text-white">
          SETTINGS<span className="text-[#c8a24a]">.</span>
        </h1>
        <p className="text-white/40 text-[10px] uppercase font-black tracking-widest leading-none">
          Manage global website configuration
        </p>
      </header>

      {loading && !Object.keys(settings).length ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-[#c8a24a]" size={40} />
          <p className="text-white/20 uppercase tracking-[0.3em] font-bold text-[10px]">
            Loading Configs...
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card border border-white/5 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-12 shadow-2xl"
        >
          <form onSubmit={handleSave} className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#c8a24a]/10 flex items-center justify-center text-[#c8a24a] border border-[#c8a24a]/20">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                    Booking Phone Number
                  </h3>
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-0.5">
                    Displayed in the client sidebar
                  </p>
                </div>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+48 000 000 000"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-6 px-8 text-lg font-serif italic text-white focus:border-[#c8a24a] focus:bg-white/1 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  required
                />
                <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <span className="text-[10px] text-[#c8a24a] font-black uppercase tracking-widest">
                    Editing Mode
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="group flex items-center gap-3 px-10 py-5 bg-[#c8a24a] text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all shadow-xl shadow-[#c8a24a]/20"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} className="group-hover:scale-125 transition-transform" />
                )}
                Update Global Config
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="flex items-center gap-4 p-8 bg-[#c8a24a]/5 border border-[#c8a24a]/10 rounded-3xl">
        <div className="w-12 h-12 rounded-2xl bg-[#c8a24a]/20 flex items-center justify-center text-[#c8a24a] shrink-0">
          <Globe size={24} />
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed font-medium uppercase tracking-wider">
          Pro Tip: Use <span className="text-[#c8a24a] italic font-bold">Standard International Format</span> (e.g., +48 ...) 
          to ensure the "Quick Call" button works perfectly on all mobile devices and operating systems.
        </p>
      </div>
    </div>
  );
}
