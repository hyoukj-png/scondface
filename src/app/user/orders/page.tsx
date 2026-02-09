"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, ExternalLink, QrCode, Loader2, Search, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import EmptyOrdersState from "@/components/user/EmptyOrdersState";
import OrderDetailModal from "@/components/user/OrderDetailModal";

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState<"all" | "1month" | "3months" | "6months" | "custom">("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        async function fetchOrders() {
            if (status === "loading") return;

            if (!session?.user?.email) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch orders where merchant_uid contains user email (our hacky filter)
                const { data, error } = await supabase
                    .from("orders")
                    .select(`
                        *,
                        order_items (
                            quantity,
                            products (
                                name,
                                images
                            )
                        )
                    `)
                    .ilike("merchant_uid", `%|${session.user.email}`)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                // Map Supabase data to our UI format
                const mappedOrders = (data || []).map(order => {
                    const firstItem = order.order_items?.[0];
                    const product = firstItem?.products;
                    const itemsCount = order.order_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 1;

                    return {
                        id: order.id,
                        displayId: order.merchant_uid.split('|')[0], // Hide email in UI
                        date: new Date(order.created_at).toLocaleDateString(),
                        status: order.status,
                        total: `₩${order.total_amount?.toLocaleString()}`,
                        itemsCount: itemsCount,
                        image: product?.images?.[0] || "/hero-glasses.png",
                        name: product?.name || "Premium Item",
                        statusText: order.status === "paid" ? "결제 완료" :
                            order.status === "shipped" ? "배송 중" :
                                order.status === "delivered" ? "배송 완료" :
                                    order.status === "cancelled" ? "취소됨" : "주문 대기",
                        tracker: order.status === "paid" ? 1 :
                            order.status === "shipped" ? 2 :
                                order.status === "delivered" ? 3 : 0,
                        raw: order,
                        recipient: order.recipient,
                        phone: order.phone,
                        address: order.address ? `(${order.zonecode}) ${order.address} ${order.detail_address || ''} ` : null,
                        paymentMethod: order.payment_method
                    };
                });

                setOrders(mappedOrders);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [session, status, refreshKey]);

    // Filter orders by date range and search term
    const filteredOrders = orders.filter(order => {
        // Date filter
        if (dateFilter !== "all") {
            const orderDate = new Date(order.date);
            const now = new Date();

            if (dateFilter === "custom") {
                if (startDate && new Date(startDate) > orderDate) return false;
                if (endDate && new Date(endDate) < orderDate) return false;
            } else {
                const monthsAgo = dateFilter === "1month" ? 1 : dateFilter === "3months" ? 3 : 6;
                const cutoffDate = new Date();
                cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);
                if (orderDate < cutoffDate) return false;
            }
        }

        // Search filter (product name, order ID)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesProduct = order.items?.some((item: any) =>
                item.name?.toLowerCase().includes(searchLower)
            );
            const matchesOrderId = order.id?.toLowerCase().includes(searchLower);
            if (!matchesProduct && !matchesOrderId) return false;
        }

        return true;
    });

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Accessing Secure Archive...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black tracking-[0.1em] uppercase mb-3 text-white italic"
                >
                    Order Archive
                </motion.h1>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">
                    Central Uplink: Stable • {filteredOrders.length} Records Retrieved
                </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="상품명 또는 주문번호로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>

                {/* Date Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <Calendar className="text-slate-500 mr-2" size={16} />
                    <button
                        onClick={() => { setDateFilter("all"); setStartDate(""); setEndDate(""); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "all" ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => setDateFilter("1month")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "1month" ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        1개월
                    </button>
                    <button
                        onClick={() => setDateFilter("3months")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "3months" ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        3개월
                    </button>
                    <button
                        onClick={() => setDateFilter("6months")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "6months" ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        6개월
                    </button>
                    <button
                        onClick={() => setDateFilter("custom")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "custom" ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        기간 설정
                    </button>
                </div>

                {/* Custom Date Range */}
                {dateFilter === "custom" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex flex-wrap gap-3 items-center bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">시작일</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <span className="text-slate-500">~</span>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">종료일</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, idx) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ x: 10 }}
                            onClick={() => setSelectedOrder(order)}
                            className="group cursor-pointer relative"
                        >
                            {/* Ticket UI Body */}
                            <motion.div
                                layoutId={`order - card - ${order.id} `}
                                className="relative flex flex-col lg:flex-row items-stretch bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md group-hover:border-blue-500/40 group-hover:bg-white/[0.08] transition-all duration-500"
                            >
                                {/* Ticket Edge Cutouts */}
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#0a0a0c] border border-white/10 z-20" />
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-[#0a0a0c] border border-white/10 z-20" />

                                {/* Left Section: Artwork Overlay */}
                                <div className="p-8 lg:p-10 flex items-center justify-center bg-white/5 border-b lg:border-b-0 lg:border-r border-dotted border-white/10 lg:w-48 shrink-0 relative">
                                    <div className="relative z-10 w-24 h-24 lg:w-32 lg:h-32">
                                        <motion.img
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            src={order.image}
                                            alt={order.name}
                                            className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform"
                                        />
                                    </div>
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,1)_0%,transparent_70%)]" />
                                </div>

                                {/* Center Section: Mission Data */}
                                <div className="flex-1 p-8 lg:p-10 space-y-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-black text-white italic uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                                                    {order.name}
                                                </h3>
                                                {order.itemsCount > 1 && (
                                                    <span className="text-[10px] h-5 px-2 flex items-center bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded font-black uppercase">
                                                        +{order.itemsCount - 1} ITEMS
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-2"><Clock size={12} /> {order.date}</span>
                                                <span className="flex items-center gap-2">ID: {order.displayId}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{order.total}</span>
                                            <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.3em] mt-1">Transaction Verified</span>
                                        </div>
                                    </div>

                                    {/* Mini Tracker UI */}
                                    <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden relative">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(order.tracker / 3) * 100}% ` }}
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                            />
                                        </div>
                                        <div className={`text - [10px] font - black uppercase tracking - widest flex items - center gap - 2 ${order.status === "shipped" || order.status === "paid" ? "text-amber-400" : "text-blue-400"
                                            } `}>
                                            {order.status === "shipped" ? <Truck size={14} /> : <CheckCircle size={14} />}
                                            {order.statusText}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: QR/Barcode Area */}
                                <div className="p-8 lg:p-10 bg-white/5 border-t lg:border-t-0 lg:border-l border-dotted border-white/10 lg:w-40 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-6 relative">
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-white/10 transition-colors">
                                        <QrCode size={40} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <div className="text-right lg:text-center">
                                        <p className="text-[9px] font-mono text-slate-500 uppercase leading-tight mb-2">Scan Artifact<br />Coordinates</p>
                                        <div className="flex justify-center gap-[2px]">
                                            {[...Array(12)].map((_, i) => (
                                                <div key={i} className={`h - 4 w - [2px] bg - slate - 700 / 50 ${i % 3 === 0 ? 'h-6' : ''} `} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))
                ) : orders.length === 0 ? (
                    <EmptyOrdersState />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package className="w-16 h-16 text-slate-600 mb-4" />
                        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest mb-2">
                            검색 결과가 없습니다
                        </p>
                        <p className="text-slate-600 text-xs">
                            다른 검색어나 기간을 시도해보세요
                        </p>
                    </div>
                )}
            </div>

            {/* Modal portal area */}
            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onOrderCancelled={() => setRefreshKey(prev => prev + 1)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
