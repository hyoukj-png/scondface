"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminOrders, adminDeleteOrders, adminUpdateOrderStatus, adminUpdateTracking } from "@/app/actions/admin";
import { ShoppingCart, Search, Filter, MoreVertical, Truck, CheckCircle, XCircle, Loader2, PackageOpen, Trash2, CheckCircle2, Info, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { CARRIERS } from "@/lib/carriers";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<{ id: string, top: number, right: number } | null>(null);
    const [refundInfoModal, setRefundInfoModal] = useState<{ orderId: string, info: any } | null>(null);
    const [trackingModal, setTrackingModal] = useState<{ orderId: string, currentTracking?: string, currentCarrier?: string } | null>(null);
    const [dateFilter, setDateFilter] = useState<"all" | "1month" | "3months" | "6months" | "custom">("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const result = await getAdminOrders();
            if (result.error) throw new Error(result.error);
            setOrders(result.data || []);
        } catch (error: any) {
            console.error("Error fetching orders:", error);
            toast.error("주문 목록을 불러오지 못했습니다: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        // Date filter
        if (dateFilter !== "all") {
            const orderDate = new Date(order.created_at);

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

        // Search filter (order ID, customer name, product name)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesOrderId = order.id.toLowerCase().includes(searchLower);
            const matchesCustomer = order.customer_name?.toLowerCase().includes(searchLower);
            const matchesProduct = order.product_name?.toLowerCase().includes(searchLower);
            if (!matchesOrderId && !matchesCustomer && !matchesProduct) return false;
        }

        return true;
    });

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const result = await adminUpdateOrderStatus(id, newStatus);
            if (result.error) throw new Error(result.error);

            const statusMap: Record<string, string> = {
                paid: "결제완료",
                shipped: "배송중",
                delivered: "배송완료",
                cancelled: "취소됨"
            };

            toast.success(`주문 상태가 ${statusMap[newStatus] || newStatus}(으)로 변경되었습니다.`);
            fetchOrders();
            setActiveDropdown(null);
        } catch (error: any) {
            toast.error("상태 변경 실패: " + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("이 주문 기록을 영구적으로 삭제하시겠습니까?")) return;
        try {
            const result = await adminDeleteOrders([id]);
            if (result.error) throw new Error(result.error);

            toast.success("주문 기록이 삭제되었습니다.");
            fetchOrders();
            setSelectedOrderIds(prev => prev.filter(oid => oid !== id));
            setActiveDropdown(null);
        } catch (error: any) {
            toast.error("삭제 실패: " + error.message);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedOrderIds.length === 0) return;
        if (!confirm(`선택한 ${selectedOrderIds.length}개의 주문 기록을 모두 삭제하시겠습니까?`)) return;

        try {
            const result = await adminDeleteOrders(selectedOrderIds);
            if (result.error) throw new Error(result.error);

            toast.success(`${selectedOrderIds.length}개의 주문 기록이 삭제되었습니다.`);
            fetchOrders();
            setSelectedOrderIds([]);
        } catch (error: any) {
            toast.error("일괄 삭제 실패: " + error.message);
        }
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === filteredOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(o => o.id));
        }
    };

    const toggleSelectOrder = (id: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
        );
    };

    const toggleDropdown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (activeDropdown?.id === id) {
            setActiveDropdown(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            const dropdownHeight = 300; // 예상 드롭다운 높이
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // 하단 공간이 부족하고 상단 공간이 충분하면 위쪽에 표시
            const showAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

            setActiveDropdown({
                id,
                top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    };

    return (
        <div className="space-y-10" onClick={() => setActiveDropdown(null)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-widest text-white italic uppercase">주문 관리</h1>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2 px-1">
                        동기화 상태: {isLoading ? "데이터 업데이트 중..." : "운영 중"} • 총 {orders.length}개의 주문 내역
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {selectedOrderIds.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={(e) => { e.stopPropagation(); handleBulkDelete(); }}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                            >
                                <Trash2 size={14} />
                                {selectedOrderIds.length}개 선택 삭제
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="주문번호, 고객명, 상품명 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-cyan-500/50 w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Date Filter Bar */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Calendar className="text-slate-500 mr-2" size={16} />
                    <button
                        onClick={() => { setDateFilter("all"); setStartDate(""); setEndDate(""); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "all" ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => setDateFilter("1month")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "1month" ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        1개월
                    </button>
                    <button
                        onClick={() => setDateFilter("3months")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "3months" ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        3개월
                    </button>
                    <button
                        onClick={() => setDateFilter("6months")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "6months" ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        6개월
                    </button>
                    <button
                        onClick={() => setDateFilter("custom")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === "custom" ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
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
                                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>
                        <span className="text-slate-500">~</span>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">종료일</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Order Table */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-6 w-12">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSelectAll(); }} // Assuming toggleSelectAll exists in scope, need to check if I missed copying it or if it is outside this replacement chunk.
                                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-white/20 hover:border-white/40'}`}
                                    >
                                        {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 && <CheckCircle2 size={12} />}
                                    </button>
                                </th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">주문 번호</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">고객 정보</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">결제 금액</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">주문 일시</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">상태</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex justify-center items-center gap-2 text-slate-500">
                                            <Loader2 className="animate-spin" size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">데이터 스캔 중...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-slate-600">
                                        <PackageOpen className="mx-auto mb-4 opacity-10" size={48} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">일치하는 주문 내역이 없습니다.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, idx) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors group ${selectedOrderIds.includes(order.id) ? 'bg-cyan-500/5' : ''}`}
                                        onClick={() => activeDropdown && setActiveDropdown(null)}
                                    >
                                        <td className="px-6 py-6">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelectOrder(order.id); // Assuming toggleSelectOrder exists
                                                }}
                                                className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${selectedOrderIds.includes(order.id) ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-white/10 group-hover:border-white/30'}`}
                                            >
                                                {selectedOrderIds.includes(order.id) && <CheckCircle2 size={12} />}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-mono text-cyan-400 font-bold">{order.id.slice(0, 8).toUpperCase()}...</span>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-300">{order.customer_name || "익명 사용자"}</td>
                                        <td className="px-8 py-6 text-sm text-white font-mono">{order.total_amount.toLocaleString()}</td>
                                        <td className="px-8 py-6 text-[11px] font-mono text-slate-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`
                                                text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border
                                                ${order.status === 'pending' ? 'bg-slate-500/10 border-slate-500/20 text-slate-400' : ''}
                                                ${order.status === 'paid' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : ''}
                                                ${order.status === 'shipped' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : ''}
                                                ${order.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
                                                ${order.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
                                            `}>
                                                {order.status === 'pending' ? '주문접수' :
                                                    order.status === 'paid' ? '결제완료' :
                                                        order.status === 'shipped' ? '배송중' :
                                                            order.status === 'delivered' ? '배송완료' :
                                                                order.status === 'cancelled' ? '취소됨' : '알 수 없음'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right relative">
                                            <button
                                                onClick={(e) => toggleDropdown(e, order.id)}
                                                className={`p-2 rounded-lg transition-colors ${activeDropdown?.id === order.id ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Portal Dropdown */}
            {activeDropdown && createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setActiveDropdown(null)}
                    />
                    {/* Dropdown Menu */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            position: 'fixed',
                            top: activeDropdown.top,
                            right: activeDropdown.right,
                            zIndex: 9999
                        }}
                        className="w-48 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                            <p className="text-[10px] font-black uppercase text-slate-500 text-center tracking-widest">상태 변경</p>
                        </div>
                        <div className="p-2 space-y-1">
                            {[
                                { id: 'pending', label: '주문접수' },
                                { id: 'paid', label: '결제완료' },
                                { id: 'shipped', label: '배송중' },
                                { id: 'delivered', label: '배송완료' },
                                { id: 'cancelled', label: '취소됨' }
                            ].map((status) => (
                                <button
                                    key={status.id}
                                    onClick={() => handleUpdateStatus(activeDropdown.id, status.id)}
                                    className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:pl-6 text-slate-400 hover:bg-white/5 hover:text-white`}
                                >
                                    • {status.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-2 border-t border-white/5 space-y-1">
                            <button
                                onClick={() => {
                                    const order = orders.find(o => o.id === activeDropdown.id);
                                    setTrackingModal({
                                        orderId: order.id,
                                        currentTracking: order.tracking_number,
                                        currentCarrier: order.carrier_code
                                    });
                                    setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/10 transition-all flex items-center gap-2"
                            >
                                <Truck size={14} /> 송장번호 입력
                            </button>
                            <button
                                onClick={() => {
                                    const order = orders.find(o => o.id === activeDropdown.id);
                                    if (order?.refund_info) {
                                        setRefundInfoModal({ orderId: order.id, info: order.refund_info });
                                        setActiveDropdown(null);
                                    } else {
                                        toast.error('환불 정보가 없습니다.');
                                    }
                                }}
                                className="w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:bg-cyan-500/10 transition-all flex items-center gap-2"
                            >
                                <Info size={14} /> 환불 정보 보기
                            </button>
                            <button
                                onClick={() => handleDelete(activeDropdown.id)}
                                className="w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all flex items-center gap-2"
                            >
                                <XCircle size={14} /> 기록 삭제
                            </button>
                        </div>
                    </motion.div>
                </>,
                document.body
            )}

            {/* Refund Info Modal */}
            {refundInfoModal && createPortal(
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
                        onClick={() => setRefundInfoModal(null)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-3xl z-[9999]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                                <Info size={20} className="text-cyan-400" />
                                환불 계좌 정보
                            </h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                주문 ID: {refundInfoModal.orderId.slice(0, 8).toUpperCase()}...
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">은행명</p>
                                    <p className="text-sm font-bold text-white">{refundInfoModal.info.bank}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">계좌번호</p>
                                    <p className="text-sm font-mono text-cyan-400">{refundInfoModal.info.account}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">예금주</p>
                                    <p className="text-sm font-bold text-white">{refundInfoModal.info.holder}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5">
                            <button
                                onClick={() => setRefundInfoModal(null)}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-xl transition-all text-[10px] uppercase tracking-widest"
                            >
                                닫기
                            </button>
                        </div>
                    </motion.div>
                </>,
                document.body
            )}

            {/* Tracking Input Modal */}
            {trackingModal && createPortal(
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
                        onClick={() => setTrackingModal(null)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-3xl z-[9999]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const trackingNumber = formData.get('trackingNumber') as string;
                            const carrierCode = formData.get('carrierCode') as string;
                            const carrierName = CARRIERS.find(c => c.code === carrierCode)?.name || '';

                            if (!trackingNumber || !carrierCode) {
                                toast.error('택배사와 송장번호를 모두 입력해주세요.');
                                return;
                            }

                            try {
                                const result = await adminUpdateTracking(trackingModal.orderId, trackingNumber, carrierCode, carrierName);
                                if (result.success) {
                                    toast.success('송장번호가 등록되었습니다. 자동으로 배송중으로 변경됩니다.');
                                    setTrackingModal(null);
                                    fetchOrders();
                                } else {
                                    toast.error(result.error || '송장번호 등록에 실패했습니다.');
                                }
                            } catch (error) {
                                toast.error('송장번호 등록 중 오류가 발생했습니다.');
                            }
                        }}>
                            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                <h3 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                                    <Truck size={20} className="text-blue-400" />
                                    송장번호 입력
                                </h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                    주문 ID: {trackingModal.orderId.slice(0, 8).toUpperCase()}...
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        택배사 선택
                                    </label>
                                    <select
                                        name="carrierCode"
                                        defaultValue={trackingModal.currentCarrier || ''}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="">택배사를 선택하세요</option>
                                        {CARRIERS.map(carrier => (
                                            <option key={carrier.code} value={carrier.code} className="bg-[#0a0a0c]">
                                                {carrier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        송장번호
                                    </label>
                                    <input
                                        type="text"
                                        name="trackingNumber"
                                        defaultValue={trackingModal.currentTracking || ''}
                                        placeholder="송장번호를 입력하세요"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-white/5 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTrackingModal(null)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-xl transition-all text-[10px] uppercase tracking-widest"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all text-[10px] uppercase tracking-widest"
                                >
                                    등록
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>,
                document.body
            )}
        </div >
    );
}
