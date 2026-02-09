"use client";

import { motion } from "framer-motion";
import BackToTop from "@/components/BackToTop";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] pt-32 pb-20 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 opacity-20" />

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase text-white">이용약관</h1>
                    <p className="text-slate-500 uppercase tracking-widest text-sm">Terms of Service</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-16 text-slate-300 leading-relaxed font-light text-sm md:text-base space-y-12"
                >
                    <section className="space-y-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-blue-500" /> 제 1조 (목적)
                        </h2>
                        <p>
                            이 약관은 안티그래비티 회사(전자상거래 사업자)가 운영하는 안티그래비티 사이버 몰(이하 “몰”이라 한다)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리․의무 및 책임사항을 규정함을 목적으로 합니다.
                        </p>
                        <p className="opacity-60 italic text-xs">
                            * 본 내역은 공정거래위원회 표준 약관을 기본으로 하여 작성되었습니다.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-blue-500" /> 제 2조 (정의)
                        </h2>
                        <div className="space-y-4">
                            <p>① “몰”이란 안티그래비티 회사가 재화 또는 용역(이하 “재화 등”이라 함)을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 사이버몰을 운영하는 사업자의 의미로도 사용합니다.</p>
                            <p>② “이용자”란 “몰”에 접속하여 이 약관에 따라 “몰”이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
                            <p>③ ‘회원’이라 함은 “몰”에 회원등록을 한 자로서, 계속적으로 “몰”이 제공하는 서비스를 이용할 수 있는 자를 말합니다.</p>
                        </div>
                    </section>

                    <section className="space-y-8 pt-8 border-t border-white/5 opacity-50">
                        <p>이하 상세 내용은 실제 운영 시 공정거래위원회 표준 약관 전문으로 대체될 예정입니다.</p>
                        <ul className="list-disc pl-5 space-y-4 text-xs">
                            <li>제 3조 (약관 등의 명시와 설명 및 개정)</li>
                            <li>제 4조 (서비스의 제공 및 변경)</li>
                            <li>제 5조 (서비스의 중단)</li>
                            <li>제 6조 (회원가입)</li>
                            <li>제 13조 (대금지급방법)</li>
                            <li>제 15조 (재화 등의 공급)</li>
                        </ul>
                    </section>
                </motion.div>
            </div>

            <BackToTop />
        </div>
    );
}
