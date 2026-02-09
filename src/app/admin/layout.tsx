"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Package,
    ShoppingCart,
    MessageSquare,
    Settings,
    LogOut,
    LayoutDashboard,
    Zap,
    Users,
    Tags
} from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarItems = [
    { name: "대시보드", href: "/admin", icon: LayoutDashboard },
    { name: "회원 관리", href: "/admin/users", icon: Users },
    { name: "상품 관리", href: "/admin/products", icon: Package },
    { name: "카테고리 관리", href: "/admin/categories", icon: Tags },
    { name: "주문 관리", href: "/admin/orders", icon: ShoppingCart },
    { name: "브랜드 관리", href: "/admin/brand", icon: Zap },
    { name: "커뮤니티 관리", href: "/admin/community", icon: MessageSquare },
    { name: "시스템 설정", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#020203] text-white flex">
            {/* Sidebar (Control Tower HUD) */}
            <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-3xl fixed inset-y-0 left-0 z-30 hidden lg:block">
                <div className="flex flex-col h-full">
                    {/* Admin Header */}
                    <div className="p-8 pb-12 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Zap size={20} className="fill-current" />
                        </div>
                        <div>
                            <h1 className="font-black text-xs uppercase tracking-[0.3em] text-white">Cockpit.OS</h1>
                            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Control Tower v2.0</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 space-y-1">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className={`
                      relative flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group
                      ${isActive
                                                ? "bg-cyan-500/10 text-cyan-400"
                                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}
                    `}
                                    >
                                        {/* Active Indicator Glow */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-nav"
                                                className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                                            />
                                        )}

                                        <item.icon size={18} className={isActive ? "text-cyan-400" : "text-slate-600 transition-colors group-hover:text-slate-400"} />
                                        <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>

                                        {/* Tiny HUD lines */}
                                        <div className="absolute right-4 opacity-0 group-hover:opacity-20 transition-opacity">
                                            <div className="w-4 h-[1px] bg-white mb-1" />
                                            <div className="w-2 h-[1px] bg-white ml-2" />
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Section */}
                    <div className="p-8 border-t border-white/5">
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-4 text-slate-600 hover:text-red-400 transition-colors px-6 py-2 group"
                        >
                            <LogOut size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Abundance Link</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 relative bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_40%)]">
                {/* HUD Overlay Lines (Decorative) */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

                <div className="p-8 md:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
