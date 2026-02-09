"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Send, Trash2, ShieldCheck, Loader2 } from "lucide-react";
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

export default function ProductReviews({ productId }: { productId: string }) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newContent, setNewContent] = useState("");

    const fetchReviews = async () => {
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
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.email) {
            toast.error("로그인이 필요합니다.");
            return;
        }
        if (!newContent.trim()) {
            toast.error("리뷰 내용을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("reviews").insert([
                {
                    product_id: productId,
                    user_email: session.user.email,
                    author: session.user.name || "익명 사용자",
                    content: newContent,
                    rating: newRating,
                    title: `Review for Product ${productId}`, // Existing title field
                },
            ]);

            if (error) throw error;

            toast.success("리뷰가 등록되었습니다.");
            setNewContent("");
            setNewRating(5);
            fetchReviews();
        } catch (error: any) {
            toast.error("리뷰 등록 실패: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-20 border-t border-white/10 pt-20">
            <div className="flex items-center gap-4 mb-10">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Customer Reviews</h2>
                <div className="flex bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-black font-mono">
                    {reviews.length} FEEDBACKS
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Review List */}
                <div className="lg:col-span-12 space-y-6">
                    {/* Add Review Form */}
                    {session ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/20 rounded-[2.5rem] p-8 mb-12 shadow-xl backdrop-blur-3xl"
                        >
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
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="상점에 대한 솔직한 후기를 남겨주세요..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 min-h-[120px] transition-all"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                                        Submit Feedback
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-10 text-center mb-12">
                            <p className="text-sm text-slate-500 font-mono uppercase tracking-[0.2em] mb-4 text-balance">
                                리뷰를 작성하려면 로그인이 필요합니다.
                            </p>
                            <button className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg transition-all">
                                AUTHENTICATE
                            </button>
                        </div>
                    )}

                    {/* Review Loop */}
                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="py-20 text-center text-slate-500 border border-white/5 rounded-3xl">
                                <MessageSquare className="mx-auto mb-4 opacity-10" size={48} />
                                <p className="text-[10px] font-black uppercase tracking-widest">No signals received yet.</p>
                            </div>
                        ) : (
                            reviews.map((review, idx) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.06] transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                                                {review.author[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{review.author}</h4>
                                                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={i < review.rating ? "text-yellow-500 fill-current" : "text-slate-800"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                        {review.content}
                                    </p>

                                    {/* Admin Answer */}
                                    {review.answer && (
                                        <div className="mt-6 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                                                <ShieldCheck size={12} />
                                                Management Response
                                            </div>
                                            <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">
                                                {review.answer}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
