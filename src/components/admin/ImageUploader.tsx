"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";

interface ImageUploaderProps {
    images: File[];
    previews: string[];
    existingImages?: string[];
    onChange: (files: File[], previews: string[]) => void;
    onRemove: (index: number) => void;
    onRemoveExisting?: (index: number) => void;
}

export default function ImageUploader({ images, previews, existingImages = [], onChange, onRemove, onRemoveExisting }: ImageUploaderProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Magnetic effect for the dropzone
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        onChange([...images, ...acceptedFiles], [...previews, ...newPreviews]);
        setIsDragActive(false);

        // Reset magnetic pos
        x.set(0);
        y.set(0);
    }, [images, previews, onChange]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => {
            setIsDragActive(false);
            x.set(0);
            y.set(0);
        },
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        }
    });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragActive || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Stretch effect: Move the zone slightly towards the mouse
        x.set(mouseX * 0.1);
        y.set(mouseY * 0.1);
    };

    const totalImages = existingImages.length + images.length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Exhibit Artifacts</label>
                <span className="text-[10px] font-mono text-blue-500/50 uppercase">{totalImages} / 5 Slots occupied</span>
            </div>

            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                className="relative"
                {...getRootProps()}
            >
                <motion.div
                    style={{ x: springX, y: springY }}
                    animate={{
                        scale: isDragActive ? 1.02 : 1,
                        borderColor: isDragActive ? "rgba(59, 130, 246, 0.5)" : "rgba(255, 255, 255, 0.05)",
                        backgroundColor: isDragActive ? "rgba(59, 130, 246, 0.05)" : "rgba(255, 255, 255, 0.02)"
                    }}
                    className={`
            relative h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors duration-500 overflow-hidden group
          `}
                >
                    <input {...getInputProps()} />

                    <AnimatePresence>
                        {isDragActive && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 2 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"
                            />
                        )}
                    </AnimatePresence>

                    <div className="relative z-10 flex flex-col items-center text-center px-6">
                        <motion.div
                            animate={isDragActive ? { y: [0, -10, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-4 group-hover:text-blue-400 transition-colors`}
                        >
                            <Upload size={24} />
                        </motion.div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            {isDragActive ? "Release to Manifest" : "Drag Artifacts or Click to Browse"}
                        </p>
                        <p className="text-[10px] font-mono text-slate-600 mt-2">Support: JPEG, PNG, WEBP (Max 5MB)</p>
                    </div>
                </motion.div>
            </div>

            {/* Preview Grid - Existing + New Images */}
            <AnimatePresence>
                {(existingImages.length > 0 || previews.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
                    >
                        {/* Existing Images */}
                        {existingImages.map((url, idx) => (
                            <motion.div
                                key={`existing-${idx}`}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ y: -5 }}
                                className="relative aspect-square rounded-2xl bg-white/5 border border-white/10 p-2 group overflow-hidden"
                            >
                                <img src={url} alt="Existing" className="w-full h-full object-contain filter drop-shadow-md" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {onRemoveExisting && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveExisting(idx)}
                                            className="p-2 rounded-lg bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                {idx === 0 && (
                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-500 text-[8px] font-bold text-white uppercase tracking-widest">Main</span>
                                )}
                            </motion.div>
                        ))}

                        {/* New Images */}
                        {previews.map((preview, idx) => (
                            <motion.div
                                key={preview}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ y: -5 }}
                                className="relative aspect-square rounded-2xl bg-white/5 border border-white/10 p-2 group overflow-hidden"
                            >
                                <img src={preview} alt="Preview" className="w-full h-full object-contain filter drop-shadow-md" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onRemove(idx)}
                                        className="p-2 rounded-lg bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                {(existingImages.length === 0 && idx === 0) && (
                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-500 text-[8px] font-bold text-white uppercase tracking-widest">Main</span>
                                )}
                            </motion.div>
                        ))}

                        {totalImages < 5 && (
                            <div
                                {...getRootProps()}
                                className="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-700 hover:border-white/10 hover:text-slate-500 cursor-pointer transition-all"
                            >
                                <input {...getInputProps()} />
                                <Plus size={20} />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
