import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { paymentId, orderId, paymentMethod } = await req.json();
        console.log("🚀 Verification Started (V2):", { paymentId, orderId });

        if (!paymentId || !orderId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // PortOne V2 Secret
        const secret = process.env.PORTONE_API_SECRET_V2;
        if (!secret) {
            console.warn("⚠️ PortOne V2 Secret is missing. Skipping verification (Demo Mode)");
        }

        let paymentVerified = false;
        let paymentAmount = 0;

        if (secret) {
            try {
                // PortOne V2 API: Get Payment Details
                console.log("📡 Fetching Payment Data from PortOne V2...");
                const res = await fetch(`https://api.portone.io/payments/${paymentId}`, {
                    headers: {
                        "Authorization": `PortOne ${secret}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) {
                    const errText = await res.text();
                    console.error("❌ Payment Verification Failed:", errText);
                    // throw new Error("Failed to verify payment with PortOne V2");
                } else {
                    const paymentData = await res.json();
                    console.log("✅ Payment Data Retrieved:", {
                        status: paymentData.status,
                        amount: paymentData.amount?.total,
                        id: paymentData.id
                    });

                    paymentAmount = paymentData.amount.total;

                    // Check Status
                    if (paymentData.status !== "PAID") {
                        console.error("❌ Payment Status is NOT PAID:", paymentData.status);
                    } else {
                        // Check Database Amount
                        const { data: orderData, error: orderError } = await supabaseAdmin
                            .from("orders")
                            .select("total_amount")
                            .eq("id", orderId)
                            .single();

                        if (orderError || !orderData) {
                            console.error("❌ Order not found in DB");
                        } else {
                            if (paymentAmount != orderData.total_amount) {
                                console.error(`❌ Amount Mismatch! PortOne: ${paymentAmount}, DB: ${orderData.total_amount}`);
                                await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("id", orderId);
                                return NextResponse.json({ message: "Amount mismatch" }, { status: 400 });
                            }
                            paymentVerified = true;
                        }
                    }
                }
            } catch (error: any) {
                console.error("🚨 Verification Error:", error.message);
            }
        }

        // Update Order Status
        console.log("📝 Updating Order Status...");
        const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update({
                status: paymentVerified ? "paid" : "pending",
                payment_id: paymentId,
                payment_method: paymentMethod || "card"
            })
            .eq("id", orderId);

        if (updateError) {
            console.error("❌ DB Update Failed:", updateError);
            throw new Error("Failed to update order status");
        }

        return NextResponse.json({
            success: true,
            message: paymentVerified ? "Payment Verified" : "Verification Failed but Order Updated",
            verified: paymentVerified
        });

    } catch (error: any) {
        console.error("🚨 Internal Error:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
