"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function WriteQnaPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        author: "",
        is_secret: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('qna')
                .insert([
                    {
                        title: formData.title,
                        content: formData.content,
                        author: formData.author || "Guest",
                        status: "Waiting",
                        is_secret: formData.is_secret
                    }
                ]);

            if (error) throw error;

            toast.success("질문이 등록되었습니다.");
            router.push("/community/qna");
            router.refresh();
        } catch (error) {
            console.error("Error creating qna:", error);
            toast.error("질문 등록에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/community/qna" className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold uppercase tracking-widest mb-4">
                        <ChevronLeft size={16} />
                        Back to Q&A
                    </Link>
                    <h1 className="text-3xl font-black italic uppercase">Ask Question</h1>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10"
                    onSubmit={handleSubmit}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Name</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="작성자명 (선택)"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${formData.is_secret ? 'bg-blue-600 border-blue-600' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                    {formData.is_secret && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.is_secret}
                                    onChange={(e) => setFormData({ ...formData, is_secret: e.target.checked })}
                                    className="hidden"
                                />
                                <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Secret Post (비밀글)</span>
                            </label>
                        </div>
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
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Question</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full h-60 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                            placeholder="궁금한 내용을 입력하세요"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Link href="/community/qna" className="px-6 py-3 rounded-full text-sm font-bold text-slate-400 hover:text-white transition-colors">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Sending...</span>
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span>Submit Question</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
