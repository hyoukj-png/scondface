"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Camera, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Review {
    id: number;
    title: string;
    content: string;
    author: string;
    likes: number;
    comments: number;
    image_url?: string;
    created_at: string;
    products?: {
        name: string;
    };
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*, products(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
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
                            REVIEWS
                        </h1>
                    </motion.div>

                    <Link href="/community/reviews/write">
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg shadow-blue-600/20"
                        >
                            <Camera size={20} />
                            <span>Write Review</span>
                        </motion.button>
                    </Link>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="py-20 text-center text-slate-500 animate-pulse">
                        Loading reviews...
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && reviews.length === 0 && (
                    <div className="py-20 text-center text-slate-500">
                        등록된 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
                    </div>
                )}

                {/* Masonry Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {reviews.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="break-inside-avoid relative p-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden cursor-pointer group hover:bg-white/10 hover:translate-y-[-4px] transition-all duration-300 flex flex-col justify-between"
                        >
                            {/* Gradient Overlay for visual depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold ring-2 ring-black">
                                        {(post.author || "A")[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-slate-300">@{post.author || "Anonymous"}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                                    {(post.title.startsWith('Review for Product') && post.products?.name)
                                        ? `[${post.products.name}] 구매 리뷰`
                                        : post.title}
                                </h3>
                                <p className="text-slate-400 text-sm line-clamp-4 leading-relaxed">{post.content}</p>

                                {post.image_url && (
                                    <div className="mt-4 rounded-lg overflow-hidden h-40 relative">
                                        <img src={post.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-white/5 group-hover:border-white/20 transition-colors">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Verified Purchase</span>
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="flex items-center gap-1.5 hover:text-pink-500 transition-colors">
                                        <Heart size={16} />
                                        <span className="text-xs font-bold">{post.likes || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                        <MessageCircle size={16} />
                                        <span className="text-xs font-bold">{post.comments || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
