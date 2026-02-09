"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Bell, ChevronRight, Calendar } from "lucide-react";

interface Notice {
    id: number;
    title: string;
    created_at: string;
    category: string;
}

export default function HomeNoticeSection() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLatestNotices();
    }, []);

    const fetchLatestNotices = async () => {
        try {
            const { data, error } = await supabase
                .from('notices')
                .select('id, title, created_at, category')
                .order('created_at', { ascending: false })
                .limit(3);

            if (error) throw error;
            setNotices(data || []);
        } catch (error) {
            console.error("Error fetching home notices:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoading && notices.length === 0) return null;

    return (
        <section className="py-24 px-6 border-t border-white/5 bg-[#08080a]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-2 mb-4 text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            <Bell size={14} />
                            <span>Stay Updated</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                            Latest <span className="text-blue-500">Notices</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/community/notice" className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-widest">View All News</span>
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-all">
                                <ChevronRight size={16} />
                            </div>
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
                        ))
                    ) : (
                        notices.map((notice, index) => (
                            <Link key={notice.id} href={`/community/notice/${notice.id}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group h-full p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col justify-between"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${notice.category === 'EVENT' ? 'bg-pink-500/10 border-pink-500/20 text-pink-500' :
                                                    notice.category === 'NEWS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                }`}>
                                                {notice.category}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-600 text-[9px] font-mono uppercase tracking-widest">
                                                <Calendar size={10} />
                                                {new Date(notice.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                                            {notice.title}
                                        </h3>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-slate-600 group-hover:text-white transition-colors">
                                        <span className="text-[9px] font-black uppercase tracking-widest">Read Article</span>
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
