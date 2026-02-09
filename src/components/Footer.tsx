"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Instagram, MessageCircle, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#050505] text-slate-500 py-16 px-6 border-t border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Brand & Mission */}
                <div className="space-y-6">
                    {/* Logo */}
                    <Link href="/" className="flex flex-col items-start leading-none group mb-4">
                        <div className="relative w-[160px] h-auto">
                            <img
                                src="/images/logo_main.png"
                                alt="SECONDFACE"
                                className="w-full h-auto filter invert opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                            />
                        </div>
                        <span className="text-[10px] tracking-[0.3em] font-bold text-blue-500 mt-2 ml-1">[MYEONGJI]</span>
                    </Link>
                    <p className="max-w-md text-sm leading-relaxed text-slate-400">
                        우리는 시력의 한계를 넘어, 프리미엄한 가벼움과 시각적 해방감을 제공합니다.
                        세컨페이스 명지점은 단순한 안경을 넘어 당신의 라이프스타일에 새로운 시야를 선사합니다.
                    </p>
                    {/* Bottom: Social & Contact */}
                    <div className="pt-10 border-t border-white/10 flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <a href="https://blog.naver.com/jungyun233" target="_blank" className="flex items-center gap-3 text-slate-200 font-bold group">
                                <span className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-[#03c75a]/20 group-hover:border-[#03c75a] group-hover:text-[#03c75a] transition-all">
                                    <MessageCircle size={20} />
                                </span>
                                <span className="text-sm tracking-tight uppercase group-hover:text-[#03c75a] transition-colors">Naver Blog</span>
                            </a>
                            <a href="https://www.instagram.com/second_face_mj" target="_blank" className="flex items-center gap-3 text-slate-200 font-bold group">
                                <span className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-pink-500/20 group-hover:border-pink-500 group-hover:text-pink-500 transition-all">
                                    <Instagram size={20} />
                                </span>
                                <span className="text-sm tracking-tight uppercase group-hover:text-pink-500 transition-colors">second_face_mj</span>
                            </a>
                            <a href="tel:051-203-8843" className="flex items-center gap-3 text-slate-200 font-bold group">
                                <span className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-blue-500/20 group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                                    <Phone size={20} />
                                </span>
                                <span className="text-sm tracking-tight group-hover:text-blue-500 transition-colors">051-203-8843</span>
                            </a>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-relaxed">
                            부산 강서구 명지오션시티4로 65, 1층 102호(명지동, 대유빌딩)<br />
                            © 2026 SECONDFACE MYEONGJI. ALL RIGHTS RESERVED.
                        </p>
                    </div>
                </div>

                {/* Business Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                    <div className="space-y-4">
                        <h4 className="text-white uppercase tracking-widest font-bold">Store Info</h4>
                        <div className="space-y-2 leading-loose">
                            <p>상호명: 세컨페이스 안경</p>
                            <p>대표자: 김광복 | 사업자번호: 211-20-13476</p>
                            <p>통신판매업신고: 제 2024-부산강서-0000호</p>
                            <p className="text-blue-500/80 font-bold">운영시간: 매일 10:00 - 20:30</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-white uppercase tracking-widest font-bold">Contact & Location</h4>
                        <div className="space-y-2 leading-loose">
                            <p className="text-white font-medium">부산 강서구 명지오션시티4로 65, 1층 102호(명지동, 대유빌딩)</p>
                            <p>고객센터: 051-203-8843</p>
                            <p>인스타그램: @second_face_mj</p>
                            <p>블로그: jungyun233.naver.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright */}
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest">
                <p>&copy; 2026 SECONDFACE MYEONGJI. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-6 opacity-40">
                    <span>Designed by Orbital Unit</span>
                    <span>Status: Uplink Stable</span>
                </div>
            </div>
        </footer>
    );
}
