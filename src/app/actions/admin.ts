"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Admin Client to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getAdminDashboardStats() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Today's Orders
        const { count: todayCount, error: todayError } = await supabaseAdmin
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        if (todayError) throw todayError;

        // 2. Total Revenue
        const { data: allOrders, error: revError } = await supabaseAdmin
            .from('orders')
            .select('total_amount');

        if (revError) throw revError;

        const totalRev = allOrders?.reduce((acc, curr) => {
            const amountStr = String(curr.total_amount || '0');
            const val = parseInt(amountStr.replace(/[^0-9]/g, '')) || 0;
            return acc + val;
        }, 0) || 0;

        // 3. Pending Orders
        const { count: pendingCount, error: pendingError } = await supabaseAdmin
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'paid');

        if (pendingError) throw pendingError;

        // 4. Total Members
        const { count: memberCount, error: memberError } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (memberError) throw memberError;

        // 5. Recent Orders (limit 5)
        const { data: recent, error: recentError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentError) throw recentError;

        // 6. System Logs (Limit 4)
        let systemLogs = [];
        try {
            const { data: logs } = await supabaseAdmin
                .from('system_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(4);
            systemLogs = logs || [];
        } catch (e) {
            console.warn("System logs fetch failed (Table might not exist yet):", e);
        }

        return {
            todayCount: todayCount || 0,
            totalRev: totalRev,
            pendingCount: pendingCount || 0,
            memberCount: memberCount || 0,
            recentOrders: recent?.map(order => ({
                ...order,
                customer_name: order.recipient || order.user_email || "비회원"
            })) || [],
            systemLogs: systemLogs
        };

    } catch (error: any) {
        console.error("Dashboard Stats Error:", error);
        return { error: error.message };
    }
}

export async function getAdminUsers() {
    try {
        console.log("Fetching admin users from profiles table...");

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Select Error:", error);
            throw error;
        }

        console.log(`Successfully fetched ${data?.length || 0} users.`);

        // 캐시 갱신 (데이터가 갱신되었을 수 있으므로)
        revalidatePath('/admin/users');

        return { data };
    } catch (error: any) {
        console.error("Get Users Error:", error);
        return { error: error.message };
    }
}

export async function adminDeleteUsers(userIds: string[]) {
    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .delete()
            .in('id', userIds);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Delete Users Error:", error);
        return { error: error.message };
    }
}

export async function adminUpdateUsersRole(userIds: string[], role: string) {
    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role })
            .in('id', userIds);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Update Role Error:", error);
        return { error: error.message };
    }
}

export async function getAdminOrders() {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map for UI
        const mapped = data?.map(order => ({
            ...order,
            customer_name: order.recipient || order.user_email || "비회원"
        }));

        return { data: mapped };
    } catch (error: any) {
        console.error("Get Orders Error:", error);
        return { error: error.message };
    }
}

export async function adminUpdateOrderStatus(orderId: string, status: string) {
    try {
        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Update Order Status Error:", error);
        return { error: error.message };
    }
}

export async function adminDeleteOrders(orderIds: string[]) {
    try {
        // 1. Delete related order items first
        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .delete()
            .in('order_id', orderIds);

        if (itemsError) throw itemsError;

        // 2. Delete the orders
        const { error } = await supabaseAdmin
            .from('orders')
            .delete()
            .in('id', orderIds);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Delete Orders Error:", error);
        return { error: error.message };
    }
}

export async function adminUpdateTracking(orderId: string, trackingNumber: string, carrierCode: string, carrierName: string) {
    try {
        const { error } = await supabaseAdmin
            .from('orders')
            .update({
                tracking_number: trackingNumber,
                carrier_code: carrierCode,
                carrier_name: carrierName,
                status: 'shipped' // 송장번호 입력 시 자동으로 배송중으로 변경
            })
            .eq('id', orderId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Update Tracking Error:", error);
        return { error: error.message };
    }
}

export async function adminReplyToCommunity(table: 'reviews' | 'qna', id: number, answer: string) {
    try {
        const updateData: any = { answer };

        // If QnA, verify it as Answered
        if (table === 'qna') {
            updateData.status = 'Answered';
        }

        const { error } = await supabaseAdmin
            .from(table)
            .update(updateData)
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Reply Action Error:", error);
        return { error: error.message };
    }
}

export async function adminUpdateSiteSettings(settings: any) {
    try {
        const { error } = await supabaseAdmin
            .from('site_settings')
            .upsert({
                id: 'main',
                ...settings,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Update Settings Error:", error);
        return { error: error.message };
    }
}

export async function adminDeleteCommunity(table: string, ids: number[]) {
    try {
        const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .in('id', ids);

        if (error) throw error;
        revalidatePath('/admin/community');
        revalidatePath('/community/notice');
        return { success: true };
    } catch (error: any) {
        console.error("Delete Community Error:", error);
        return { error: error.message };
    }
}

export async function adminUpdateCommunityStatus(table: string, ids: number[], status: string) {
    try {
        const { error } = await supabaseAdmin
            .from(table)
            .update({ status })
            .in('id', ids);

        if (error) throw error;
        revalidatePath('/admin/community');
        return { success: true };
    } catch (error: any) {
        console.error("Update Status Error:", error);
        return { error: error.message };
    }
}

export async function adminCreateNotice(notice: any) {
    try {
        const { error } = await supabaseAdmin
            .from('notices')
            .insert([notice]);

        if (error) throw error;
        revalidatePath('/community/notice');
        revalidatePath('/admin/community');
        return { success: true };
    } catch (error: any) {
        console.error("Create Notice Error:", error);
        return { error: error.message };
    }
}
