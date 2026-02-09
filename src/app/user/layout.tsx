"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, LogOut, ChevronRight, ShieldCheck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const navItems = [
    { name: "내 정보", href: "/user", icon: User },
    { name: "프로필 수정", href: "/user/profile", icon: ShieldCheck },
    { name: "주문 내역", href: "/user/orders", icon: Package },
    { name: "관심 상품", href: "/user/wishlist", icon: Heart },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-72 space-y-4">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="font-black uppercase tracking-widest text-sm">PERSONAL</h2>
                                <p className="text-[10px] text-slate-500 font-mono">ARCHIVE SYSTEM v1.0</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                                            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${isActive
                                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                : "text-slate-400 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={18} />
                                                <span className="text-sm font-bold tracking-tight">{item.name}</span>
                                            </div>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
                                                />
                                            )}
                                            {!isActive && <ChevronRight size={14} className="opacity-0 group-hover:opacity-40" />}
                                        </motion.div>
                                    </Link>
                                );
                            })}

                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all mt-10"
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-bold tracking-tight">로그아웃</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full rounded-3xl bg-white/5 border border-white/10 backdrop-blur-3xl p-8 lg:p-12 relative overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
