"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Product } from "@/types/product";

export default function Hero() {
    const ref = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Fetch up to 3 featured products
    useEffect(() => {
        async function fetchFeaturedProducts() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_featured', true)
                    .limit(3);

                if (!error && data) {
                    setFeaturedProducts(data);
                }
            } catch (error) {
                console.error("Error fetching featured products:", error);
            }
        }
        fetchFeaturedProducts();
    }, []);

    // Auto-rotate carousel
    useEffect(() => {
        if (featuredProducts.length === 0 || isPaused) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % featuredProducts.length);
        }, 4000); // 4초마다 회전

        return () => clearInterval(interval);
    }, [featuredProducts.length, isPaused]);

    // Mouse Parallax for Image
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 50, stiffness: 400 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const rotateX = useTransform(springY, [-0.5, 0.5], [20, -20]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-20, 20]);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        // For Spotlight
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });

        // For Parallax
        const width = rect.width;
        const height = rect.height;
        const mouseXCurrent = e.clientX - rect.left;
        const mouseYCurrent = e.clientY - rect.top;
        const xPct = mouseXCurrent / width - 0.5;
        const yPct = mouseYCurrent / height - 0.5;
        mouseX.set(xPct);
        mouseY.set(yPct);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setMousePosition({ x: 0, y: 0 }); // Optional: reset spotlight or fade it out
    };

    // Staggered Text Animation
    const titleVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                type: "spring" as const,
                damping: 12,
                stiffness: 100
            }
        })
    };

    return (
        <section
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] text-white"
        >
            {/* Spotlight Effect Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
                style={{
                    background: `
                        radial-gradient(
                            600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
                            rgba(255, 255, 255, 0.03),
                            transparent 40%
                        )
                    `
                }}
            />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay" />

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 pt-20">

                {/* Left: Text Content */}
                <div className="space-y-8 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="space-y-4"
                    >
                        <div className="relative w-full max-w-[500px] lg:max-w-[700px] mx-auto lg:mx-0">
                            <img
                                src="/images/logo_main.png"
                                alt="SECONDFACE"
                                className="w-full h-auto filter invert opacity-100"
                            />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="flex items-center justify-center lg:justify-start gap-3"
                        >
                            <span className="text-blue-500 font-bold tracking-[0.5em] text-xl md:text-2xl mt-4 block">[MYEONGJI]</span>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="flex flex-col lg:flex-row items-center gap-4"
                    >
                        <span className="px-4 py-1 border border-blue-500/50 rounded-full text-blue-400 text-xs font-bold tracking-[0.2em] uppercase bg-blue-500/10 backdrop-blur-sm">
                            Myeongji Premium
                        </span>
                        <div className="h-px w-20 bg-slate-700 hidden lg:block" />
                        <p className="text-slate-400 font-light text-lg tracking-wide">
                            "안경은 당신의, <b>두 번째 얼굴</b>입니다"
                        </p>
                    </motion.div>

                    <motion.a
                        href="/shop"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                            SHOP COLLECTION
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            >
                                <ArrowRight size={18} />
                            </motion.span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
                    </motion.a>
                </div>


                {/* Right: 3D Carousel */}
                <div
                    className="relative h-[600px] flex items-center justify-center perspective-[2000px]"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Glow Behind */}
                    <div className="absolute w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] -z-10 animate-pulse" />
                    <div className="absolute w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px] -z-10 top-0 right-0 animate-pulse delay-75" />

                    {featuredProducts.length > 0 ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {featuredProducts.map((product, index) => {
                                // Calculate position relative to active index
                                const position = (index - activeIndex + featuredProducts.length) % featuredProducts.length;

                                // Determine styling based on position
                                let style: any = {};
                                let className = "absolute transition-all duration-700 ease-out";

                                if (position === 0) {
                                    // Center (Main)
                                    style = {
                                        transform: "translateX(0%) scale(1) translateZ(0px)",
                                        zIndex: 30,
                                        opacity: 1,
                                    };
                                    className += " cursor-pointer";
                                } else if (position === 1) {
                                    // Right (Behind)
                                    style = {
                                        transform: "translateX(40%) scale(0.7) translateZ(-100px) rotateY(-25deg)",
                                        zIndex: 10,
                                        opacity: 0.6,
                                    };
                                    className += " cursor-pointer";
                                } else {
                                    // Left (Behind)
                                    style = {
                                        transform: "translateX(-40%) scale(0.7) translateZ(-100px) rotateY(25deg)",
                                        zIndex: 10,
                                        opacity: 0.6,
                                    };
                                    className += " cursor-pointer";
                                }

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/shop/${product.id}`}
                                        className={className}
                                        style={{
                                            ...style,
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        <motion.div
                                            animate={{
                                                y: position === 0 ? [0, -20, 0] : [0, -10, 0],
                                            }}
                                            transition={{
                                                duration: position === 0 ? 4 : 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="relative group"
                                        >
                                            <img
                                                src={product.images?.[0] || "/hero-glasses.png"}
                                                alt={product.name}
                                                className={`object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform ${position === 0 ? 'w-[450px] h-[450px]' : 'w-[300px] h-[300px]'
                                                    }`}
                                            />

                                            {/* Product Badge - Only show on center */}
                                            {position === 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="absolute -bottom-16 left-1/2 -translate-x-1/2 p-4 px-6 rounded-2xl bg-black/80 border border-blue-500/30 backdrop-blur-md text-center min-w-[200px]"
                                                >
                                                    <div className="text-blue-400 font-bold text-sm">NEW ARRIVAL</div>
                                                    <div className="text-white font-black text-lg mt-1">{product.name}</div>
                                                    <div className="text-slate-400 text-xs mt-1">{product.price}</div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    </Link>
                                );
                            })}

                            {/* Navigation Dots */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                                {featuredProducts.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === activeIndex
                                                ? 'bg-blue-500 w-8'
                                                : 'bg-white/30 hover:bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Fallback: 기본 이미지
                        <motion.img
                            src="/hero-glasses.png"
                            alt="Premium Eyewear"
                            animate={{
                                y: [0, -20, 0],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 4,
                                ease: "easeInOut"
                            }}
                            className="w-full max-w-lg object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
