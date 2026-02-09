"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { Product } from "@/types/product";
import { Loader2, Check, ShoppingBag, Heart } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import CheckoutModal from "@/components/shop/CheckoutModal";
import ProductCommunity from "@/components/shop/ProductCommunity";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProductDetailPage() {
    const params = useParams();
    const { data: session } = useSession();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddingRequest, setIsAddingRequest] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const { addItem, toggleCart } = useCartStore();
    const { wishlistItems, toggleItem } = useWishlistStore();

    // Animation Refs
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [flyingItem, setFlyingItem] = useState<{ x: number, y: number } | null>(null);

    // Image Gallery State
    const [activeImage, setActiveImage] = useState<string>("");

    // Derived state
    const isLiked = product ? wishlistItems.some(item => item.id === product.id) : false;

    useEffect(() => {
        if (product) {
            setActiveImage(product.image);
        }
    }, [product]);

    useEffect(() => {
        async function fetchProduct() {
            try {
                // Fetch Single Product Directly (Optimized)
                const res = await fetch(`/api/products/${params.id}`);

                if (!res.ok) {
                    if (res.status === 404) {
                        setProduct(null);
                        return;
                    }
                    throw new Error("Failed to fetch");
                }

                const data: Product = await res.json();
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        }
        if (params.id) fetchProduct();
    }, [params.id]);

    const handleAddToCart = (e: React.MouseEvent) => {
        if (isAddingRequest || !product) return;
        setIsAddingRequest(true);

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setFlyingItem({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

        addItem({
            id: product.id,
            name: product.name,
            price: parseInt(product.price.replace(/[^0-9]/g, "")) || 0,
            image: product.image,
            quantity: 1
        });

        setTimeout(() => {
            setFlyingItem(null);
            setIsAddingRequest(false);
            toggleCart();
        }, 1000);
    };

    const handleToggleWishlist = () => {
        if (!product) return;
        const willBeLiked = !isLiked;

        toggleItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });

        if (willBeLiked) {
            toast.success("관심 상품에 추가되었습니다!", { icon: '❤️' });
        } else {
            toast("관심 상품에서 제거되었습니다.", { icon: '💔' });
        }
    };

    const handleBuyNow = () => {
        if (!session) {
            toast.error("로그인이 필요한 서비스입니다.", {
                icon: '🔒',
                duration: 3000,
            });
            setTimeout(() => {
                // 로그인 후 현재 페이지로 돌아오도록 callbackUrl 설정
                const currentPath = window.location.pathname;
                router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
            }, 1000);
            return;
        }
        setIsCheckoutOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-[#020617]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">데이터를 불러오고 있습니다...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex justify-center items-center text-slate-400 bg-[#020617] font-mono text-xs uppercase tracking-widest">
                제품을 찾을 수 없습니다.
            </div>
        );
    }



    // Left: Sticky Image Section
    const productImages = product?.images && product.images.length > 0
        ? product.images
        : [product?.image || ""];

    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative">

                {/* Left: Sticky Image Section */}
                <div className="relative">
                    <div className="sticky top-32 space-y-6">
                        {/* Main Image */}
                        <motion.div
                            key={activeImage} // Key change triggers animation
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="relative z-10 p-12 rounded-[3.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] aspect-square flex items-center justify-center overflow-hidden"
                        >
                            <motion.div
                                className="relative w-full h-full"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            >
                                <Image
                                    src={activeImage || "/hero-glasses.png"}
                                    alt={product?.name || "Detail View"}
                                    fill
                                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,1)]"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                            </motion.div>
                        </motion.div>

                        {/* Thumbnails */}
                        {productImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto p-4 scrollbar-hide">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-24 h-24 rounded-2xl border-2 overflow-hidden transition-all flex-shrink-0 ${activeImage === img
                                            ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105"
                                            : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                                        <div className="relative w-full h-full p-2 z-10">
                                            <Image
                                                src={img}
                                                alt={`View ${idx + 1}`}
                                                fill
                                                className="object-contain"
                                                sizes="96px"
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-500/5 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
                    </div>
                </div>

                {/* Right: Product Details */}
                <div className="flex flex-col justify-center space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {product.category || "LIMITED EDITION"}
                            </span>
                            {product.stock && product.stock > 0 ? (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">재고 보유 ({product.stock})</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">품절</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-4 italic uppercase">
                                {product.name}
                            </h1>
                            <p className="text-3xl font-mono text-blue-500 font-bold tracking-tight">
                                {product.price}
                            </p>
                        </div>

                        <div className="space-y-4 max-w-xl">
                            <p className="text-slate-400 leading-relaxed font-medium whitespace-pre-line">
                                {product.description || "중력을 거스르는 가벼움. 최첨단 소재와 인체공학적 설계를 통해 착용하지 않은 듯한 편안함을 제공합니다."}
                            </p>
                            {product.description && product.description.includes('•') && (
                                <ul className="grid grid-cols-1 gap-3">
                                    {product.description.split('\n').filter(line => line.trim().startsWith('•')).map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
                                            <div className="w-1 h-1 bg-blue-500" />
                                            {item.replace('•', '').trim()}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-5 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-4">
                                <motion.button
                                    ref={buttonRef}
                                    whileHover={product.stock && product.stock > 0 ? { scale: 1.02, y: -2 } : {}}
                                    whileTap={product.stock && product.stock > 0 ? { scale: 0.98 } : {}}
                                    onClick={handleAddToCart}
                                    disabled={isAddingRequest || !product.stock || product.stock <= 0}
                                    className={`
                                        relative overflow-hidden flex-1 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 shadow-2xl
                                        ${isAddingRequest
                                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                            : (!product.stock || product.stock <= 0)
                                                ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
                                                : "bg-white/10 text-white hover:bg-white/20 border border-white/10"}
                                    `}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isAddingRequest ? <><Check size={16} /> ADDED</> : <><ShoppingBag size={16} /> CART</>}
                                    </span>
                                </motion.button>


                                <motion.button
                                    whileHover={product.stock && product.stock > 0 ? { scale: 1.02, y: -2 } : {}}
                                    whileTap={product.stock && product.stock > 0 ? { scale: 0.98 } : {}}
                                    onClick={handleBuyNow}
                                    disabled={!product.stock || product.stock <= 0}
                                    className={`relative overflow-hidden flex-[1.5] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 ${(!product.stock || product.stock <= 0)
                                            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-500/25"
                                        }`}
                                >
                                    {(!product.stock || product.stock <= 0) ? "품절" : "BUY NOW"}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleToggleWishlist}
                                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-300 ${isLiked
                                        ? "bg-red-500/20 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                        : "bg-white/5 border-white/10 text-slate-500"
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 transition-all ${isLiked ? "fill-current" : ""}`} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    product={product}
                />

                <AnimatePresence>
                    {flyingItem && (
                        <motion.div
                            initial={{
                                x: flyingItem.x,
                                y: flyingItem.y,
                                scale: 1,
                                opacity: 1
                            }}
                            animate={{
                                x: Math.min(window.innerWidth - 60, window.innerWidth > 1280 ? (window.innerWidth + 1280) / 2 - 60 : window.innerWidth - 60),
                                y: 40,
                                scale: 0.2,
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="fixed top-0 left-0 z-[200] pointer-events-none select-none"
                            style={{
                                marginLeft: -16,
                                marginTop: -16,
                                willChange: 'transform'
                            }}
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center border border-white/20">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ProductCommunity productId={product.id} productName={product.name} />
            </div>
        </div>
    );
}
