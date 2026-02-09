"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Instagram, Phone, ChevronRight, User, ShoppingBag, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const mobileLinks = [
    { name: "Shop", href: "/shop", hasSub: true },
    { name: "Brand", href: "/brand", hasSub: false },
    { name: "About", href: "/about", hasSub: false },
    { name: "Community", href: "/community", hasSub: false },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { data: session } = useSession();
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: "100%" }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] bg-white flex flex-col pt-24 px-8 pb-10"
                >
                    {/* Top Header */}
                    <div className="absolute top-8 left-8">
                        <div className="w-[140px] relative">
                            <img
                                src="/images/logo_main.png"
                                alt="SECONDFACE"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X size={28} className="text-slate-900" />
                    </button>

                    {/* Top: User Auth Status */}
                    <div className="mb-12">
                        {session ? (
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                        <img src={session.user?.image || ""} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{session.user?.name}님</h3>
                                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Member Authenticated</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href="/user" onClick={onClose} className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                        <User size={20} className="text-slate-700" />
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md hover:text-red-500 transition-all text-slate-700"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={onClose}
                                className="block w-full text-center py-6 bg-slate-900 text-white rounded-[2rem] font-black tracking-widest uppercase text-sm hover:bg-blue-600 transition-colors"
                            >
                                Get Started / Sign In
                            </Link>
                        )}
                    </div>

                    {/* Middle: Main Navigation */}
                    <nav className="flex-1 space-y-4">
                        {mobileLinks.map((link) => (
                            <div key={link.name} className="border-b border-slate-100 pb-4">
                                <div
                                    className="flex items-center justify-between"
                                    onClick={() => link.hasSub ? setExpanded(expanded === link.name ? null : link.name) : null}
                                >
                                    {link.hasSub ? (
                                        <button className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                                            {link.name}
                                        </button>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            onClick={onClose}
                                            className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter"
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                    {link.hasSub && (
                                        <motion.div
                                            animate={{ rotate: expanded === link.name ? 90 : 0 }}
                                            className="p-2 text-slate-400"
                                        >
                                            <ChevronRight size={20} />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Submenu (Only for Shop) */}
                                <AnimatePresence>
                                    {expanded === link.name && link.hasSub && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden space-y-3 pt-6 pl-4"
                                        >
                                            {[
                                                { name: "All Products", href: "/shop" },
                                                { name: "Eyeglasses", href: "/shop?cat=eyeglasses" },
                                                { name: "Sunglasses", href: "/shop?cat=sunglasses" },
                                            ].map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    onClick={onClose}
                                                    className="block text-lg font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </nav>

                    {/* Bottom: Social & Contact */}
                    <div className="pt-10 border-t border-slate-100 flex flex-col gap-6">
                        <div className="flex items-center gap-6">
                            <a href="https://www.instagram.com/second_face_mj" target="_blank" className="flex items-center gap-3 text-slate-900 font-bold group">
                                <span className="p-3 bg-slate-50 rounded-2xl group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                                    <Instagram size={20} />
                                </span>
                                <span className="text-sm tracking-tight">Instagram</span>
                            </a>
                            <a href="tel:051-203-8843" className="flex items-center gap-3 text-slate-900 font-bold group">
                                <span className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <Phone size={20} />
                                </span>
                                <span className="text-sm tracking-tight">051-203-8843</span>
                            </a>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-relaxed">
                            부산 강서구 명지오션시티4로 65, 1층 102호(명지동, 대유빌딩)<br />
                            © 2024 SECONDFACE [MYEONGJI]. ALL RIGHTS RESERVED.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
