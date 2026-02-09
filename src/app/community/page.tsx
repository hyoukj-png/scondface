"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bell, Camera, MessageCircleQuestion, ArrowRight } from "lucide-react";

const communitySections = [
    {
        title: "NOTICE",
        subtitle: "공지사항",
        desc: "세컨페이스 명지점의 새로운 소식과 이벤트를 확인하세요.",
        href: "/community/notice",
        icon: Bell,
        color: "from-blue-400 to-blue-600",
        delay: 0
    },
    {
        title: "REVIEWS",
        subtitle: "포토 리뷰",
        desc: "고객님들이 직접 남겨주신 솔직한 후기를 만나보세요.",
        href: "/community/reviews",
        icon: Camera,
        color: "from-purple-400 to-pink-600",
        delay: 0.1
    },
    {
        title: "Q&A",
        subtitle: "질문과 답변",
        desc: "궁금한 점이 있으신가요? 빠르고 친절하게 답변해 드립니다.",
        href: "/community/qna",
        icon: MessageCircleQuestion,
        color: "from-amber-400 to-orange-600",
        delay: 0.2
    }
];

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <span className="text-blue-500 font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Community</span>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6">
                        CONNECT<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">WITH US</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg mx-auto font-light text-lg">
                        세컨페이스 명지점과 소통하는 공간입니다.<br />
                        다양한 소식과 이야기를 나눠보세요.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {communitySections.map((section) => (
                        <Link href={section.href} key={section.title} className="block group">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: section.delay, duration: 0.5 }}
                                className="h-[400px] relative p-8 rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20 group-hover:-translate-y-2"
                            >
                                {/* Background Glow */}
                                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${section.color} opacity-5 blur-[80px] rounded-full group-hover:opacity-10 transition-opacity duration-500`} />

                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                                            <section.icon size={28} />
                                        </div>
                                        <h2 className="text-3xl font-black italic uppercase mb-2 group-hover:text-blue-400 transition-colors">
                                            {section.title}
                                        </h2>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">{section.subtitle}</p>
                                        <p className="text-slate-400 font-light leading-relaxed">
                                            {section.desc}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                                        <span>Enter</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
