"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Send, Save, Upload, Loader2, Image as ImageIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { adminCreateNotice } from "@/app/actions/admin";

export default function WriteNoticePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: "",
        category: "NOTICE",
        content: "",
        image_url: ""
    });

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user?.email !== 'admin@antigravity.com') {
            toast.error("관리자만 작성할 수 있습니다.");
            router.push("/community/notice");
        }
    }, [session, status, router]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("파일 크기는 5MB 이하여야 합니다.");
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `notice_body_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('notices')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('notices')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image_url: publicUrl });
            toast.success("이미지가 업로드되었습니다.");
        } catch (error: any) {
            toast.error("업로드 실패: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return;

        setIsSubmitting(true);
        try {
            const result = await adminCreateNotice({
                title: formData.title,
                category: formData.category,
                content: formData.content,
                image_url: formData.image_url,
                read_count: 0
            });

            if (result.error) throw new Error(result.error);

            toast.success("공지가 등록되었습니다.");
            router.push("/community/notice");
            router.refresh();
        } catch (error: any) {
            console.error("Error creating notice:", error);
            toast.error("공지 등록에 실패했습니다: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/community/notice" className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold uppercase tracking-widest mb-4">
                        <ChevronLeft size={16} />
                        Back to List
                    </Link>
                    <h1 className="text-3xl font-black italic uppercase">Write Notice</h1>
                </div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10"
                    onSubmit={handleSubmit}
                >
                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Category</label>
                        <div className="flex gap-4">
                            {['NOTICE', 'EVENT', 'NEWS'].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${formData.category === cat
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
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

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notice Image (Optional)</label>
                        <div className="space-y-4">
                            {formData.image_url && (
                                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5">
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image_url: '' })}
                                        className="absolute top-4 right-4 bg-black/60 hover:bg-rose-500 text-white p-2 rounded-full transition-colors backdrop-blur-md"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="이미지 URL을 입력하거나 파일을 업로드하세요"
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-6 flex items-center justify-center transition-all disabled:opacity-50"
                                >
                                    {isUploading ? <Loader2 className="animate-spin text-blue-400" size={18} /> : <Upload size={18} className="text-slate-400" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full h-80 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                            placeholder="내용을 입력하세요"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Link href="/community/notice" className="px-6 py-3 rounded-full text-sm font-bold text-slate-400 hover:text-white transition-colors">
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
                                    <span>Register Notice</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
