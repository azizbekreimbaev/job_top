import { BottomCta } from "@/components/homepage/BottomCta";
import { FeatureShowcase } from "@/components/homepage/FeatureShowcase";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/homepage/Hero";
import { Navbar } from "@/components/layout/Navbar";
import { Testimonial } from "@/components/homepage/Testimonial";

export default function Home() {
  return (
    <main className="overflow-hidden bg-surface">
      <Navbar />
      <Hero />
      <FeatureShowcase />
      <Testimonial />
      <BottomCta />
      <Footer />
    </main>
  );
}
