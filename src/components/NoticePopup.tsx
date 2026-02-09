"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { X, Bell } from "lucide-react";
import Image from "next/image";

export default function NoticePopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [dontShowToday, setDontShowToday] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('*')
                    .eq('id', 'main')
                    .single();

                if (data && data.notice_popup) {
                    // 1. Check Scheduling
                    const now = new Date();
                    if (data.notice_start_at && new Date(data.notice_start_at) > now) return;
                    if (data.notice_end_at && new Date(data.notice_end_at) < now) return;

                    // 2. Check if dismissed for 24h
                    const dismissedAt = localStorage.getItem('notice_dismissed_at');
                    const nowTime = now.getTime();

                    if (!dismissedAt || nowTime - parseInt(dismissedAt) > 24 * 60 * 60 * 1000) {
                        setSettings(data);
                        setIsOpen(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching popup settings:", error);
            }
        };

        fetchSettings();
    }, []);

    const handleClose = (dontShowToday: boolean) => {
        if (dontShowToday) {
            localStorage.setItem('notice_dismissed_at', new Date().getTime().toString());
        }
        setIsOpen(false);
    };

    if (!isOpen || !settings) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                >
                    {settings.notice_type === 'text' ? (
                        <>
                            {/* Header/Banner */}
                            <div className="h-32 bg-gradient-to-br from-blue-600/20 to-cyan-400/10 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-2 border border-white/20">
                                        <Bell className="text-blue-400" size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">System Notification</span>
                                </div>
                            </div>

                            <div className="p-10 space-y-6">
                                <div className="text-center space-y-3">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">
                                        {settings.notice_title || "Greetings, Agent"}
                                    </h2>
                                    <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
                                </div>

                                {settings.notice_link ? (
                                    <a href={settings.notice_link} target="_blank" rel="noopener noreferrer" className="block group">
                                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 group-hover:bg-white/10 group-hover:border-blue-500/30 transition-all">
                                            <p className="text-slate-400 text-sm leading-relaxed text-center whitespace-pre-wrap font-medium">
                                                {settings.notice_content || "No message content synchronised."}
                                            </p>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                        <p className="text-slate-400 text-sm leading-relaxed text-center whitespace-pre-wrap font-medium">
                                            {settings.notice_content || "No message content synchronised."}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <input
                                            type="checkbox"
                                            id="dontShowTodayText"
                                            checked={dontShowToday}
                                            onChange={(e) => setDontShowToday(e.target.checked)}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                                        />
                                        <label htmlFor="dontShowTodayText" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer select-none">
                                            24시간 동안 다시 열지 않기
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => handleClose(dontShowToday)}
                                        className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                    >
                                        Close Terminal
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Image Type Popup */
                        <div className="relative">
                            {settings.notice_link ? (
                                <a href={settings.notice_link} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer">
                                    <img
                                        src={settings.notice_image}
                                        alt="Notice"
                                        className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
                                    />
                                    {/* Link Overlay Indicator */}
                                    <div className="absolute inset-x-0 bottom-12 py-3 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Click to Synchronize</span>
                                    </div>
                                </a>
                            ) : (
                                <img
                                    src={settings.notice_image}
                                    alt="Notice"
                                    className="w-full h-auto object-cover"
                                />
                            )}

                            {/* Bottom Close Section for Image Popup */}
                            <div className="bg-[#0a0a0c] p-6 flex items-center justify-between border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="dontShowTodayImg"
                                        checked={dontShowToday}
                                        onChange={(e) => setDontShowToday(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor="dontShowTodayImg" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer select-none">
                                        24시간 안보기
                                    </label>
                                </div>
                                <button
                                    onClick={() => handleClose(dontShowToday)}
                                    className="py-2.5 px-8 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => handleClose(false)}
                        className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2 bg-black/20 rounded-full z-20"
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
