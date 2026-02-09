"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Instagram, MessageCircle, Star } from "lucide-react";

const photos = [
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop", // Store interior vibe
    "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=2070&auto=format&fit=crop", // Glasses display
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", // Fashion/Lifestyle
];

export default function AboutPage() {
    return (
        <div className="bg-[#0a0a0c] min-h-screen text-white pt-20">
            {/* 1. Hero Section */}
            <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-4xl mx-auto space-y-6"
                >
                    <span className="text-blue-500 font-bold tracking-[0.3em] text-sm uppercase">About Us</span>
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="w-[300px] md:w-[500px] relative">
                            <img
                                src="/images/logo_main.png"
                                alt="SECONDFACE"
                                className="w-full h-auto filter invert opacity-100"
                            />
                        </div>
                        <span className="text-blue-500 font-bold tracking-[0.5em] text-2xl mt-4 block">[MYEONGJI]</span>
                    </div>
                    <p className="text-slate-400 text-lg lg:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                        "안경은 당신의 두 번째 얼굴입니다."<br />
                        세컨페이스 명지점은 단순한 시력 교정 도구를 넘어,<br className="hidden md:block" />
                        당신의 아이덴티티를 완성하는 가장 완벽한 아이웨어를 제안합니다.
                    </p>
                </motion.div>
            </section>

            {/* 2. Visual Grid */}
            <section className="px-6 py-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] md:h-[400px]">
                    {photos.map((src, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className={`rounded-[2rem] overflow-hidden relative group border border-white/10 ${i === 1 ? 'md:-mt-10 md:mb-10' : ''}`}
                        >
                            <img src={src} alt="Store Atmosphere" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 3. Values Section */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: "Premium Selection", desc: "엄격한 기준으로 선별된 하우스 브랜드와 트렌디한 디자인을 가장 먼저 만나보세요." },
                        { title: "Professional Care", desc: "첨단 검안 장비와 숙련된 안경사의 정밀한 피팅으로 최상의 편안함을 제공합니다." },
                        { title: "Honest Price", desc: "투명한 정찰제와 합리적인 가격으로 신뢰할 수 있는 쇼핑 경험을 약속드립니다." }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                            <Star className="text-blue-500 mb-6" size={32} />
                            <h3 className="text-xl font-bold uppercase italic mb-3">{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed font-light">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 4. Location & Contact Info (Store Identity) */}
            <section className="px-6 pb-24">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-[#111] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-12">
                        <div className="flex-1 space-y-8">
                            <div>
                                <h2 className="text-3xl font-black uppercase italic mb-2">Visit Store</h2>
                                <p className="text-slate-500 font-mono tracking-widest text-xs uppercase">Busan Myeongji Branch</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Address</h4>
                                        <p className="text-slate-400 font-light">부산 강서구 명지오션시티4로 65, 1층 102호(명지동, 대유빌딩)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Contact</h4>
                                        <p className="text-slate-400 font-light">051-203-8843</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Opening Hours</h4>
                                        <p className="text-slate-400 font-light font-mono">10:00 - 20:30 (Daily)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <a
                                    href="https://blog.naver.com/jungyun233"
                                    target="_blank"
                                    className="flex items-center gap-2 px-6 py-3 bg-[#03c75a] hover:bg-[#02b351] text-white rounded-xl font-bold transition-colors text-sm"
                                >
                                    <MessageCircle size={18} />
                                    Naver Blog
                                </a>
                                <a
                                    href="https://www.instagram.com/second_face_mj"
                                    target="_blank"
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-xl font-bold transition-opacity text-sm"
                                >
                                    <Instagram size={18} />
                                    Instagram
                                </a>
                            </div>
                        </div>

                        {/* Right: Map Placeholder or Image */}
                        <div className="w-full md:w-1/2 h-[300px] md:h-auto min-h-[300px] bg-slate-800 rounded-2xl border border-white/5 overflow-hidden relative group">
                            <iframe
                                src="https://maps.google.com/maps?q=부산+강서구+명지오션시티4로+65&t=&z=17&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                className="absolute inset-0 w-full h-full"
                            ></iframe>
                            <div className="absolute bottom-4 right-4 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-md pointer-events-none">
                                SECONDFACE [MYEONGJI]
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
