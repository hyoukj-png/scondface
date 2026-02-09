"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Suspense } from "react";

function LoginForm() {
    const { data: session, status } = useSession();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    useEffect(() => {
        if (status === "authenticated") {
            router.push(callbackUrl);
        }
    }, [status, router, callbackUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            alert("로그인 실패: 이메일이나 비밀번호를 확인하세요.");
            setLoading(false);
        } else {
            router.push(callbackUrl);
            router.refresh();
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12"
        >
            <div className="text-center mb-8">
                <Link href="/" className="inline-block text-2xl font-bold tracking-tighter text-slate-800 mb-2 relative group">
                    ANTIGRAVITY
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <p className="text-slate-500 text-sm">Welcome back to the weightless world.</p>
            </div>

            <div className="space-y-3 mb-6">
                <button
                    onClick={() => signIn("google", { callbackUrl })}
                    className="w-full py-3 rounded-xl bg-white text-slate-700 font-bold shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">G</span>
                    <span>Continue with Google</span>
                </button>
                <button
                    onClick={() => signIn("kakao", { callbackUrl })}
                    className="w-full py-3 rounded-xl bg-[#FEE500] text-black font-bold shadow-md hover:bg-[#FDD835] transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="text-xl font-black group-hover:scale-110 transition-transform">TALK</span>
                    <span>Continue with Kakao</span>
                </button>
                <button
                    onClick={() => signIn("naver", { callbackUrl })}
                    className="w-full py-3 rounded-xl bg-[#03C75A] text-white font-bold shadow-md hover:bg-[#02b351] transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="text-xl font-black group-hover:scale-110 transition-transform">N</span>
                    <span>Continue with Naver</span>
                </button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-slate-500 rounded backdrop-blur-sm">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@antigravity.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/60 transition-all placeholder:text-slate-400 text-slate-800"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password123"
                        className="w-full px-4 py-3 rounded-xl bg-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/60 transition-all placeholder:text-slate-400 text-slate-800"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
                <p>Don't have an account? <span className="text-blue-600 cursor-not-allowed hover:underline">Sign up (Coming soon)</span></p>
                <p className="mt-2 text-xs">Test credentials: user@antigravity.com / password123</p>
            </div>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-1000" />

            <Suspense fallback={
                <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 h-[600px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={40} />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
