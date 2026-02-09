"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Save, X, Loader2, GripVertical, Check } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { Category } from "@/types/category";

// 인라인 편집 컴포넌트 (컴포넌트 외부로 이동)
const InlineEdit = ({
    value,
    onSave,
    onCancel,
    type = "text",
    className = "",
    autoFocus = false
}: {
    value: string | number,
    onSave: (val: string) => void,
    onCancel: () => void,
    type?: string,
    className?: string,
    autoFocus?: boolean
}) => {
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    // 내부 상태 동기화 (value가 외부에서 변경되었을 때)
    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
            if (type === "text") {
                inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
            }
        }
    }, [autoFocus, type]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSave(String(editValue));
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    const handleBlur = () => {
        // 값이 변경되었을 때만 저장하고, 변경되지 않았어도 편집 모드를 끄지 않음
        if (String(editValue) !== String(value) && String(editValue).trim()) {
            onSave(String(editValue));
        }
    };

    return (
        <input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`bg-white/10 border border-blue-500/50 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500 ${className}`}
        />
    );
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        value: "",
        label: "",
        sort_order: 999
    });

    // 카테고리 목록 불러오기
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("카테고리를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 새 카테고리 추가
    const handleAdd = async () => {
        if (!formData.value || !formData.label) {
            toast.error("모든 필드를 입력해주세요.");
            return;
        }

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.error || "Failed to add category");
            }

            toast.success("카테고리가 추가되었습니다!");
            setFormData({ value: "", label: "", sort_order: 999 });
            setIsAdding(false);
            fetchCategories();
        } catch (error: any) {
            console.error("Error adding category:", error);
            toast.error(error.message || "카테고리 추가 실패");
        }
    };

    // 카테고리 수정
    const handleUpdate = async (id: string, updates: Partial<Category>) => {
        try {
            const res = await fetch("/api/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...updates })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.error || "Failed to update category");
            }

            toast.success("수정되었습니다");
            // editingId를 초기화하지 않음 (편집 모드 유지)
            fetchCategories();
        } catch (error: any) {
            console.error("Error updating category:", error);
            toast.error(error.message || "카테고리 수정 실패");
        }
    };

    // 카테고리 삭제
    const handleDelete = async (id: string, label: string) => {
        if (!confirm(`"${label}" 카테고리를 삭제하시겠습니까?`)) return;

        try {
            const res = await fetch(`/api/categories?id=${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Failed to delete category");

            toast.success("카테고리가 삭제되었습니다!");
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("카테고리 삭제 실패");
        }
    };

    return (
        <div className="space-y-8">
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#1a1a1e',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        borderRadius: '1rem'
                    }
                }}
            />

            {/* Header */}
            <div>
                <h1 className="text-4xl font-black uppercase tracking-wider text-white mb-2">
                    카테고리 관리
                </h1>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                    Category Management System
                </p>
            </div>

            {/* Add Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                    {isAdding ? <X size={16} /> : <Plus size={16} />}
                    {isAdding ? "취소" : "새 카테고리"}
                </button>
            </div>

            {/* Add Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-8 space-y-6"
                    >
                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">새 카테고리 추가</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                    카테고리 값 (영문)
                                </label>
                                <input
                                    type="text"
                                    placeholder="sunglasses"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                    한글 이름
                                </label>
                                <input
                                    type="text"
                                    placeholder="선글라스"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                    정렬 순서
                                </label>
                                <input
                                    type="number"
                                    placeholder="1"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAdd}
                            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            추가하기
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Categories List */}
            <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            로딩 중...
                        </span>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 text-sm">
                        카테고리가 없습니다.
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                <th className="px-6 py-4 text-left">순서</th>
                                <th className="px-6 py-4 text-left">카테고리 값</th>
                                <th className="px-6 py-4 text-left">카테고리 이름</th>
                                <th className="px-6 py-4 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {categories.map((cat, idx) => (
                                <motion.tr
                                    key={cat.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`group transition-colors ${editingId === cat.id ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                                >
                                    <td className="px-6 py-4">
                                        {editingId === cat.id ? (
                                            <InlineEdit
                                                value={cat.sort_order}
                                                type="number"
                                                className="w-16"
                                                autoFocus={true}
                                                onSave={(val) => {
                                                    const newOrder = parseInt(val);
                                                    if (!isNaN(newOrder) && newOrder !== cat.sort_order) {
                                                        handleUpdate(cat.id, { sort_order: newOrder });
                                                    }
                                                }}
                                                onCancel={() => { }} // 개별 취소는 동작 없음 (전체 완료 버튼 사용)
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <GripVertical size={14} className="text-slate-600 cursor-move" />
                                                <span className="text-slate-400 font-mono text-sm">{cat.sort_order}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === cat.id ? (
                                            <InlineEdit
                                                value={cat.value}
                                                onSave={(val) => {
                                                    const newValue = val.toLowerCase().replace(/\s/g, '');
                                                    if (newValue && newValue !== cat.value) {
                                                        handleUpdate(cat.id, { value: newValue });
                                                    }
                                                }}
                                                onCancel={() => { }}
                                            />
                                        ) : (
                                            <span className="text-white font-mono text-sm">{cat.value}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === cat.id ? (
                                            <InlineEdit
                                                value={cat.label}
                                                onSave={(val) => {
                                                    if (val && val !== cat.label) {
                                                        handleUpdate(cat.id, { label: val });
                                                    }
                                                }}
                                                onCancel={() => { }}
                                            />
                                        ) : (
                                            <span className="text-white font-bold text-sm">{cat.label}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {editingId === cat.id ? (
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-1"
                                                    title="완료"
                                                >
                                                    <Check size={14} />
                                                    <span className="text-[10px] font-bold uppercase hidden md:inline">Done</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setEditingId(cat.id)}
                                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                                    title="수정"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(cat.id, cat.label)}
                                                className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                title="삭제"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
