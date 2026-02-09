"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

export default function WishlistPage() {
    const { wishlistItems, removeItem } = useWishlistStore();
    const { addItem, toggleCart } = useCartStore();

    const handleAddToCart = (item: any) => {
        addItem({
            id: item.id,
            name: item.name,
            price: parseInt(item.price.replace(/[^0-9]/g, "")) || 0,
            image: item.image,
            quantity: 1
        });
        toast.success("장바구니에 추가되었습니다.");
        toggleCart();
    };

    const handleRemove = (id: string) => {
        removeItem(id);
        toast.success("목록에서 삭제되었습니다.");
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="space-y-12">
                <div>
                    <h1 className="text-4xl font-black tracking-widest uppercase mb-2">My Wishlist</h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Synchronization Level: Stable</p>
                </div>

                <div className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="w-32 h-32 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"
                        >
                            <Heart size={48} className="text-red-500/50 fill-current" />
                        </motion.div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-400">관심 상품 목록이 비어 있습니다</h3>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em]">Target some items for your next mission.</p>
                    </div>

                    <Link href="/shop">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 border border-white/10 text-white font-black uppercase tracking-widest rounded-none hover:bg-white hover:text-black transition-all"
                        >
                            Explore Collection
                        </motion.button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-black tracking-widest uppercase mb-2">My Wishlist</h1>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
                    Active Targets: {wishlistItems.length} Items // Ready for Acquisition
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {wishlistItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all"
                        >
                            <div className="relative aspect-square overflow-hidden bg-white/5">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                                    <p className="text-slate-400 text-sm">{item.price}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Link href={`/shop/${item.id}`} className="block">
                                        <button className="w-full py-3 rounded-xl border border-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                                            View
                                            <ArrowRight size={12} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                                    >
                                        Add
                                        <ShoppingBag size={12} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
