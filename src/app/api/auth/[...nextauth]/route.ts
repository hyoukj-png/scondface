import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID?.trim() || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || "",
        }),
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID?.trim() || "",
            clientSecret: process.env.NAVER_CLIENT_SECRET?.trim() || "",
        }),
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID?.trim() || "",
            clientSecret: process.env.KAKAO_CLIENT_SECRET?.trim() || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "user@antigravity.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                // Mock User for Antigravity Demo
                // In a real app, you would fetch this from Supabase
                const user = {
                    id: "1",
                    name: "Antigravity CEO",
                    email: "admin@antigravity.com",
                    role: "admin"
                };

                if (credentials?.email === "admin@antigravity.com" && credentials?.password === "admin123") {
                    return user;
                } else if (credentials?.email === "user@antigravity.com" && credentials?.password === "password123") {
                    return { id: "2", name: "Explorer", email: "user@antigravity.com", role: "user" };
                } else {
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login", // Custom login page
    },
    // Explicitly set NEXTAUTH_URL and trim any whitespace/newlines
    ...(process.env.NEXTAUTH_URL && {
        url: process.env.NEXTAUTH_URL.trim()
    }),
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "credentials") return true;

            const cookieStore = await cookies();
            const linkIntentEmail = cookieStore.get('account_linking_intent')?.value;

            // 소셜 ID (고유 식별자)
            const providerKey = account?.provider || 'unknown';
            const providerId = account?.providerAccountId || user.id;

            console.log('🔵 SNS Login/Link Attempt:', {
                provider: providerKey,
                providerId: providerId,
                email: user.email,
                isLinking: !!linkIntentEmail
            });

            try {
                let targetUser = null;

                // 1. [연동 모드] 사용자가 명시적으로 연동을 요청한 경우 (쿠키 존재)
                if (linkIntentEmail) {
                    console.log('🔗 Linking Intent Detected for:', linkIntentEmail);
                    // 기존 로그인된 유저 찾기
                    const { data } = await supabaseAdmin
                        .from('profiles')
                        .select('*')
                        .eq('email', linkIntentEmail)
                        .single();
                    targetUser = data;

                    // 쿠키 삭제 (일회용)
                    // Note: Route Handler에서 쿠키 삭제는 Response로 해야하나, NextAuth 내부에서는 동작이 제한적일 수 있음.
                    // 여기서는 만료를 기다리거나 무시함.
                }

                // 2. [로그인 모드] 연동 요청이 아니면, 기존에 이 소셜 ID로 등록된 유저가 있는지 확인
                if (!targetUser) {
                    // JSONB 컬럼(linked_accounts)에서 검색
                    // 예: linked_accounts->>'kakao' = '12345'
                    const { data: linkedUser } = await supabaseAdmin
                        .from('profiles')
                        .select('*')
                        .eq(`linked_accounts->>${providerKey}`, providerId)
                        .single();

                    if (linkedUser) {
                        console.log('✅ Found user via linked_accounts:', linkedUser.email);
                        targetUser = linkedUser;
                    }
                }

                // 3. [이메일 검색] 아직 못 찾았으면 이메일로 검색 (기존 로직)
                if (!targetUser && user.email) {
                    const { data: emailUser } = await supabaseAdmin
                        .from('profiles')
                        .select('*')
                        .eq('email', user.email)
                        .single();

                    if (emailUser) {
                        targetUser = emailUser;
                    }
                }

                // 4. 데이터 저장/업데이트 (Upsert)
                const currentProviders = targetUser?.connected_providers || [];
                const newProviders = currentProviders.includes(providerKey) ? currentProviders : [...currentProviders, providerKey];

                // linked_accounts 업데이트
                const currentLinks = targetUser?.linked_accounts || {};
                const newLinks = { ...currentLinks, [providerKey]: providerId };

                // 최종 이메일 결정 (기존 유저면 기존 이메일 유지, 신규면 소셜 이메일 or 가짜 이메일)
                const finalEmail = targetUser?.email || user.email || `${providerId}@${providerKey}.anonymous`;

                const upsertData = {
                    email: finalEmail,
                    full_name: targetUser?.full_name || user.name || '알 수 없음',
                    avatar_url: targetUser?.avatar_url || user.image || '',
                    updated_at: new Date().toISOString(),
                    connected_providers: newProviders,
                    linked_accounts: newLinks,
                    provider: providerKey // Last login provider
                };

                // 신규 유저일 경우 추가 필드
                if (!targetUser) {
                    (upsertData as any).role = 'user';
                    (upsertData as any).created_at = new Date().toISOString();
                }

                const { error } = await supabaseAdmin
                    .from('profiles')
                    .upsert(upsertData, { onConflict: 'email' })
                    .select(); // upsert는 insert/update 모두 처리

                if (error) {
                    console.error('❌ DB Save Error:', error);
                    // 에러를 던져서 로그인을 중단시키고 사용자에게 알림
                    throw new Error(`DB Error: ${error.message} (Did you run the migration SQL?)`);
                } else {
                    console.log('💾 Profile Saved/Updated:', finalEmail);
                }

            } catch (error) {
                console.error('❌ SignIn logic error:', error);
            }

            return true;
        },
        async jwt({ token, user, account, trigger, session }) {
            // 1. 연동 중인지 확인 (쿠키 체크)
            const cookieStore = await cookies();
            const linkIntentEmail = cookieStore.get('account_linking_intent')?.value;

            // 2. 만약 연동 중이라면, 현재 로그인 프로필(user)을 무시하고 '원래 계정(linkIntentEmail)' 정보를 토큰에 넣음
            if (linkIntentEmail) {
                console.log('🔄 Account Linking Mode: Preserving original session for', linkIntentEmail);

                // 원래 계정 정보 가져오기
                const { data: originalUser } = await supabaseAdmin
                    .from('profiles')
                    .select('*')
                    .eq('email', linkIntentEmail)
                    .single();

                if (originalUser) {
                    token.sub = originalUser.id; // 중요: 세션 ID를 원래 사용자로 유지
                    token.email = originalUser.email;
                    token.name = originalUser.full_name;
                    token.picture = originalUser.avatar_url;
                    token.role = originalUser.role || 'user';

                    // 연동 쿠키 삭제 (일회용) -> Response에서 삭제하는게 맞지만 여기선 불가능하므로 만료되길 기다림
                    return token;
                }
            }

            if (user) {
                token.role = (user as any).role;

                // SNS 로그인 시 Supabase에서 role 가져오기
                if (account && account.provider !== "credentials" && user.email) {
                    try {
                        const { data: profile } = await supabaseAdmin
                            .from('profiles')
                            .select('role')
                            .eq('email', user.email)
                            .single();

                        if (profile) {
                            token.role = profile.role || 'user';
                        }
                    } catch (error) {
                        console.error('Error fetching user role:', error);
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role || 'user';
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "antigravity-secret-key-123", // Use env in production
    useSecureCookies: process.env.NODE_ENV === "production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
