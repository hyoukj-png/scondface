"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import Link from "next/link";

export default function EmptyOrdersState() {
    return (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden">
            <div className="relative">
                {/* Floating animated border circles */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="w-40 h-40 rounded-full border-2 border-dashed border-slate-800/50 flex items-center justify-center"
                />

                {/* Hovering icon with pulse */}
                <motion.div
                    animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Package size={56} className="text-slate-600" />
                </motion.div>

                {/* Floating space particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            x: [0, (i % 2 === 0 ? 1 : -1) * 60, 0],
                            y: [0, (i < 3 ? 1 : -1) * 60, 0],
                            opacity: [0, 0.4, 0],
                            scale: [0, 1.2, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.5 }}
                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-blue-500/30 rounded-full blur-[2px]"
                    />
                ))}
            </div>

            <div className="space-y-3 z-10">
                <h3 className="text-2xl font-bold text-slate-400">아직 수집된 아이템이 없습니다</h3>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.3em]">
                    The collection is waiting for your discovery.
                    <br />Scan the shop for new artifacts.
                </p>
            </div>

            <Link href="/shop">
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs transition-shadow shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    Shop Now
                </motion.button>
            </Link>
        </div>
    );
}
