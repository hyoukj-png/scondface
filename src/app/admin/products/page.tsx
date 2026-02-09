"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, Search, Filter, Loader2, Image as ImageIcon, CheckCircle2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    price: string;
    category: string;
    stock: number;
    images: string[];
    created_at: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [activeProductId, setActiveProductId] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("재고 데이터를 불러오지 못했습니다.");
            console.error(error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`[${name}] 상품을 정말 삭제하시겠습니까?`)) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("삭제 처리에 실패했습니다.");
        } else {
            toast.success("상품이 성공적으로 삭제되었습니다.");
            fetchProducts();
            setSelectedProductIds(prev => prev.filter(pid => pid !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProductIds.length === 0) return;
        if (!confirm(`선택한 ${selectedProductIds.length}개의 상품을 모두 삭제하시겠습니까?`)) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .in('id', selectedProductIds);

            if (error) throw error;

            toast.success(`${selectedProductIds.length}개의 상품이 삭제되었습니다.`);
            fetchProducts();
            setSelectedProductIds([]);
        } catch (error: any) {
            toast.error("일괄 삭제 실패: " + error.message);
        }
    };

    const toggleSelectAll = () => {
        if (selectedProductIds.length === filteredProducts.length) {
            setSelectedProductIds([]);
        } else {
            setSelectedProductIds(filteredProducts.map(p => p.id));
        }
    };

    const toggleSelectProduct = (id: string) => {
        setSelectedProductIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10" onClick={() => setActiveProductId(null)}>
            <Toaster position="bottom-right" />

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-widest text-white italic uppercase">상품 관리</h1>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2 px-1">
                        {loading ? "데이터 스캔 중..." : `아카이브 상태: 정상 • ${products.length}개의 상품 등록됨`}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <AnimatePresence>
                        {selectedProductIds.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                            >
                                <Trash2 size={14} className="inline mr-1" />
                                {selectedProductIds.length}개 선택 삭제
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="상품명 또는 카테고리 검색..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-bold text-xs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Link href="/admin/products/new">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Plus size={16} />
                            신규 상품 등록
                        </motion.button>
                    </Link>
                </div>
            </div>

            {/* Product Table (HUD Style) */}
            <div className="bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">보안 데이터 로드 중...</span>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-500">
                        <ImageIcon size={48} className="opacity-10" />
                        <span className="text-[10px] font-black uppercase tracking-widest">일치하는 상품 데이터가 없습니다.</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                    <th className="px-6 py-6 w-12">
                                        <button
                                            onClick={toggleSelectAll}
                                            className={`w-5 h-5 rounded border transition-all mx-auto flex items-center justify-center ${selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 hover:border-white/40'}`}
                                        >
                                            {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 && <CheckCircle2 size={12} />}
                                        </button>
                                    </th>
                                    <th className="px-8 py-6">상품 정보</th>
                                    <th className="px-8 py-6">카테고리</th>
                                    <th className="px-8 py-6 text-right">판매 단가</th>
                                    <th className="px-8 py-6 text-center">재고 수량</th>
                                    <th className="px-8 py-6 text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((p, idx) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className={`group hover:bg-white/[0.02] transition-colors ${selectedProductIds.includes(p.id) ? 'bg-blue-500/5' : ''}`}
                                        >
                                            <td className="px-6 py-6 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelectProduct(p.id);
                                                    }}
                                                    className={`w-5 h-5 rounded border transition-all mx-auto flex items-center justify-center ${selectedProductIds.includes(p.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/10 group-hover:border-white/30'}`}
                                                >
                                                    {selectedProductIds.includes(p.id) && <CheckCircle2 size={12} />}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/5 p-2 flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-all overflow-hidden">
                                                        {p.images && p.images[0] ? (
                                                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                                                        ) : (
                                                            <ImageIcon className="text-slate-800" size={24} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase italic text-white group-hover:text-blue-400 transition-colors">{p.name}</p>
                                                        <p className="text-[9px] font-mono text-slate-600 mt-1 uppercase">ID: {p.id.split('-')[0].toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-sm font-black text-white">{p.price.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`text-[10px] font-bold font-mono px-3 py-1 rounded-lg ${p.stock < 10 ? "text-amber-500 bg-amber-500/10" : "text-emerald-500 bg-emerald-500/10"
                                                    }`}>
                                                    {p.stock.toString().padStart(3, '0')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right relative">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/products/edit/${p.id}`}>
                                                        <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                                            <Edit2 size={14} />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(p.id, p.name)}
                                                        className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
