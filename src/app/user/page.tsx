"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useSession } from "next-auth/react";
import { Shield, Mail, Calendar, MapPin, Zap, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const { wishlistItems } = useWishlistStore(); // Get real wishlist items
    const [isHovered, setIsHovered] = useState(false);
    const [stats, setStats] = useState({
        orders: 0,
        points: 0,
        createdAt: ""
    });
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 3D Tilt Values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    useEffect(() => {
        async function fetchUserStats() {
            if (status === "loading") return;
            if (!session?.user?.email) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // 1. Fetch Profile for Join Date
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('created_at')
                    .eq('email', session.user.email)
                    .single();

                // 2. Fetch Orders Count
                const { count: orderCount } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .ilike('merchant_uid', `%|${session.user.email}`);

                setStats({
                    orders: orderCount || 0,
                    points: (orderCount || 0) * 1000, // Dummy calculation for now
                    createdAt: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR') : "정보 없음"
                });

                // 3. Fetch User Reviews
                const { data: reviews } = await supabase
                    .from('reviews')
                    .select('*, products(name)')
                    .eq('user_email', session.user.email)
                    .order('created_at', { ascending: false });

                setUserReviews(reviews || []);

            } catch (err) {
                console.error("Error fetching user stats:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchUserStats();
    }, [session, status]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = (mouseX / width) - 0.5;
        const yPct = (mouseY / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest text-center">
                    Syncing with Mainframe...<br />
                    데이터를 동기화 중입니다
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-black tracking-widest uppercase mb-2 italic">My Station</h1>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Synchronization Level: Optimal</p>
            </div>

            {/* Profile Card with 3D Tilt */}
            <div
                className="perspective-1000 flex justify-center lg:justify-start"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
            >
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                    }}
                    className="relative w-full max-w-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden group"
                >
                    {/* Animated Glow following mouse (simplified) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center gap-10" style={{ transform: "translateZ(50px)" }}>
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                <img
                                    src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'User'}`}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-xl shadow-lg">
                                <Shield size={16} />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight text-white mb-1 uppercase italic">
                                    {session?.user?.name || "Agent Unknown"}
                                </h3>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400 font-mono text-[10px] uppercase tracking-widest">
                                    <Zap size={10} className="fill-current animate-pulse" />
                                    Account Level: Elite
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Mail size={14} />
                                    <span className="text-sm font-medium">{session?.user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Calendar size={14} />
                                    <span className="text-sm font-medium">가입일: {stats.createdAt}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <MapPin size={14} />
                                    <span className="text-sm font-medium">Sector: Seoul, KR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating HUD elements */}
                    <div className="absolute top-6 right-8 text-[8px] font-mono text-blue-500/40 uppercase tracking-[0.3em] leading-relaxed hidden sm:block">
                        Bio-metric Auth: Verified<br />
                        Neural Link: Encrypted<br />
                        Location: Live Sync Active
                    </div>
                </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Completed Missions", value: stats.orders.toString().padStart(2, '0'), unit: "Orders" },
                    { label: "Collection Size", value: wishlistItems.length.toString().padStart(2, '0'), unit: "Items" },
                    { label: "Loyalty Points", value: stats.points >= 1000 ? `${(stats.points / 1000).toFixed(1)}k` : stats.points.toString(), unit: "Credits" },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors"
                    >
                        <span className="text-2xl font-black text-white mb-1 tracking-widest">{stat.value}</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">{stat.unit}</span>
                        <div className="h-0.5 w-0 bg-blue-500 group-hover:w-full transition-all duration-500" />
                    </motion.div>
                ))}
            </div>

            {/* My Reviews Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black italic uppercase tracking-widest">Personal Manifest</h2>
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{userReviews.length} LOGS FOUND</span>
                </div>

                {
                    userReviews.length === 0 ? (
                        <div className="p-12 rounded-[2rem] bg-white/5 border border-white/10 border-dashed text-center">
                            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">No activity recorded for this sector.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {userReviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    whileHover={{ x: 10 }}
                                    className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 rounded">
                                                    {review.products?.name || "Product"}
                                                </span>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className={`w-1 h-1 rounded-full ${i < review.rating ? "bg-yellow-500" : "bg-white/10"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-slate-200 text-sm font-medium">{review.content}</p>
                                            <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
                                                Timestamp: {new Date(review.created_at).toLocaleString()}
                                            </p>
                                        </div>

                                        {review.answer && (
                                            <div className="md:max-w-xs p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl relative">
                                                <div className="absolute -left-1 top-4 w-1 h-4 bg-emerald-500" />
                                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block mb-1">HQ Response Received</span>
                                                <p className="text-[11px] text-slate-400 italic">"{review.answer}"</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    );
}
