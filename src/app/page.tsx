import { NavBar } from "@/components/NavBar";
import { HeroSection } from "@/components/HeroSection";
import { MapPreviewSection } from "@/components/MapPreviewSection";
import { B2bLeadMagnet } from "@/components/B2bLeadMagnet";
import { VerificationSection } from "@/components/VerificationSection";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <NavBar />
      <HeroSection />
      <MapPreviewSection />
      <B2bLeadMagnet />
      <VerificationSection />
      <Footer />
      <Toaster />
    </main>
  );
}