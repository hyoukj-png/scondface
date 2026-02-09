"use client";

import { useState, useEffect } from "react";
import { getAdminUsers, adminDeleteUsers, adminUpdateUsersRole } from "@/app/actions/admin";
import { Search, User, Mail, Calendar, Shield, MoreHorizontal, Loader2, CheckCircle2, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
    phone?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<{ userId: string, top: number, right: number } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const result = await getAdminUsers();
            if (result.error) throw new Error(result.error);
            setUsers(result.data || []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast.error("회원 목록을 불러오지 못했습니다: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        if (ids.length === 0) return;
        if (!confirm(`선택한 ${ids.length}명의 회원을 정말 삭제하시겠습니까?`)) return;

        try {
            const result = await adminDeleteUsers(ids);
            if (result.error) throw new Error(result.error);

            toast.success(`${ids.length}명의 회원이 삭제되었습니다.`);
            fetchUsers();
            setSelectedUserIds([]);
        } catch (error: any) {
            toast.error("삭제 실패: " + error.message);
        }
    };

    const handleRoleChange = async (ids: string[], newRole: string) => {
        if (ids.length === 0) return;

        try {
            const result = await adminUpdateUsersRole(ids, newRole);
            if (result.error) throw new Error(result.error);

            toast.success(`${ids.length}명의 권한이 ${newRole === 'ADMIN' ? '관리자' : '일용직'}(으)로 변경되었습니다.`);
            fetchUsers();
            setSelectedUserIds([]);
        } catch (error: any) {
            toast.error("권한 변경 실패: " + error.message);
        }
    };

    const toggleSelectAll = () => {
        if (selectedUserIds.length === filteredUsers.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(filteredUsers.map(u => u.id));
        }
    };

    const toggleSelectUser = (id: string) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8" onClick={() => setActiveDropdown(null)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-widest text-white italic uppercase">회원 관리</h1>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2 px-1">
                        데이터베이스 상태: 정상 • 총 회원 수: <span className="text-white font-mono">{users.length}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {selectedUserIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-2"
                            >
                                <button
                                    onClick={() => handleRoleChange(selectedUserIds, 'ADMIN')}
                                    className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all"
                                >
                                    관리자 등록
                                </button>
                                <button
                                    onClick={() => handleRoleChange(selectedUserIds, 'USER')}
                                    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                    일용직 강등
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedUserIds)}
                                    className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                                >
                                    <Trash2 size={14} className="inline mr-1" />
                                    삭제
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="이름 또는 이메일로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 w-full md:w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <th className="px-6 py-6 w-12">
                                    <button
                                        onClick={toggleSelectAll}
                                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 hover:border-white/40'}`}
                                    >
                                        {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 && <CheckCircle2 size={12} />}
                                    </button>
                                </th>
                                <th className="px-8 py-6">사용자 정보</th>
                                <th className="px-8 py-6">권한</th>
                                <th className="px-8 py-6">가입일</th>
                                <th className="px-8 py-6 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" /> 회원 목록을 불러오는 중...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-500">
                                        <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">회원을 찾을 수 없습니다.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, idx) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`hover:bg-white/[0.03] transition-colors group ${selectedUserIds.includes(user.id) ? 'bg-blue-500/5' : ''}`}
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelectUser(user.id);
                                                }}
                                                className={`w-5 h-5 rounded border transition-all mx-auto flex items-center justify-center ${selectedUserIds.includes(user.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/10 group-hover:border-white/30'}`}
                                            >
                                                {selectedUserIds.includes(user.id) && <CheckCircle2 size={12} />}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-white font-bold uppercase shadow-inner">
                                                    {user.full_name ? user.full_name[0] : user.email ? user.email[0] : '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm uppercase">{user.full_name || "익명"}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {user.email || '이메일 없음'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${user.role === 'ADMIN'
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                {user.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                                {user.role === 'ADMIN' ? '관리자' : '일용직'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-slate-500 font-mono text-[11px]">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    if (activeDropdown?.userId === user.id) {
                                                        setActiveDropdown(null);
                                                    } else {
                                                        setActiveDropdown({
                                                            userId: user.id,
                                                            top: rect.bottom + 8,
                                                            right: window.innerWidth - rect.right
                                                        });
                                                    }
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${activeDropdown?.userId === user.id ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
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
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveDropdown(null)}
                    />
                    {/* Dropdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'fixed',
                            top: `${activeDropdown.top}px`,
                            right: `${activeDropdown.right}px`,
                        }}
                        className="w-40 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-3xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                            <p className="text-[10px] font-black uppercase text-slate-500 text-center tracking-widest">권한 변경</p>
                        </div>
                        <div className="p-2 space-y-1">
                            {(() => {
                                const user = users.find(u => u.id === activeDropdown.userId);
                                if (!user) return null;
                                return (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleRoleChange([user.id], 'ADMIN');
                                                setActiveDropdown(null);
                                            }}
                                            className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.role === 'ADMIN' ? 'text-purple-400 bg-purple-400/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            • 관리자
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleRoleChange([user.id], 'USER');
                                                setActiveDropdown(null);
                                            }}
                                            className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.role === 'USER' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            • 일용직
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="p-2 border-t border-white/5">
                            <button
                                onClick={() => {
                                    const user = users.find(u => u.id === activeDropdown.userId);
                                    if (user && confirm(`${user.full_name || user.email} 회원을 삭제하시겠습니까?`)) {
                                        handleDelete([user.id]);
                                        setActiveDropdown(null);
                                    }
                                }}
                                className="w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all"
                            >
                                회원 삭제
                            </button>
                        </div>
                    </motion.div>
                </>,
                document.body
            )}
        </div>
    );
}
