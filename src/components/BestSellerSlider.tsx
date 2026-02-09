"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import Link from "next/link";
import { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BestSellerSlider() {
    const [bestSellers, setBestSellers] = useState<Product[]>([]);

    useEffect(() => {
        async function fetchBestSellers() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_bestseller', true)
                    .limit(10);

                if (!error && data) {
                    setBestSellers(data);
                }
            } catch (error) {
                console.error("Error fetching bestsellers:", error);
            }
        }
        fetchBestSellers();
    }, []);
    return (
        <div className="w-full py-24 px-4 md:px-0 relative overflow-hidden bg-[#050505] text-white">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto mb-16 text-center relative z-10">
                <span className="text-blue-500 font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Collection</span>
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500">
                        BEST SELLERS
                    </span>
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto font-light">
                    세컨페이스 명지점에서 가장 사랑받는 프리미엄 컬렉션.<br />
                    트렌드를 이끄는 디자인과 최상의 착용감을 경험하세요.
                </p>
            </div>

            {bestSellers.length > 0 ? (
                <Swiper
                    modules={[Autoplay, Pagination, EffectCoverflow]}
                    effect="coverflow"
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView="auto"
                    initialSlide={1}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: 0,
                        depth: 150,
                        modifier: 2.5,
                        slideShadows: false,
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    className="w-full max-w-6xl !pb-20 best-seller-swiper"
                    breakpoints={{
                        320: { slidesPerView: 1.2, spaceBetween: 20 },
                        640: { slidesPerView: 2, spaceBetween: 30 },
                        1024: { slidesPerView: 3, spaceBetween: 40 },
                    }}
                >
                    {bestSellers.map((product) => (
                        <SwiperSlide key={product.id} className="max-w-md">
                            <Link href={`/shop/${product.id}`} className="block group relative">
                                {/* Card Container */}
                                <div className="h-[500px] w-full rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 p-8 flex flex-col items-center justify-between transition-all duration-500 group-hover:bg-white/15 group-hover:border-blue-500/30 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.2)]">

                                    {/* Product Image Area */}
                                    <div className="flex-1 w-full flex items-center justify-center relative perspective-1000">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <img
                                            src={product.images?.[0] || "/hero-glasses.png"}
                                            alt={product.name}
                                            className="w-full object-contain filter drop-shadow-2xl transform transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-6 group-hover:rotate-3"
                                        />
                                    </div>

                                    {/* Text Content */}
                                    <div className="w-full relative z-10">
                                        <div className="flex justify-between items-end border-t border-white/10 pt-6">
                                            <div className="text-left">
                                                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase italic">{product.name}</h3>
                                                <p className="text-slate-400 font-mono text-sm mt-1">{product.price}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transform -rotate-45 group-hover:rotate-0 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className="text-center py-20">
                    <p className="text-slate-500 text-lg">아직 Best Seller로 등록된 상품이 없습니다.</p>
                    <p className="text-slate-600 text-sm mt-2">관리자 페이지에서 상품을 Best Seller로 선택해주세요.</p>
                </div>
            )}

            {/* Pagination Style Override */}
            <style jsx global>{`
                .best-seller-swiper .swiper-pagination-bullet {
                    background: rgba(255,255,255,0.2);
                    opacity: 1;
                    width: 10px;
                    height: 10px;
                    transition: all 0.3s;
                }
                .best-seller-swiper .swiper-pagination-bullet-active {
                    background: #3b82f6;
                    width: 30px;
                    border-radius: 5px;
                }
            `}</style>
        </div>
    );
}
