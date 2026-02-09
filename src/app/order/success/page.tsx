"use client";

import { motion } from "framer-motion";
import { Package, CheckCircle2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
    const [particles, setParticles] = useState<number[]>([]);

    useEffect(() => {
        setParticles(Array.from({ length: 40 }, (_, i) => i));
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
            {/* Ambient Background Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {particles.map((i) => (
                    <motion.div
                        key={i}
                        initial={{
                            opacity: 0,
                            y: "100vh",
                            x: `${Math.random() * 100}vw`,
                            scale: Math.random() * 0.5 + 0.5
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            y: "-10vh",
                        }}
                        transition={{
                            duration: Math.random() * 5 + 3,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "linear"
                        }}
                        className="absolute w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">

                {/* 3D Sucking Animation Box */}
                <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                    {/* The Package */}
                    <motion.div
                        initial={{ scale: 0.8, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="relative z-10"
                    >
                        <Package size={120} className="text-blue-500/80" strokeWidth={1} />
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.2, 0.5, 0.2]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 bg-blue-500/20 blur-3xl -z-10 rounded-full"
                        />
                    </motion.div>

                    {/* The Item (Glasses Icon) being sucked in */}
                    <motion.div
                        initial={{ y: -150, x: 20, rotate: 45, opacity: 0, scale: 1.5 }}
                        animate={{
                            y: 20,
                            x: 0,
                            rotate: 0,
                            opacity: [0, 1, 1, 0],
                            scale: [1.5, 1, 0.2]
                        }}
                        transition={{
                            delay: 0.5,
                            duration: 2,
                            times: [0, 0.2, 0.8, 1],
                            ease: "easeInOut"
                        }}
                        className="absolute top-0"
                    >
                        <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                            <ShoppingBag className="text-white" size={40} />
                        </div>
                    </motion.div>

                    {/* Success Pulse Ring */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ delay: 2.2, duration: 1.5 }}
                        className="absolute inset-0 border-2 border-blue-500 rounded-full pointer-events-none"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5 }}
                >
                    <div className="flex items-center justify-center gap-3 mb-4 text-blue-400">
                        <CheckCircle2 size={24} />
                        <span className="uppercase tracking-[0.3em] font-medium text-sm">Transaction Secure</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                        주문이 완료되었습니다
                    </h1>

                    <p className="text-slate-400 text-lg mb-10 leading-relaxed font-light">
                        당신의 안티그래비티 패키지가 곧 중력을 거스릴 준비를 시작합니다.<br />
                        준비가 완료되면 실시간 알림을 보내드리겠습니다.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/shop">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white text-black font-bold flex items-center gap-2 group"
                            >
                                Continue Shopping
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>
                        <Link href="/brand">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-bold"
                            >
                                Explore Story
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Label */}
            <div className="absolute top-10 left-10 opacity-20 hidden md:block">
                <div className="flex flex-col gap-1">
                    <div className="w-12 h-[1px] bg-white" />
                    <span className="text-[10px] uppercase tracking-widest">A-G Control Unit</span>
                    <span className="text-[10px] font-mono">STATUS: SHIPMENT_PENDING</span>
                </div>
            </div>
        </div>
    );
}
