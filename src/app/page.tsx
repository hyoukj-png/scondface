import Hero from "@/components/Hero";
import BestSellerSlider from "@/components/BestSellerSlider";
import HomeNoticeSection from "@/components/HomeNoticeSection";

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen">
      <Hero />
      <BestSellerSlider />
      <HomeNoticeSection />
    </main>
  );
}
