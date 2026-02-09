"use client";

import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Camera, Save, ShieldCheck, Loader2, Plus, Trash2, CheckCircle, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import AddressSearch from "@/components/checkout/AddressSearch";

export default function ProfileEditPage() {
    const { data: session, update: updateSession, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile Data
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        location: "",
        address: "",
        avatar_url: "",
        connected_providers: [] as string[]
    });

    // Address Data
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // Controls Search Modal
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false); // Controls Form Modal

    const [newAddressForm, setNewAddressForm] = useState({
        name: "", // 배송지명
        recipient: "",
        phone: "",
        email: "", // Default to session email
        zonecode: "",
        road_address: "",
        detail_address: "",
        is_default: false
    });

    const router = useRouter();
    const isLoaded = useRef(false);

    useEffect(() => {
        async function fetchData() {
            if (status === "loading") return;

            // If already loaded, mostly skip to prevent overwrite but consider refetch logic if needed
            if (isLoaded.current) return;

            if (!session?.user?.email) {
                setFetching(false);
                return;
            }

            try {
                setFetching(true);

                // 1. Fetch Profile
                const profileRes = await fetch('/api/user/profile', { cache: 'no-store' });
                let profile = null;

                if (profileRes.ok) {
                    profile = await profileRes.json();
                    console.log("✅ Profile Fetched:", profile);
                } else {
                    console.error("❌ Failed to fetch profile:", profileRes.status);
                }

                if (profile) {
                    setFormData({
                        full_name: profile.full_name || session.user.name || "",
                        phone: profile.phone || "",
                        location: profile.location || "",
                        address: profile.address || "",
                        avatar_url: profile.avatar_url || session.user.image || "",
                        connected_providers: profile.connected_providers || []
                    });
                } else {
                    setFormData(prev => ({
                        ...prev,
                        full_name: session.user?.name || "",
                        avatar_url: session.user?.image || ""
                    }));
                }

                // 2. Fetch Addresses
                const res = await fetch('/api/user/addresses');
                if (res.ok) {
                    const addressData = await res.json();
                    setAddresses(addressData);
                }

                isLoaded.current = true;
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setFetching(false);
            }
        }

        fetchData();
    }, [session, status]);

    // Initialize email in form when session loads
    useEffect(() => {
        if (session?.user?.email) {
            setNewAddressForm(prev => ({ ...prev, email: session.user?.email || "" }));
        }
    }, [session]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
        };
        reader.readAsDataURL(file);

        if (!session?.user?.email) {
            toast("미리보기만 적용되었습니다. (로그인 세션 없음)", { icon: '⚠️' });
            return;
        }

        try {
            setLoading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.email}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true, contentType: file.type });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            toast.success("사진 업로드 완료!");
        } catch (err: any) {
            console.error("Image upload failed:", err);
            if (err.statusCode === '404' || (err.message && err.message.includes("Bucket not found"))) {
                toast.error("스토리지 설정 오류: 'avatars' 버킷을 생성해주세요.");
            } else {
                toast.error("업로드 실패: " + (err.message || "알 수 없는 오류"));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userEmail = session?.user?.email;

        if (!userEmail) {
            toast.error("로그인 정보가 없습니다. 상단 로그아웃 후 다시 시도해주세요.");
            return;
        }

        try {
            setLoading(true);
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', userEmail)
                .single();

            let error;
            const profileData = {
                full_name: formData.full_name,
                phone: formData.phone,
                location: formData.location,
                address: formData.address,
                avatar_url: formData.avatar_url,
                updated_at: new Date().toISOString()
            };

            if (existingProfile) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update(profileData)
                    .eq('email', userEmail);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ ...profileData, email: userEmail, role: 'USER' }]);
                error = insertError;
            }

            if (error) throw error;

            await updateSession({
                ...session,
                user: { ...session.user, name: formData.full_name, image: formData.avatar_url }
            });

            toast.success("프로필 정보가 안전하게 저장되었습니다.");
            router.refresh();
        } catch (err: any) {
            console.error("Profile update failed:", err);
            toast.error("저장 실패: " + (err.message || "데이터베이스 오류"));
        } finally {
            setLoading(false);
        }
    };

    // Address Search Complete Handler
    // Now it updates the form state instead of saving immediately
    const handleAddressComplete = (data: any) => {
        setNewAddressForm(prev => ({
            ...prev,
            zonecode: data.zonecode,
            road_address: data.roadAddress,
        }));
        setIsAddressModalOpen(false); // Close Search
        setIsAddressFormOpen(true);   // Ensure Form is Open (Open if not already, or just Keep Open)
    };

    const handleOpenAddressForm = () => {
        // Reset form
        setNewAddressForm({
            name: "",
            recipient: session?.user?.name || "",
            phone: formData.phone || "",
            email: session?.user?.email || "",
            zonecode: "",
            road_address: "",
            detail_address: "",
            is_default: addresses.length === 0
        });
        setIsAddressFormOpen(true);
    };

    const formatPhoneNumber = (value: string) => {
        return value
            .replace(/[^0-9]/g, '')
            .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setNewAddressForm({ ...newAddressForm, phone: formatted });
    };

    const handleSaveNewAddress = async () => {
        if (!newAddressForm.name || !newAddressForm.recipient || !newAddressForm.phone || !newAddressForm.road_address) {
            toast.error("필수 정보를 모두 입력해주세요.");
            return;
        }

        try {
            const res = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAddressForm)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "주소 추가 실패");
            }

            const inserted = await res.json();

            // Refetch or update optimistic
            // If default was true, we need to update local state fully because others might have changed
            // For simplicity, let's refetch or manually adjust
            if (newAddressForm.is_default) {
                setAddresses(prev => [inserted, ...prev.map(a => ({ ...a, is_default: false }))]);
            } else {
                setAddresses(prev => [inserted, ...prev]);
            }

            setAddresses(prev => prev.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)));

            toast.success("배송지가 추가되었습니다.");
            setIsAddressFormOpen(false);
        } catch (err: any) {
            console.error("Add address error:", err);
            toast.error(`추가 실패: ${err.message}`);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        try {
            const res = await fetch(`/api/user/addresses?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Delete failed");

            setAddresses(prev => prev.filter(a => a.id !== id));
            toast.success("주소가 삭제되었습니다.");
        } catch (err) {
            toast.error("삭제 실패");
        }
    };

    const handleSetDefaultAddress = async (id: string) => {
        try {
            const res = await fetch('/api/user/addresses', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action: 'set_default' })
            });

            if (!res.ok) throw new Error("Update failed");

            setAddresses(prev => prev.map(a => ({
                ...a,
                is_default: a.id === id
            })).sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)));

            toast.success("기본 배송지로 설정되었습니다.");
        } catch (err) {
            toast.error("설정 실패");
        }
    };


    const handleLinkAccount = async (provider: string) => {
        try {
            // 1. 연동 의도 설정 (쿠키 생성)
            const res = await fetch('/api/auth/link-intent', { method: 'POST' });

            if (!res.ok) {
                let errorMsg = "Link intent failed";
                try {
                    const data = await res.json();
                    if (data.error) errorMsg = data.error;
                } catch (e) {
                    errorMsg = `Status: ${res.status}`;
                }
                throw new Error(errorMsg);
            }

            // 2. 로그인 진행 (쿠키가 있으므로 서버에서 연동 처리됨)
            await signIn(provider, { callbackUrl: '/user/profile' });
        } catch (err: any) {
            console.error(err);
            toast.error(`연동 실패: ${err.message || '알 수 없는 오류'}`);
        }
    };

    if (fetching) {
        return (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                    데이터 스캔 중...<br />
                    계정 정보를 동기화하고 있습니다
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            <div>
                <h1 className="text-4xl font-black tracking-widest uppercase mb-2 italic text-white underline decoration-blue-500/50 decoration-4 underline-offset-8">내 정보 관리</h1>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em] mt-4">계정 정보 및 배송지를 관리하세요</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6"
                    >
                        <div className="relative group">
                            <div
                                onClick={handleAvatarClick}
                                className="w-32 h-32 rounded-full overflow-hidden border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] cursor-pointer hover:border-white transition-all relative"
                            >
                                <img
                                    src={formData.avatar_url || session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                                {loading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Loader2 className="text-white animate-spin" size={24} />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tight italic">{formData.full_name || "알 수 없음"}</h2>
                            <p className="text-[10px] text-blue-400 font-mono uppercase tracking-[0.2em]">계정 연동됨</p>
                        </div>
                    </motion.div>


                </div >

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 space-y-8"
                >
                    {/* Basic Info (Read-Only) */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md relative">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">이름</label>
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <User size={20} />
                                    </div>
                                    <span className="text-xl font-bold text-white tracking-tight">{session?.user?.name || "알 수 없음"}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">이메일</label>
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <Mail size={20} />
                                    </div>
                                    <span className="text-sm font-mono text-slate-300">{session?.user?.email || "이메일 없음"}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                                    * 계정 정보는 소셜 로그인과 연동되어 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Addresses */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black uppercase italic tracking-widest text-slate-300">
                                배송지 관리
                            </h3>
                            <button
                                onClick={handleOpenAddressForm}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                            >
                                <Plus size={18} className="text-white" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {addresses.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 font-mono text-xs uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">
                                    등록된 배송지가 없습니다
                                </div>
                            ) : (
                                addresses.map((addr) => (
                                    <div key={addr.id} className={`relative p-6 rounded-2xl border transition-all group ${addr.is_default ? "bg-blue-500/10 border-blue-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-sm font-bold text-white">{addr.name}</span>
                                                    {addr.is_default && (
                                                        <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">기본</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400">{addr.road_address} {addr.detail_address}</p>
                                                <p className="text-xs text-slate-600 font-mono mt-1 pt-2 border-t border-white/5">
                                                    {addr.recipient} | {addr.phone}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!addr.is_default && (
                                                    <button
                                                        onClick={() => handleSetDefaultAddress(addr.id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400"
                                                        title="Set as Default"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            </div >

            {/* New Address Form Modal */}
            {
                isAddressFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddressFormOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-8 relative z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-2xl font-black text-white mb-6 uppercase italic">New Address</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">배송지명 (예: 우리집, 회사)</label>
                                    <input
                                        type="text"
                                        value={newAddressForm.name}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                                        placeholder="배송지 별칭"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">받는 분</label>
                                    <input
                                        type="text"
                                        value={newAddressForm.recipient}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, recipient: e.target.value })}
                                        placeholder="이름"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">연락처</label>
                                        <input
                                            type="tel"
                                            value={newAddressForm.phone}
                                            onChange={handlePhoneChange}
                                            placeholder="010-0000-0000"
                                            maxLength={13}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">이메일</label>
                                        <input
                                            type="email"
                                            value={newAddressForm.email}
                                            onChange={(e) => setNewAddressForm({ ...newAddressForm, email: e.target.value })}
                                            placeholder="email@example.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/5">
                                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">주소</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={newAddressForm.zonecode}
                                            readOnly
                                            placeholder="우편번호"
                                            className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 text-sm"
                                        />
                                        <button
                                            onClick={() => setIsAddressModalOpen(true)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            주소 검색
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={newAddressForm.road_address}
                                        readOnly
                                        placeholder="기본 주소"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 mb-2 focus:border-blue-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={newAddressForm.detail_address}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, detail_address: e.target.value })}
                                        placeholder="상세 주소 입력"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>

                                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={newAddressForm.is_default}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, is_default: e.target.checked })}
                                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                                    />
                                    <span className="text-sm font-bold text-white">기본 배송지로 저장</span>
                                </label>

                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setIsAddressFormOpen(false)}
                                    className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSaveNewAddress}
                                    className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                                >
                                    저장하기
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )
            }

            <AddressSearch
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onComplete={handleAddressComplete}
            />
        </div >
    );
}
