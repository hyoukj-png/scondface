"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, MessageCircleQuestion, ChevronDown, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface QnA {
    id: number;
    status: string;
    title: string;
    content: string;
    author: string;
    created_at: string;
    answer?: string;
    is_secret?: boolean;
}

export default function QnaPage() {
    const [qnaList, setQnaList] = useState<QnA[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchQna();
    }, []);

    const fetchQna = async () => {
        try {
            const { data, error } = await supabase
                .from('qna')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQnaList(data || []);
        } catch (error) {
            console.error("Error fetching qna:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
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
                            Q&A
                        </h1>
                    </motion.div>

                    <Link href="/community/qna/write">
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg shadow-blue-600/20"
                        >
                            <MessageCircleQuestion size={20} />
                            <span>Ask Question</span>
                        </motion.button>
                    </Link>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="py-20 text-center text-slate-500 animate-pulse">
                        Loading questions...
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && qnaList.length === 0 && (
                    <div className="py-20 text-center text-slate-500">
                        등록된 질문이 없습니다. 궁금한 점을 남겨주세요!
                    </div>
                )}

                {/* QnA List */}
                <div className="space-y-4">
                    {qnaList.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 + 0.3 }}
                            className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden"
                        >
                            <div
                                onClick={() => toggleExpand(item.id)}
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 mt-1 ${item.status === 'Answered' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {item.status || "Waiting"}
                                    </span>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {item.is_secret && <Lock size={14} className="text-slate-500" />}
                                            <h3 className="text-lg font-bold text-slate-200">
                                                {item.is_secret ? "비밀글입니다." : item.title}
                                            </h3>
                                        </div>
                                        <div className="text-sm text-slate-500 font-mono">
                                            {item.author || "Guest"} | {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-slate-500 transition-transform duration-300 ${expandedId === item.id ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </div>

                            {/* Answer Section */}
                            {expandedId === item.id && (
                                <div className="bg-slate-900/50 p-6 border-t border-white/5 text-slate-300 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                    {/* Content Display */}
                                    <div className="mb-6 p-4 bg-white/5 rounded-xl text-sm text-slate-400">
                                        <p className="font-bold text-slate-500 mb-2 uppercase tracking-widest text-[10px]">Question Content</p>
                                        {item.is_secret ? (
                                            <div className="flex items-center gap-2">
                                                <Lock size={16} />
                                                <span>비밀글 내용은 작성자와 관리자만 볼 수 있습니다. (데모: 모두 공개)</span>
                                                <p className="mt-2 text-white">{item.content}</p>
                                            </div>
                                        ) : (
                                            <p>{item.content}</p>
                                        )}
                                    </div>

                                    {/* Answer Display */}
                                    {item.answer ? (
                                        <>
                                            <p className="font-bold text-blue-500 mb-2">[Answer]</p>
                                            <p>{item.answer}</p>
                                        </>
                                    ) : (
                                        <p className="text-slate-600 italic">답변 대기 중입니다.</p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
