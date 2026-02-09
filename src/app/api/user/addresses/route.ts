
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from('shipping_addresses')
        .select('*')
        .eq('user_email', session.user.email)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check count to see if this is the first address
    const { count } = await supabaseAdmin
        .from('shipping_addresses')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', session.user.email);

    let isDefault = body.is_default || false;

    // Force default if it's the first address
    if (count === 0) {
        isDefault = true;
    }

    // If this new address is set to be default, unset others first
    if (isDefault) {
        await supabaseAdmin
            .from('shipping_addresses')
            .update({ is_default: false })
            .eq('user_email', session.user.email);
    }

    // Exclude email from the DB insert payload
    const { email, ...addressData } = body;

    const newAddress = {
        ...addressData,
        user_email: session.user.email,
        is_default: isDefault
    };

    const { data, error } = await supabaseAdmin
        .from('shipping_addresses')
        .insert([newAddress])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Ensure the address belongs to the user
    const { error } = await supabaseAdmin
        .from('shipping_addresses')
        .delete()
        .eq('id', id)
        .eq('user_email', session.user.email);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, action } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (action === 'set_default') {
        // 1. Reset all
        await supabaseAdmin
            .from('shipping_addresses')
            .update({ is_default: false })
            .eq('user_email', session.user.email);

        // 2. Set new default
        const { data, error } = await supabaseAdmin
            .from('shipping_addresses')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_email', session.user.email)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
