"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Save, Image as ImageIcon, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface BrandImage {
    id: number;
    title: string;
    image_url: string;
    section?: string;
    display_order: number;
}

export default function AdminBrandPage() {
    const [images, setImages] = useState<BrandImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState<'campaign' | 'concept_slide'>('campaign');

    // Form States
    const [title, setTitle] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);
    const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
    const [imageUrl, setImageUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const { data, error } = await supabase
                .from('brand_images')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setImages(data || []);
        } catch (error: any) {
            console.error("Error fetching brand images:", error.message || error);
            toast.error("이미지 목록을 불러오지 못했습니다: " + (error.message || "알 수 없는 오류"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title) {
            toast.error("제목을 입력해주세요.");
            return;
        }

        let finalImageUrl = imageUrl;

        try {
            setIsUploading(true);

            // 1. Handle File Upload if selected
            if (uploadMethod === 'file') {
                if (!selectedFile) {
                    toast.error("파일을 선택해주세요.");
                    setIsUploading(false);
                    return;
                }

                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `brand-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('brand-assets')
                    .upload(fileName, selectedFile);

                if (uploadError) {
                    if (uploadError.message.includes("Bucket not found")) {
                        throw new Error("Supabase Storage에 'brand-assets' 버킷을 생성해야 합니다.");
                    }
                    throw uploadError;
                }

                const { data: publicUrlData } = supabase.storage
                    .from('brand-assets')
                    .getPublicUrl(fileName);

                finalImageUrl = publicUrlData.publicUrl;
            } else {
                if (!imageUrl) {
                    toast.error("이미지 URL을 입력해주세요.");
                    setIsUploading(false);
                    return;
                }
            }

            if (finalImageUrl) {
                const { error: insertError } = await supabase
                    .from('brand_images')
                    .insert([
                        {
                            title: title,
                            image_url: finalImageUrl,
                            section: activeTab, // Use the currently active tab as the section
                            display_order: displayOrder
                        }
                    ]);

                if (insertError) throw insertError;
            }


            toast.success("성공적으로 등록되었습니다.");

            // Reset Form
            setTitle("");
            // setDisplayOrder(0); // Removed displayOrder reset if we want to keep it? Or just keep simple
            setImageUrl("");
            setSelectedFile(null);
            setIsAdding(false);
            fetchImages();

        } catch (error: any) {
            console.error("Error adding image:", error);
            toast.error(error.message || "오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: number, imageUrlToDelete: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            const { error } = await supabase
                .from('brand_images')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success("삭제되었습니다.");
            fetchImages();
        } catch (error: any) {
            console.error("Error deleting image:", error);
            toast.error("삭제 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"));
        }
    };

    // Filter images based on active tab
    const filteredImages = images.filter(img =>
        activeTab === 'campaign'
            ? (!img.section || img.section === 'campaign')
            : img.section === 'concept_slide'
    );

    // Load Demo Data Function
    const handleLoadDemoData = async () => {
        if (!confirm(`${activeTab === 'campaign' ? '메인 캠페인' : '컨셉 슬라이더'} 데모 데이터를 불러오시겠습니까?`)) return;

        try {
            setIsUploading(true);
            const dataToInsert = activeTab === 'campaign' ? DEMO_CAMPAIGN_DATA : DEMO_SLIDER_DATA;

            const { error } = await supabase
                .from('brand_images')
                .insert(dataToInsert);

            if (error) throw error;

            toast.success("데모 데이터가 로드되었습니다.");
            fetchImages();
        } catch (error: any) {
            console.error("Error loading demo data:", error);
            toast.error("데모 데이터 로드 실패: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black tracking-widest text-white italic uppercase">브랜드 관리</h1>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('campaign')}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'campaign'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                >
                    메인 캠페인 (Grid)
                </button>
                <button
                    onClick={() => setActiveTab('concept_slide')}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'concept_slide'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                >
                    컨셉 슬라이더 (Gallery)
                </button>
            </div>

            <div className="bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-white italic uppercase tracking-tight">
                    <Plus className="w-5 h-5 text-blue-500" />
                    <span className={activeTab === 'campaign' ? "text-blue-400" : "text-purple-400"}>
                        {activeTab === 'campaign' ? '메인 캠페인' : '컨셉 슬라이더'}
                    </span> 새로운 이미지 등록
                </h2>
                <form onSubmit={handleAddImage} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">이미지 제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all"
                            placeholder="예: 2024 S/S 룩북 01 (필수)"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">업로드 방식</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setUploadMethod('file')}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${uploadMethod === 'file' ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                            >
                                <Upload className="w-4 h-4" /> 파일 직접 업로드
                            </button>
                            <button
                                type="button"
                                onClick={() => setUploadMethod('url')}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${uploadMethod === 'url' ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                            >
                                <LinkIcon className="w-4 h-4" /> 이미지 URL 주소
                            </button>
                        </div>
                    </div>

                    {uploadMethod === 'file' ? (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">이미지 파일 선택</label>
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center group-hover:border-blue-500/50 transition-colors bg-white/5">
                                    {selectedFile ? (
                                        <div className="text-blue-400 flex items-center justify-center gap-2 font-bold text-sm">
                                            <CheckCircle2 className="w-5 h-5" />
                                            {selectedFile.name}
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 space-y-2">
                                            <Upload className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            <p className="text-xs font-black uppercase tracking-widest">파일을 클릭하거나 여기로 드래그하세요</p>
                                            <p className="text-[10px] opacity-50">JPG, PNG, WEBP (최대 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">이미지 URL 주소</label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all"
                                placeholder="https://example.com/image.jpg"
                                required={uploadMethod === 'url'}
                            />
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em]"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> 업로드 중...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> {activeTab === 'campaign' ? '메인 캠페인' : '슬라이더'}에 저장하기
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase italic tracking-widest text-white">등록된 이미지 목록 ({filteredImages.length})</h2>
                </div>
                <div className="divide-y divide-white/5">
                    {filteredImages.map((img) => (
                        <div key={img.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-center gap-6">
                                <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-black border border-white/10 group-hover:border-blue-500/30 transition-all">
                                    <img src={img.image_url} alt={img.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-white uppercase text-sm">{img.title}</h3>
                                    <p className="text-[10px] font-mono text-slate-500 truncate max-w-sm">{img.image_url}</p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border inline-block mt-1 ${img.section === 'concept_slide'
                                        ? 'border-purple-500/30 text-purple-400 bg-purple-500/10'
                                        : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                        }`}>
                                        {img.section === 'concept_slide' ? '컨셉 슬라이더' : '메인 캠페인'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(img.id, img.image_url)}
                                className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {filteredImages.length === 0 && !isLoading && (
                        <div className="p-20 text-center text-slate-600 space-y-4">
                            <ImageIcon className="mx-auto mb-4 opacity-10" size={64} />
                            <p className="text-[10px] font-black uppercase tracking-widest">이 섹션에 등록된 이미지가 없습니다.</p>
                            <button
                                onClick={handleLoadDemoData}
                                disabled={isUploading}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                            >
                                {activeTab === 'campaign' ? '캠페인' : '슬라이더'} 데모 데이터 불러오기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Check if CheckCircle2 is imported, if not use CheckCircle
import { CheckCircle2 } from "lucide-react";

const DEMO_CAMPAIGN_DATA = [
    { title: "Zero Gravity", image_url: "/hero-glasses.png", section: 'campaign', display_order: 1 },
    { title: "Lunar Eclipse", image_url: "/hero-glasses.png", section: 'campaign', display_order: 2 },
    { title: "Solar Flare", image_url: "/hero-glasses.png", section: 'campaign', display_order: 3 },
    { title: "Nebula Cloud", image_url: "/hero-glasses.png", section: 'campaign', display_order: 4 },
];

const DEMO_SLIDER_DATA = [
    { title: "Lookbook 1", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/a769d6626acca.jpg", section: 'concept_slide', display_order: 1 },
    { title: "Lookbook 2", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/72b88df44e366.jpg", section: 'concept_slide', display_order: 2 },
    { title: "Lookbook 3", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/6b131f06f811a.jpg", section: 'concept_slide', display_order: 3 },
    { title: "Lookbook 4", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/d8a39b56f8749.jpg", section: 'concept_slide', display_order: 4 },
    { title: "Lookbook 5", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/a0765955a1099.png", section: 'concept_slide', display_order: 5 },
    { title: "Lookbook 6", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/d75b8a07f6c31.png", section: 'concept_slide', display_order: 6 },
    { title: "Lookbook 7", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/a62ad853f683a.png", section: 'concept_slide', display_order: 7 },
    { title: "Lookbook 8", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/c94b7f9417937.png", section: 'concept_slide', display_order: 8 },
    { title: "Lookbook 9", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/4102914d3f382.png", section: 'concept_slide', display_order: 9 },
    { title: "Lookbook 10", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/3d0382379cad9.png", section: 'concept_slide', display_order: 10 },
    { title: "Lookbook 11", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/94d4d9de59b56.png", section: 'concept_slide', display_order: 11 },
    { title: "Lookbook 12", image_url: "https://cdn.imweb.me/upload/S201610315817320f164e6/b8ff0e3d23d83.png", section: 'concept_slide', display_order: 12 },
];
