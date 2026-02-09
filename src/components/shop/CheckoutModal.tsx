"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CreditCard, Landmark, Truck, Info, Check, ChevronDown, Square, CheckSquare } from "lucide-react";
import { Product } from "@/types/product";
import { useSession } from "next-auth/react";
import Script from "next/script";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/order";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
}

interface Address {
    id: string;
    name: string;
    recipient: string;
    phone: string;
    road_address: string;
    detail_address: string;
    zonecode: string;
    is_default: boolean;
}

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Address Management
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

    // Form State
    const [form, setForm] = useState({
        recipient: session?.user?.name || "",
        phone: "",
        address: "",
        detailAddress: "",
        zonecode: "",
        paymentMethod: "card" as "card" | "bank",
        saveAsDefault: false,
    });

    // Fetch Addresses
    useEffect(() => {
        if (isOpen && session?.user?.email) {
            fetch('/api/user/addresses')
                .then(res => res.json())
                .then((data: Address[]) => {
                    setAddresses(data);
                    // Find default address
                    const defaultAddr = data.find(a => a.is_default);
                    if (defaultAddr) {
                        applyAddress(defaultAddr);
                        setSelectedAddressId(defaultAddr.id);
                    }
                })
                .catch(err => console.error("Failed to load addresses", err));
        }
    }, [isOpen, session]);

    const applyAddress = (addr: Address) => {
        setForm(prev => ({
            ...prev,
            recipient: addr.recipient,
            phone: addr.phone,
            address: addr.road_address,
            detailAddress: addr.detail_address,
            zonecode: addr.zonecode,
        }));
    };

    const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedAddressId(val);

        if (val === "new") {
            setForm(prev => ({
                ...prev,
                recipient: "",
                phone: "",
                address: "",
                detailAddress: "",
                zonecode: ""
            }));
        } else {
            const selected = addresses.find(a => a.id === val);
            if (selected) applyAddress(selected);
        }
    };

    // Calculations
    const productPrice = parseInt(product.price.replace(/[^0-9]/g, "")) || 0;
    const shippingFee = productPrice >= 100000 ? 0 : 3000;
    const totalAmount = productPrice + shippingFee;

    const handleAddressSearch = () => {
        new (window as any).daum.Postcode({
            oncomplete: (data: any) => {
                setForm(prev => ({
                    ...prev,
                    address: data.roadAddress,
                    zonecode: data.zonecode
                }));
            }
        }).open();
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 숫자만 추출
        const numbers = value.replace(/[^0-9]/g, '');

        // 자동 하이픈 추가
        let formatted = numbers;
        if (numbers.length <= 3) {
            formatted = numbers;
        } else if (numbers.length <= 7) {
            formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else if (numbers.length <= 11) {
            formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        } else {
            formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        }

        setForm(f => ({ ...f, phone: formatted }));
    };

    const handleSubmit = async () => {
        // 수령인 검사
        if (!form.recipient || form.recipient.trim().length === 0) {
            toast.error("수령인 이름을 입력해 주세요.");
            return;
        }

        // 연락처 검사 (최소 10자리 이상의 숫자)
        const phoneDigits = form.phone.replace(/[^0-9]/g, '');
        if (!form.phone || phoneDigits.length < 10) {
            toast.error("올바른 연락처를 입력해 주세요. (예: 010-1234-5678)");
            return;
        }

        // 주소 검사
        if (!form.address || form.address.trim().length === 0) {
            toast.error("주소 검색 버튼을 눌러 주소를 입력해 주세요.");
            return;
        }

        // 상세주소 검사
        if (!form.detailAddress || form.detailAddress.trim().length === 0) {
            toast.error("상세 주소를 입력해 주세요. (예: 101동 101호)");
            return;
        }

        // 우편번호 검사
        if (!form.zonecode || form.zonecode.length === 0) {
            toast.error("주소 검색을 통해 우편번호를 입력해 주세요.");
            return;
        }

        // Save address if checked
        if (form.saveAsDefault && addresses.length === 0) {
            try {
                await fetch('/api/user/addresses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: "기본 배송지",
                        recipient: form.recipient,
                        phone: form.phone,
                        zonecode: form.zonecode,
                        road_address: form.address,
                        detail_address: form.detailAddress,
                        is_default: true
                    })
                });
            } catch (err) {
                console.error("Failed to save address", err);
            }
        }

        if (form.paymentMethod === "card") {
            handlePortOnePayment();
        } else {
            handleBankTransfer();
        }
    };

    const handlePortOnePayment = async () => {
        setLoading(true);

        // PortOne V2 Keys
        const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
        const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

        console.log("🚀 [Checkout] PortOne Config:", { storeId, channelKey });

        if (!storeId || !channelKey) {
            toast.error("결제 설정 오류: Store ID 또는 Channel Key가 없습니다.");
            setLoading(false);
            return;
        }

        // 1. Create Order
        let orderId = "";
        try {
            const result = await createOrder(
                totalAmount,
                product.name,
                session?.user?.email || "",
                {
                    recipient: form.recipient,
                    phone: form.phone,
                    address: form.address,
                    detailAddress: form.detailAddress,
                    zonecode: form.zonecode,
                    saveAsDefault: form.saveAsDefault
                },
                form.paymentMethod
            );
            if (result.success && result.orderId) {
                orderId = result.orderId;
            } else {
                throw new Error(result.error || "Order creation failed");
            }
        } catch (e: any) {
            console.error("Order Creation Failed:", e);
            toast.error(`주문 생성 실패: ${e.message}`);
            setLoading(false);
            return;
        }

        try {
            // @ts-ignore
            const response = await PortOne.requestPayment({
                storeId,
                channelKey,
                paymentId: `pid_${Date.now()}`,
                orderName: product.name,
                totalAmount: totalAmount,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                customer: {
                    fullName: form.recipient,
                    phoneNumber: form.phone,
                    email: session?.user?.email,
                    address: {
                        addressLine1: form.address,
                        addressLine2: form.detailAddress,
                    },
                    zipcode: form.zonecode,
                },
                redirectUrl: window.location.origin + "/payment/redirect",
            });

            if (response.code != null) {
                // Error
                toast.error(`결제 실패: ${response.message}`);
                setLoading(false);
                return;
            }

            // Success: Verify on server
            const verifyRes = await fetch("/api/payments/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentId: response.paymentId,
                    orderId: orderId,
                    paymentMethod: "card"
                })
            });

            if (verifyRes.ok) {
                const data = await verifyRes.json();
                if (data.verified) {
                    toast.success("결제가 완료되었습니다!");
                    onClose();
                    router.push("/user/orders");
                } else {
                    toast.success("주문이 접수되었습니다. (검증 대기)");
                    onClose();
                    router.push("/user/orders");
                }
            } else {
                const errData = await verifyRes.json();
                toast.error(`검증 실패: ${errData.message}`);
            }

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast.error(`결제 오류: ${error.message}`);
            setLoading(false);
        }
    };

    const handleBankTransfer = async () => {
        setLoading(true);
        try {
            const result = await createOrder(
                totalAmount,
                product.name,
                session?.user?.email || "",
                {
                    recipient: form.recipient,
                    phone: form.phone,
                    address: form.address,
                    detailAddress: form.detailAddress,
                    zonecode: form.zonecode
                },
                form.paymentMethod
            );

            if (result.success) {
                toast.success("주문이 접수되었습니다. 안내된 계좌로 입금해 주세요.");
                onClose();
                router.push("/user/orders");
            } else {
                toast.error(`주문 실패: ${result.error}`);
            }
        } catch (e: any) {
            console.error("Bank Order Failed:", e);
            toast.error("주문 처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                <Script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
                <Script src="https://cdn.portone.io/v2/browser-sdk.js" strategy="lazyOnload" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Checkout Proceeding</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                        {/* 1. 배송지 정보 */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2">
                                    <Truck size={14} /> 01. Shipping Information
                                </h3>
                                {/* Address Selector */}
                                {addresses.length > 0 && (
                                    <div className="relative">
                                        <select
                                            value={selectedAddressId}
                                            onChange={handleAddressSelect}
                                            className="bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-blue-600/20 transition-colors"
                                        >
                                            <option value="new">새 배송지 입력</option>
                                            {addresses.map(addr => (
                                                <option key={addr.id} value={addr.id}>
                                                    {addr.name} {addr.is_default ? "(기본)" : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Recipient Name</label>
                                    <input
                                        type="text"
                                        value={form.recipient}
                                        onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                        placeholder="받는 사람 이름"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Contact Number</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={handlePhoneChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                        placeholder="010-0000-0000"
                                        maxLength={13}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.zonecode}
                                        readOnly
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400 w-32 focus:outline-none"
                                        placeholder="우편번호"
                                    />
                                    <button
                                        onClick={handleAddressSearch}
                                        className="flex-1 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all border border-white/5"
                                    >
                                        주소 검색
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={form.address}
                                    readOnly
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400 focus:outline-none"
                                    placeholder="기본 주소"
                                />
                                <input
                                    type="text"
                                    value={form.detailAddress}
                                    onChange={e => setForm(f => ({ ...f, detailAddress: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                    placeholder="상세 주소 입력"
                                />

                                {/* Save as Default Checkbox (Only if no addresses exist or adding new) */}
                                {addresses.length === 0 && (
                                    <button
                                        onClick={() => setForm(f => ({ ...f, saveAsDefault: !f.saveAsDefault }))}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {form.saveAsDefault ? (
                                            <CheckSquare size={16} className="text-blue-500" />
                                        ) : (
                                            <Square size={16} />
                                        )}
                                        <span className="text-xs">기본 배송지로 자동 저장</span>
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* 2. 주문 상품 내용 */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2">
                                <Info size={14} /> 02. Order Summary
                            </h3>
                            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] flex items-center gap-6">
                                <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center p-2">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain filter drop-shadow-lg" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-black text-white italic uppercase">{product.name}</h4>
                                    <p className="text-sm font-mono text-blue-400 font-bold">{product.price}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Quantity: 1 EA</p>
                                </div>
                            </div>
                        </section>

                        {/* 3. 결제 정보 & 4. 결제 수단 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2">
                                    <Landmark size={14} /> 03. Payment Method
                                </h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setForm(f => ({ ...f, paymentMethod: "card" }))}
                                        className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${form.paymentMethod === "card" ? "bg-blue-600/20 border-blue-500/50 text-white" : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <CreditCard size={18} className={form.paymentMethod === "card" ? "text-blue-400" : "text-slate-500"} />
                                            <span className="text-xs font-bold uppercase tracking-widest">카드 결제</span>
                                        </div>
                                        {form.paymentMethod === "card" && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                                    </button>
                                    <button
                                        onClick={() => setForm(f => ({ ...f, paymentMethod: "bank" }))}
                                        className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${form.paymentMethod === "bank" ? "bg-blue-600/20 border-blue-500/50 text-white" : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Landmark size={18} className={form.paymentMethod === "bank" ? "text-blue-400" : "text-slate-500"} />
                                            <span className="text-xs font-bold uppercase tracking-widest">무통장 입금</span>
                                        </div>
                                        {form.paymentMethod === "bank" && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                                    </button>
                                </div>
                                {form.paymentMethod === "bank" && (
                                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                        <p className="text-[10px] text-blue-400 font-bold leading-relaxed whitespace-pre-line">
                                            국민은행 123456-01-123456{"\n"}
                                            예금주: 안티그래비티 (세컨페이스 명지)
                                        </p>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-2">
                                    <Info size={14} /> 04. Order Totals
                                </h3>
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase">Item Subtotal</span>
                                        <span className="text-white font-mono">₩{productPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase">Delivery Fee</span>
                                        <span className="text-white font-mono">+{shippingFee.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex flex-col items-end gap-2">
                                        <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Total Amount</span>
                                        <span className="text-3xl font-black text-white italic tracking-tighter">₩{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer / Submit */}
                    <div className="p-8 bg-white/[0.02] border-t border-white/5">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/30 uppercase tracking-[0.3em] text-xs"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>결제하기 (PROCEDURE PAYMENT)</>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
