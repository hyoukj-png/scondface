"use client";

import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, User, Package, ArrowLeft, Info, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import FloatingInput from "@/components/checkout/FloatingInput";
import AddressSearch from "@/components/checkout/AddressSearch";
import PaymentButton from "@/components/payment/PaymentButton";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

type FormValues = {
    name: string;
    phone: string;
    detailAddress: string;
    memo: string;
    postcode: string;
    roadAddress: string;
    saveAsDefault?: boolean;
};

export default function CheckoutPage() {
    const { data: session } = useSession();
    const { cartItems } = useCartStore();
    const setShippingInfo = useCheckoutStore((state) => state.setShippingInfo);
    const [initialInfo, setInitialInfo] = useState(() => useCheckoutStore.getState().shippingInfo);
    const [mounted, setMounted] = useState(false);
    const [isAddressOpen, setIsAddressOpen] = useState(false);

    const methods = useForm<FormValues>({
        defaultValues: initialInfo,
        mode: "onChange"
    });

    const { watch, setValue, reset, formState: { isValid } } = methods;

    // Fetch Default Address
    // Fetch Default Address
    // Fetch Default Address
    useEffect(() => {
        async function fetchDefaultAddress() {
            if (!session?.user?.email) {
                console.log("⚠️ [Checkout] No session user email found.");
                return;
            }

            console.log("🔍 [Checkout] Fetching default address via API for:", session.user.email);

            try {
                const res = await fetch('/api/user/addresses');
                if (!res.ok) throw new Error('Failed to fetch addresses');

                const addresses = await res.json();
                const defaultAddr = addresses.find((addr: any) => addr.is_default);

                if (defaultAddr) {
                    console.log("✅ [Checkout] Default address loaded from API:", defaultAddr);
                    const newData = {
                        name: defaultAddr.recipient,
                        phone: defaultAddr.phone,
                        postcode: defaultAddr.zonecode,
                        roadAddress: defaultAddr.road_address,
                        detailAddress: defaultAddr.detail_address,
                        memo: ""
                    };
                    setInitialInfo(newData);
                    reset(newData); // Update User Form
                    setShippingInfo(newData); // Update Store
                } else {
                    console.log("⚠️ [Checkout] No default address found in API response");
                }
            } catch (error) {
                console.error("❌ [Checkout] Error fetching addresses:", error);
            }
        }
        fetchDefaultAddress();
    }, [session, reset, setShippingInfo]);

    // Persist form changes to store without triggering re-renders of this component
    const watchedFields = watch();
    useEffect(() => {
        setShippingInfo(watchedFields);
    }, [watchedFields, setShippingInfo]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const subtotal = cartItems.reduce((acc, item) => {
        return acc + item.price * item.quantity;
    }, 0);

    const shippingFee = subtotal >= 50000 ? 0 : 3000;
    const total = subtotal + shippingFee;

    const formatPhone = (value: string) => {
        const numbers = value.replace(/[^0-9]/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setValue("phone", formatted, { shouldValidate: true });
    };

    const handleAddressComplete = (data: any) => {
        setValue("postcode", data.zonecode, { shouldValidate: true });
        setValue("roadAddress", data.roadAddress, { shouldValidate: true });
    };

    if (!mounted) return null;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center px-6">
                <Package size={64} className="text-slate-800 mb-8" />
                <p className="text-slate-500 font-mono tracking-widest uppercase mb-8">매니페스트가 비어 있습니다</p>
                <Link href="/shop" className="px-8 py-4 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all font-bold uppercase tracking-widest">
                    상점으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 bg-[#0a0a0c] text-white">
            <FormProvider {...methods}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-6 mb-16">
                        <Link href="/shop" className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-5xl font-black tracking-widest uppercase italic">Manifest</h1>
                            <p className="text-xs text-slate-500 font-mono tracking-[0.3em] uppercase mt-1">탑승 승인: 0x-ALPHA-CHECK-IN</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Left: Shipping Manifest */}
                        <div className="lg:col-span-7 space-y-8">
                            <motion.section
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-10"
                            >
                                {/* Receiver Group */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-blue-400 mb-4 opacity-70">
                                        <User size={16} />
                                        <span className="text-xs uppercase font-black tracking-widest">주문자 정보</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FloatingInput
                                            name="name"
                                            label="성함"
                                            placeholder="수령인 성함을 입력하세요"
                                            rules={{ required: "성함을 입력해주세요" }}
                                        />
                                        <FloatingInput
                                            name="phone"
                                            label="연락처"
                                            placeholder="010-0000-0000"
                                            onChange={handlePhoneChange}
                                            rules={{ required: "연락처를 입력해주세요", pattern: { value: /^[0-9-]*$/, message: "올바른 형식이 아닙니다" } }}
                                        />
                                    </div>
                                </div>

                                {/* Address Group */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-blue-400 mb-4 opacity-70">
                                        <MapPin size={16} />
                                        <span className="text-xs uppercase font-black tracking-widest">배송지 좌표</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <FloatingInput
                                                    name="postcode"
                                                    label="우편번호"
                                                    readOnly
                                                    rules={{ required: true }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddressOpen(true)}
                                                className="px-8 h-[64px] mt-0 rounded-xl bg-blue-500 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-400/50"
                                            >
                                                주소 찾기
                                            </button>
                                        </div>
                                        <FloatingInput
                                            name="roadAddress"
                                            label="기본 주소"
                                            readOnly
                                            rules={{ required: true }}
                                        />
                                        <FloatingInput
                                            name="detailAddress"
                                            label="상세 주소"
                                            placeholder="동, 호수 등 상세 주소를 입력하세요"
                                            rules={{ required: "상세 주소를 입력해주세요" }}
                                        />
                                    </div>
                                </div>

                                {/* Memo */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-blue-400 mb-4 opacity-70">
                                        <Info size={16} />
                                        <span className="text-xs uppercase font-black tracking-widest">배송 요청사항</span>
                                    </div>
                                    <FloatingInput
                                        name="memo"
                                        label="요청사항"
                                        placeholder="기사님께 전달할 메시지(예: 문 앞에 놓아주세요)"
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="saveAsDefault"
                                            {...methods.register("saveAsDefault")}
                                            className="w-4 h-4 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500/50"
                                        />
                                        <label htmlFor="saveAsDefault" className="text-sm text-slate-400 cursor-pointer select-none">
                                            이 배송지를 기본 배송지로 저장
                                        </label>
                                    </div>
                                </div>
                            </motion.section>
                        </div>

                        {/* Right: Summary Box (Sticky) */}
                        <div className="lg:col-span-5">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="sticky top-32 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-3xl overflow-hidden"
                            >
                                {/* Background Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />

                                <h2 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                                    <Package className="text-blue-500" size={24} />
                                    CARGO MANIFEST
                                </h2>

                                <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-6 items-center group">
                                            <div className="relative w-24 h-24 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    sizes="96px"
                                                    className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-200 line-clamp-1">{item.name}</h4>
                                                <div className="flex justify-between items-end mt-4">
                                                    <span className="text-xs text-slate-500 font-mono">수량: {item.quantity}</span>
                                                    <span className="text-blue-400 font-bold text-base">
                                                        ₩{(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-8 border-t border-white/5">
                                    <div className="flex justify-between text-sm font-mono text-slate-500 uppercase tracking-widest">
                                        <span>주문 소계</span>
                                        <span className="text-slate-300">₩{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-mono text-slate-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-2">
                                            배송비
                                            {shippingFee === 0 && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">무료</span>}
                                        </span>
                                        <span className="text-slate-300">₩{shippingFee.toLocaleString()}</span>
                                    </div>

                                    {subtotal < 50000 && (
                                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-3">
                                            <Truck size={14} className="text-blue-500" />
                                            <span className="text-[11px] text-blue-400/80 font-mono uppercase tracking-widest">
                                                ₩{(50000 - subtotal).toLocaleString()} 더 담으면 무료 배송
                                            </span>
                                        </div>
                                    )}

                                    <div className="pt-6 mt-4 border-t border-white/10 flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 pb-1">최종 결제 금액</span>
                                        <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                            ₩{total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-12 space-y-4">
                                    <AnimatePresence mode="wait">
                                        {!isValid ? (
                                            <motion.div
                                                key="disabled"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-black text-sm uppercase tracking-[0.2em] text-center cursor-not-allowed"
                                            >
                                                정보 입력 대기 중...
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="enabled"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <PaymentButton
                                                    productName={cartItems.length === 1 ? cartItems[0].name : `${cartItems[0].name} 외 ${cartItems.length - 1}건`}
                                                    amount={total}
                                                    shippingInfo={{
                                                        recipient: watchedFields.name,
                                                        phone: watchedFields.phone,
                                                        address: watchedFields.roadAddress,
                                                        detailAddress: watchedFields.detailAddress,
                                                        zonecode: watchedFields.postcode,
                                                        saveAsDefault: watchedFields.saveAsDefault
                                                    }}
                                                    paymentMethod="kakaopay"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <p className="text-xs text-center text-slate-600 font-mono tracking-widest uppercase pb-2">
                                        안티그래비티 보안 시스템 보호 중. 결제를 진행하세요.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </FormProvider>

            <AddressSearch
                isOpen={isAddressOpen}
                onClose={() => setIsAddressOpen(false)}
                onComplete={handleAddressComplete}
            />
        </div>
    );
}
