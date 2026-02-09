import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, QrCode, Truck, X, ExternalLink, Printer, Ban } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { cancelOrder } from "@/app/actions/order";

interface OrderDetailModalProps {
    order: any;
    onClose: () => void;
    onOrderCancelled?: () => void;
}

const steps = [
    { label: "주문접수", icon: Clock },
    { label: "결제완료", icon: QrCode },
    { label: "배송중", icon: Truck },
    { label: "배송완료", icon: CheckCircle },
];

export default function OrderDetailModal({ order, onClose, onOrderCancelled }: OrderDetailModalProps) {
    const [mounted, setMounted] = useState(false);
    const { data: session } = useSession();

    // Refund State
    const [showRefundForm, setShowRefundForm] = useState(false);
    const [refundBank, setRefundBank] = useState("");
    const [refundAccount, setRefundAccount] = useState("");
    const [refundHolder, setRefundHolder] = useState("");

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleCancelOrder = async () => {
        // If payment method is bank transfer and form not shown, show form first
        if (order.paymentMethod === 'bank' && !showRefundForm) {
            setShowRefundForm(true);
            return;
        }

        if (!confirm("정말로 주문을 취소하시겠습니까? 취소 후에는 되돌릴 수 없습니다.")) return;

        if (!session?.user?.email) {
            toast.error("로그인 정보가 없습니다.");
            return;
        }

        // Validate refund info if applicable
        if (order.paymentMethod === 'bank') {
            if (!refundBank || !refundAccount || !refundHolder) {
                toast.error("환불 계좌 정보를 모두 입력해주세요.");
                return;
            }
        }

        try {
            const refundInfo = order.paymentMethod === 'bank' ? {
                bank: refundBank,
                account: refundAccount,
                holder: refundHolder
            } : undefined;

            const result = await cancelOrder(order.id, session.user.email, refundInfo);

            if (result.success) {
                toast.success("주문이 성공적으로 취소되었습니다.");
                onOrderCancelled?.();
                onClose();
            } else {
                toast.error(result.error || "주문 취소에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            toast.error("주문 취소 중 오류가 발생했습니다.");
        }
    };

    const handleInquiry = () => {
        const subject = `[1:1 문의] 주문 번호 ${order.displayId} 관련 문의`;
        const body = `
주문 번호: ${order.displayId}
주문 일자: ${order.date}
상품명: ${order.name}

문의 내용을 아래에 적어주세요.
--------------------------------------------------
`;
        window.location.href = `mailto:help@secondface.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handlePrintReceipt = () => {
        const receiptWindow = window.open('', '', 'width=800,height=600');
        if (!receiptWindow) return;

        const html = `
            <html>
                <head>
                    <title>영수증 - ${order.displayId}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                        .title { font-size: 24px; font-weight: bold; }
                        .info { margin-bottom: 30px; }
                        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        .table th, .table td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
                        .table th { background-color: #f8f9fa; }
                        .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">SECONDFACE 영수증</div>
                        <p>${order.date}</p>
                    </div>
                    <div class="info">
                        <div class="info-row"><span>주문 번호</span><span>${order.displayId}</span></div>
                        <div class="info-row"><span>받는 사람</span><span>${order.recipient}</span></div>
                        <div class="info-row"><span>배송지</span><span>${order.address}</span></div>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>상품명</th>
                                <th>수량</th>
                                <th style="text-align: right;">금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${order.name}</td>
                                <td>${order.itemsCount}</td>
                                <td style="text-align: right;">${order.total}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="total">
                        총 결제 금액: ${order.total}
                    </div>
                    <div class="footer">
                        © 2026 SECONDFACE. All rights reserved.
                    </div>
                    <script>
                        window.print();
                    </script>
                </body>
            </html>
        `;

        receiptWindow.document.write(html);
        receiptWindow.document.close();
    };


    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
                layoutId={`order-card-${order.id}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-2xl bg-[#0e0e11] border border-white/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10"
            >
                {/* Header with Progress Tracker */}
                <div className="p-8 md:p-10 border-b border-white/10 bg-white/5 relative">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <motion.h3
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2"
                            >
                                주문 상세 내역 <span className="text-blue-500">#{order.displayId}</span>
                            </motion.h3>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                <div className={`w-2 h-2 rounded-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                                {order.date} @ SECONDFACE
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Futuristic Progress Tracker */}
                    <div className="relative pt-6 px-2">
                        {order.status === 'cancelled' ? (
                            <div className="flex flex-col items-center justify-center py-8 text-red-500">
                                <Ban size={48} className="mb-4 opacity-50" />
                                <span className="text-xl font-black uppercase tracking-widest">취소된 주문입니다</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start relative z-10">
                                    {steps.map((step, idx) => {
                                        const isCompleted = idx <= order.tracker;
                                        const isCurrent = idx === order.tracker;

                                        return (
                                            <div key={idx} className="flex flex-col items-center">
                                                <motion.div
                                                    animate={isCurrent ? {
                                                        boxShadow: ["0 0 10px rgba(59,130,246,0.3)", "0 0 25px rgba(59,130,246,0.6)", "0 0 10px rgba(59,130,246,0.3)"],
                                                        borderColor: ["rgba(59,130,246,0.3)", "rgba(59,130,246,1)", "rgba(59,130,246,0.3)"]
                                                    } : {}}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${isCompleted
                                                        ? "bg-blue-500 border-blue-400 text-white"
                                                        : "bg-black/40 border-white/10 text-slate-700"
                                                        }`}
                                                >
                                                    <step.icon size={22} className={isCurrent ? "animate-pulse" : ""} />
                                                </motion.div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest mt-4 text-center ${isCompleted ? "text-blue-400" : "text-slate-600"
                                                    }`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Connection Lines */}
                                <div className="absolute top-12 md:top-13 left-10 right-10 h-[2px] bg-white/5 -z-0" />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(order.tracker / 3) * 100}%` }}
                                    transition={{ duration: 1.2, ease: "circOut" }}
                                    className="absolute top-12 md:top-13 left-10 h-[2px] bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] -z-0"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Details Body */}
                <div className="p-8 md:p-10 space-y-10 max-h-[50vh] overflow-y-auto custom-scrollbar bg-black/20">
                    {showRefundForm ? (
                        <div className="space-y-6">
                            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
                                <h4 className="text-red-500 font-bold mb-2 flex items-center gap-2">
                                    <Ban size={18} /> 무통장 입금 환불 안내
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    무통장 입금으로 결제하신 경우, 취소 처리를 위해 환불받으실 계좌 정보를 입력해주셔야 합니다.
                                    입력하신 정보는 관리자에게 전달되며, 환불 처리가 완료되면 파기됩니다.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">환불 은행</label>
                                    <input
                                        type="text"
                                        value={refundBank}
                                        onChange={(e) => setRefundBank(e.target.value)}
                                        placeholder="예: 신한은행"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">계좌 번호</label>
                                    <input
                                        type="text"
                                        value={refundAccount}
                                        onChange={(e) => setRefundAccount(e.target.value)}
                                        placeholder="하이픈(-) 없이 입력해주세요"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">예금주</label>
                                    <input
                                        type="text"
                                        value={refundHolder}
                                        onChange={(e) => setRefundHolder(e.target.value)}
                                        placeholder="예금주명 입력"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1 h-3 bg-blue-500 rounded-full" /> 주문 상품 정보
                                    </h4>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center p-2">
                                            <img src={order.image} alt="" className="w-full h-auto object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white uppercase">{order.name}</p>
                                            <p className="text-[10px] text-slate-500 font-mono mt-1">수량: {order.itemsCount}개</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-blue-400">{order.total}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-1 h-3 bg-blue-500 rounded-full" /> 배송지 정보
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                        <p className="text-xs font-bold text-white">{order.recipient || "받는 사람 정보 없음"}</p>
                                        <p className="text-xs text-slate-400 leading-relaxed font-mono">
                                            {order.address || "주소 정보가 없습니다."}
                                        </p>
                                        <p className="text-xs text-blue-500/60 font-mono">연락처: {order.phone || "미입력"}</p>
                                    </div>
                                </section>
                            </div>

                            {/* Payment Summary */}
                            <section className="pt-8 border-t border-white/5">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                                            <QrCode size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">결제 수단</p>
                                            <p className="text-sm font-bold text-white tracking-wider">
                                                {order.paymentMethod === 'card' ? '카드 결제' : order.paymentMethod === 'bank' ? '무통장 입금' : '기타 결제'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">주문 번호 (ID)</p>
                                        <p className="text-xs font-mono text-blue-500/80">{order.displayId}</p>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-[#1a1a1e] flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleInquiry}
                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                        <ExternalLink size={14} />
                        1:1 문의하기
                    </button>
                    {(order.status === 'pending' || order.status === 'paid') && (
                        <button
                            onClick={handleCancelOrder}
                            className="flex-1 py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                            <X size={14} />
                            주문 취소
                        </button>
                    )}
                    <button
                        onClick={handlePrintReceipt}
                        className="flex-1 py-4 bg-blue-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3"
                    >
                        <Printer size={14} />
                        영수증 출력
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
