"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Calendar, Eye, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Notice {
    id: number;
    title: string;
    content: string;
    image_url?: string;
    created_at: string;
    category: string;
    read_count: number;
}

export default function NoticeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [notice, setNotice] = useState<Notice | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchNotice();
            incrementReadCount();
        }
    }, [params.id]);

    const fetchNotice = async () => {
        try {
            const { data, error } = await supabase
                .from('notices')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;
            if (!data) {
                toast.error("존재하지 않는 게시물입니다.");
                router.push("/community/notice");
                return;
            }
            setNotice(data);
        } catch (error: any) {
            console.error("Error fetching notice:", error);
            toast.error("게시물을 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const incrementReadCount = async () => {
        try {
            await supabase.rpc('increment_notice_read_count', { notice_id: parseInt(params.id as string) });
        } catch (error) {
            console.error("Error incrementing read count:", error);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("링크가 복사되었습니다.");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!notice) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link href="/community/notice" className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                            <ChevronLeft size={18} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">Back to List</span>
                    </Link>
                </motion.div>

                {/* Article Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 mb-12"
                >
                    <div className="flex flex-wrap items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${notice.category === 'EVENT'
                                ? 'bg-pink-500/10 border-pink-500/20 text-pink-500'
                                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            }`}>
                            {notice.category}
                        </span>
                        <div className="flex items-center gap-4 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                {new Date(notice.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye size={12} />
                                {notice.read_count + 1}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                            {notice.title}
                        </h1>
                        <button
                            onClick={handleShare}
                            className="shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                </motion.header>

                {/* Article Content */}
                <motion.article
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-12"
                >
                    {notice.image_url && (
                        <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-white/5">
                            <img
                                src={notice.image_url}
                                alt={notice.title}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    )}

                    <div className="prose prose-invert max-w-none">
                        <div className="text-slate-300 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium pb-20">
                            {notice.content}
                        </div>
                    </div>
                </motion.article>

                {/* Bottom Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-12 border-t border-white/10 flex justify-center"
                >
                    <Link href="/community/notice">
                        <button className="px-12 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-xl">
                            List Overview
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
