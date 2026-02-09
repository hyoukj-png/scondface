"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function checkOrdersTableSchema() {
    try {
        // PostgreSQL의 information_schema를 사용하여 컬럼 정보 조회
        const { data, error } = await supabaseAdmin
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_name', 'orders')
            .eq('table_schema', 'public');

        if (error) {
            console.error("Schema query error:", error);
            return { success: false, error: error.message };
        }

        // 필요한 컬럼들
        const requiredColumns = ['recipient', 'phone', 'address', 'detail_address', 'zonecode'];
        const existingColumns = data?.map(col => col.column_name) || [];

        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        const foundColumns = requiredColumns.filter(col => existingColumns.includes(col));

        return {
            success: true,
            allColumns: existingColumns,
            foundColumns,
            missingColumns,
            hasAllRequired: missingColumns.length === 0
        };
    } catch (error: any) {
        console.error("Schema check failed:", error);
        return { success: false, error: error.message };
    }
}
