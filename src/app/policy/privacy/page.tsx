"use client";

import { motion } from "framer-motion";
import BackToTop from "@/components/BackToTop";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] pt-32 pb-20 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-y-1/2 opacity-20" />

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase text-white">개인정보처리방침</h1>
                    <p className="text-slate-500 uppercase tracking-widest text-sm">Privacy Policy</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-16 text-slate-300 leading-relaxed font-light text-sm md:text-base space-y-12"
                >
                    <section className="space-y-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-blue-500" /> 1. 개인정보의 수집 및 이용 목적
                        </h2>
                        <div className="space-y-4">
                            <p>안티그래비티는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                            <ul className="list-disc pl-5 space-y-2 opacity-80">
                                <li>홈페이지 회원 가입 및 관리</li>
                                <li>재화 또는 서비스 제공 (배송, 결제, 정산)</li>
                                <li>고객 문의 응대 및 안내</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-blue-500" /> 2. 수집하는 개인정보 항목
                        </h2>
                        <p>
                            회사는 회원가입, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
                        </p>
                        <div className="bg-white/5 p-6 rounded-2xl space-y-2 text-sm">
                            <p><span className="text-blue-400 font-bold">필수항목:</span> 성명, 이메일 주소, 비밀번호, 휴대전화번호</p>
                            <p><span className="text-blue-400 font-bold">선택항목:</span> 주소, 마케팅 수신 동의 여부</p>
                            <p><span className="text-blue-400 font-bold">자동수집항목:</span> 접속 IP 정보, 쿠키, 방문 일시, 서비스 이용 기록</p>
                        </div>
                    </section>

                    <section className="space-y-8 pt-8 border-t border-white/5">
                        <p className="opacity-50 text-sm">
                            귀하는 안티그래비티의 개인정보 수집 및 이용에 거부할 권리가 있으며, 거부 시 회원 가입 및 구매 서비스 이용에 제한이 있을 수 있습니다.
                        </p>
                        <p className="opacity-50 text-xs italic">
                            본 방침은 2026년 01월 30일부터 시행됩니다.
                        </p>
                    </section>
                </motion.div>
            </div>

            <BackToTop />
        </div>
    );
}
