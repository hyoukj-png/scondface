"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CreditCard, Rocket } from "lucide-react";
import Script from "next/script";

declare global {
    interface Window {
        PortOne: any;
    }
}
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/order";
import { useSession } from "next-auth/react";

interface PaymentProps {
    productName: string;
    amount: number;
    shippingInfo: {
        recipient: string;
        phone: string;
        address: string;
        detailAddress: string;
        zonecode: string;
        saveAsDefault?: boolean;
    };
    paymentMethod: string;
}

export default function PaymentButton({ productName, amount, shippingInfo, paymentMethod }: PaymentProps) {
    const { data: session } = useSession();
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const router = useRouter();

    const handlePayment = async () => {
        if (!session?.user) {
            alert("로그인이 필요한 서비스입니다.");
            router.push("/login?callbackUrl=" + window.location.href);
            return;
        }

        setIsProcessing(true);

        // 1. Create Order (Pending) via Server Action
        let orderId = "";
        try {
            setLoadingText("Initializing Secure Order...");
            const result = await createOrder(
                amount,
                productName,
                session.user.email || "",
                shippingInfo,
                paymentMethod
            );

            if (result.success && result.orderId) {
                orderId = result.orderId;
            } else {
                throw new Error(result.error || "Order creation failed");
            }
        } catch (e: any) {
            console.error("Order Creation Failed:", e);
            setIsProcessing(false);
            alert(`주문 정보를 생성할 수 없습니다: ${e.message}`);
            return;
        }

        // Simulate cinematic loading sequence
        const sequences = [
            "Payment Gateway Connecting...",
            "Encrypting Transaction Data...",
            "Verifying Security Token...",
            "Access Granted."
        ];

        for (const text of sequences) {
            setLoadingText("");
            for (let i = 0; i < text.length; i++) {
                setLoadingText(prev => prev + text[i]);
                await new Promise(r => setTimeout(r, 30)); // Typing speed
            }
            await new Promise(r => setTimeout(r, 600)); // Pause between lines
        }

        // PortOne V2 Logic
        const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
        const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

        console.log("🚀 [PaymentButton] PortOne Config:", { storeId, channelKey });

        if (!storeId || !channelKey) {
            alert("결제 설정이 올바르지 않습니다.");
            setIsProcessing(false);
            return;
        }

        try {
            // @ts-ignore
            const response = await PortOne.requestPayment({
                storeId,
                channelKey,
                paymentId: `pid_${Date.now()}`,
                orderName: productName,
                totalAmount: amount,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                customer: {
                    fullName: shippingInfo.recipient,
                    phoneNumber: shippingInfo.phone,
                    email: session.user.email,
                    address: {
                        addressLine1: shippingInfo.address,
                        addressLine2: shippingInfo.detailAddress,
                    },
                    zipcode: shippingInfo.zonecode,
                },
                redirectUrl: window.location.origin + "/payment/redirect", // Mobile redirect needed?
            });

            if (response.code != null) {
                // Error occurred
                console.error("Payment failed:", response.message);
                alert(`결제 실패: ${response.message}`);
                setIsProcessing(false);
                setLoadingText("");
                return;
            }

            // Success: Verify on server
            setLoadingText("Verifying Transaction...");
            const verifyRes = await fetch("/api/payments/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentId: response.paymentId,
                    orderId: orderId,
                    paymentMethod: "card" // Simply card for now
                })
            });

            if (verifyRes.ok) {
                const data = await verifyRes.json();
                if (data.verified) {
                    router.push("/order/success");
                } else {
                    alert("결제는 완료되었으나 검증에 실패했습니다. 관리자에게 문의하세요.");
                    router.push("/user/orders");
                }
            } else {
                const errData = await verifyRes.json();
                alert(`Verification Failed: ${errData.message}`);
                router.push("/order/fail");
            }

        } catch (error: any) {
            console.error("Payment Request Error:", error);
            alert(`결제 요청 중 오류가 발생했습니다: ${error.message}`);
            setIsProcessing(false);
            setLoadingText("");
        }
    };

    return (
        <>
            <Script src="https://cdn.portone.io/v2/browser-sdk.js" />

            <motion.button
                onClick={handlePayment}
                whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 255, 136, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden group w-full bg-[#00ff88]/10 border border-[#00ff88] text-[#00ff88] px-8 py-4 rounded-none font-bold text-lg uppercase tracking-widest transition-all duration-300 hover:bg-[#00ff88] hover:text-black"
            >
                <span className="relative z-10 flex items-center justify-center gap-3">
                    <CreditCard size={20} />
                    Initialize Transaction
                </span>
                <div className="absolute inset-0 bg-[#00ff88] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
            </motion.button>

            {/* Cinematic Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center font-mono"
                    >
                        <div className="w-full max-w-2xl px-8">
                            <div className="flex items-center gap-4 text-[#00ff88] mb-8">
                                <Rocket className="animate-pulse" size={32} />
                                <span className="text-sm tracking-widest uppercase">Securing Connection</span>
                            </div>

                            <div className="h-20 text-2xl md:text-4xl text-white font-bold typing-cursor">
                                {loadingText}
                                <span className="animate-blink">_</span>
                            </div>

                            <div className="mt-12 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#00ff88]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 4, ease: "easeInOut" }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
