import type { NextConfig } from "next";

// Trim all environment variables to remove hidden whitespace/newlines
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.trim();
}
if (process.env.GOOGLE_CLIENT_ID) {
  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID.trim();
}
if (process.env.GOOGLE_CLIENT_SECRET) {
  process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET.trim();
}
if (process.env.NAVER_CLIENT_ID) {
  process.env.NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID.trim();
}
if (process.env.NAVER_CLIENT_SECRET) {
  process.env.NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET.trim();
}
if (process.env.KAKAO_CLIENT_ID) {
  process.env.KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID.trim();
}
if (process.env.KAKAO_CLIENT_SECRET) {
  process.env.KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET.trim();
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ejjwucaccwyupyvginxi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;

