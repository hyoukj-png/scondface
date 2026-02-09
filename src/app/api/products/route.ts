import { NextResponse } from "next/server";
import { Product } from "@/types/product";
import { supabase } from "@/lib/supabase";

// Fallback Mock Data
const mockProducts: Product[] = [
    { id: "1", name: "Zero-G Alpha", price: "₩280,000", image: "/hero-glasses.png", category: "sunglasses" },
    { id: "2", name: "Nebula X", price: "₩320,000", image: "/hero-glasses.png", category: "sunglasses" },
    { id: "3", name: "Stardust V", price: "₩250,000", image: "/hero-glasses.png", category: "sunglasses" },
    { id: "4", name: "Eclipse Bold", price: "₩350,000", image: "/hero-glasses.png", category: "frames" },
    { id: "5", name: "Lunar Edge", price: "₩290,000", image: "/hero-glasses.png", category: "frames" },
    { id: "6", name: "Orbit Vision", price: "₩310,000", image: "/hero-glasses.png", category: "goggles" },
];

export async function GET() {
    // 1. Check if Supabase keys are present
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-project-url';

    if (!isSupabaseConfigured) {
        console.warn("Supabase not configured. Returning mock data.");
        return NextResponse.json(mockProducts);
    }

    // 2. Fetch from Supabase
    try {
        const { data, error } = await supabase.from("products").select("*");

        if (error) {
            console.error("Supabase Error:", error);
            // Fallback to mock data on error (optional)
            return NextResponse.json(mockProducts);
        }

        // Map Supabase data to Product interface (if needed)
        // Assuming Supabase returns data matching the table schema which matches our interface approximately
        // We might need to handle 'images' array vs single string if we used single image field in mock
        // But our interface says 'image' (string), DB has 'images' (text[]).

        const mappedData = data?.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.images && item.images.length > 0 ? item.images[0] : "/hero-glasses.png", // Use first image
            images: item.images || [],
            category: item.category,
            description: item.description,
            stock: item.stock
        }));

        // If DB is empty, return mock data? Or just empty array?
        if (!mappedData || mappedData.length === 0) {
            return NextResponse.json(mockProducts);
        }

        return NextResponse.json(mappedData);

    } catch (e) {
        console.error("Server Error:", e);
        return NextResponse.json(mockProducts);
    }
}
