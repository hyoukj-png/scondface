"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { MessageSquare, ThumbsUp, Trash2, EyeOff, ShieldCheck, Loader2, MessageCircleQuestion, CheckCircle2, MoreVertical, XCircle, Plus, Bell, PenTool } from "lucide-react";
import toast from "react-hot-toast";
import { adminReplyToCommunity, adminDeleteCommunity, adminUpdateCommunityStatus } from "@/app/actions/admin";
import Link from "next/link";

export default function AdminCommunityPage() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'reviews' | 'qna' | 'notices'>('reviews');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeItemId, setActiveItemId] = useState<number | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const table = activeTab;
            let query = (table === 'reviews' || table === 'qna')
                ? supabase.from(table).select('*, products(name)')
                : supabase.from(table).select('*');

            const { data, error } = await query
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
            setSelectedIds([]);
        } catch (error: any) {
            console.error("Error fetching community data:", error);
            toast.error("커뮤니티 데이터를 불러오지 못했습니다: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleDelete = async (id?: number) => {
        const idsToDelete = id ? [id] : selectedIds;
        if (idsToDelete.length === 0) return;

        if (!confirm(`선택한 ${idsToDelete.length}개의 항목을 정말 삭제하시겠습니까?`)) return;

        try {
            const result = await adminDeleteCommunity(activeTab, idsToDelete);
            if (result.error) throw new Error(result.error);

            toast.success(`${idsToDelete.length}개의 항목이 삭제되었습니다.`);
            fetchData();
        } catch (error: any) {
            toast.error("삭제 실패: " + error.message);
        }
    };

    const handleBulkStatusChange = async (newStatus: string) => {
        if (selectedIds.length === 0) return;

        try {
            const result = await adminUpdateCommunityStatus(activeTab, selectedIds, newStatus);
            if (result.error) throw new Error(result.error);

            toast.success(`${selectedIds.length}개의 항목 상태가 변경되었습니다.`);
            fetchData();
        } catch (error: any) {
            toast.error("상태 변경 실패: " + error.message);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(item => item.id));
        }
    };

    const toggleSelectItem = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };


    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");

    const handleReplySubmit = async (id: number) => {
        if (!replyContent.trim()) {
            toast.error("답변 내용을 입력해주세요.");
            return;
        }
        try {
            const table = activeTab;
            if (table === 'notices') {
                toast.error("공지사항에는 답변을 달 수 없습니다.");
                return;
            }

            // Server Action 호출
            const result = await adminReplyToCommunity(table, id, replyContent);

            if (result.error) throw new Error(result.error);

            toast.success("답변이 등록되었습니다.");
            setReplyingTo(null);
            setReplyContent("");
            fetchData();
        } catch (error: any) {
            console.error("Reply Error:", error);
            toast.error("답변 등록 실패: " + error.message);
        }
    };

    return (
        <div className="space-y-10" onClick={() => setActiveItemId(null)}>
            {/* ... Header Section (Omitted for brevity in diff, assume unchanged) ... */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-widest text-white italic uppercase">커뮤니티 관리</h1>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2 px-1">리뷰 및 문의 내역 통합 관리 센터</p>
                </div>

                <div className="flex items-center gap-4">
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-2"
                            >
                                {activeTab === 'qna' && (
                                    <>
                                        <button
                                            onClick={() => handleBulkStatusChange('Answered')}
                                            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all"
                                        >
                                            답변 완료로 변경
                                        </button>
                                        <button
                                            onClick={() => handleBulkStatusChange('Pending')}
                                            className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
                                        >
                                            대기로 변경
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete()}
                                    className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={14} className="inline mr-1" />
                                    {selectedIds.length}개 삭제
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reviews' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            구매 리뷰
                        </button>
                        <button
                            onClick={() => setActiveTab('qna')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'qna' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            상품 문의
                        </button>
                        <button
                            onClick={() => setActiveTab('notices')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notices' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            공지사항
                        </button>
                    </div>

                    {activeTab === 'notices' && (
                        <Link href="/community/notice/write">
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <Plus size={14} />
                                공지 등록
                            </motion.button>
                        </Link>
                    )}
                </div>
            </div>

            {items.length > 0 && (
                <div className="flex items-center gap-2 px-4">
                    <button
                        onClick={toggleSelectAll}
                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${selectedIds.length === items.length ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-white/20 hover:border-white/40'}`}
                    >
                        {selectedIds.length === items.length && <CheckCircle2 size={12} />}
                    </button>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">전체 선택</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-cyan-500" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">데이터 스캔 중...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-20 bg-white/5 border border-white/10 rounded-3xl text-center text-slate-500">
                        <MessageSquare className="mx-auto mb-4 opacity-10" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest">등록된 내역이 없습니다.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white/5 border border-white/10 rounded-3xl p-8 group hover:bg-white/[0.08] transition-all relative ${selectedIds.includes(item.id) ? 'border-cyan-500/50 bg-cyan-500/5' : ''}`}
                            >
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Selection Overlay */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelectItem(item.id);
                                        }}
                                        className={`absolute top-8 left-4 -translate-x-full opacity-0 group-hover:opacity-100 transition-all w-6 h-6 rounded-full border flex items-center justify-center ${selectedIds.includes(item.id) ? 'bg-cyan-500 border-cyan-500 text-white opacity-100' : 'border-white/20 bg-black/50'}`}
                                    >
                                        <CheckCircle2 size={14} />
                                    </button>

                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${activeTab === 'notices' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'}`}>
                                                    {activeTab === 'notices' ? <Bell size={18} /> : (item.author || item.user || '?')[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">
                                                        {activeTab === 'notices' ? item.title : (item.author || item.user || "익명 사용자")}
                                                        {item.products?.name && (
                                                            <span className="ml-2 text-[10px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                                                                {item.products.name}
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                                                        {activeTab === 'reviews' ? '리뷰 작성자' : activeTab === 'qna' ? '문의 작성자' : '공지사항'} • {new Date(item.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {activeTab === 'reviews' && (
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={`text-xs ${i < (item.rating || 5) ? 'text-yellow-500' : 'text-slate-700'}`}>★</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {activeTab === 'qna' && (
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${item.status === 'Answered' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                                        {item.status === 'Answered' ? '답변완료' : '답변대기'}
                                                    </span>
                                                )}
                                                {activeTab === 'notices' && (
                                                    <>
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                                            {item.category}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-500">
                                                            조회수: {item.read_count}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <p className="text-slate-300 text-sm leading-relaxed">"{item.content || item.title}"</p>
                                        </div>

                                        {/* Admin Answer Display */}
                                        {item.answer && replyingTo !== item.id && (
                                            <div className="p-4 ml-8 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <ShieldCheck size={12} /> 관리자 답변
                                                </p>
                                                <p className="text-slate-400 text-sm whitespace-pre-wrap">{item.answer}</p>
                                            </div>
                                        )}

                                        {/* Reply Input Form */}
                                        <AnimatePresence>
                                            {replyingTo === item.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="pl-8 pt-2"
                                                >
                                                    <div className="bg-white/5 rounded-2xl p-4 border border-blue-500/30">
                                                        <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">관리자 답변 작성</h5>
                                                        <textarea
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            placeholder="답변 내용을 입력하세요..."
                                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 min-h-[100px] mb-3"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setReplyingTo(null);
                                                                    setReplyContent("");
                                                                }}
                                                                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white/10 transition-colors"
                                                            >
                                                                취소
                                                            </button>
                                                            <button
                                                                onClick={() => handleReplySubmit(item.id)}
                                                                className="px-6 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                                                            >
                                                                답변 등록
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex md:flex-col gap-3 shrink-0">
                                        {activeTab !== 'notices' && (
                                            <button
                                                onClick={() => {
                                                    if (replyingTo === item.id) {
                                                        setReplyingTo(null);
                                                    } else {
                                                        setReplyingTo(item.id);
                                                        setReplyContent(item.answer || ""); // Load existing answer if any
                                                    }
                                                }}
                                                className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition-all ${replyingTo === item.id
                                                    ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400'
                                                    }`}
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                        )}
                                        {activeTab === 'notices' && (
                                            <Link href={`/community/notice/write`}>
                                                <button
                                                    className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                                                >
                                                    <PenTool size={18} />
                                                </button>
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
