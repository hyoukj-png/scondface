"use client";

import { motion, AnimatePresence } from "framer-motion";
import DaumPostcodeEmbed from "react-daum-postcode";
import { X } from "lucide-react";

interface AddressSearchProps {
    isOpen: boolean;
    onComplete: (data: any) => void;
    onClose: () => void;
}

export default function AddressSearch({ isOpen, onComplete, onClose }: AddressSearchProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] h-[500px] bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden z-[201] shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination Locator</span>
                            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <DaumPostcodeEmbed
                            onComplete={(data) => {
                                onComplete(data);
                                onClose();
                            }}
                            style={{ height: 'calc(100% - 53px)' }}
                            theme={{
                                bgColor: "#0a0a0c",
                                searchBgColor: "#0a0a0c",
                                contentBgColor: "#0a0a0c",
                                pageBgColor: "#0a0a0c",
                                textColor: "#ffffff",
                                queryTextColor: "#ffffff",
                                postcodeTextColor: "#60a5fa",
                                emphTextColor: "#3b82f6",
                                outlineColor: "#1e293b"
                            }}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
