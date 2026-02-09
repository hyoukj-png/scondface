"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface BrandImage {
    id: number;
    title: string;
    image_url: string;
    section?: string; // 'campaign' | 'concept_slide'
}

function DistortionCard({ src, title }: { src: string, title: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 50, damping: 10 });
    const mouseY = useSpring(y, { stiffness: 50, damping: 10 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);
    const scale = useTransform(mouseX, [-0.5, 0.5], [1, 1.1]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            const width = rect.width;
            const height = rect.height;
            const mouseXPct = (e.clientX - rect.left) / width - 0.5;
            const mouseYPct = (e.clientY - rect.top) / height - 0.5;
            x.set(mouseXPct);
            y.set(mouseYPct);
        }
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
            }}
            className="relative w-full aspect-[3/4] cursor-none overflow-hidden rounded-none"
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    scale,
                }}
                className="w-full h-full relative"
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <motion.img
                    src={src}
                    alt={title}
                    className="w-full h-full object-cover filter brightness-75 contrast-125"
                />
                <div className="absolute bottom-10 left-10 z-20 overflow-hidden">
                    <motion.h3
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        className="text-4xl font-black text-white uppercase tracking-tighter"
                    >
                        {title}
                    </motion.h3>
                </div>
            </motion.div>
        </motion.div>
    );
}

function ConceptSlider({ images }: { images: BrandImage[] }) {
    if (!images || images.length === 0) return null;

    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    // Double the images for infinite loop effect
    // Ensure we have enough images to loop smoothly. If few, duplicate more.
    const loopImages = images.length < 5 ? [...images, ...images, ...images, ...images] : [...images, ...images];

    return (
        <div className="relative w-full bg-black py-20 overflow-visible">
            {/* Slider Container with Local Clipping */}
            <div className="relative w-full overflow-hidden px-4 h-[500px] md:h-[600px] flex items-center">
                {/* Gradient Overlays for smooth edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

                <motion.div
                    className="flex gap-6"
                    animate={selectedIdx === null ? {
                        x: ["0%", "-50%"],
                    } : {}}
                    transition={{
                        duration: Math.max(20, loopImages.length * 3), // Dynamic speed
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {loopImages.map((img, idx) => (
                        <motion.div
                            key={`${img.id}-${idx}`}
                            layoutId={`img-${img.id}-${idx}`}
                            onClick={() => setSelectedIdx(idx)}
                            className="relative flex-shrink-0 w-[280px] md:w-[400px] aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 group shadow-2xl cursor-pointer"
                        >
                            <motion.img
                                src={img.image_url}
                                alt={img.title}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                <span className="text-white font-black italic tracking-tighter text-2xl uppercase">Expand</span>
                                <div className="w-12 h-1 bg-blue-500 mt-2" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Local Expansion Component */}
            <AnimatePresence>
                {selectedIdx !== null && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedIdx(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto cursor-zoom-out"
                        />

                        <motion.div
                            layoutId={`img-${loopImages[selectedIdx].id}-${selectedIdx}`}
                            className="relative z-10 w-auto h-auto max-w-[90vw] max-h-[85vh] overflow-hidden rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/20 pointer-events-auto flex items-center justify-center bg-black"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.img
                                src={loopImages[selectedIdx].image_url}
                                alt="Expanded"
                                className="w-auto h-auto max-w-full max-h-[85vh] object-contain"
                            />

                            <div className="absolute top-6 right-6 z-20">
                                <button
                                    onClick={() => setSelectedIdx(null)}
                                    className="p-2 bg-black/60 backdrop-blur-xl rounded-full text-white/70 hover:text-white transition-colors border border-white/10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="absolute bottom-8 left-0 right-0 text-center z-20 pointer-events-none">
                                <span className="text-white/80 font-black italic tracking-[0.3em] uppercase text-xs drop-shadow-md">{loopImages[selectedIdx].title}</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function BrandPage() {
    const [images, setImages] = useState<BrandImage[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
            const { data } = await supabase
                .from('brand_images')
                .select('*')
                .order('display_order', { ascending: true });

            if (data && data.length > 0) {
                setImages(data);
            } else {
                // Fallback Mock Data if DB is empty
                setImages([
                    { id: 1, image_url: "/hero-glasses.png", title: "Zero Gravity" },
                    { id: 2, image_url: "/hero-glasses.png", title: "Lunar Eclipse" },
                    { id: 3, image_url: "/hero-glasses.png", title: "Solar Flare" },
                    { id: 4, image_url: "/hero-glasses.png", title: "Nebula cloud" },
                ]);
            }
        };
        fetchImages();
    }, []);

    const campaignImages = images.filter(img => !img.section || img.section === 'campaign');
    const sliderImages = images.filter(img => img.section === 'concept_slide');

    return (
        <div className="min-h-screen bg-black">
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <h1 className="text-[15vw] font-black text-white/10 uppercase tracking-tighter leading-none select-none pointer-events-none absolute z-0 scale-y-150">
                    CAMPAIGN
                </h1>
                <div className="z-10 text-center space-y-4 px-6">
                    <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                        Beyond The Horizon
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg font-light">
                        2026 S/S Collection. 중력을 넘어선 새로운 시각적 경험.
                    </p>
                </div>
            </div>

            {/* Campaign Grid Section */}
            {campaignImages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {campaignImages.map((img) => (
                        <DistortionCard key={img.id} src={img.image_url} title={img.title} />
                    ))}
                </div>
            )}

            {/* Concept Slider Section */}
            {sliderImages.length > 0 && (
                <div className="py-32 space-y-20">
                    <div className="text-center space-y-4">
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-widest">Concept Showcase</h3>
                        <div className="w-12 h-1 bg-blue-600 mx-auto" />
                    </div>
                    <ConceptSlider images={sliderImages} />
                </div>
            )}
        </div>
    );
}
