import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: 모든 카테고리 조회
export async function GET() {
    try {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        // 폴백: 기본 카테고리 반환
        return NextResponse.json([
            { id: "1", value: "sunglasses", label: "선글라스", label_en: "SUNGLASSES", sort_order: 1 },
            { id: "2", value: "frames", label: "안경테", label_en: "FRAMES", sort_order: 2 },
            { id: "3", value: "goggles", label: "고글", label_en: "GOGGLES", sort_order: 3 },
        ]);
    }
}

// POST: 새 카테고리 추가
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { value, label, label_en, sort_order } = body;

        if (!value || !label) {
            return NextResponse.json(
                { error: "필수 필드가 누락되었습니다." },
                { status: 400 }
            );
        }

        const insertData: any = {
            value,
            label,
            sort_order: sort_order || 999
        };

        // label_en은 선택 사항
        if (label_en) {
            insertData.label_en = label_en;
        }

        const { data, error } = await supabase
            .from("categories")
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error("Supabase INSERT error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            {
                error: error.message || "카테고리 추가 실패",
                details: error.details || null,
                code: error.code || null
            },
            { status: 500 }
        );
    }
}

// PUT: 카테고리 수정
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, value, label, label_en, sort_order, is_active } = body;

        console.log("PUT Request received:", { id, label }); // 디버깅 로그

        if (!id) {
            return NextResponse.json(
                { error: "카테고리 ID가 필요합니다." },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (value !== undefined) updateData.value = value;
        if (label !== undefined) updateData.label = label;
        if (label_en !== undefined) updateData.label_en = label_en;
        if (sort_order !== undefined) updateData.sort_order = sort_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        console.log("Updating with data:", updateData); // 디버깅 로그

        const { data, error } = await supabase
            .from("categories")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Supabase error details:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        console.log("Update successful:", data); // 디버깅 로그
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            {
                error: error.message || "카테고리 수정 실패",
                details: error.details || null,
                hint: error.hint || null,
                code: error.code || null
            },
            { status: 500 }
        );
    }
}

// DELETE: 카테고리 삭제 (비활성화)
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "카테고리 ID가 필요합니다." },
                { status: 400 }
            );
        }

        // 실제 삭제 대신 비활성화
        const { error } = await supabase
            .from("categories")
            .update({ is_active: false })
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { error: error.message || "카테고리 삭제 실패" },
            { status: 500 }
        );
    }
}
