import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { Providers } from "@/components/Providers";
import NoticePopup from "@/components/NoticePopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SECONDFACE [MYEONGJI] | 프리미엄 아이웨어 셀렉트샵",
  description: "부산 명지국제신도시 프리미엄 안경원 세컨페이스 명지점. 린드버그, 마이키타, 금자안경 등 다양한 하우스 브랜드를 정직한 가격과 전문적인 피팅으로 만나보세요.",
  keywords: ["세컨페이스", "명지안경", "부산안경", "하우스브랜드", "린드버그", "금자안경", "안경", "선글라스"],
  openGraph: {
    title: "SECONDFACE [MYEONGJI] | 프리미엄 아이웨어 셀렉트샵",
    description: "당신의 두 번째 얼굴을 찾아드립니다. 부산 명지 프리미엄 안경원 세컨페이스.",
    url: "https://secondface-myeongji.vercel.app",
    siteName: "SECONDFACE [MYEONGJI]",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
    }],
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30`}
      >
        <Providers>
          <Header />
          <CartDrawer />
          <NoticePopup />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
