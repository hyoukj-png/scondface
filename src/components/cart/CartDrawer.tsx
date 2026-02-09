"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, CreditCard, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import CartItemCard from "./CartItemCard";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
    const { cartItems, isOpen, toggleCart, setIsOpen, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);

    // Fix hydration mismatch and handle scroll lock
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const subtotal = cartItems.reduce((acc, item) => {
        return acc + item.price * item.quantity;
    }, 0);

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]"
                    />

                    {/* Side Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0c]/80 backdrop-blur-2xl border-l border-white/10 z-[100] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-widest uppercase">
                                    Your Collection
                                </h2>
                                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">
                                    {cartItems.length} {cartItems.length === 1 ? "item" : "items"} cached in orbit
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ rotate: 90 }}
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="text-white" size={24} />
                            </motion.button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 custom-scrollbar">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {cartItems.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="h-full flex flex-col items-center justify-center text-center opacity-40"
                                    >
                                        <ShoppingBag size={64} strokeWidth={1} className="mb-4" />
                                        <p className="font-medium">The container is empty.</p>
                                    </motion.div>
                                ) : (
                                    cartItems.map((item) => (
                                        <CartItemCard key={`${item.id}-${item.selectedOption}`} item={item} />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-white/5 bg-black/20 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em]">
                                        Estimated Total
                                    </div>
                                    <div className="text-2xl font-black text-white">
                                        ₩{subtotal.toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <motion.button
                                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                        onClick={clearCart}
                                        className="p-4 rounded-xl border border-white/10 text-slate-500 hover:text-red-400 transition-colors"
                                        title="Clear Inventory"
                                    >
                                        <Trash2 size={20} />
                                    </motion.button>

                                    <Link href="/checkout" className="flex-1" onClick={() => setIsOpen(false)}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full h-full p-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20"
                                        >
                                            <CreditCard size={18} />
                                            Beam to Checkout
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </motion.button>
                                    </Link>
                                </div>

                                <p className="text-[9px] text-center text-slate-600 font-mono tracking-widest uppercase">
                                    Secure transmission via antigravity orbital uplink
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
