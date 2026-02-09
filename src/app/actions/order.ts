"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createOrder(
    amount: number,
    productName: string,
    userEmail: string,
    shippingDetails: {
        recipient: string;
        phone: string;
        address: string;
        detailAddress: string;
        zonecode: string;
        saveAsDefault?: boolean;
    },
    paymentMethod: string
) {
    const emailSuffix = userEmail ? `|${userEmail}` : "";
    const merchantUid = `mid_${new Date().getTime()}${emailSuffix}`;

    // Validation
    if (!shippingDetails.recipient || !shippingDetails.phone || !shippingDetails.address) {
        return {
            success: false,
            error: "배송지 정보(수령인, 연락처, 주소)가 누락되었습니다. 모든 정보를 입력해주세요."
        };
    }

    try {
        // 1. Find Product First (to check stock)
        const { data: product, error: productError } = await supabaseAdmin
            .from("products")
            .select("id, stock")
            .ilike("name", `%${productName}%`)
            .limit(1)
            .single();

        if (productError || !product) {
            throw new Error("상품 정보를 찾을 수 없습니다.");
        }

        // 2. Decrease Stock (Atomic Operation via RPC)
        const { data: stockSuccess, error: stockError } = await supabaseAdmin
            .rpc('decrease_stock', { p_id: product.id, qty: 1 });

        if (stockError) {
            console.error("Stock Decrease Error:", stockError);
            throw new Error("재고 처리 중 오류가 발생했습니다.");
        }

        if (!stockSuccess) {
            return {
                success: false,
                error: "재고가 부족하여 주문할 수 없습니다 (SOLD OUT)."
            };
        }

        // 3. Create the Order
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert([{
                total_amount: amount,
                status: "pending",
                merchant_uid: merchantUid,
                recipient: shippingDetails.recipient,
                phone: shippingDetails.phone,
                address: shippingDetails.address,
                detail_address: shippingDetails.detailAddress,
                zonecode: shippingDetails.zonecode,
                payment_method: paymentMethod
            }])
            .select()
            .single();

        if (orderError) {
            // 주문 생성 실패 시 재고 복구 (Rollback Stock)
            await supabaseAdmin.rpc('increase_stock', { p_id: product.id, qty: 1 });

            console.error("Supabase Order Insert Error:", orderError);
            throw orderError;
        }

        // 4. Create Order Item
        const { error: itemError } = await supabaseAdmin
            .from("order_items")
            .insert([{
                order_id: order.id,
                product_id: product.id,
                quantity: 1
            }]);

        if (itemError) {
            console.error("Order Item Insert Error:", itemError);
        }

        // 5. Save Shipping Address (If requested or first address)
        if (shippingDetails.saveAsDefault) {
            // Unset previous default
            await supabaseAdmin
                .from('shipping_addresses')
                .update({ is_default: false })
                .eq('user_email', userEmail);

            // Insert new default
            const { error: addressError } = await supabaseAdmin
                .from('shipping_addresses')
                .upsert({
                    user_email: userEmail,
                    recipient: shippingDetails.recipient,
                    phone: shippingDetails.phone,
                    road_address: shippingDetails.address,
                    detail_address: shippingDetails.detailAddress,
                    zonecode: shippingDetails.zonecode,
                    is_default: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_email, road_address, detail_address' }); // Avoid duplicates if possible

            if (addressError) {
                console.error("Failed to save default address:", addressError);
            }
        }

        return { success: true, orderId: order.id, merchantUid: order.merchant_uid };
    } catch (error: any) {
        console.error("Order Creation Action Failed:", error);
        return {
            success: false,
            error: error.message || "주문 정보 생성에 실패했습니다.",
            details: error
        };
    }
}

export async function cancelOrder(orderId: string, userEmail: string, refundInfo?: { bank: string; account: string; holder: string }) {
    try {
        // 1. Check order ownership and status
        const { data: order, error: fetchError } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(product_id, quantity)") // Join order_items to get product info
            .eq("id", orderId)
            .single();

        if (fetchError || !order) {
            throw new Error("주문 정보를 찾을 수 없습니다.");
        }

        // Verify User Logic (merchant_uid check or user_email check)
        // 기존 로직 유지
        if (!order.merchant_uid.includes(userEmail) && order.user_email !== userEmail) {
            throw new Error("본인의 주문만 취소할 수 있습니다.");
        }

        if (order.status !== 'pending' && order.status !== 'paid') {
            throw new Error("이미 배송 중이거나 취소된 주문은 취소할 수 없습니다.");
        }

        // 2. Update status to cancelled
        const updatePayload: any = { status: 'cancelled' };
        if (refundInfo) {
            updatePayload.refund_info = refundInfo;
        }

        const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update(updatePayload)
            .eq("id", orderId);

        if (updateError) throw updateError;

        // 3. Restore Stock
        if (order.order_items && order.order_items.length > 0) {
            for (const item of order.order_items) {
                await supabaseAdmin.rpc('increase_stock', {
                    p_id: item.product_id,
                    qty: item.quantity || 1
                });
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Cancel Order Error:", error);
        return { success: false, error: error.message };
    }
}
