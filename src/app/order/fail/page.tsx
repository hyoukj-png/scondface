"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCcw, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function OrderFailPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">

            {/* Background Glitch Effect Overlay */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-xl w-full text-center">

                {/* Signal Icon with Glitch Animation */}
                <div className="relative mb-12">
                    <motion.div
                        animate={{
                            opacity: [1, 0.4, 1, 0.8, 1],
                            x: [0, -2, 2, -1, 0]
                        }}
                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <WifiOff size={100} className="text-red-500" strokeWidth={1} />
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-4 -right-4 bg-red-600 p-2 rounded-full border-4 border-[#0a0a0c]"
                    >
                        <AlertTriangle size={20} />
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">
                        Connection Interrupted
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                        통신 신호가 약합니다
                    </h1>

                    <p className="text-slate-400 text-lg leading-relaxed font-light">
                        결제 서버와의 연결이 불안정하여 완료하지 못했습니다.<br />
                        잠시 후 다시 시도하시거나 네트워크 상태를 확인해 주세요.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                        >
                            <RefreshCcw size={18} />
                            Retry Transaction
                        </button>

                        <Link href="/shop">
                            <button className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-bold flex items-center justify-center gap-2">
                                <ArrowLeft size={18} />
                                Back to Shop
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Technical Info (Mock) */}
                <div className="mt-16 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    ERROR_CODE: AG_UPLINK_TIMEOUT_408<br />
                    LOCATION: ORBITAL_UPLINK_STATION_B
                </div>
            </div>

            {/* Scanning Line Effect */}
            <motion.div
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[1px] bg-red-500/20 z-20"
            />
        </div>
    );
}
