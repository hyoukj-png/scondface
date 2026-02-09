"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, X, Info } from "lucide-react";
import { CartItem, useCartStore } from "@/store/useCartStore";

interface CartItemCardProps {
    item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
    const { updateQuantity, removeItem } = useCartStore();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 50 }}
            className="relative flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors"
        >
            {/* Product Image */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-2 flex items-center justify-center overflow-hidden border border-white/5">
                <motion.img
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    src={item.image}
                    alt={item.name}
                    className="w-full h-auto drop-shadow-lg"
                />
            </div>

            {/* Info Container */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-200 truncate pr-4 uppercase tracking-tighter">
                        {item.name}
                    </h4>
                    <button
                        onClick={() => removeItem(item.id, item.selectedOption)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                        <X size={14} />
                    </button>
                </div>

                <p className="text-xs text-slate-500 font-medium mb-3">
                    {item.selectedOption || "Standard Edition"}
                </p>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-400">
                        ₩{(item.price * item.quantity).toLocaleString()}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-black/20 rounded-full p-1 border border-white/5">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOption)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                            <Minus size={12} />
                        </motion.button>

                        <motion.span
                            key={item.quantity}
                            initial={{ y: -5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-4 text-center text-[10px] font-black text-white"
                        >
                            {item.quantity}
                        </motion.span>

                        <motion.button
                            whileTap={{ scale: 1.2 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedOption)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Plus size={12} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
