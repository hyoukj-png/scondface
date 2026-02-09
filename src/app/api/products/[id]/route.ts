import { NextResponse } from "next/server";
import { Product } from "@/types/product";
import { supabase } from "@/lib/supabase";

// Fallback Mock Data (Sync with main route)
const mockProducts: Product[] = [
    { id: "1", name: "Zero-G Alpha", price: "₩280,000", image: "/hero-glasses.png", category: "sunglasses" },
    { id: "2", name: "Nebula X", price: "₩320,000", image: "/hero-glasses.png", category: "sunglasses" },
    { id: "3", name: "Stardust V", price: "₩250,000", image: "/hero-glasses.png", category: "sunglasses" },
    { id: "4", name: "Eclipse Bold", price: "₩350,000", image: "/hero-glasses.png", category: "frames" },
    { id: "5", name: "Lunar Edge", price: "₩290,000", image: "/hero-glasses.png", category: "frames" },
    { id: "6", name: "Orbit Vision", price: "₩310,000", image: "/hero-glasses.png", category: "goggles" },
];

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Next.js 15+ params handling
) {
    const { id } = await params;

    // 1. Check if Supabase keys are present
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-project-url';

    // Helper to return mock
    const findMock = () => {
        const product = mockProducts.find(p => p.id === id);
        return product ? NextResponse.json(product) : NextResponse.json({ error: "Product not found" }, { status: 404 });
    };

    if (!isSupabaseConfigured) {
        return findMock();
    }

    // 2. Fetch from Supabase
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            // If error is code PGRST116 (0 rows), return 404
            console.warn(`Supabase fetch error for id ${id}:`, error.message);
            return findMock();
        }

        if (!data) {
            return findMock();
        }

        // Map Data
        const mappedProduct = {
            id: data.id,
            name: data.name,
            price: data.price,
            image: data.images && data.images.length > 0 ? data.images[0] : "/hero-glasses.png",
            images: data.images || [],
            category: data.category,
            description: data.description,
            stock: data.stock
        };

        return NextResponse.json(mappedProduct);

    } catch (e) {
        console.error("Server Error:", e);
        return findMock();
    }
}
