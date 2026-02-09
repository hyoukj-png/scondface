"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, User, LogOut, Menu, Instagram, MessageCircle, Phone } from "lucide-react";
import { clsx } from "clsx";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import MobileMenu from "./MobileMenu";
import { usePathname } from "next/navigation";

const navLinks = [
    { name: "About", href: "/about" },
    { name: "Brand", href: "/brand" },
    {
        name: "Shop",
        href: "/shop",
        subItems: [
            { name: "All Products", href: "/shop" },
            { name: "Eyeglasses", href: "/shop?cat=eyeglasses" },
            { name: "Sunglasses", href: "/shop?cat=sunglasses" },
            { name: "Goggles", href: "/shop?cat=goggles" },
        ]
    },
    {
        name: "Community",
        href: "/community",
        subItems: [
            { name: "Notice", href: "/community/notice" },
            { name: "Reviews", href: "/community/reviews" },
            { name: "Q&A", href: "/community/qna" },
        ]
    },
];

export default function Header() {
    const pathname = usePathname();
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { data: session } = useSession();
    const { cartItems, toggleCart } = useCartStore();
    const [pulse, setPulse] = useState(false);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Pulse effect when items are added
    useEffect(() => {
        if (totalItems > 0) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 300);
            return () => clearTimeout(timer);
        }
    }, [totalItems]);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    // Hide Header on Admin Pages - MUST BE AFTER ALL HOOKS
    if (pathname?.startsWith('/admin')) return null;

    return (
        <>
            <motion.header
                variants={{
                    visible: { y: 0, opacity: 1 },
                    hidden: { y: "-100%", opacity: 0 },
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="fixed top-0 left-0 right-0 z-[60] flex justify-center py-4 px-6 pointer-events-none"
            >
                <nav className={clsx(
                    "pointer-events-auto",
                    "flex items-center justify-between",
                    "w-full max-w-7xl",
                    "px-6 py-3 rounded-2xl",
                    "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg", // Dark Glassmorphism
                    "transition-all duration-300"
                )}>
                    {/* Logo */}
                    <Link href="/" className="flex flex-col items-center leading-none group">
                        <div className="relative w-[180px] h-auto">
                            <img
                                src="/images/logo_main.png"
                                alt="SECONDFACE"
                                className="w-full h-auto filter invert opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                            />
                        </div>
                        <span className="text-[10px] tracking-[0.3em] font-bold text-blue-500 mt-2 self-end mr-1">[MYEONGJI]</span>
                    </Link>

                    {/* Center Navigation */}
                    <ul className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <li key={link.name} className="relative group">
                                <Link href={link.href} className="relative z-10 block py-4">
                                    <span className="text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
                                        {link.name}
                                    </span>
                                </Link>

                                {/* Dropdown Menu */}
                                {link.subItems && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 pt-2">
                                        <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden ring-1 ring-white/5">
                                            {/* Glow Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

                                            {link.subItems.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    className="block px-4 py-3 rounded-xl hover:bg-white/10 transition-colors group/item"
                                                >
                                                    <span className="text-sm font-medium text-slate-400 group-hover/item:text-white block">
                                                        {sub.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {session ? (
                            <div className="flex items-center gap-1 md:gap-4">
                                {/* Admin Dashboard Button (Only for Super Admin) */}
                                {(session.user as any)?.role === "admin" && (
                                    <Link href="/admin" className="hidden sm:block">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
                                        >
                                            Control Tower
                                        </motion.button>
                                    </Link>
                                )}
                                <Link href="/user" className="p-2 rounded-full hover:bg-white/10 transition-colors group relative hidden md:block" title="My Archive">
                                    <User className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                    <span className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <span className="text-sm font-medium text-slate-300 hidden lg:block">
                                    {session.user?.name}
                                </span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors group relative hidden md:block"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                                    <span className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="p-2 rounded-full hover:bg-white/10 transition-colors group relative hidden md:block" title="Login">
                                <User className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                                <span className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        )}

                        <button
                            onClick={() => toggleCart()}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors group relative"
                        >
                            <ShoppingBag className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />

                            <AnimatePresence>
                                {totalItems > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{
                                            scale: pulse ? [1, 1.4, 1] : 1,
                                        }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#050505] shadow-lg shadow-blue-500/50"
                                    >
                                        {totalItems}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            <span className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Hamburger Menu Mobile Button */}
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="p-2 md:hidden rounded-full hover:bg-white/10 transition-colors text-slate-300"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </nav>
            </motion.header>

            <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
}
