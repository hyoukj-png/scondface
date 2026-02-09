"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { adminUpdateSiteSettings } from "@/app/actions/admin";
import {
    Settings as SettingsIcon,
    Image as ImageIconComponent,
    Bell as BellIcon,
    Globe as GlobeIcon,
    Save as SaveIcon,
    Loader2 as LoaderIcon,
    Power as PowerIcon,
    Upload as UploadIcon
} from "lucide-react";
import { useRef } from "react";

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [settings, setSettings] = useState<any>({
        site_name: "SecondFace",
        notice_popup: false,
        notice_title: "",
        notice_content: "",
        notice_image: "",
        notice_type: "text",
        notice_link: "",
        notice_start_at: "",
        notice_end_at: "",
        maintenance_mode: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 'main')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No settings yet, which is fine, we use defaults
                    return;
                }
                if (error.code === '42P01') {
                    toast.error("site_settings 테이블이 없습니다. SQL 마이그레이션을 실행해 주세요.");
                }
                throw error;
            }
            if (data) setSettings(data);
        } catch (error: any) {
            console.error("Error details:", error);
            // toast.error("설정을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await adminUpdateSiteSettings(settings);

            if (result.error) throw new Error(result.error);
            toast.success("시스템 설정이 업데이트되었습니다.");
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast.error("저장 실패: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 용량 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("파일 크기는 5MB 이하여야 합니다.");
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `notice_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('notices')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('notices')
                .getPublicUrl(filePath);

            setSettings({ ...settings, notice_image: publicUrl });
            toast.success("이미지가 업로드되었습니다.");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("업로드 실패: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <LoaderIcon className="animate-spin text-cyan-500" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">코어 설정 동기화 중...</span>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-widest text-white italic uppercase">시스템 설정</h1>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2 px-1">패키지 환경 설정 및 플랫폼 데이터베이스 구성</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8"
                >
                    <div className="flex items-center gap-4">
                        <ImageIconComponent className="text-cyan-400" size={24} />
                        <h3 className="text-xl font-bold text-white uppercase italic">사이트 정보</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">서비스 이름</label>
                            <input
                                type="text"
                                value={settings.site_name}
                                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/50"
                            />
                        </div>
                        <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-300">공지사항 팝업 활성화</span>
                                <span className="text-[9px] text-slate-500 font-mono mt-1 uppercase">접속 시 공지 팝업을 표시합니다.</span>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, notice_popup: !settings.notice_popup })}
                                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.notice_popup ? 'bg-cyan-600' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notice_popup ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {settings.notice_popup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">팝업 유형</label>
                                    <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl gap-1">
                                        <button
                                            onClick={() => setSettings({ ...settings, notice_type: 'text' })}
                                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${settings.notice_type === 'text' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            텍스트 중심
                                        </button>
                                        <button
                                            onClick={() => setSettings({ ...settings, notice_type: 'image' })}
                                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${settings.notice_type === 'image' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            이미지 전용
                                        </button>
                                    </div>
                                </div>

                                {settings.notice_type === 'text' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">팝업 제목</label>
                                            <input
                                                type="text"
                                                value={settings.notice_title || ""}
                                                onChange={(e) => setSettings({ ...settings, notice_title: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-cyan-500/30"
                                                placeholder="공지사항 제목을 입력하세요"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">팝업 내용</label>
                                            <textarea
                                                value={settings.notice_content || ""}
                                                onChange={(e) => setSettings({ ...settings, notice_content: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-cyan-500/30 min-h-[100px] resize-none"
                                                placeholder="공지사항 내용을 입력하세요 (줄바꿈 지원)"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">이미지 설정</label>

                                        {settings.notice_image && (
                                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 bg-[url('/grid.svg')] bg-[length:20px_20px]">
                                                <img
                                                    src={settings.notice_image}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                <button
                                                    onClick={() => setSettings({ ...settings, notice_image: '' })}
                                                    className="absolute top-2 right-2 bg-black/60 hover:bg-rose-500 text-white p-1.5 rounded-full transition-colors backdrop-blur-md"
                                                >
                                                    <LoaderIcon className="w-4 h-4" style={{ transform: 'rotate(45deg)' }} />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={settings.notice_image || ""}
                                                onChange={(e) => setSettings({ ...settings, notice_image: e.target.value })}
                                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-cyan-500/30"
                                                placeholder="이미지 URL을 입력하거나 직접 업로드하세요"
                                            />
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 flex items-center justify-center transition-all disabled:opacity-50"
                                                title="컴퓨터에서 파일 선택"
                                            >
                                                {isUploading ? <LoaderIcon className="animate-spin text-cyan-400" size={16} /> : <UploadIcon size={16} className="text-slate-400" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">클릭 시 이동할 링크 (선택)</label>
                                    <input
                                        type="text"
                                        value={settings.notice_link || ""}
                                        onChange={(e) => setSettings({ ...settings, notice_link: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-cyan-500/30"
                                        placeholder="https://..."
                                    />
                                    <p className="text-[9px] text-slate-600">※ 팝업 전체(이미지 또는 텍스트 박스)가 링크로 작동합니다.</p>
                                </div>

                                {/* Scheduling */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">시작 일시</label>
                                        <input
                                            type="datetime-local"
                                            value={settings.notice_start_at ? new Date(new Date(settings.notice_start_at).getTime() - new Date(settings.notice_start_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                            onChange={(e) => setSettings({ ...settings, notice_start_at: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px] outline-none focus:border-cyan-500/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">종료 일시</label>
                                        <input
                                            type="datetime-local"
                                            value={settings.notice_end_at ? new Date(new Date(settings.notice_end_at).getTime() - new Date(settings.notice_end_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                            onChange={(e) => setSettings({ ...settings, notice_end_at: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px] outline-none focus:border-cyan-500/30"
                                        />
                                    </div>
                                    <p className="col-span-2 text-[9px] text-slate-600">※ 설정 시 해당 기간에만 팝업이 노출됩니다. 비워두면 상시 노출됩니다.</p>
                                </div>

                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* System Maintenance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8"
                >
                    <div className="flex items-center gap-4">
                        <PowerIcon className="text-rose-500" size={24} />
                        <h3 className="text-xl font-bold text-white uppercase italic">시스템 운영 상태</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-rose-500/10 hover:border-rose-500/30 transition-all">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-rose-400">점검 모드 (접속 제한)</span>
                                <span className="text-[9px] text-slate-500 font-mono mt-1 uppercase">일반 사용자의 웹사이트 접속을 차단합니다.</span>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.maintenance_mode ? 'bg-rose-600' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenance_mode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                            <p className="text-[9px] font-mono text-slate-500 leading-relaxed uppercase italic">
                                점검 모드를 활성화하면 모든 일반 트래픽이 점검 페이지로 리다이렉트됩니다. 관리자 세션은 상시 유지됩니다.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Final Save */}
                <div className="lg:col-span-2 flex justify-end pt-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-cyan-500/20 transition-all uppercase tracking-widest text-xs"
                    >
                        {isSaving ? <LoaderIcon className="animate-spin" size={18} /> : <SaveIcon size={18} />}
                        {isSaving ? "설정 적용 중..." : "설정 저장 및 적용"}
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
