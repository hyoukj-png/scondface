"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, PenTool } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";

interface Notice {
    id: number;
    title: string;
    content: string;
    image_url?: string;
    created_at: string;
    category: string;
    read_count: number;
}

export default function NoticePage() {
    const { data: session } = useSession();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const { data, error } = await supabase
                .from('notices')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotices(data || []);
        } catch (error) {
            console.error("Error fetching notices:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Link href="/community" className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold uppercase tracking-widest">
                                <ChevronLeft size={16} />
                                Back
                            </Link>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter">
                            NOTICE
                        </h1>
                    </motion.div>

                    {/* Only Admin can see this button */}
                    {session?.user?.email === 'admin@antigravity.com' && (
                        <Link href="/community/notice/write">
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-bold transition-colors border border-white/10"
                            >
                                <PenTool size={18} />
                                <span>Write Notice</span>
                            </motion.button>
                        </Link>
                    )}
                </div>

                {/* Notice List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="space-y-4"
                >
                    {/* List Header (Desktop) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-white/10 text-slate-500 font-bold text-sm uppercase tracking-widest text-center">
                        <div className="col-span-1">No.</div>
                        <div className="col-span-1">Cat.</div>
                        <div className="col-span-7 text-left pl-4">Title</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-1">Read</div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="py-20 text-center text-slate-500 animate-pulse">
                            Loading notices...
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && notices.length === 0 && (
                        <div className="py-20 text-center text-slate-500">
                            등록된 공지사항이 없습니다.
                        </div>
                    )}

                    {/* Items */}
                    {notices.map((notice, index) => (
                        <Link key={notice.id} href={`/community/notice/${notice.id}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 + 0.3 }}
                                className="group relative md:grid grid-cols-12 gap-4 items-center p-6 md:p-4 bg-white/5 rounded-2xl md:rounded-lg md:bg-transparent border border-white/5 md:border-b md:border-t-0 md:border-l-0 md:border-r-0 md:border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                {/* Mobile Header */}
                                <div className="flex justify-between md:hidden mb-2 text-xs text-slate-500 font-mono">
                                    <span className={
                                        notice.category === 'EVENT' ? 'text-pink-500' :
                                            notice.category === 'NEWS' ? 'text-emerald-400' :
                                                'text-blue-500'
                                    }>[{notice.category}]</span>
                                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="hidden md:block col-span-1 text-center text-slate-600 font-mono text-sm">{notice.id}</div>
                                <div className="hidden md:block col-span-1 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${notice.category === 'EVENT' ? 'bg-pink-500/10 text-pink-500' :
                                            notice.category === 'NEWS' ? 'bg-emerald-500/10 text-emerald-400' :
                                                'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {notice.category}
                                    </span>
                                </div>
                                <div className="col-span-12 md:col-span-7">
                                    <h3 className="text-lg md:text-base font-medium group-hover:text-blue-400 transition-colors line-clamp-1">
                                        {notice.title}
                                    </h3>
                                </div>
                                <div className="hidden md:block col-span-2 text-center text-slate-500 text-sm font-light">
                                    {new Date(notice.created_at).toLocaleDateString()}
                                </div>
                                <div className="hidden md:block col-span-1 text-center text-slate-600 text-sm font-mono">{notice.read_count}</div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
