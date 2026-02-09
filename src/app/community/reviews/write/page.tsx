"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function WriteReviewPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        author: "",
        image_url: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert([
                    {
                        title: formData.title,
                        content: formData.content,
                        author: formData.author || "Anonymous",
                        image_url: formData.image_url || null,
                        likes: 0,
                        comments: 0
                    }
                ]);

            if (error) throw error;

            toast.success("리뷰가 등록되었습니다.");
            router.push("/community/reviews");
            router.refresh();
        } catch (error) {
            console.error("Error creating review:", error);
            toast.error("리뷰 등록에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/community/reviews" className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold uppercase tracking-widest mb-4">
                        <ChevronLeft size={16} />
                        Back to Reviews
                    </Link>
                    <h1 className="text-3xl font-black italic uppercase">Write Review</h1>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">My Name</label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="작성자명 (선택)"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="제목을 입력하세요"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Image URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="https://..."
                        />
                        <p className="text-[10px] text-slate-600 mt-1">※ 이미지 호스팅 URL을 입력해주세요. (추후 업로드 기능 업데이트 예정)</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full h-60 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                            placeholder="내용을 입력하세요"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Link href="/community/reviews" className="px-6 py-3 rounded-full text-sm font-bold text-slate-400 hover:text-white transition-colors">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Saving...</span>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Post Review</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
