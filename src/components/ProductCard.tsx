"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ProductCardProps {
    id: string;
    name: string;
    price: string;
    image: string;
    index: number;
    stock: number; // 재고 추가
}

export default function ProductCard({ id, name, price, image, index, stock }: ProductCardProps) {
    const [imgSrc, setImgSrc] = useState(image);
    const isSoldOut = stock <= 0;

    useEffect(() => {
        setImgSrc(image);
    }, [image]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.5,
                delay: index * 0.1, // Stagger effect
                ease: "easeOut"
            }}
            className="group relative w-full"
        >
            <Link href={`/shop/${id}`} className="block w-full h-full">
                {/* Card Container (The Capsule) */}
                <div className="relative h-[400px] w-full rounded-3xl overflow-visible transition-all duration-500">

                    {/* Glass Background */}
                    <div className="absolute inset-0 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/20 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/30 group-hover:-translate-y-2 z-0" />

                    {/* Product Image Area - Floats OUT of the card on hover */}
                    <div className="relative h-2/3 w-full flex items-center justify-center p-6 z-10 perspective-1000">
                        <motion.div
                            className="w-full h-full relative"
                            whileHover={!isSoldOut ? {
                                scale: 1.15,
                                y: -30,
                                rotateZ: 2,
                                filter: "drop-shadow(0px 20px 30px rgba(0,0,0,0.2))"
                            } : {}}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {/* Using img tag for external URL demo, replace with Image in production */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <Image
                                src={imgSrc}
                                alt={name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                onError={() => setImgSrc("/hero-glasses.png")}
                                className={`object-contain transition-all duration-300 ${isSoldOut ? "grayscale opacity-50 contrast-125" : "drop-shadow-lg"
                                    }`}
                                priority={index < 4}
                            />

                            {/* SOLD OUT Overlay */}
                            {isSoldOut && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <span className="text-3xl font-black text-white/50 border-4 border-white/50 px-4 py-2 -rotate-12 uppercase tracking-widest">
                                        Sold Out
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Text Content */}
                    <div className="relative h-1/3 flex flex-col justify-end p-6 z-10">
                        <h3 className="text-xl font-bold text-white mb-1 translate-y-0 transition-transform duration-300 group-hover:-translate-y-1">{name}</h3>
                        <p className="text-slate-400 font-medium translate-y-0 transition-transform duration-300 group-hover:-translate-y-1">{price}</p>

                        {/* Action Button (Hidden by default, slides up on hover) */}
                        <div className="absolute bottom-6 right-6 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <button className="bg-white text-black rounded-full p-3 shadow-lg hover:bg-blue-500 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Hover Shadow (The floor shadow when levitating) */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[100%]" />
                </div>
            </Link>
        </motion.div>
    );
}
