"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProduct() {
            if (!params.id) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error || !data) {
                console.error('Product not found:', error);
                router.push('/admin/products');
            } else {
                setProduct(data);
            }
            setLoading(false);
        }

        fetchProduct();
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="min-h-[600px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                    상품 정보 로딩 중...
                </p>
            </div>
        );
    }

    if (!product) {
        return null;
    }

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
            <div className="flex items-center gap-4">
                <Link href="/admin/products">
                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <ArrowLeft size={18} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider text-white">
                        상품 수정
                    </h1>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">
                        Modify Product Data
                    </p>
                </div>
            </div>

            <ProductForm initialData={product} />
        </div>
    );
}
