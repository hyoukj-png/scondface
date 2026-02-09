"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Send, ShieldCheck, Loader2, Lock, MessageCircleQuestion } from "lucide-react";
import toast from "react-hot-toast";

interface Review {
    id: number;
    user_email: string;
    author: string;
    content: string;
    rating: number;
    created_at: string;
    answer?: string;
}

interface QnA {
    id: number;
    title: string;
    content: string;
    author: string;
    status: string;
    created_at: string;
    answer?: string;
    is_secret: boolean;
}

export default function ProductCommunity({ productId, productName }: { productId: string, productName: string }) {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<'reviews' | 'qna'>('reviews');

    // States for Reviews
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newReviewContent, setNewReviewContent] = useState("");

    // States for QnA
    const [qnaList, setQnaList] = useState<QnA[]>([]);
    const [qnaLoading, setQnaLoading] = useState(true);
    const [isSubmittingQna, setIsSubmittingQna] = useState(false);
    const [newQnaTitle, setNewQnaTitle] = useState("");
    const [newQnaContent, setNewQnaContent] = useState("");
    const [isSecret, setIsSecret] = useState(false);
    const [expandedQna, setExpandedQna] = useState<number | null>(null);

    const fetchReviews = async () => {
        setReviewLoading(true);
        try {
            const { data, error } = await supabase
                .from("reviews")
                .select("*")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setReviewLoading(false);
        }
    };

    const fetchQna = async () => {
        setQnaLoading(true);
        try {
            const { data, error } = await supabase
                .from("qna")
                .select("*")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setQnaList(data || []);
        } catch (error) {
            console.error("Error fetching qna:", error);
        } finally {
            setQnaLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
            fetchQna();
        }
    }, [productId]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.email) {
            toast.error("로그인이 필요합니다.");
            return;
        }
        if (!newReviewContent.trim()) {
            toast.error("리뷰 내용을 입력해주세요.");
            return;
        }

        setIsSubmittingReview(true);
        try {
            const { error } = await supabase.from("reviews").insert([
                {
                    product_id: productId,
                    user_email: session.user.email,
                    author: session.user.name || "익명 사용자",
                    content: newReviewContent,
                    rating: newRating,
                    title: `[${productName}] 상품 리뷰`,
                },
            ]);

            if (error) throw error;

            toast.success("리뷰가 등록되었습니다.");
            setNewReviewContent("");
            setNewRating(5);
            fetchReviews();
        } catch (error: any) {
            toast.error("리뷰 등록 실패: " + error.message);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleQnaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.email) {
            toast.error("로그인이 필요합니다.");
            return;
        }
        if (!newQnaTitle.trim() || !newQnaContent.trim()) {
            toast.error("제목과 내용을 입력해주세요.");
            return;
        }

        setIsSubmittingQna(true);
        try {
            const { error } = await supabase.from("qna").insert([
                {
                    product_id: productId,
                    title: newQnaTitle,
                    content: newQnaContent,
                    author: session.user.name || "익명 사용자",
                    status: "Waiting",
                    is_secret: isSecret,
                },
            ]);

            if (error) throw error;

            toast.success("문의사항이 등록되었습니다.");
            setNewQnaTitle("");
            setNewQnaContent("");
            setIsSecret(false);
            fetchQna();
        } catch (error: any) {
            toast.error("문의 등록 실패: " + error.message);
        } finally {
            setIsSubmittingQna(false);
        }
    };

    return (
        <section className="mt-20 border-t border-white/10 pt-20">
            {/* Tab Navigation */}
            <div className="flex items-center gap-8 mb-12 border-b border-white/5">
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'reviews' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Customer Reviews ({reviews.length})
                    {activeTab === 'reviews' && (
                        <motion.div layoutId="communityTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('qna')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'qna' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Product Q&A ({qnaList.length})
                    {activeTab === 'qna' && (
                        <motion.div layoutId="communityTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-12 space-y-8">
                    {/* REVIEWS TAB */}
                    {activeTab === 'reviews' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            {/* Review Form */}
                            {session ? (
                                <div className="bg-white/5 border border-white/20 rounded-[2.5rem] p-8 mb-12 shadow-xl backdrop-blur-3xl">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Leave a Review</h3>
                                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rating:</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => setNewRating(s)}
                                                        className={`transition-all ${s <= newRating ? "text-yellow-400 scale-110" : "text-slate-700 hover:text-slate-500"}`}
                                                    >
                                                        <Star size={20} fill={s <= newRating ? "currentColor" : "none"} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <textarea
                                            value={newReviewContent}
                                            onChange={(e) => setNewReviewContent(e.target.value)}
                                            placeholder="제품에 대한 솔직한 후기를 남겨주세요..."
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 min-h-[120px] transition-all"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSubmittingReview}
                                                className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 flex items-center gap-2"
                                            >
                                                {isSubmittingReview ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                                                Submit Review
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-10 text-center mb-12">
                                    <p className="text-sm text-slate-500 font-mono uppercase tracking-[0.2em] mb-4">리뷰를 작성하려면 로그인이 필요합니다.</p>
                                </div>
                            )}

                            {/* Review List */}
                            <div className="space-y-6">
                                {reviewLoading ? (
                                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                                ) : reviews.length === 0 ? (
                                    <div className="py-20 text-center text-slate-500 border border-white/5 rounded-3xl">
                                        <MessageSquare className="mx-auto mb-4 opacity-10" size={48} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No reviews yet.</p>
                                    </div>
                                ) : (
                                    reviews.map((review, idx) => (
                                        <motion.div key={review.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.06] transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">{review.author[0]}</div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">{review.author}</h4>
                                                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} className={i < review.rating ? "text-yellow-500 fill-current" : "text-slate-800"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed mb-6">{review.content}</p>
                                            {review.answer && (
                                                <div className="mt-6 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldCheck size={12} /> Management Response</p>
                                                    <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">{review.answer}</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* QNA TAB */}
                    {activeTab === 'qna' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            {/* QnA Form */}
                            {session ? (
                                <div className="bg-white/5 border border-white/20 rounded-[2.5rem] p-8 mb-12 shadow-xl backdrop-blur-3xl">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400 mb-6">Product Inquiry</h3>
                                    <form onSubmit={handleQnaSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={newQnaTitle}
                                                onChange={(e) => setNewQnaTitle(e.target.value)}
                                                placeholder="문의 제목을 입력하세요"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                            />
                                            <div className="flex items-center">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSecret ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                                        {isSecret && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} className="hidden" />
                                                    <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">Secret Mode (비밀글)</span>
                                                </label>
                                            </div>
                                        </div>
                                        <textarea
                                            value={newQnaContent}
                                            onChange={(e) => setNewQnaContent(e.target.value)}
                                            placeholder="제품에 대해 궁금한 점을 문의해주세요..."
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/50 min-h-[120px] transition-all"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSubmittingQna}
                                                className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-30 flex items-center gap-2"
                                            >
                                                {isSubmittingQna ? <Loader2 className="animate-spin" size={14} /> : <MessageCircleQuestion size={14} />}
                                                Ask Question
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-10 text-center mb-12">
                                    <p className="text-sm text-slate-500 font-mono uppercase tracking-[0.2em] mb-4">로그인 후 문의하실 수 있습니다.</p>
                                </div>
                            )}

                            {/* QnA List */}
                            <div className="space-y-4">
                                {qnaLoading ? (
                                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-cyan-500" size={32} /></div>
                                ) : qnaList.length === 0 ? (
                                    <div className="py-20 text-center text-slate-500 border border-white/5 rounded-3xl">
                                        <MessageCircleQuestion className="mx-auto mb-4 opacity-10" size={48} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No inquiries found.</p>
                                    </div>
                                ) : (
                                    qnaList.map((item, idx) => (
                                        <div key={item.id} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                                            <div
                                                onClick={() => setExpandedQna(expandedQna === item.id ? null : item.id)}
                                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-full ${item.status === 'Answered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'}`}>
                                                        {item.status === 'Answered' ? 'ANSWERED' : 'WAITING'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {item.is_secret && <Lock size={12} className="text-slate-500" />}
                                                        <h4 className="text-sm font-bold text-slate-200">
                                                            {item.is_secret ? "비밀글입니다." : item.title}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                                    {item.author} • {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                                {expandedQna === item.id && (
                                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/5">
                                                        <div className="p-6 space-y-6 bg-black/20">
                                                            <div className="space-y-2">
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Question</p>
                                                                <p className="text-sm text-slate-300 leading-relaxed">{item.is_secret ? "비밀글 내용입니다." : item.content}</p>
                                                            </div>
                                                            {item.answer && (
                                                                <div className="pl-6 border-l-2 border-cyan-500/30 space-y-2">
                                                                    <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                                                        <ShieldCheck size={12} /> Management Response
                                                                    </p>
                                                                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                                                                </div>
                                                            )}
                                                            {!item.answer && <p className="text-xs text-slate-600 italic">답변 준비 중입니다.</p>}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
