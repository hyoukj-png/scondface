import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function POST(request: Request) {
    console.log('🔵 Link Intent API Called (POST)');

    // 1. 현재 로그인된 사용자 확인 (보안)
    try {
        const session = await getServerSession(authOptions);

        console.log('🔍 Link Intent Session Check:', {
            hasSession: !!session,
            userEmail: session?.user?.email
        });

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized: Please login first' }, { status: 401 });
        }

        // 2. 연동 의도 쿠키 설정 ('account_linking_intent')
        const response = NextResponse.json({ success: true, message: 'Link intent set' });

        console.log(`✅ Setting Link Intent Cookie for: ${session.user.email}`);

        // 5분간 유효한 쿠키 설정
        response.cookies.set('account_linking_intent', session.user.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 300, // 5 minutes
            path: '/',
            sameSite: 'lax' // 리다이렉트 시 쿠키 유지를 위해 lax 권장
        });

        return response;

    } catch (error) {
        console.error('❌ Link Intent Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    console.log('🔵 Link Intent API Called (DELETE)');
    const response = NextResponse.json({ success: true, message: 'Link intent cleared' });

    // 쿠키 삭제
    response.cookies.delete('account_linking_intent');

    return response;
}
