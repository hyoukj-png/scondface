"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { getAdminDashboardStats } from "@/app/actions/admin";
import {
    TrendingUp,
    Users,
    Package,
    CheckCircle,
    Clock,
    ArrowUpRight,
    ExternalLink,
    ShoppingCart,
    Loader2
} from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { label: "오늘의 주문", value: 0, prefix: "", suffix: " 건", icon: ShoppingCart, color: "blue", trend: "..." },
        { label: "총 매출", value: 0, prefix: "₩", suffix: "", icon: TrendingUp, color: "emerald", trend: "..." },
        { label: "배송 대기", value: 0, prefix: "", suffix: " 건", icon: Clock, color: "amber", trend: "..." },
        { label: "전체 회원", value: 0, prefix: "", suffix: " 명", icon: Users, color: "purple", trend: "..." }
    ]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [systemLogs, setSystemLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const result = await getAdminDashboardStats();

            if (result.error) {
                console.error("Dashboard Stats Error:", result.error);
                return;
            }

            setStats([
                { label: "오늘의 주문", value: result.todayCount || 0, prefix: "", suffix: " 건", icon: ShoppingCart, color: "blue", trend: "+0%" },
                { label: "총 매출", value: result.totalRev || 0, prefix: "₩", suffix: "", icon: TrendingUp, color: "emerald", trend: "+0%" },
                { label: "배송 대기", value: result.pendingCount || 0, prefix: "", suffix: " 건", icon: Clock, color: "amber", trend: "+0%" },
                { label: "전체 회원", value: result.memberCount || 0, prefix: "", suffix: " 명", icon: Users, color: "purple", trend: "+0%" }
            ]);

            setRecentOrders(result.recentOrders || []);
            setSystemLogs(result.systemLogs || []);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-12">
            {/* Header Log */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-widest text-white italic uppercase mb-2">시스템 현황</h1>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400">
                            네트워크: 온라인
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            실시간 데이터 스트림 활성화됨
                        </span>
                    </div>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="px-6 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2 text-slate-300"
                >
                    {isLoading && <Loader2 size={12} className="animate-spin" />}
                    데이터 새로고침
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 rounded-[2rem] bg-[#0a0a0c] border border-white/5 relative group overflow-hidden"
                    >
                        {/* Background Accent */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-3xl -z-10`} />

                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-mono font-bold text-emerald-500`}>
                                {stat.trend}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white tabular-nums">
                                    {stat.prefix}
                                    <CountUp end={stat.value} duration={2} separator="," />
                                    {stat.suffix}
                                </span>
                            </div>
                        </div>

                        {/* HUD Decoration */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="h-1 w-2/3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ delay: idx * 0.1 + 0.5, duration: 1 }}
                                    className={`h-full bg-${stat.color}-500/50`}
                                />
                            </div>
                            <ArrowUpRight size={12} className="text-slate-700" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Recent Orders List */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-8 p-10 rounded-[2.5rem] bg-[#0a0a0c] border border-white/5"
                >
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black uppercase italic tracking-widest text-white">최근 주문 내역</h3>
                        <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">전체 기록 보기</button>
                    </div>

                    <div className="space-y-4">
                        {recentOrders.length > 0 ? recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-6 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 font-mono text-[10px]">
                                        {order.id.slice(-4)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200 uppercase">{order.customer_name || "익명 사용자"}</p>
                                        <p className="text-[10px] font-mono text-slate-600 mt-1 uppercase tracking-widest">{order.id} • {new Date(order.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white">{order.total_amount}</p>
                                        <p className={`text-[9px] font-black uppercase mt-1 ${order.status === 'delivered' ? 'text-emerald-500' :
                                            order.status === 'shipped' ? 'text-blue-500' : 'text-amber-500'
                                            }`}>
                                            {order.status === 'paid' ? '결제완료' :
                                                order.status === 'shipped' ? '배송중' :
                                                    order.status === 'delivered' ? '배송완료' : '취소됨'}
                                        </p>
                                    </div>
                                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink size={14} className="text-slate-400 hover:text-white" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
                                현재 주문 내역이 없습니다.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Real-time Feed or Secondary Box */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 p-10 rounded-[2.5rem] bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/10"
                >
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-8">시스템 피드</h3>
                    <div className="space-y-8">
                        {(systemLogs.length > 0 ? systemLogs : [
                            { event_code: "WAIT", message: "시스템 로그 수신 대기 중..." }
                        ]).map((feed, i) => (
                            <div key={i} className="flex gap-4">
                                <span className={`text-[10px] font-mono opacity-50 w-8 text-right ${feed.event_code === 'LIVE' ? 'text-emerald-500' :
                                        feed.event_code === 'SEC' ? 'text-red-500' :
                                            feed.event_code === 'SYNC' ? 'text-blue-500' :
                                                feed.event_code === 'SYS' ? 'text-amber-500' : 'text-slate-500'
                                    }`}>
                                    {feed.event_code}
                                </span>
                                <p className="text-[10px] font-mono text-slate-400 leading-relaxed uppercase tracking-widest flex-1">
                                    {feed.message}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <p className="text-[9px] font-mono text-slate-500 italic uppercase">시스템이 문제 없이 17,284시간 동안 가동 중입니다.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
