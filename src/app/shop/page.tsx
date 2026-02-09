"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

function ShopContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        // Fetch categories
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                const data = await res.json();
                setCategories([
                    { id: "all", value: "all", label: "전체 제품" },
                    ...data
                ]);
            } catch (error) {
                console.error("Error loading categories:", error);
                // Fallback
                setCategories([
                    { id: "all", value: "all", label: "전체 제품" }
                ]);
            }
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        const cat = searchParams.get('cat');
        if (cat === 'eyeglasses') {
            setActiveCategory('frames');
        } else if (cat) {
            setActiveCategory(cat);
        } else {
            setActiveCategory('all');
        }
    }, [searchParams]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error("Error loading products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) => {
        const matchesCategory = activeCategory === "all" || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen py-24 px-6">
            <div className="max-w-7xl mx-auto space-y-16">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-6"
                >
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Tactical Archive</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-white">
                        COLLECTION
                    </h1>
                    <p className="text-slate-500 max-w-lg mx-auto text-sm font-medium leading-relaxed">
                        중력을 거스르는 가벼움. 안티그래비티의 모든 제품은 최고의 소재와 정밀한 설계를 통해 최상의 착용감을 제공합니다.
                    </p>
                </motion.div>

                {/* Filter & Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-2xl"
                >
                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.value || cat.id)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeCategory === (cat.value || cat.id)
                                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105"
                                    : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-80 group">
                        <input
                            type="text"
                            placeholder="제품 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-6 pr-6 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50 text-white placeholder:text-slate-600 transition-all font-bold text-sm"
                        />
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Scanning Database...</span>
                    </div>
                ) : (
                    /* Product Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    index={index}
                                    name={product.name}
                                    price={product.price}
                                    image={product.image}
                                    stock={product.stock || 0}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-32 text-slate-600 font-black uppercase tracking-[0.2em] text-sm italic">
                                검색 결과가 없습니다.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
