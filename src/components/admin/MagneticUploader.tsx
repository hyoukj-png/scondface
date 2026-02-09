"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Ensure this path is correct

interface MagneticUploaderProps {
    onUploadComplete: (url: string) => void;
    onRemove: () => void;
    currentImage?: string;
}

export default function MagneticUploader({ onUploadComplete, onRemove, currentImage }: MagneticUploaderProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Magnetic Effect Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150, mass: 0.5 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        x.set(distanceX * 0.3); // Magnetic strength
        y.set(distanceY * 0.3);
    }, [x, y]);

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setIsHovering(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadImage(file);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(false);
        x.set(0);
        y.set(0);

        const file = e.dataTransfer.files?.[0];
        if (file) await uploadImage(file);
    };

    const uploadImage = async (file: File) => {
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            onUploadComplete(publicUrl);
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto aspect-square">
            {currentImage ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden group border border-cyan-900/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentImage} alt="Product" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                        <button
                            onClick={onRemove}
                            type="button"
                            className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div
                    style={{ x: springX, y: springY }}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={handleMouseLeave}
                    onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                    onDragLeave={() => setIsHovering(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                    w-full h-full rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-8 text-center
                    ${isHovering
                            ? 'border-cyan-500 bg-cyan-900/10 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] scale-105'
                            : 'border-slate-700 bg-black/20 hover:border-slate-500'
                        }
                `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {isUploading ? (
                        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                    ) : (
                        <>
                            <motion.div
                                animate={isHovering ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
                                className="mb-4 p-4 rounded-full bg-cyan-500/10 text-cyan-500"
                            >
                                {isHovering ? <Upload size={32} /> : <ImageIcon size={32} />}
                            </motion.div>
                            <h3 className={`text-lg font-bold mb-2 transition-colors ${isHovering ? 'text-cyan-400' : 'text-slate-400'}`}>
                                {isHovering ? "Drop it like it's hot!" : "Upload Image"}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Drag & drop or click to select
                            </p>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
}
